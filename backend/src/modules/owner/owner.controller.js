const { decryptFile } = require("../../utils/fileEncryption");
const { downloadAndDecryptFile } = require("../../utils/fileEncryption");
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
  const conn = await db.getConnection();
  try {
  const ownerId = req.user.id;
  const { vehicle_number,brand,model_name,hourly_price,daily_price,pickup_address,pickup_map_link } = req.body;
  // files
  const rc = req.files?.rc?.[0];
  const insurance = req.files?.insurance?.[0];
  const puc = req.files?.puc?.[0];
  const noc = req.files?.noc?.[0];
  const images = req.files?.images || [];

    if (!vehicle_number||!brand||!model_name||!hourly_price||!daily_price||!pickup_address||
        !pickup_map_link) {
      return res.status(400).json({ success: false, message: "All details required" });
    }
    if (!rc||!puc||!noc||!insurance||images.length===0) {
      return res.status(400).json({ success: false, message: "All files required" });
    }
    await conn.beginTransaction();
    const [existingRows] =
      await conn.query(`
        SELECT id
        FROM vehicles
        WHERE vehicle_number = ?
        LIMIT 1
      `, [vehicle_number]);

    if (existingRows[0]) {
      await conn.rollback();
      return res.status(400).json({ success: false, message: "Vehicle already exists"});
    }

    // Insert vehicle into MySQL
    const [result] = await conn.query(`
      INSERT INTO vehicles (
        owner_id,vehicle_number,brand,model_name,hourly_price,daily_price,
        pickup_address,pickup_map_link,status,availability_status
      )
      VALUES (?,?,?,?, ?,?,?,?,'PENDING','AVAILABLE')
    `, [ownerId, vehicle_number, brand, model_name, hourly_price, daily_price, pickup_address, pickup_map_link]);

    const vehicleId = result.insertId;

    // Create vehicle folder path
    const vehicleFolder = `owners/${ownerId}/vehicles/${vehicleId}`;
    const uploads = [];

    // Document uploads
    uploads.push(encryptFile(rc.path, `${vehicleFolder}/rc`));
    uploads.push(encryptFile(insurance.path, `${vehicleFolder}/insurance`));
    uploads.push(encryptFile(puc.path, `${vehicleFolder}/puc`));
    uploads.push(encryptFile(noc.path, `${vehicleFolder}/noc`));

    // Image uploads
    images.forEach((file, index) => {
      uploads.push(encryptFile(file.path, `${vehicleFolder}/image${index + 1}`));
    });
    await Promise.all(uploads);
    await conn.commit();

    res.json({
      success: true,
      message: "Vehicle added successfully (Pending approval)"
    });

  } catch (error) {
    await conn.rollback();
    if (error.code === 'ER_DUP_ENTRY' || error.message.includes("UNIQUE")) {
      return res.status(400).json({
        success: false,
        message: "Vehicle number already registered"
      });
    }
    res.status(500).json({ success: false, message: error.message });
  } finally{
    conn.release();
  }
};

// =====================================
// VIEW MY VEHICLES
// =====================================
exports.getMyVehicles = async (req, res) => {
  const ownerId = req.user.id;

  try {
    const [vehicles] = await db.query(
      "SELECT * FROM vehicles WHERE owner_id = ? ORDER BY created_at DESC", 
      [ownerId]);

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
    const [vehicleRows] = await db.query(`
      SELECT id FROM vehicles WHERE id = ? AND owner_id = ?
    `, [vehicleId, ownerId]);

    const vehicle = vehicleRows[0];

    if (!vehicle) {
      return res.status(404).json({ success: false, message: "Vehicle not found" });
    }

    const [bookingRows] = await db.query(`
      SELECT id FROM bookings
      WHERE vehicle_id = ? AND status IN ( 'PENDING','CONFIRMED','READY_TO_DELIVER') LIMIT 1
    `, [vehicleId]);
    
    const activeBooking = bookingRows[0];

    if (activeBooking) {
      return res.status(400).json({
        success: false,
        message: "Vehicle has active bookings"
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
    const [rows] = await db.query(`SELECT * FROM vehicles WHERE id = ? AND owner_id = ?`, [vehicleId, ownerId]);
    const vehicle = rows[0];
    if (!vehicle) {
      return res.status(404).json({ success: false, message: "Vehicle not found" });
    }

    const images = Array.from({ length: 5 }, (_, i) => `/api/owner/vehicles/${vehicleId}/image${i + 1}`);
    res.json({
      success: true,
      data: { ...vehicle, images }
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
        b.id as booking_id, b.start_datetime, b.end_datetime, b.booking_type, 
        b.total_days, b.total_price, b.driver_name, b.status, b.created_at, 
        v.id as vehicle_id, v.vehicle_number, v.brand, v.model_name,
        bu.email as customer_email 
      FROM bookings b
      JOIN vehicles v ON b.vehicle_id = v.id
      JOIN booking_users bu ON b.booking_user_id = bu.id
      WHERE v.owner_id = ?
      ORDER BY b.created_at DESC
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
    const [rows] = await db.query(`
      SELECT b.*, 
             v.vehicle_number,
       v.brand,
       v.model_name,
       v.pickup_address,
       v.pickup_map_link,
             bu.id as booking_user_id,
            bu.email as customer_email
      FROM bookings b
      JOIN vehicles v ON b.vehicle_id = v.id
      JOIN booking_users bu ON b.booking_user_id = bu.id
      WHERE b.id = ?
        AND v.owner_id = ? LIMIT 1
    `, [bookingId, ownerId]);
    const booking = rows[0];
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
    const [rows] = await db.query(`
      SELECT id FROM vehicles WHERE id = ? AND owner_id = ? LIMIT 1`, 
      [vehicleId, ownerId]
    );
    const vehicle = rows[0];

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
    const [rows] = await db.query(`
      SELECT b.license_url FROM bookings b
      JOIN vehicles v ON b.vehicle_id = v.id
      WHERE b.id = ? AND v.owner_id = ? LIMIT 1
    `, [bookingId, ownerId]);
    
    const booking = rows[0];

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Not authorized"
      });
    }

    const decryptedBuffer = await downloadAndDecryptFile(booking.license_url);

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
    const [rows] = await db.query(`
      SELECT b.aadhar_url FROM bookings b
      JOIN vehicles v ON b.vehicle_id = v.id
      WHERE b.id = ? AND v.owner_id = ?
    `, [bookingId, ownerId]);

    const booking = rows[0];

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Not authorized"
      });
    }

    const decryptedBuffer = await downloadAndDecryptFile(booking.aadhar_url);

    res.setHeader("Content-Type", "image/jpeg");
    res.send(decryptedBuffer);

  } catch (error) {
    if (error.message === "FILE_NOT_FOUND") {
      return res.status(404).json({ success: false, message: "Image not found" });
    }
    return res.status(500).json({ success: false, message: "Failed to load image" });
  }
};

exports.getPendingBookings = async (req, res) => {
  const ownerId = req.user.id;
  try {
    const [bookings] = await db.query(`
      SELECT b.id as booking_id, b.booking_type,
        b.start_datetime, b.end_datetime,
        b.total_days, b.total_price,
        b.driver_name, b.status,
        b.created_at,
        v.id as vehicle_id, v.vehicle_number,
        v.brand, v.model_name,
        bu.email as customer_email
      FROM bookings b
      JOIN vehicles v ON b.vehicle_id = v.id
      JOIN booking_users bu ON b.booking_user_id = bu.id
      WHERE v.owner_id = ? AND b.status = 'PENDING'
      ORDER BY b.created_at DESC
    `, [ownerId]);

    const data = bookings.map(booking => ({
      ...booking,vehicle_image: `/api/owner/vehicles/${booking.vehicle_id}/image1`
    }));

    res.json({success: true,data});
  } catch (error) {
    res.status(500).json({success: false, message: error.message});
  }
};

exports.approveBooking = async (req, res) => {
  const ownerId = req.user.id;
  const bookingId = req.params.id;
  try {
    const [rows] = await db.query(`
      SELECT b.id, b.status FROM bookings b
      JOIN vehicles v ON b.vehicle_id = v.id
      WHERE b.id = ? AND v.owner_id = ?
      LIMIT 1
    `, [bookingId, ownerId]);
    const booking = rows[0];

    if (!booking) {
      return res.status(404).json({success: false, message: "Booking not found"});
    }

    if (booking.status !== "PENDING") {
      return res.status(400).json({success: false,  message: "Only pending bookings can be approved"});
    }
    await db.query(`UPDATE bookings SET status = 'CONFIRMED' WHERE id = ?
    `, [bookingId]);
    res.json({success: true, message: "Booking approved"});
  } catch (error) {
    res.status(500).json({success: false, message: error.message });
  }
};

exports.rejectBooking = async (req, res) => {
  const ownerId = req.user.id;
  const bookingId = req.params.id;
  const { reason } = req.body;

  try {
    if (!reason) {
      return res.status(400).json({success: false, message: "Rejection reason required"});
    }

    const [rows] = await db.query(`
      SELECT b.id, b.status FROM bookings b
      JOIN vehicles v ON b.vehicle_id = v.id
      WHERE b.id = ? AND v.owner_id = ? LIMIT 1
    `, [bookingId, ownerId]);
    const booking = rows[0];

    if (!booking) {
      return res.status(404).json({success: false, message: "Booking not found"});
    }

    if (booking.status !== "PENDING") {
      return res.status(400).json({ success: false, message:"Only pending bookings can be rejected"});
    }
    await db.query(`UPDATE bookings SET status = 'REJECTED',rejection_reason = ? WHERE id = ?
    `, [reason,bookingId]);

    res.json({success: true, message: "Booking rejected"});

  } catch (error) {
     res.status(500).json({success: false, message: error.message}); 
    }
};