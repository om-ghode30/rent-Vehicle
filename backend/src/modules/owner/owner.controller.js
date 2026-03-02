const db = require("../../config/db");
const fs = require("fs");
const { encryptFile } = require("../../utils/fileEncryption");
const { decryptFile } = require("../../utils/fileEncryption");
exports.addVehicle = (req, res) => {
  const { brand, model_name, price_per_day, vehicle_number } = req.body;
  const ownerId = req.user.id;

  const owner = db.prepare(`
  SELECT isApproved FROM users WHERE id = ?
`).get(ownerId);

if (!owner || owner.isApproved === 0) {
  return res.status(403).json({
    success: false,
    message: "Owner not approved by admin"
  });
}

  if (!brand || !model_name || !price_per_day || !vehicle_number) {
    return res.status(400).json({
      success: false,
      message: "All fields required"
    });
  }

  if (!req.files?.images || req.files.images.length !== 5) {
    return res.status(400).json({
      success: false,
      message: "Exactly 5 vehicle images required"
    });
  }

  try {
    // Insert vehicle first
    const result = db.prepare(`
      INSERT INTO vehicles (
        owner_id,
        vehicle_number,
        brand,
        model_name,
        price_per_day
      )
      VALUES (?, ?, ?, ?, ?)
    `).run(ownerId, vehicle_number, brand, model_name, price_per_day);

    const vehicleId = result.lastInsertRowid;

    // Create vehicle folder
    const vehicleFolder = `src/uploads/owners/${ownerId}/vehicles/${vehicleId}`;
    fs.mkdirSync(vehicleFolder, { recursive: true });

    // Save and encrypt fixed names
    encryptFile(req.files.rc[0].path, `${vehicleFolder}/rc.enc`);
    encryptFile(req.files.insurance[0].path, `${vehicleFolder}/insurance.enc`);
    encryptFile(req.files.puc[0].path, `${vehicleFolder}/puc.enc`);
    encryptFile(req.files.noc[0].path, `${vehicleFolder}/noc.enc`);

    // Save 5 images
    req.files.images.forEach((file, index) => {
      encryptFile(file.path, `${vehicleFolder}/image${index + 1}.enc`);
    });

    res.json({
      success: true,
      message: "Vehicle added successfully (Pending approval)"
    });

  } catch (error) {
    if (error.message.includes("UNIQUE")) {
      return res.status(400).json({
        success: false,
        message: "Vehicle number already registered"
      });
    }

    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


// VIEW MY VEHICLES
exports.getMyVehicles = (req, res) => {
  const ownerId = req.user.id;

  const vehicles = db
    .prepare("SELECT * FROM vehicles WHERE owner_id = ?")
    .all(ownerId);

  const data = vehicles.map(v => ({
    ...v,
    image_url: `/api/owner/vehicles/${v.id}/image1`
  }));

  res.json({
    success: true,
    data
  });
};

// =====================================
// DELETE VEHICLE + FOLDER
// =====================================
exports.deleteVehicle = (req, res) => {

  const ownerId = req.user.id;
  const vehicleId = req.params.id;

  const vehicle = db.prepare(`
    SELECT id FROM vehicles
    WHERE id = ? AND owner_id = ?
  `).get(vehicleId, ownerId);

  if (!vehicle) {
    return res.status(404).json({
      success: false,
      message: "Vehicle not found"
    });
  }

  const activeBooking = db.prepare(`
    SELECT id FROM bookings
    WHERE vehicle_id = ?
      AND status IN ('CONFIRMED','READY_TO_DELIVER')
  `).get(vehicleId);

  if (activeBooking) {
    return res.status(400).json({
      success: false,
      message: "Cannot delete vehicle with active bookings"
    });
  }

  // 🔥 DELETE VEHICLE FOLDER
  const vehicleFolderPath = path.join(
    __dirname,
    `../../uploads/owners/${ownerId}/vehicles/${vehicleId}`
  );

  if (fs.existsSync(vehicleFolderPath)) {
    fs.rmSync(vehicleFolderPath, { recursive: true, force: true });
  }

  // Delete from DB
  db.prepare(`
    DELETE FROM vehicles WHERE id = ?
  `).run(vehicleId);

  res.json({
    success: true,
    message: "Vehicle and files deleted successfully"
  });
};

// =====================================
// GET VEHICLE DETAILS (OWNER)
// =====================================
exports.getOwnerVehicleDetails = (req, res) => {

  const ownerId = req.user.id;
  const vehicleId = req.params.id;

  const vehicle = db.prepare(`
    SELECT *
    FROM vehicles
    WHERE id = ? AND owner_id = ?
  `).get(vehicleId, ownerId);

  if (!vehicle) {
    return res.status(404).json({
      success: false,
      message: "Vehicle not found"
    });
  }

  // Generate 5 image URLs
  const images = [];

  for (let i = 1; i <= 5; i++) {
    images.push(`/api/owner/vehicles/${vehicleId}/image${i}`);
  }

  res.json({
    success: true,
    data: {
      vehicle,
      images
    }
  });
};

// =====================================
// GET ALL BOOKINGS FOR OWNER VEHICLES
// =====================================
exports.getOwnerBookings = (req, res) => {

  const ownerId = req.user.id;

  const bookings = db.prepare(`
    SELECT 
      b.id as booking_id,
      b.start_datetime,
      b.end_datetime,
      b.total_price,
      b.status,
      v.id as vehicle_id,
      v.vehicle_number,
      v.brand,
      v.model_name,

      u.name as user_name,
      u.phone_number as user_phone

    FROM bookings b
    JOIN vehicles v ON b.vehicle_id = v.id
    JOIN users u ON b.user_id = u.id

    WHERE v.owner_id = ?
    ORDER BY b.start_datetime DESC
  `).all(ownerId);

  const data = bookings.map(b => ({
    ...b,
    vehicle_image: `/api/owner/vehicles/${b.vehicle_id}/image1`
  }));

  res.json({
    success: true,
    data
  });
};


exports.getOwnerBookingDetails = (req, res) => {

  const ownerId = req.user.id;
  const bookingId = req.params.id;

  const booking = db.prepare(`
    SELECT b.*, 
           v.vehicle_number,
           v.brand,
           v.model_name,
           u.id as user_id,
           u.name as user_name,
           u.phone_number
    FROM bookings b
    JOIN vehicles v ON b.vehicle_id = v.id
    JOIN users u ON b.user_id = u.id
    WHERE b.id = ?
      AND v.owner_id = ?
  `).get(bookingId, ownerId);

  if (!booking) {
    return res.status(404).json({
      success: false,
      message: "Booking not found"
    });
  }


  const images = [];

  for (let i = 1; i <= 5; i++) {
    images.push(`/api/owner/vehicles/${booking.vehicle_id}/image${i}`);
  }



  res.json({
    success: true,
    data: {
      ...booking,
      vehicle_images: images,
      documents: {
        aadhar_url: `/api/owner/bookings/${bookingId}/aadhar`,
        license_url: `/api/owner/bookings/${bookingId}/license`
      }
    }
  });
};

// TOGGLE AVAILABILITY
exports.toggleAvailability = (req, res) => {
  const vehicleId = req.params.id;
  const { availability_status } = req.body;
  const ownerId = req.user.id;

  const vehicle = db
    .prepare("SELECT * FROM vehicles WHERE id = ? AND owner_id = ?")
    .get(vehicleId, ownerId);

  if (!vehicle) {
    return res.status(404).json({
      success: false,
      message: "Vehicle not found"
    });
  }

  db.prepare(`
    UPDATE vehicles
    SET availability_status = ?
    WHERE id = ?
  `).run(availability_status, vehicleId);

  res.json({
    success: true,
    message: "Availability updated"
  });
};

const path = require("path");
exports.getVehicleImage = (req, res) => {

  const ownerId = req.user.id;
  const vehicleId = req.params.id;
  const imageName = req.params.imageName; // image1, image2...

  // Validate vehicle ownership
  const vehicle = db.prepare(`
    SELECT id FROM vehicles
    WHERE id = ? AND owner_id = ?
  `).get(vehicleId, ownerId);

  if (!vehicle) {
    return res.status(404).json({
      success: false,
      message: "Vehicle not found"
    });
  }

  const filePath = path.join(
    __dirname,
    `../../uploads/owners/${ownerId}/vehicles/${vehicleId}/${imageName}.enc`
  );

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({
      success: false,
      message: "Image not found"
    });
  }

  try {
    const decryptedBuffer = decryptFile(filePath);

    // 🔥 VERY IMPORTANT
    res.setHeader("Content-Type", "image/jpeg");
    res.setHeader("Content-Length", decryptedBuffer.length);

    res.end(decryptedBuffer);

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error decrypting image"
    });
  }
};


exports.getBookingLicense = (req, res) => {

  const ownerId = req.user.id;
  const bookingId = req.params.id;

  const booking = db.prepare(`
    SELECT b.id, b.user_id
    FROM bookings b
    JOIN vehicles v ON b.vehicle_id = v.id
    WHERE b.id = ?
      AND v.owner_id = ?
  `).get(bookingId, ownerId);

  if (!booking) {
    return res.status(404).json({
      success: false,
      message: "Not authorized"
    });
  }

  const filePath = `src/uploads/bookings/${bookingId}/license.enc`;

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({
      success: false,
      message: "License not found"
    });
  }

  const decryptedBuffer = decryptFile(filePath);

  res.setHeader("Content-Type", "image/jpeg");
  res.send(decryptedBuffer);
};

exports.getUserAadhar = (req, res) => {

  const ownerId = req.user.id;
  const bookingId = req.params.id;

  const booking = db.prepare(`
    SELECT b.user_id
    FROM bookings b
    JOIN vehicles v ON b.vehicle_id = v.id
    WHERE b.id = ?
      AND v.owner_id = ?
  `).get(bookingId, ownerId);

  if (!booking) {
    return res.status(404).json({
      success: false,
      message: "Not authorized"
    });
  }

  const filePath = `src/uploads/users/${booking.user_id}/aadhar.enc`;

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({
      success: false,
      message: "Aadhar not found"
    });
  }

  const decryptedBuffer = decryptFile(filePath);

  res.setHeader("Content-Type", "image/jpeg");
  res.send(decryptedBuffer);
};