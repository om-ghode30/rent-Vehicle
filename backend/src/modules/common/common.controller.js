const db = require("../../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { encryptFile, decryptFile } = require("../../utils/fileEncryption");
const generateOTP = require("../../utils/otp");
const { sendOTPEmail } = require("../../services/email.service");

// Helper for single row fetching in MySQL
async function getOne(query, params) {
  const [rows] = await db.query(query, params);
  return rows[0] || null;
}

// =============================
// REGISTER OWNER / USER
// =============================
const register = async (req, res) => {
  const { name, email, password, phone_number, role } = req.body;

  if (!name || !email || !password || !phone_number || !role || !req.file) {
    return res.status(400).json({
      success: false,
      message: "All fields including Aadhar file required"
    });
  }

  if (!["USER", "OWNER"].includes(role)) {
    return res.status(400).json({ success: false, message: "Invalid role" });
  }

  // Validations
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex = /^\d{10}$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ success: false, message: "Invalid email format" });
  }
  if (!phoneRegex.test(phone_number)) {
    return res.status(400).json({ success: false, message: "Invalid phone number (10 digits required)" });
  }
  if (password.length < 6) {
    return res.status(400).json({ success: false, message: "Password must be at least 6 characters" });
  }

  const existingUser = await getOne("SELECT * FROM users WHERE email = ?", [email]);
  if (existingUser) {
    return res.status(400).json({ success: false, message: "Email already registered" });
  }

  try {
    const otpRecord = await getOne(`
      SELECT * FROM otp_verifications
      WHERE email = ?
      ORDER BY id DESC LIMIT 1
    `, [email]);

    if (!otpRecord) {
      return res.status(400).json({ success: false, message: "Please verify OTP first" });
    }

    if (new Date(otpRecord.expires_at) < new Date()) {
      return res.status(400).json({ success: false, message: "OTP expired" });
    }

    if (otpRecord.is_verified !== 1) {
      return res.status(400).json({ success: false, message: "OTP not verified" });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);
    
    const [result] = await db.query(`
      INSERT INTO users (name, email, phone_number, password, role)
      VALUES (?, ?, ?, ?, ?)
    `, [name, email, phone_number, hashedPassword, role]);

    const userId = result.insertId;
    const baseFolder = role === "OWNER" ? `owners/${userId}` : `users/${userId}`;
    const encryptedPath = `${baseFolder}/aadhar`;

    await encryptFile(req.file.path, encryptedPath);

    res.json({
      success: true,
      message: `${role} registered successfully. Waiting for admin approval.`
    });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY' || error.message.includes("UNIQUE")) {
      return res.status(400).json({ success: false, message: "Email already exists" });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

// =============================
// LOGIN
// =============================
const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await getOne("SELECT * FROM users WHERE email = ? AND isBlocked = 0", [email]);

  if (!user) {
    return res.status(400).json({ success: false, message: "Invalid credentials or blocked" });
  }

  const isMatch = bcrypt.compareSync(password, user.password);
  if (!isMatch) {
    return res.status(400).json({ success: false, message: "Invalid credentials" });
  }

  if (user.isApproved !== 1) {
    return res.status(403).json({ success: false, message: "Your account is pending admin approval" });
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

  res.json({ success: true, message: "Login successful", role: user.role,token:token });
};

const logout = (req, res) => {
  res.clearCookie("token", { httpOnly: true, secure: false, sameSite: "lax" });
  res.json({ success: true, message: "Logged out successfully" });
};

const getCurrentUser = async (req, res) => {
  const user = await getOne(`
    SELECT id, name, email, phone_number, role, isApproved
    FROM users WHERE id = ?
  `, [req.user.id]);

  if (!user) {
    return res.status(404).json({ success: false, message: "User not found" });
  }
  res.json({ success: true, data: user });
};

// =====================================
// VEHICLE ANALYTICS / DETAILS
// =====================================
const getApprovedVehicles = async (req, res) => {
  try {
    const [vehicles] = await db.query(`
      SELECT 
        v.id as vehicle_id, v.vehicle_number, v.brand, 
        v.model_name, v.price_per_day, u.name as owner_name
      FROM vehicles v
      JOIN users u ON v.owner_id = u.id
      WHERE v.status = 'APPROVED'
        AND v.availability_status = 'AVAILABLE'
        AND v.isBlocked = 0
        AND (
          v.is_temporarily_locked = 0
          OR v.lock_expiry_time < NOW()
        )
    `);

    const data = vehicles.map(v => ({
      ...v,
      image_url: `/api/common/vehicles/${v.vehicle_id}/image`
    }));

    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getVehicleDetailsPublic = async (req, res) => {
  const vehicleId = req.params.vehicleId;

  const vehicle = await getOne(`
    SELECT id, vehicle_number, brand, model_name, price_per_day
    FROM vehicles WHERE id = ? AND status = 'APPROVED' AND isBlocked = 0
  `, [vehicleId]);

  if (!vehicle) {
    return res.status(404).json({ success: false, message: "Vehicle not found" });
  }

  const owner = await getOne(`
    SELECT name, phone_number, address FROM users
    WHERE id = (SELECT owner_id FROM vehicles WHERE id = ?)
  `, [vehicleId]);

  res.json({
    success: true,
    data: {
      vehicle,
      owner,
      images: Array.from({ length: 5 }, (_, i) => `/api/common/vehicles/${vehicleId}/docs/image${i + 1}`)
    }
  });
};

// =============================
// IMAGE HANDLERS
// =============================
const getVehicleFirstImage = async (req, res) => {
  const vehicleId = req.params.vehicleId;
  const vehicle = await getOne(`SELECT owner_id FROM vehicles WHERE id = ?`, [vehicleId]);

  if (!vehicle) return res.status(404).json({ success: false, message: "Vehicle not found" });

  try {
    const filePath = `owners/${vehicle.owner_id}/vehicles/${vehicleId}/image1`;
    const fileBuffer = await decryptFile(filePath);
    res.setHeader("Content-Type", "image/jpeg");
    res.send(fileBuffer);
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to load image" });
  }
};

const getVehicleImage = async (req, res) => {
  const { vehicleId, fileName } = req.params;
  const vehicle = await getOne(`SELECT owner_id FROM vehicles WHERE id = ?`, [vehicleId]);

  if (!vehicle) return res.status(404).json({ success: false, message: "Vehicle not found" });

  try {
    const filePath = `owners/${vehicle.owner_id}/vehicles/${vehicleId}/${fileName}`;
    const fileBuffer = await decryptFile(filePath);
    res.setHeader("Content-Type", "image/jpeg");
    res.send(fileBuffer);
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to load image" });
  }
};

// =============================
// DEV TOOLS & OTP
// =============================
const runHardcodedQuery = async (req, res) => {
  try {
    const Query = "ALTER TABLE otp_verifications ADD COLUMN is_verified INTEGER DEFAULT 0;";
    const [result] = await db.query(Query); 
    res.json({ success: true, result });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const sendOTP = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: "Email required" });

    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await db.query(`
      INSERT INTO otp_verifications (email, otp, expires_at)
      VALUES (?, ?, ?)
    `, [email, otp, expiresAt]);

    await sendOTPEmail(email, otp);

    res.json({ success: true, message: "OTP sent successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to send OTP" });
  }
};

const verifyOTP = async (req, res) => {
  const { email, otp } = req.body;

  const record = await getOne(`
    SELECT * FROM otp_verifications
    WHERE email = ? AND otp = ?
    ORDER BY id DESC LIMIT 1
  `, [email, otp]);

  if (!record) return res.status(400).json({ success: false, message: "Invalid OTP" });

  if (new Date(record.expires_at) < new Date()) {
    return res.status(400).json({ success: false, message: "OTP expired" });
  }

  await db.query(`UPDATE otp_verifications SET is_verified = 1 WHERE id = ?`, [record.id]);

  res.json({ success: true, message: "OTP verified" });
};

// Exporting using your original module.exports structure
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