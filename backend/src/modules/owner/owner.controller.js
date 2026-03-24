const { decryptFile } = require("../../utils/fileEncryption");
const db = require("../../config/db");
const fs = require("fs");
const { encryptFile } = require("../../utils/fileEncryption");

// Helper for single row fetching
async function getOne(query, params) {
  const [rows] = await db.query(query, params);
  return rows[0] || null;
}

// =====================================
// ADD VEHICLE
// =====================================
exports.addVehicle = async (req, res) => {
  const { brand, model_name, price_per_day, vehicle_number } = req.body;
  const ownerId = req.user.id;

  try {
    const owner = await getOne(`SELECT isApproved FROM users WHERE id = ?`, [ownerId]);

    if (!owner || owner.isApproved === 0) {
      return res.status(403).json({
        success: false,
        message: "Owner not approved by admin"
      });
    }

    if (!brand || !model_name || !price_per_day || !vehicle_number) {
      return res.status(400).json({ success: false, message: "All fields required" });
    }

    if (!req.files?.images || req.files.images.length !== 5) {
      return res.status(400).json({
        success: false,
        message: "Exactly 5 vehicle images required"
      });
    }

    // Insert vehicle into MySQL
    const [result] = await db.query(`
      INSERT INTO vehicles (
        owner_id,
        vehicle_number,
        brand,
        model_name,
        price_per_day
      )
      VALUES (?, ?, ?, ?, ?)
    `, [ownerId, vehicle_number, brand, model_name, price_per_day]);

    const vehicleId = result.insertId;

    // Create vehicle folder path
    const vehicleFolder = `owners/${ownerId}/vehicles/${vehicleId}`;
    const uploads = [];

    // Document uploads
    uploads.push(encryptFile(req.files.rc[0].path, `${vehicleFolder}/rc`));
    uploads.push(encryptFile(req.files.insurance[0].path, `${vehicleFolder}/insurance`));
    uploads.push(encryptFile(req.files.puc[0].path, `${vehicleFolder}/puc`));
    uploads.push(encryptFile(req.files.noc[0].path, `${vehicleFolder}/noc`));

    // Image uploads
    req.files.images.forEach((file, index) => {
      uploads.push(encryptFile(file.path, `${vehicleFolder}/image${index + 1}`));
    });

    await Promise.all(uploads);

    res.json({
      success: true,
      message: "Vehicle added successfully (Pending approval)"
    });

  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY' || error.message.includes("UNIQUE")) {
      return res.status(400).json({
        success: false,
        message: "Vehicle number already registered"
      });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

// =====================================
// VIEW MY VEHICLES
// =====================================
exports.getMyVehicles = async (req, res) => {
  const ownerId = req.user.id;

  try {
    const [vehicles] = await db.query(
      "SELECT * FROM vehicles WHERE owner_id = ?", 
      [ownerId]
    );

    const data = vehicles.map(v => ({
      ...v,
      image_url: `/api/owner/vehicles/${v.id}/image1`
    }));

    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// =====================================
// DELETE VEHICLE
// =====================================
exports.deleteVehicle = async (req, res) => {
  const ownerId = req.user.id;
  const vehicleId = req.params.id;

  try {
    const vehicle = await getOne(`
      SELECT id FROM vehicles WHERE id = ? AND owner_id = ?
    `, [vehicleId, ownerId]);

    if (!vehicle) {
      return res.status(404).json({ success: false, message: "Vehicle not found" });
    }

    const activeBooking = await getOne(`
      SELECT id FROM bookings
      WHERE vehicle_id = ? AND status IN ('CONFIRMED','READY_TO_DELIVER')
    `, [vehicleId]);

    if (activeBooking) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete vehicle with active bookings"
      });
    }

    // Note: Cloudinary logic kept as is from your snippet
    /* await cloudinary.api.delete_resources_by_prefix(`rental-vehicle/owners/${ownerId}/vehicles/${vehicleId}`);
    await cloudinary.api.delete_folder(`rental-vehicle/owners/${ownerId}/vehicles/${vehicleId}`);
    */

    await db.query(`DELETE FROM vehicles WHERE id = ?`, [vehicleId]);

    res.json({ success: true, message: "Vehicle deleted successfully" });

  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to delete vehicle" });
  }
};

// =====================================
// GET VEHICLE DETAILS (OWNER)
// =====================================
exports.getOwnerVehicleDetails = async (req, res) => {
  const ownerId = req.user.id;
  const vehicleId = req.params.id;

  try {
    const vehicle = await getOne(`
      SELECT * FROM vehicles WHERE id = ? AND owner_id = ?
    `, [vehicleId, ownerId]);

    if (!vehicle) {
      return res.status(404).json({ success: false, message: "Vehicle not found" });
    }

    const images = Array.from({ length: 5 }, (_, i) => `/api/owner/vehicles/${vehicleId}/image${i + 1}`);

    res.json({
      success: true,
      data: { vehicle, images }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// =====================================
// GET ALL BOOKINGS FOR OWNER VEHICLES
// =====================================
exports.getOwnerBookings = async (req, res) => {
  const ownerId = req.user.id;

  try {
    const [bookings] = await db.query(`
      SELECT 
        b.id as booking_id, b.start_datetime, b.end_datetime, 
        b.total_price, b.status, v.id as vehicle_id, 
        v.vehicle_number, v.brand, v.model_name,
        u.name as user_name, u.phone_number as user_phone
      FROM bookings b
      JOIN vehicles v ON b.vehicle_id = v.id
      JOIN users u ON b.user_id = u.id
      WHERE v.owner_id = ?
      ORDER BY b.start_datetime DESC
    `, [ownerId]);

    const data = bookings.map(b => ({
      ...b,
      vehicle_image: `/api/owner/vehicles/${b.vehicle_id}/image1`
    }));

    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// =============================
// GET OWNER BOOKING DETAILS
// =============================
exports.getOwnerBookingDetails = async (req, res) => { // Added async
  const ownerId = req.user.id;
  const bookingId = req.params.id;

  try {
    const booking = await getOne(`
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
    `, [bookingId, ownerId]);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found"
      });
    }

    const images = Array.from({ length: 5 }, (_, i) => `/api/owner/vehicles/${booking.vehicle_id}/image${i + 1}`);

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
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// =============================
// TOGGLE AVAILABILITY
// =============================
exports.toggleAvailability = async (req, res) => { // Added async
  const vehicleId = req.params.id;
  const { availability_status } = req.body;
  const ownerId = req.user.id;

  try {
    const vehicle = await getOne(
      "SELECT id FROM vehicles WHERE id = ? AND owner_id = ?", 
      [vehicleId, ownerId]
    );

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: "Vehicle not found"
      });
    }

    await db.query(`
      UPDATE vehicles
      SET availability_status = ?
      WHERE id = ?
    `, [availability_status, vehicleId]);

    res.json({
      success: true,
      message: "Availability updated"
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// =============================
// GET VEHICLE IMAGE
// =============================
exports.getVehicleImage = async (req, res) => {
  const ownerId = req.user.id;
  const vehicleId = req.params.id;
  const imageName = req.params.imageName; 

  try {
    // Validate vehicle ownership
    const vehicle = await getOne(`
      SELECT id FROM vehicles
      WHERE id = ? AND owner_id = ?
    `, [vehicleId, ownerId]);

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: "Vehicle not found"
      });
    }

    const filePath = `owners/${ownerId}/vehicles/${vehicleId}/${imageName}`;
    const decryptedBuffer = await decryptFile(filePath);

    res.setHeader("Content-Type", "image/jpeg");
    res.setHeader("Content-Length", decryptedBuffer.length);
    res.end(decryptedBuffer);

  } catch (error) {
    if (error.message === "FILE_NOT_FOUND") {
      return res.status(404).json({ success: false, message: "Image not found" });
    }
    return res.status(500).json({ success: false, message: "Failed to load image" });
  }
};

// =============================
// GET BOOKING LICENSE
// =============================
exports.getBookingLicense = async (req, res) => {
  const ownerId = req.user.id;
  const bookingId = req.params.id;

  try {
    const booking = await getOne(`
      SELECT b.id
      FROM bookings b
      JOIN vehicles v ON b.vehicle_id = v.id
      WHERE b.id = ?
        AND v.owner_id = ?
    `, [bookingId, ownerId]);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Not authorized"
      });
    }

    const filePath = `bookings/${bookingId}/license`;
    const decryptedBuffer = await decryptFile(filePath);

    res.setHeader("Content-Type", "image/jpeg");
    res.send(decryptedBuffer);

  } catch (error) {
    if (error.message === "FILE_NOT_FOUND") {
      return res.status(404).json({ success: false, message: "Image not found" });
    }
    return res.status(500).json({ success: false, message: "Failed to load image" });
  }
};

// =============================
// GET USER AADHAR (FOR OWNER VIEW)
// =============================
exports.getUserAadhar = async (req, res) => {
  const ownerId = req.user.id;
  const bookingId = req.params.id;

  try {
    const booking = await getOne(`
      SELECT b.user_id
      FROM bookings b
      JOIN vehicles v ON b.vehicle_id = v.id
      WHERE b.id = ?
        AND v.owner_id = ?
    `, [bookingId, ownerId]);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Not authorized"
      });
    }

    const filePath = `users/${booking.user_id}/aadhar`;
    const decryptedBuffer = await decryptFile(filePath);

    res.setHeader("Content-Type", "image/jpeg");
    res.send(decryptedBuffer);

  } catch (error) {
    if (error.message === "FILE_NOT_FOUND") {
      return res.status(404).json({ success: false, message: "Image not found" });
    }
    return res.status(500).json({ success: false, message: "Failed to load image" });
  }
};