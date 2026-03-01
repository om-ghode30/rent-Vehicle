const db = require("../../config/db");
const fs = require("fs");
const { decryptFile } = require("../../utils/fileEncryption");

// =============================
// GET PENDING VEHICLES
// =============================
exports.getPendingVehicles = (req, res) => {

  const vehicles = db.prepare(`
    SELECT 
      v.id as vehicle_id,
      v.vehicle_number,
      v.brand,
      v.model_name,
      u.name as owner_name
    FROM vehicles v
    JOIN users u ON v.owner_id = u.id
    WHERE v.status = 'PENDING'
  `).all();

  const data = vehicles.map(v => ({
    ...v,
    image_url: `/api/admin/vehicles/${v.vehicle_id}/docs/image1`
  }));

  res.json({ success: true, data });
};


// =============================
// GET FULL VEHICLE DETAILS
// =============================
exports.getVehicleDetails = (req, res) => {

  const vehicleId = req.params.vehicleId;

  const vehicle = db.prepare(`
    SELECT * FROM vehicles WHERE id = ?
  `).get(vehicleId);

  if (!vehicle) {
    return res.status(404).json({ success: false, message: "Vehicle not found" });
  }

  const owner = db.prepare(`
    SELECT id, name, email, phone_number, isApproved 
    FROM users WHERE id = ?
  `).get(vehicle.owner_id);

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
exports.approveVehicle = (req, res) => {

  const vehicleId = req.params.id;

  const vehicle = db.prepare(`
    SELECT owner_id FROM vehicles WHERE id = ?
  `).get(vehicleId);

  if (!vehicle) {
    return res.status(404).json({ success: false, message: "Vehicle not found" });
  }

  const owner = db.prepare(`
    SELECT isApproved FROM users WHERE id = ?
  `).get(vehicle.owner_id);

  if (!owner || owner.isApproved === 0) {
    return res.status(400).json({
      success: false,
      message: "Cannot approve vehicle. Owner not approved."
    });
  }

  db.prepare(`
    UPDATE vehicles SET status = 'APPROVED' WHERE id = ?
  `).run(vehicleId);

  res.json({ success: true, message: "Vehicle approved successfully" });
};


// =============================
// REJECT VEHICLE
// =============================
exports.rejectVehicle = (req, res) => {

  const vehicleId = req.params.id;

  db.prepare(`
    DELETE FROM vehicles WHERE id = ?
  `).run(vehicleId);

  res.json({ success: true, message: "Vehicle rejected successfully" });
};


// =====================================
// GET ALL PENDING PAYMENTS
// =====================================
exports.getPendingPayments = (req, res) => {

  const payments = db.prepare(`
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
  `).all();

  res.json({
    success: true,
    data: payments
  });
};

// =====================================
// MARK PAYMENT AS PAID
// =====================================
exports.approvePayment = (req, res) => {

  const paymentId = req.params.id;

  const payment = db.prepare(`
    SELECT * FROM pending_payments WHERE id = ?
  `).get(paymentId);

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

  db.prepare(`
    UPDATE pending_payments
    SET status = 'PAID'
    WHERE id = ?
  `).run(paymentId);

  res.json({
    success: true,
    message: "Payment marked as PAID"
  });
};

// =====================================
// SYNC COMPLETED BOOKINGS TO PAYMENTS
// =====================================
exports.syncCompletedPayments = (req, res) => {

  // Find completed bookings
  const completedBookings = db.prepare(`
    SELECT b.id, b.total_price, v.owner_id
    FROM bookings b
    JOIN vehicles v ON b.vehicle_id = v.id
    WHERE b.status = 'COMPLETED'
  `).all();

  let createdCount = 0;

  for (const booking of completedBookings) {

    // Check if payment already exists
    const existing = db.prepare(`
      SELECT id FROM pending_payments
      WHERE booking_id = ?
        AND type = 'PAY_TO_OWNER'
    `).get(booking.id);

    if (!existing) {

      db.prepare(`
        INSERT INTO pending_payments (
          booking_id,
          owner_id,
          amount,
          type
        )
        VALUES (?, ?, ?, 'PAY_TO_OWNER')
      `).run(
        booking.id,
        booking.owner_id,
        booking.total_price
      );

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
exports.getPendingUsers = (req, res) => {

  const users = db.prepare(`
    SELECT id, name, email, phone_number, role, created_at
    FROM users
    WHERE isApproved = 0
  `).all();
   

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
    };});

  res.json({ success: true, data });
};


// =============================
// APPROVE USER
// =============================
exports.approveUser = (req, res) => {

  const userId = req.params.id;

  db.prepare(`
    UPDATE users SET isApproved = 1 WHERE id = ?
  `).run(userId);

  res.json({ success: true, message: "User approved successfully" });
};


// =============================
// REJECT USER
// =============================
exports.rejectUser = (req, res) => {

  const userId = req.params.id;

  db.prepare(`
    DELETE FROM users WHERE id = ?
  `).run(userId);

  res.json({ success: true, message: "User rejected successfully" });
};


// =============================
// DOCUMENT VIEW APIs
// =============================
exports.viewVehicleDoc = (req, res) => {

  const { vehicleId, fileName } = req.params;

  const vehicle = db.prepare(`
    SELECT owner_id FROM vehicles WHERE id = ?
  `).get(vehicleId);

  if (!vehicle) {
    return res.status(404).json({ success: false, message: "Vehicle not found" });
  }

  const filePath = `src/uploads/owners/${vehicle.owner_id}/vehicles/${vehicleId}/${fileName}.enc`;

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ success: false, message: "File not found" });
  }

  const fileBuffer = decryptFile(filePath);
  res.setHeader("Content-Type", "image/jpeg");
  res.send(fileBuffer);
};


exports.viewOwnerDoc = (req, res) => {

  const { ownerId } = req.params;

  const filePath = `src/uploads/owners/${ownerId}/aadhar.enc`;

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ success: false, message: "File not found" });
  }

  const fileBuffer = decryptFile(filePath);
  res.setHeader("Content-Type", "image/jpeg");
  res.send(fileBuffer);
};


exports.viewUserDoc = (req, res) => {

  const { userId } = req.params;

  const filePath = `src/uploads/users/${userId}/aadhar.enc`;

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ success: false, message: "File not found" });
  }

  const fileBuffer = decryptFile(filePath);
res.setHeader("Content-Type", "image/jpeg");
  res.send(fileBuffer);
};


// =====================================
// 1. ALL VEHICLES ORDER BY BOOKINGS
// =====================================
exports.getAllVehiclesAnalytics = (req, res) => {
  try {
    const vehicles = db.prepare(`
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
    `).all();

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
exports.getAllOwnersAnalytics = (req, res) => {
  try {
    const owners = db.prepare(`
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
    `).all();

    res.json({ success: true, data: owners });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


// =====================================
// 3. ALL USERS ANALYTICS
// =====================================
exports.getAllUsersAnalytics = (req, res) => {
  try {
    const users = db.prepare(`
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
    `).all();

    res.json({ success: true, data: users });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


// =====================================
// 4. OWNER DETAILS
// =====================================
exports.getOwnerDetails = (req, res) => {
  try {
    const ownerId = req.params.id;

    const owner = db.prepare(`
      SELECT * FROM users
      WHERE id = ? AND role = 'OWNER'
    `).get(ownerId);

    if (!owner) {
      return res.status(404).json({
        success: false,
        message: "Owner not found"
      });
    }

    const vehicles = db.prepare(`
      SELECT id FROM vehicles
      WHERE owner_id = ?
    `).all(ownerId);

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
exports.getVehicleDetailsFull = (req, res) => {
  try {
    const vehicleId = req.params.id;

    const vehicle = db.prepare(`
      SELECT * FROM vehicles WHERE id = ?
    `).get(vehicleId);

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: "Vehicle not found"
      });
    }

    const bookings = db.prepare(`
      SELECT id FROM bookings
      WHERE vehicle_id = ?
    `).all(vehicleId);

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
exports.getUserDetailsFull = (req, res) => {
  try {
    const userId = req.params.id;

    const user = db.prepare(`
      SELECT * FROM users WHERE id = ?
    `).get(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    const bookings = db.prepare(`
      SELECT id FROM bookings
      WHERE user_id = ?
    `).all(userId);

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
exports.getBookingDetails = (req, res) => {
  try {
    const bookingId = req.params.id;

    const booking = db.prepare(`
      SELECT * FROM bookings
      WHERE id = ?
    `).get(bookingId);

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
exports.updateUserBlockStatus = (req, res) => {

  const userId = req.params.id;
  const { action } = req.body;

  if (typeof action !== "boolean") {
    return res.status(400).json({
      success: false,
      message: "Action must be true or false"
    });
  }

  const user = db.prepare(`
    SELECT id FROM users WHERE id = ?
  `).get(userId);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found"
    });
  }

  // action true → unblock → isBlocked = 0
  // action false → block → isBlocked = 1
  const newStatus = action ? 0 : 1;

  db.prepare(`
    UPDATE users SET isBlocked = ?
    WHERE id = ?
  `).run(newStatus, userId);

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
exports.updateVehicleBlockStatus = (req, res) => {

  const vehicleId = req.params.id;
  const { action } = req.body;

  if (typeof action !== "boolean") {
    return res.status(400).json({
      success: false,
      message: "Action must be true or false"
    });
  }

  const vehicle = db.prepare(`
    SELECT id FROM vehicles WHERE id = ?
  `).get(vehicleId);

  if (!vehicle) {
    return res.status(404).json({
      success: false,
      message: "Vehicle not found"
    });
  }

  const newStatus = action ? 0 : 1;

  db.prepare(`
    UPDATE vehicles SET isBlocked = ?
    WHERE id = ?
  `).run(newStatus, vehicleId);

  res.json({
    success: true,
    message: action
      ? "Vehicle unblocked successfully"
      : "Vehicle blocked successfully"
  });
};