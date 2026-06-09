const db = require("../../config/db");
const fs = require("fs");
const { decryptFile } = require("../../utils/fileEncryption");

// =============================
// GET PENDING VEHICLES
// =============================
exports.getPendingVehicles = async (req, res) => {

  const [vehicles] = await db.query(`
    SELECT 
      v.id as vehicle_id,
      v.vehicle_number,
      v.brand,
      v.model_name,
      u.name as owner_name
    FROM vehicles v
    JOIN users u ON v.owner_id = u.id
    WHERE v.status = 'PENDING'
  `);

  const data = vehicles.map(v => ({
    ...v,
    image_url: `/api/admin/vehicles/${v.vehicle_id}/docs/image1`
  }));

  res.json({ success: true, data });
};


// =============================
// GET FULL VEHICLE DETAILS
// =============================
exports.getVehicleDetails = async (req, res) => {

  const vehicleId = req.params.vehicleId;

  const [vehicleRows] = await db.query(`
    SELECT * FROM vehicles WHERE id = ?
  `,[vehicleId]);
  const vehicle = vehicleRows[0];

  if (!vehicle) {
    return res.status(404).json({ success: false, message: "Vehicle not found" });
  }

  const [ownerRows] = await db.query(`
    SELECT id, name, email, phone_number, isApproved 
    FROM users WHERE id = ?
  `,[vehicle.owner_id]);

   const owner = ownerRows[0];

  res.json({
    success: true,
    data: {
      vehicle,
      owner,
      documents: {
        owner_aadhar: `/api/admin/owners/${owner.id}/docs/aadhar`,
        rc: `/api/admin/vehicles/${vehicleId}/docs/rc`,
        insurance: `/api/admin/vehicles/${vehicleId}/docs/insurance`,
        puc: `/api/admin/vehicles/${vehicleId}/docs/puc`,
        noc: `/api/admin/vehicles/${vehicleId}/docs/noc`,
        images: [
          `/api/admin/vehicles/${vehicleId}/docs/image1`,
          `/api/admin/vehicles/${vehicleId}/docs/image2`,
          `/api/admin/vehicles/${vehicleId}/docs/image3`,
          `/api/admin/vehicles/${vehicleId}/docs/image4`,
          `/api/admin/vehicles/${vehicleId}/docs/image5`
        ]
      }
    }
  });
};

// =============================
// APPROVE VEHICLE
// =============================
exports.approveVehicle = async (req, res) => { // Added async
  const vehicleId = req.params.id;

  // MySQL returns [rows, fields], so we destructure the first element
  const [vehicleRows] = await db.query(`
    SELECT owner_id FROM vehicles WHERE id = ?
  `, [vehicleId]);

  const vehicle = vehicleRows[0];

  if (!vehicle) {
    return res.status(404).json({ success: false, message: "Vehicle not found" });
  }

  const [ownerRows] = await db.query(`
    SELECT isApproved FROM users WHERE id = ?
  `, [vehicle.owner_id]);

  const owner = ownerRows[0];

  if (!owner || owner.isApproved === 0) {
    return res.status(400).json({
      success: false,
      message: "Cannot approve vehicle. Owner not approved."
    });
  }

  await db.query(`
    UPDATE vehicles SET status = 'APPROVED' WHERE id = ?
  `, [vehicleId]);

  res.json({ success: true, message: "Vehicle approved successfully" });
};


// =============================
// REJECT VEHICLE
// =============================
exports.rejectVehicle = async (req, res) => { // Added async
  const vehicleId = req.params.id;

  await db.query(`
    DELETE FROM vehicles WHERE id = ?
  `, [vehicleId]);

  res.json({ success: true, message: "Vehicle rejected successfully" });
};


// =====================================
// GET ALL PENDING PAYMENTS
// =====================================
exports.getPendingPayments = async (req, res) => { // Added async
  const [payments] = await db.query(`
    SELECT 
      p.id,
      p.booking_id,
      p.amount,
      p.type,
      CASE 
        WHEN p.type = 'REFUND_TO_USER' THEN u.name
        WHEN p.type = 'PAY_TO_OWNER' THEN o.name
      END as name
    FROM pending_payments p
    LEFT JOIN users u ON p.user_id = u.id
    LEFT JOIN users o ON p.owner_id = o.id
    WHERE p.status = 'PENDING'
  `);

  res.json({
    success: true,
    data: payments
  });
};

// =====================================
// MARK PAYMENT AS PAID
// =====================================
exports.approvePayment = async (req, res) => { // Added async
  const paymentId = req.params.id;

  const [paymentRows] = await db.query(`
    SELECT * FROM pending_payments WHERE id = ?
  `, [paymentId]);
  
  const payment = paymentRows[0];

  if (!payment) {
    return res.status(404).json({
      success: false,
      message: "Payment not found"
    });
  }

  if (payment.status === 'PAID') {
    return res.status(400).json({
      success: false,
      message: "Payment already approved"
    });
  }

  await db.query(`
    UPDATE pending_payments
    SET status = 'PAID'
    WHERE id = ?
  `, [paymentId]);

  res.json({
    success: true,
    message: "Payment marked as PAID"
  });
};

// =====================================
// SYNC COMPLETED BOOKINGS TO PAYMENTS
// =====================================
exports.syncCompletedPayments = async (req, res) => { // Added async

  // Find completed bookings
  const [completedBookings] = await db.query(`
    SELECT b.id, b.total_price, v.owner_id
    FROM bookings b
    JOIN vehicles v ON b.vehicle_id = v.id
    WHERE b.status = 'COMPLETED'
  `);

  let createdCount = 0;

  for (const booking of completedBookings) {

    // Check if payment already exists
    const [existingRows] = await db.query(`
      SELECT id FROM pending_payments
      WHERE booking_id = ?
        AND type = 'PAY_TO_OWNER'
    `, [booking.id]);

    const existing = existingRows[0];

    if (!existing) {
      await db.query(`
        INSERT INTO pending_payments (
          booking_id,
          owner_id,
          amount,
          type
        )
        VALUES (?, ?, ?, 'PAY_TO_OWNER')
      `, [
        booking.id,
        booking.owner_id,
        booking.total_price
      ]);

      createdCount++;
    }
  }

  res.json({
    success: true,
    message: "Sync completed",
    new_entries_created: createdCount
  });
};


// =============================
// GET PENDING USERS (FULL INFO)
// =============================
exports.getPendingUsers = async (req, res) => { // Added async

  const [users] = await db.query(`
    SELECT id, name, email, phone_number, role, created_at
    FROM users
    WHERE isApproved = 0
  `);

  const data = users.map(u => {
    let aadhar_url;

    if (u.role === 'USER') {
      aadhar_url = `/api/admin/users/${u.id}/docs/aadhar`;
    } else {
      aadhar_url = `/api/admin/owners/${u.id}/docs/aadhar`;
    }

    return {
      ...u,
      aadhar_url
    };
  });

  res.json({ success: true, data });
};


// =============================
// APPROVE USER
// =============================
exports.approveUser = async (req, res) => { // Added async

  const userId = req.params.id;

  await db.query(`
    UPDATE users SET isApproved = 1 WHERE id = ?
  `, [userId]);

  res.json({ success: true, message: "User approved successfully" });
};

// =============================
// REJECT USER
// =============================
exports.rejectUser = async (req, res) => { // Added async

  const userId = req.params.id;

  await db.query(`
    DELETE FROM users WHERE id = ?
  `, [userId]); // Wrapped in array

  res.json({ success: true, message: "User rejected successfully" });
};


// =============================
// DOCUMENT VIEW APIs
// =============================
exports.viewVehicleDoc = async (req, res) => {

  const { vehicleId, fileName } = req.params;

  // MySQL destructuring [rows]
  const [vehicleRows] = await db.query(`
    SELECT owner_id FROM vehicles WHERE id = ?
  `, [vehicleId]);

  const vehicle = vehicleRows[0];

  if (!vehicle) {
    return res.status(404).json({ success: false, message: "Vehicle not found" });
  }

  const filePath = `owners/${vehicle.owner_id}/vehicles/${vehicleId}/${fileName}`;

  try {
    const fileBuffer = await decryptFile(filePath);
    res.setHeader("Content-Type", "image/jpeg");
    res.send(fileBuffer);
  } catch (error) {
    if (error.message === "FILE_NOT_FOUND") {
      return res.status(404).json({
        success: false,
        message: "Image not found"
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to load image"
    });
  }
};


exports.viewOwnerDoc = async (req, res) => {

  const { ownerId } = req.params;
  const filePath = `owners/${ownerId}/aadhar`;

  try {
    const fileBuffer = await decryptFile(filePath);

    res.setHeader("Content-Type", "image/jpeg");
    res.setHeader("Content-Length", fileBuffer.length);
    res.end(fileBuffer);

  } catch (error) {
    if (error.message === "FILE_NOT_FOUND") {
      return res.status(404).json({
        success: false,
        message: "Image not found"
      });
    }

    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Failed to load image"
    });
  }
};


exports.viewUserDoc = async (req, res) => {

  const { userId } = req.params;
  const filePath = `users/${userId}/aadhar`;

  try {
    const fileBuffer = await decryptFile(filePath);

    res.setHeader("Content-Type", "image/jpeg");
    res.setHeader("Content-Length", fileBuffer.length);
    res.end(fileBuffer);

  } catch (error) {
    if (error.message === "FILE_NOT_FOUND") {
      return res.status(404).json({
        success: false,
        message: "Image not found"
      });
    }

    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Failed to load image"
    });
  }
};

// =====================================
// 1. ALL VEHICLES ORDER BY BOOKINGS
// =====================================
exports.getAllVehiclesAnalytics = async (req, res) => { // Added async
  try {
    // MySQL destructuring [rows]
    const [vehicles] = await db.query(`
      SELECT 
        v.id,
        v.vehicle_number,
        v.brand,
        v.model_name,
        v.isBlocked,
        u.name as owner_name,
        u.address as owner_address,
        COUNT(b.id) as total_bookings
      FROM vehicles v
      JOIN users u ON v.owner_id = u.id
      LEFT JOIN bookings b ON b.vehicle_id = v.id
      GROUP BY v.id
      ORDER BY total_bookings DESC
    `);

    const data = vehicles.map(v => ({
      ...v,
      image_url: `/api/admin/vehicles/${v.id}/docs/image1`
    }));

    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// =====================================
// 2. ALL OWNERS ANALYTICS
// =====================================
exports.getAllOwnersAnalytics = async (req, res) => { // Added async
  try {
    const [owners] = await db.query(`
      SELECT 
        u.id,
        u.name,
        u.phone_number,
        u.address,
        u.isBlocked,
        COUNT(DISTINCT v.id) as vehicles_count,
        COUNT(b.id) as total_bookings
      FROM users u
      LEFT JOIN vehicles v ON v.owner_id = u.id
      LEFT JOIN bookings b ON b.vehicle_id = v.id
      WHERE u.role = 'OWNER'
      GROUP BY u.id
      ORDER BY vehicles_count DESC
    `);

    res.json({ success: true, data: owners });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


// =====================================
// 3. ALL USERS ANALYTICS
// =====================================
exports.getAllUsersAnalytics = async (req, res) => { // Added async
  try {
    const [users] = await db.query(`
      SELECT 
        u.id,
        u.name,
        u.phone_number,
        u.address,
        u.isBlocked,
        COUNT(b.id) as bookings_count
      FROM users u
      LEFT JOIN bookings b ON b.user_id = u.id
      WHERE u.role = 'USER'
      GROUP BY u.id
      ORDER BY bookings_count DESC
    `);

    res.json({ success: true, data: users });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


// =====================================
// 4. OWNER DETAILS
// =====================================
exports.getOwnerDetails = async (req, res) => { // Added async
  try {
    const ownerId = req.params.id;

    const [ownerRows] = await db.query(`
      SELECT * FROM users
      WHERE id = ? AND role = 'OWNER'
    `, [ownerId]);

    const owner = ownerRows[0];

    if (!owner) {
      return res.status(404).json({
        success: false,
        message: "Owner not found"
      });
    }

    const [vehicles] = await db.query(`
      SELECT id FROM vehicles
      WHERE owner_id = ?
    `, [ownerId]);

    res.json({
      success: true,
      data: {
        owner,
        vehicle_ids: vehicles.map(v => v.id)
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


// =====================================
// 5. VEHICLE DETAILS
// =====================================
exports.getVehicleDetailsFull = async (req, res) => { // Added async
  try {
    const vehicleId = req.params.id;

    const [vehicleRows] = await db.query(`
      SELECT * FROM vehicles WHERE id = ?
    `, [vehicleId]);

    const vehicle = vehicleRows[0];

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: "Vehicle not found"
      });
    }

    const [bookings] = await db.query(`
      SELECT id FROM bookings
      WHERE vehicle_id = ?
    `, [vehicleId]);

    res.json({
      success: true,
      data: {
        vehicle,
        booking_ids: bookings.map(b => b.id)
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


// =====================================
// 6. USER DETAILS
// =====================================
exports.getUserDetailsFull = async (req, res) => { // Added async
  try {
    const userId = req.params.id;

    const [userRows] = await db.query(`
      SELECT * FROM users WHERE id = ?
    `, [userId]);

    const user = userRows[0];

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    const [bookings] = await db.query(`
      SELECT id FROM bookings
      WHERE user_id = ?
    `, [userId]);

    res.json({
      success: true,
      data: {
        user,
        booking_ids: bookings.map(b => b.id)
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
// =====================================
// 7. BOOKING DETAILS
// =====================================
exports.getBookingDetails = async (req, res) => { // Added async
  try {
    const bookingId = req.params.id;

    // Using your helper: getOne
    const booking = await getOne(`
      SELECT * FROM bookings
      WHERE id = ?
    `, [bookingId]);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found"
      });
    }

    res.json({
      success: true,
      data: booking
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// =====================================
// UPDATE USER BLOCK STATUS
// =====================================
exports.updateUserBlockStatus = async (req, res) => { // Added async

  const userId = req.params.id;
  const { action } = req.body;

  if (typeof action !== "boolean") {
    return res.status(400).json({
      success: false,
      message: "Action must be true or false"
    });
  }

  const user = await getOne(`
    SELECT id FROM users WHERE id = ?
  `, [userId]);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found"
    });
  }

  // action true → unblock → isBlocked = 0
  // action false → block → isBlocked = 1
  const newStatus = action ? 0 : 1;

  await db.query(`
    UPDATE users SET isBlocked = ?
    WHERE id = ?
  `, [newStatus, userId]);

  res.json({
    success: true,
    message: action
      ? "User unblocked successfully"
      : "User blocked successfully"
  });
};


// =====================================
// UPDATE VEHICLE BLOCK STATUS
// =====================================
exports.updateVehicleBlockStatus = async (req, res) => { // Added async

  const vehicleId = req.params.id;
  const { action } = req.body;

  if (typeof action !== "boolean") {
    return res.status(400).json({
      success: false,
      message: "Action must be true or false"
    });
  }

  const vehicle = await getOne(`
    SELECT id FROM vehicles WHERE id = ?
  `, [vehicleId]);

  if (!vehicle) {
    return res.status(404).json({
      success: false,
      message: "Vehicle not found"
    });
  }

  const newStatus = action ? 0 : 1;

  await db.query(`
    UPDATE vehicles SET isBlocked = ?
    WHERE id = ?
  `, [newStatus, vehicleId]);

  res.json({
    success: true,
    message: action
      ? "Vehicle unblocked successfully"
      : "Vehicle blocked successfully"
  });
};

// Your Helper Function
async function getOne(query, params) {
  const [rows] = await db.query(query, params);
  return rows[0] || null; // Added || null for safety
}