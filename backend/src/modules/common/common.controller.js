const db = require("../../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { encrypt } = require("../../utils/encryption");
const fs = require("fs");
const path = require("path");
const { encryptFile } = require("../../utils/fileEncryption");
const { decryptFile } = require("../../utils/fileEncryption");
const generateOTP = require("../../utils/otp");
const { sendOTPEmail } = require("../../services/email.service");


// REGISTER OWNER
const register = async (req, res) => {
  const { name, email, password,phone_number,role } = req.body;

  if (!name || !email || !password||!phone_number || !role || !req.file) {
    return res.status(400).json({
      success: false,
      message: "All fields including Aadhar file required"
    });
  }
if (!["USER", "OWNER"].includes(role)) {
    return res.status(400).json({
      success: false,
      message: "Invalid role"
    });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^\d{10}$/;
if (!emailRegex.test(email)) {
  return res.status(400).json({
    success: false,
    message: "Invalid email format"
  });
}
if(!phoneRegex.test(phone_number)) {
  return res.status(400).json({
    success: false,
    message: "Invalid phone number and Phone number should be 10 digit"
  });
}
if (password.length < 6) {
  return res.status(400).json({
    success: false,
    message: "Password must be at least 6 characters"
  });
}
  const existingUser = db
    .prepare("SELECT * FROM users WHERE email = ?")
    .get(email);

  if (existingUser) {
    return res.status(400).json({
      success: false,
      message: "Email already registered"
    });
  }

  
try{

  const otpRecord = db.prepare(`
  SELECT * FROM otp_verifications
  WHERE email = ?
  ORDER BY id DESC
`).get(email);

if (!otpRecord) {
  return res.status(400).json({
    success: false,
    message: "Please verify OTP first"
  });
}

// check expiry
if (new Date(otpRecord.expires_at) < new Date()) {
  return res.status(400).json({
    success: false,
    message: "OTP expired"
  });
}

// check verified flag
if (otpRecord.is_verified !== 1) {
  return res.status(400).json({
    success: false,
    message: "OTP not verified"
  });
}

  const hashedPassword = bcrypt.hashSync(password, 10);
  console.log(name, email,phone_number, hashedPassword,role);
  const result = db.prepare(`
    INSERT INTO users (name, email,phone_number, password, role)
    VALUES (?, ?, ?, ?, ?)
  `).run(name, email,phone_number, hashedPassword,role);
    
  const userId = result.lastInsertRowid;
  // Create owner folder
  const baseFolder = role === "OWNER"
      ? `owners/${userId}`
      : `users/${userId}`;
 
  const encryptedPath = `${baseFolder}/aadhar`;
  await encryptFile(req.file.path, encryptedPath);
  res.json({
    success: true,
    message: `${role} registered successfully. Waiting for admin approval.`
  });
  } catch (error) {

  if (error.message.includes("UNIQUE")) {
    return res.status(400).json({
      success: false,
      message: "Email already exists"
    });
  }
  
  if (error.message === "FILE_NOT_FOUND") {
      return res.status(404).json({
        success: false,
        message: "Image not found"
      });
    }

    console.error(error);


  return res.status(500).json({
    success: false,
    message: error.message
  });
}
};


// LOGIN
const login = (req, res) => {
  const { email, password } = req.body;

  const user = db
    .prepare("SELECT * FROM users WHERE email = ? and isblocked=0")
    .get(email);

  if (!user) {
    return res.status(400).json({
      success: false,
      message: "Invalid credentials"
    });
  }
  

  const isMatch = bcrypt.compareSync(password, user.password);

  if (!isMatch) {
    return res.status(400).json({
      success: false,
      message: "Invalid credentials"
    });
  }

  // 🔥 ADD THIS BLOCK HERE
if (user.isApproved !== 1) {
  return res.status(403).json({
    success: false,
    message: "Your account is pending admin approval"
  });
}

  const token = jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );

  res.cookie("token", token, {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    maxAge: 24 * 60 * 60 * 1000
  });

  res.json({
    success: true,
    message: "Login successful",
    role: user.role
  });
};
// =============================
// LOGOUT
// =============================
const logout = (req, res) => {

  res.clearCookie("token", {
    httpOnly: true,
    secure: false,
    sameSite: "lax"
  });

  res.json({
    success: true,
    message: "Logged out successfully"
  });
};

// =============================
// GET CURRENT USER
// =============================
const getCurrentUser = (req, res) => {

  const user = db.prepare(`
    SELECT id, name, email, phone_number, role, isApproved
    FROM users
    WHERE id = ?
  `).get(req.user.id);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found"
    });
  }

  res.json({
    success: true,
    data: user
  });
};

// =====================================
// GET ALL APPROVED VEHICLES (MINIMAL)
// =====================================
const getApprovedVehicles = (req, res) => {
  console.log("called");
try{
  const vehicles = db.prepare(`
    SELECT 
      v.id as vehicle_id,
      v.vehicle_number,
      v.brand,
      v.model_name,
      v.price_per_day,
      u.name as owner_name
    FROM vehicles v
    JOIN users u ON v.owner_id = u.id
    WHERE v.status = 'APPROVED'
      AND v.availability_status = 'AVAILABLE'
      AND v.isBlocked = 0
      AND (
        v.is_temporarily_locked = 0
        OR v.lock_expiry_time < datetime('now')
      )
  `).all();

  const data = vehicles.map(v => ({
    ...v,
    image_url: `/api/common/vehicles/${v.vehicle_id}/image`
  }));

  res.json({ success: true, data });

  }catch (error) {
return res.status(500).json({
    success: false,
    message: error.message
  });
  
}
  
};

// =====================================
// GET FULL VEHICLE DETAILS (PUBLIC)
// =====================================
const getVehicleDetailsPublic = (req, res) => {

  const vehicleId = req.params.vehicleId;

  const vehicle = db.prepare(`
    SELECT id, vehicle_number, brand, model_name, price_per_day
    FROM vehicles
    WHERE id = ?
      AND status = 'APPROVED' AND isblocked=0
  `).get(vehicleId);

  if (!vehicle) {
    return res.status(404).json({
      success: false,
      message: "Vehicle not found"
    });
  }

  const owner = db.prepare(`
    SELECT name, phone_number, address
    FROM users
    WHERE id = (
      SELECT owner_id FROM vehicles WHERE id = ?
    )
  `).get(vehicleId);

  res.json({
    success: true,
    data: {
      vehicle,
      owner,
      images: [
        `/api/common/vehicles/${vehicleId}/docs/image1`,
        `/api/common/vehicles/${vehicleId}/docs/image2`,
        `/api/common/vehicles/${vehicleId}/docs/image3`,
        `/api/common/vehicles/${vehicleId}/docs/image4`,
        `/api/common/vehicles/${vehicleId}/docs/image5`
      ]
    }
  });
};

const getVehicleFirstImage = async (req, res) => {

  const vehicleId = req.params.vehicleId;

  const vehicle = db.prepare(`
    SELECT owner_id FROM vehicles WHERE id = ?
  `).get(vehicleId);

  if (!vehicle) {
    return res.status(404).json({ success: false, message: "Vehicle not found" });
  }
  try{
  const filePath = `owners/${vehicle.owner_id}/vehicles/${vehicleId}/image1`;
  res.setHeader("Content-Type", "image/jpeg");
  const fileBuffer = await decryptFile(filePath);

  res.send(fileBuffer);
  }catch(error){
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

const getVehicleImage = async (req, res) => {

  const { vehicleId, fileName } = req.params;
  const vehicle = db.prepare(`
    SELECT owner_id FROM vehicles WHERE id = ?
  `).get(vehicleId);

  if (!vehicle) {
    return res.status(404).json({ success: false, message: "Vehicle not found" });
  }

  const filePath = `owners/${vehicle.owner_id}/vehicles/${vehicleId}/${fileName}`;

  try{
  console.log(filePath);
  const fileBuffer =await decryptFile(filePath);
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
// =====================================
// DEV HARDCODED QUERY RUNNER (TEMP)
// =====================================
const runHardcodedQuery = (req, res) => {

  
  try {

// const Query = "select * from bookings ;";
const Query = "ALTER TABLE otp_verifications ADD COLUMN is_verified INTEGER DEFAULT 0;";

    let result;

    
      // result = db.prepare(Query).all();
      result = db.prepare(Query).run(); 

  res.json({ success: true, result });

  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};


const sendOTP = async (req, res) => {
  try {

    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email required"
      });
    }

    const otp = generateOTP();

    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 min

    db.prepare(`
      INSERT INTO otp_verifications (email, otp, expires_at)
      VALUES (?, ?, ?)
    `).run(email, otp, expiresAt.toISOString());

    await sendOTPEmail(email, otp);

    res.json({
      success: true,
      message: "OTP sent successfully"
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to send OTP"
    });
  }
};

const verifyOTP = (req, res) => {

  const { email, otp } = req.body;

  const record = db.prepare(`
    SELECT * FROM otp_verifications
    WHERE email = ? AND otp = ?
    ORDER BY id DESC
  `).get(email, otp);

  if (!record) {
    return res.status(400).json({
      success: false,
      message: "Invalid OTP"
    });
  }

  if (new Date(record.expires_at) < new Date()) {
    return res.status(400).json({
      success: false,
      message: "OTP expired"
    });
  }

  // ✅ mark verified
  db.prepare(`
    UPDATE otp_verifications
    SET is_verified = 1
    WHERE id = ?
  `).run(record.id);

  res.json({
    success: true,
    message: "OTP verified"
  });
};

module.exports = {
  register,
  login,
  logout,
  getCurrentUser,
  getApprovedVehicles,
  getVehicleDetailsPublic,
  getVehicleImage,
  getVehicleFirstImage,
  runHardcodedQuery,
  sendOTP,  
  verifyOTP
};