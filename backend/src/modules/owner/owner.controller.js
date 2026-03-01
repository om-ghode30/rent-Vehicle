const db = require("../../config/db");
const fs = require("fs");
const { encryptFile } = require("../../utils/fileEncryption");
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

  res.json({
    success: true,
    data: vehicles
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

  res.json({
    success: true,
    data: bookings
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

  res.json({
    success: true,
    data: booking
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