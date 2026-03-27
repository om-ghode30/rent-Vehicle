const db = require("../../config/db");
const fs = require("fs");
const { encryptFile } = require("../../utils/fileEncryption");
const { processPayment } = require("../../services/payment.service");
const { acquireVehicleLock, releaseVehicleLock } = require("../../services/lock.service");

// Helper for single row fetching
async function getOne(conn, query, params) {
  const [rows] = await conn.query(query, params);
  return rows[0] || null;
}

// =================================
// CREATE BOOKING
// =================================
exports.createBooking = async (req, res) => {
  const conn = await db.getConnection();
  let lockAcquired = false;

  const userId = req.user.id;
  const { vehicle_id, start_datetime, end_datetime, driver_name } = req.body;

  if (!vehicle_id || !start_datetime || !end_datetime || !req.file || !driver_name) {
    return res.status(400).json({
      success: false,
      message: "All fields including license required"
    });
  }

  try {
    await conn.beginTransaction();

    // 1. User check
    const user = await getOne(conn,
      `SELECT isApproved FROM users WHERE id = ?`,
      [userId]
    );

    if (!user || user.isApproved === 0) {
      await conn.rollback();
      return res.status(403).json({
        success: false,
        message: "User not approved"
      });
    }

    // 2. Vehicle check
    const vehicle = await getOne(conn, `
      SELECT * FROM vehicles 
      WHERE id = ?
        AND status = 'APPROVED'
        AND availability_status = 'AVAILABLE'
        AND isBlocked = 0
    `, [vehicle_id]);

    if (!vehicle) {
      await conn.rollback();
      return res.status(400).json({
        success: false,
        message: "Vehicle not available"
      });
    }

    // 3. Date validation
    const start = new Date(start_datetime);
    const end = new Date(end_datetime);

    if (end <= start) {
      await conn.rollback();
      return res.status(400).json({
        success: false,
        message: "Invalid date range"
      });
    }

    const diffHours = (end - start) / (1000 * 60 * 60);

    if (diffHours < 12) {
      await conn.rollback();
      return res.status(400).json({
        success: false,
        message: "Minimum booking is 12 hours"
      });
    }

    const totalDays = Math.ceil(diffHours / 24);
    const totalPrice = totalDays * vehicle.price_per_day;

    // 4. Overlap check
    const overlap = await getOne(conn, `
      SELECT id FROM bookings
      WHERE vehicle_id = ?
        AND status IN ('CONFIRMED','PENDING','READY_TO_DELIVER')
        AND (
          start_datetime < DATE_ADD(?, INTERVAL 1 HOUR)
          AND end_datetime > ?
        )
    `, [vehicle_id, end_datetime, start_datetime]);

    if (overlap) {
      await conn.rollback();
      return res.status(400).json({
        success: false,
        message: "Vehicle already booked in selected dates"
      });
    }

    // 5. Lock
    const lockResult = await acquireVehicleLock(vehicle_id);
    if (!lockResult.success) {
      await conn.rollback();
      return res.status(400).json({
        success: false,
        message: lockResult.message
      });
    }

    lockAcquired = true;

    // 6. Insert booking
    const [result] = await conn.query(`
      INSERT INTO bookings (
        user_id,
        vehicle_id,
        start_datetime,
        end_datetime,
        total_days,
        total_price,
        status,
        d_name
      )
      VALUES (?, ?, ?, ?, ?, ?, 'PENDING', ?)
    `, [userId, vehicle_id, start_datetime, end_datetime, totalDays, totalPrice, driver_name]);

    const bookingId = result.insertId;

    // 7. File save
    try {
      await encryptFile(req.file.path, `bookings/${bookingId}/license`);
    } catch (error) {
      await conn.rollback();
      if (lockAcquired) {  await releaseVehicleLock(vehicle_id);}
      return res.status(500).json({
        success: false,
        message: "Failed to process license image"
      });
    }

    // 8. Payment
    let paymentResponse;
    try {
      paymentResponse = await processPayment(totalPrice, bookingId);
    } catch (error) {
      await conn.rollback();
      if (lockAcquired) {  await releaseVehicleLock(vehicle_id);}
      return res.status(500).json({
        success: false,
        message: "Payment processing error"
      });
    }

    if (!paymentResponse.success) {
      await conn.rollback();
      if (lockAcquired) {  await releaseVehicleLock(vehicle_id);}
      return res.json({
        success: false,
        message: "Payment failed"
      });
    }

    // 9. Confirm booking
    await conn.query(`
      UPDATE bookings SET status = 'CONFIRMED'
      WHERE id = ?
    `, [bookingId]);

    await conn.commit();

    if (lockAcquired) {  await releaseVehicleLock(vehicle_id);}

    res.json({
      success: true,
      message: "Booking created successfully",
      booking_id: bookingId,
      total_days: totalDays,
      total_price: totalPrice
    });

  } catch (err) {
    await conn.rollback();
    if (lockAcquired) {  await releaseVehicleLock(vehicle_id);}

    res.status(500).json({
      success: false,
      message: err.message
    });

  } finally {
    conn.release();
  }
};

// =====================================
// GET MY BOOKINGS
// =====================================
exports.getMyBookings = async (req, res) => { // Added async
  try {
    const userId = req.user.id;

    const [bookings] = await db.query(`
      SELECT b.*, v.vehicle_number, v.brand, v.model_name
      FROM bookings b
      JOIN vehicles v ON b.vehicle_id = v.id
      WHERE b.user_id = ?
      ORDER BY b.created_at DESC
    `, [userId]);

    res.json({  
      success: true,
      data: bookings
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// =====================================
// CANCEL BOOKING (CORE LOGIC PRESERVED)
// =====================================
exports.cancelBooking = async (req, res) => { // Added async
  try {
    const bookingId = req.params.id;
    const userId = req.user.id;

    // 1. Fetch booking with ownership check
    const [rows] = await db.query(`
      SELECT * FROM bookings
      WHERE id = ? AND user_id = ?
    `, [bookingId, userId]);

    const booking = rows[0];

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found"
      });
    }

    // 2. Status check
    if (["CANCELLED", "COMPLETED"].includes(booking.status)) {
      return res.status(400).json({
        success: false,
        message: "Booking cannot be cancelled"
      });
    }

    // 3. Start time check
    const now = new Date();
    const start = new Date(booking.start_datetime);

    if (now >= start) {
      return res.status(400).json({
        success: false,
        message: "Booking already started. Cannot cancel."
      });
    }

    // 4. Refund calculation logic (PRESERVED)
    const diffHours = (start - now) / (1000 * 60 * 60);
    let refundPercent = 0;

    if (diffHours > 48) refundPercent = 100;
    else if (diffHours > 24) refundPercent = 70;
    else if (diffHours > 12) refundPercent = 50;
    else refundPercent = 0;

    const refundAmount = (booking.total_price * refundPercent) / 100;

    // 5. Database updates
    if (refundAmount > 0) {
      await db.query(`
        INSERT INTO pending_payments (
          booking_id,
          user_id,
          amount,
          type
        )
        VALUES (?, ?, ?, 'REFUND_TO_USER')
      `, [bookingId, userId, refundAmount]);
    }

    await db.query(`
      UPDATE bookings SET status = 'CANCELLED'
      WHERE id = ?
    `, [bookingId]);

    res.json({
      success: true,
      message: "Booking cancelled",
      refund_percent: refundPercent,
      refund_amount: refundAmount
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// =====================================
// GET PARTICULAR BOOKING
// =====================================
exports.getPerticularBooking = async (req, res) => { // Added async
  try {
    const bookingId = req.params.id;
    const userId = req.user.id;

    const [rows] = await db.query(`
      SELECT 
        b.id as booking_id,
        b.start_datetime,
        b.end_datetime,
        b.total_price,
        b.status,
        b.d_name,

        v.id as vehicle_id,
        v.vehicle_number,
        v.brand,
        v.model_name,

        o.name as owner_name,
        o.address,
        o.phone_number

      FROM bookings b
      JOIN vehicles v ON b.vehicle_id = v.id
      JOIN users o ON v.owner_id = o.id

      WHERE b.id = ? AND b.user_id = ?
    `, [bookingId, userId]);
    const booking=rows[0];
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found"
      });
    }

    // Image logic preserved
    const images = Array.from({ length: 5 }, (_, i) => 
      `/api/common/vehicles/${booking.vehicle_id}/docs/image${i + 1}`
    );

    res.json({
      success: true,
      data: {
        ...booking,
        vehicle_images: images
      }
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};