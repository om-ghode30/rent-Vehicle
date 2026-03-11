const db = require("../../config/db");
const fs = require("fs");
const { encryptFile } = require("../../utils/fileEncryption");
const { processPayment } = require("../../services/payment.service");
const { acquireVehicleLock, releaseVehicleLock } =require("../../services/lock.service");
// =================================
// CREATE BOOKING
// =================================
exports.createBooking = async (req, res) => {

  const userId = req.user.id;
  const { vehicle_id, start_datetime, end_datetime } = req.body;

  if (!vehicle_id || !start_datetime || !end_datetime || !req.file) {
    return res.status(400).json({
      success: false,
      message: "All fields including license required"
    });
  }

  // Check user approval
  const user = db.prepare(`
    SELECT isApproved FROM users WHERE id = ?
  `).get(userId);

  if (!user || user.isApproved === 0) {
    return res.status(403).json({
      success: false,
      message: "User not approved"
    });
  }


  // Check vehicle
  const vehicle = db.prepare(`
    SELECT * FROM vehicles 
    WHERE id = ?
      AND status = 'APPROVED'
      AND availability_status = 'AVAILABLE'
      AND isBlocked = 0
  `).get(vehicle_id);

  if (!vehicle) {
    return res.status(400).json({
      success: false,
      message: "Vehicle not available"
    });
  }

    if (vehicle.isBlocked === 1) {
  return res.status(403).json({
    success: false,
    message: "Vehicle is blocked by admin"
  });
}

  const start = new Date(start_datetime);
  const end = new Date(end_datetime);

  if (end <= start) {
  return res.status(400).json({
    success: false,
    message: "Invalid date range"
  });
}

  const diffHours = (end - start) / (1000 * 60 * 60);

  if (diffHours < 24) {
    return res.status(400).json({
      success: false,
      message: "Minimum booking is 24 hours"
    });
  }

  const totalDays = Math.ceil(diffHours / 24);
  const totalPrice = totalDays * vehicle.price_per_day;

  // Overlap check
  const overlap = db.prepare(`
  SELECT * FROM bookings
  WHERE vehicle_id = ?
    AND status IN ('CONFIRMED','PENDING','READY_TO_DELIVER')
    AND (
        datetime(start_datetime) < datetime(?, '+1 hour')
        AND datetime(end_datetime) > datetime(?)
    )
`).get(vehicle_id, end_datetime, start_datetime);

  if (overlap) {
    return res.status(400).json({
      success: false,
      message: "Vehicle already booked in selected dates"
    });
  }
  const lockResult = acquireVehicleLock(vehicle_id);

if (!lockResult.success) {
  return res.status(400).json({
    success: false,
    message: lockResult.message
  });
}


  // Insert booking
  const result = db.prepare(`
    INSERT INTO bookings (
      user_id,
      vehicle_id,
      start_datetime,
      end_datetime,
      total_days,
      total_price,status
    )
    VALUES (?, ?, ?, ?, ?, ?,'PENDING')
  `).run(
    userId,
    vehicle_id,
    start_datetime,
    end_datetime,
    totalDays,
    totalPrice
  );

  const bookingId = result.lastInsertRowid;

  
  // Save license file
  const bookingFolder = `src/uploads/bookings/${bookingId}`;
  fs.mkdirSync(bookingFolder, { recursive: true });

  encryptFile(req.file.path, `${bookingFolder}/license.enc`);

 let paymentResponse;

try {
  paymentResponse = await processPayment(totalPrice, bookingId);
} catch (error) {

  db.prepare(`DELETE FROM bookings WHERE id = ?`)
    .run(bookingId);

  releaseVehicleLock(vehicle_id);

  return res.status(500).json({
    success: false,
    message: "Payment processing error"
  });
}

if (!paymentResponse.success) {

  // Payment failed → remove booking
  db.prepare(`
    DELETE FROM bookings WHERE id = ?
  `).run(bookingId);
    releaseVehicleLock(vehicle_id);
  return res.json({
    success: false,
    message: "Payment failed"
  });
}

// 3️⃣ Payment success → confirm booking
db.prepare(`
  UPDATE bookings SET status = 'CONFIRMED'
  WHERE id = ?
`).run(bookingId);
releaseVehicleLock(vehicle_id);

  res.json({
    success: true,
    message: "Booking created successfully",
    booking_id: bookingId,
    total_days: totalDays,
    total_price: totalPrice
  });
};

exports.getMyBookings = (req, res) => {

  const userId = req.user.id;

  const bookings = db.prepare(`
    SELECT b.*, v.vehicle_number, v.brand, v.model_name
    FROM bookings b
    JOIN vehicles v ON b.vehicle_id = v.id
    WHERE b.user_id = ?
    ORDER BY b.created_at DESC;
  `).all(userId);

  res.json({
    success: true,
    data: bookings
  });
};
exports.cancelBooking = (req, res) => {

  const bookingId = req.params.id;
  const userId = req.user.id;

  const booking = db.prepare(`
    SELECT * FROM bookings
    WHERE id = ? AND user_id = ?
  `).get(bookingId, userId);

  if (!booking) {
    return res.status(404).json({
      success: false,
      message: "Booking not found"
    });
  }

  
if (["CANCELLED", "COMPLETED"].includes(booking.status)) {
  return res.status(400).json({
    success: false,
    message: "Booking cannot be cancelled"
  });
}

  const now = new Date();
  const start = new Date(booking.start_datetime);

if (now >= start) {
  return res.status(400).json({
    success: false,
    message: "Booking already started. Cannot cancel."
  });
}


  const diffHours = (start - now) / (1000 * 60 * 60);

  let refundPercent = 0;

  if (diffHours > 48) refundPercent = 100;
  else if (diffHours > 24) refundPercent = 70;
  else if (diffHours > 12) refundPercent = 50;
  else refundPercent = 0;

  const refundAmount = (booking.total_price * refundPercent) / 100;
if (refundAmount > 0) {
  db.prepare(`
    INSERT INTO pending_payments (
      booking_id,
      user_id,
      amount,
      type
    )
    VALUES (?, ?, ?, 'REFUND_TO_USER')
  `).run(bookingId, userId, refundAmount);
}
  db.prepare(`
    UPDATE bookings SET status = 'CANCELLED'
    WHERE id = ?
  `).run(bookingId);

  res.json({
    success: true,
    message: "Booking cancelled",
    refund_percent: refundPercent,
    refund_amount: refundAmount
  });
};
