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
// =============================
// REGISTER OWNER / USER
// =============================
const register = async (req, res) => {
  const { name, email, password, phone_number, role } = req.body;
  const requestId = Date.now(); // Simple ID to track this specific request in logs

  console.log(`[${requestId}] [REGISTER] Request received for: ${email}`);

  // 1. Validate Input Fields
  if (!name || !email || !password || !phone_number || !role || !req.file) {
    console.error(`[${requestId}] [REGISTER] Validation Failed: Missing required fields.`);
    return res.status(400).json({
      success: false,
      message: "All fields including Aadhar file required"
    });
  }

  // 2. Validate Role and Formats
  if (!["USER", "OWNER"].includes(role)) {
    console.error(`[${requestId}] [REGISTER] Validation Failed: Invalid role - ${role}`);
    return res.status(400).json({ success: false, message: "Invalid role" });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    console.error(`[${requestId}] [REGISTER] Validation Failed: Invalid email format - ${email}`);
    return res.status(400).json({ success: false, message: "Invalid email format" });
  }

  // 3. Check if user already exists
  try {
    console.log(`[${requestId}] [REGISTER] Checking if user exists in DB...`);
    const existingUser = await getOne("SELECT * FROM users WHERE email = ?", [email]);
    if (existingUser) {
      console.warn(`[${requestId}] [REGISTER] Conflict: Email ${email} is already registered.`);
      return res.status(400).json({ success: false, message: "Email already registered" });
    }

    // 5. Hash Password
    console.log(`[${requestId}] [REGISTER] Hashing password...`);
    const hashedPassword = bcrypt.hashSync(password, 10);
    
    // 6. Insert User into Database
    console.log(`[${requestId}] [REGISTER] Inserting user into DB...`);
    const [result] = await db.query(`
      INSERT INTO users (name, email, phone_number, password, role)
      VALUES (?, ?, ?, ?, ?)
    `, [name, email, phone_number, hashedPassword, role]);

    const userId = result.insertId;
    console.log(`[${requestId}] [REGISTER] User inserted successfully. ID: ${userId}`);

    // 7. Handle File Encryption
    const baseFolder = role === "OWNER" ? `owners/${userId}` : `users/${userId}`;
    const encryptedPath = `${baseFolder}/aadhar`;

    console.log(`[${requestId}] [REGISTER] Encrypting file to: ${encryptedPath}`);
    await encryptFile(req.file.path, encryptedPath);
    console.log(`[${requestId}] [REGISTER] File encrypted and saved.`);

    res.json({
      success: true,
      message: `${role} registered successfully. Waiting for admin approval.`
    });

  } catch (error) {
    console.error(`[${requestId}] [REGISTER] CRITICAL ERROR:`, error);
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
  const requestId = Date.now();

  console.log(`[${requestId}] [LOGIN] Attempt for email: ${email}`);

  try {
    // 1. Fetch User
    console.log(`[${requestId}] [LOGIN] Querying user from DB...`);
    const user = await getOne("SELECT * FROM users WHERE email = ? AND isBlocked = 0", [email]);

    if (!user) {
      console.warn(`[${requestId}] [LOGIN] Failed: User not found or account is blocked - ${email}`);
      return res.status(400).json({ success: false, message: "Invalid credentials or blocked" });
    }

    // 2. Compare Password
    console.log(`[${requestId}] [LOGIN] Verifying password...`);
    const isMatch = bcrypt.compareSync(password, user.password);
    if (!isMatch) {
      console.warn(`[${requestId}] [LOGIN] Failed: Incorrect password for ${email}`);
      return res.status(400).json({ success: false, message: "Invalid credentials" });
    }

    // 3. Check Approval Status
    if (user.isApproved !== 1) {
      console.warn(`[${requestId}] [LOGIN] Failed: Account ${email} not yet approved by admin.`);
      return res.status(403).json({ success: false, message: "Your account is pending admin approval" });
    }

    // 4. Generate JWT
    console.log(`[${requestId}] [LOGIN] User authorized. Generating token...`);
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    // 5. Set Cookie and Respond
    res.cookie("token", token, {
      httpOnly: true,
      secure: true, // Set to true if using HTTPS
      sameSite: "None",
      // maxAge: 24 * 60 * 60 * 1000
    });

    console.log(`[${requestId}] [LOGIN] Success: Session started for ${email}`);
    res.json({ success: true, message: "Login successful", role: user.role, token: token });

  } catch (error) {
    console.error(`[${requestId}] [LOGIN] CRITICAL ERROR:`, error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};


const logout = (req, res) => {
  console.log("logout calls");
  res.clearCookie("token", { httpOnly: true, secure: true, sameSite: "None" });
  res.json({ success: true, message: "Logged out successfully" });
};
// =============================
// CURRENT USER HANDLER
// =============================
const getCurrentUser = async (req, res) => {
  const requestId = Date.now();
  console.log(`[${requestId}] [GET_CURRENT_USER] Fetching profile for User ID: ${req.user.id}`);

  try {
    const user = await getOne(`
      SELECT id, name, email, phone_number, role, isApproved
      FROM users WHERE id = ?
    `, [req.user.id]);

    if (!user) {
      console.warn(`[${requestId}] [GET_CURRENT_USER] Failed: User ID ${req.user.id} not found in database.`);
      return res.status(404).json({ success: false, message: "User not found" });
    }

    console.log(`[${requestId}] [GET_CURRENT_USER] Success: Profile found for ${user.email}`);
    res.json({ success: true, data: user });
  } catch (error) {
    console.error(`[${requestId}] [GET_CURRENT_USER] CRITICAL ERROR:`, error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// =====================================
// VEHICLE ANALYTICS / DETAILS
// =====================================
const getApprovedVehicles = async (req, res) => {
  const requestId = Date.now();
  console.log(`[${requestId}] [GET_APPROVED_VEHICLES] Fetching available approved vehicles...`);

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

    console.log(`[${requestId}] [GET_APPROVED_VEHICLES] Query successful. Found ${vehicles.length} vehicles.`);

    const data = vehicles.map(v => ({
      ...v,
      image_url: `/api/common/vehicles/${v.vehicle_id}/image`
    }));

    res.json({ success: true, data });
  } catch (error) {
    console.error(`[${requestId}] [GET_APPROVED_VEHICLES] CRITICAL ERROR:`, error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const getVehicleDetailsPublic = async (req, res) => {
  const vehicleId = req.params.vehicleId;
  const requestId = Date.now();
  console.log(`[${requestId}] [GET_VEHICLE_DETAILS] Fetching details for Vehicle ID: ${vehicleId}`);

  try {
    const vehicle = await getOne(`
      SELECT id, vehicle_number, brand, model_name, price_per_day
      FROM vehicles WHERE id = ? AND status = 'APPROVED' AND isBlocked = 0
    `, [vehicleId]);

    if (!vehicle) {
      console.warn(`[${requestId}] [GET_VEHICLE_DETAILS] Failed: Vehicle ${vehicleId} not found or not approved.`);
      return res.status(404).json({ success: false, message: "Vehicle not found" });
    }

    console.log(`[${requestId}] [GET_VEHICLE_DETAILS] Vehicle found. Fetching owner info...`);
    const owner = await getOne(`
      SELECT name, phone_number, address FROM users
      WHERE id = (SELECT owner_id FROM vehicles WHERE id = ?)
    `, [vehicleId]);

    console.log(`[${requestId}] [GET_VEHICLE_DETAILS] Success: Returning details for ${vehicle.brand} ${vehicle.model_name}`);
    res.json({
      success: true,
      data: {
        vehicle,
        owner,
        images: Array.from({ length: 5 }, (_, i) => `/api/common/vehicles/${vehicleId}/docs/image${i + 1}`)
      }
    });
  } catch (error) {
    console.error(`[${requestId}] [GET_VEHICLE_DETAILS] CRITICAL ERROR:`, error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// =============================
// IMAGE HANDLERS
// =============================
const getVehicleFirstImage = async (req, res) => {
  const vehicleId = req.params.vehicleId;
  const requestId = Date.now();
  console.log(`[${requestId}] [IMAGE_HANDLER_FIRST] Requesting first image for Vehicle ID: ${vehicleId}`);

  try {
    const vehicle = await getOne(`SELECT owner_id FROM vehicles WHERE id = ?`, [vehicleId]);

    if (!vehicle) {
      console.warn(`[${requestId}] [IMAGE_HANDLER_FIRST] Vehicle ${vehicleId} not found.`);
      return res.status(404).json({ success: false, message: "Vehicle not found" });
    }

    const filePath = `owners/${vehicle.owner_id}/vehicles/${vehicleId}/image1`;
    console.log(`[${requestId}] [IMAGE_HANDLER_FIRST] Attempting to decrypt file at: ${filePath}`);

    const fileBuffer = await decryptFile(filePath);
    
    console.log(`[${requestId}] [IMAGE_HANDLER_FIRST] Decryption successful. Sending buffer.`);
    res.setHeader("Content-Type", "image/jpeg");
    res.send(fileBuffer);
  } catch (error) {
    console.error(`[${requestId}] [IMAGE_HANDLER_FIRST] Failed: Decryption or Read error.`, error);
    res.status(500).json({ success: false, message: "Failed to load image" });
  }
};

const getVehicleImage = async (req, res) => {
  const { vehicleId, fileName } = req.params;
  const requestId = Date.now();
  console.log(`[${requestId}] [IMAGE_HANDLER_SPECIFIC] Requesting: ${fileName} for Vehicle: ${vehicleId}`);

  try {
    const vehicle = await getOne(`SELECT owner_id FROM vehicles WHERE id = ?`, [vehicleId]);

    if (!vehicle) {
      console.warn(`[${requestId}] [IMAGE_HANDLER_SPECIFIC] Vehicle ${vehicleId} not found.`);
      return res.status(404).json({ success: false, message: "Vehicle not found" });
    }

    const filePath = `owners/${vehicle.owner_id}/vehicles/${vehicleId}/${fileName}`;
    console.log(`[${requestId}] [IMAGE_HANDLER_SPECIFIC] Decrypting: ${filePath}`);

    const fileBuffer = await decryptFile(filePath);
    
    console.log(`[${requestId}] [IMAGE_HANDLER_SPECIFIC] Success.`);
    res.setHeader("Content-Type", "image/jpeg");
    res.send(fileBuffer);
  } catch (error) {
    console.error(`[${requestId}] [IMAGE_HANDLER_SPECIFIC] Failed:`, error);
    res.status(500).json({ success: false, message: "Failed to load image" });
  }
};


// =============================
// DEV TOOLS & OTP
// =============================
const runHardcodedQuery = async (req, res) => {
  try {

    // Take query from request body
    const { query } = req.body;

    // Check if query exists
    if (!query) {
      return res.status(400).json({
        success: false,
        message: "Query is required"
      });
    }

    // Execute query
    const [result] = await db.query(query);

    // Return result
    res.json({
      success: true,
      result
    });

  } catch (error) {

    res.status(400).json({
      success: false,
      message: error.message
    });

  }
};

// =============================
// OTP SYSTEM
// =============================

const sendOTP = async (req, res) => {
  const { email } = req.body;
  const requestId = Date.now();

  console.log(`[${requestId}] [OTP_SEND] Request received for: ${email}`);

  try {
    if (!email) {
      console.warn(`[${requestId}] [OTP_SEND] Failed: Email field is missing.`);
      return res.status(400).json({ success: false, message: "Email required" });
    }

    const otp = generateOTP();
    // 5 minutes expiry
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    console.log(`[${requestId}] [OTP_SEND] Generated OTP: ${otp} | Expires At: ${expiresAt.toISOString()}`);

    // Insert into DB
    console.log(`[${requestId}] [OTP_SEND] Saving OTP to database...`);
    await db.query(`
      INSERT INTO otp_verifications (email, otp, expires_at)
      VALUES (?, ?, ?)
    `, [email, otp, expiresAt]);

    // Send Email
    console.log(`[${requestId}] [OTP_SEND] Triggering email service for ${email}...`);
    await sendOTPEmail(email, otp);
    
    console.log(`[${requestId}] [OTP_SEND] Success: OTP sent and recorded.`);
    res.json({ success: true, message: "OTP sent successfully" });

  } catch (error) {
    console.error(`[${requestId}] [OTP_SEND] CRITICAL ERROR:`, error);
    res.status(500).json({ success: false, message: "Failed to send OTP" });
  }
};

const verifyOTP = async (req, res) => {
  const { email, otp } = req.body;
  const requestId = Date.now();

  console.log(`[${requestId}] [OTP_VERIFY] Attempt for: ${email} | Code: ${otp}`);

  try {
    // 1. Fetch the record
    console.log(`[${requestId}] [OTP_VERIFY] Querying latest OTP record for ${email}...`);
    const record = await getOne(`
      SELECT * FROM otp_verifications
      WHERE email = ? AND otp = ?
      ORDER BY id DESC LIMIT 1
    `, [email, otp]);

    if (!record) {
      console.warn(`[${requestId}] [OTP_VERIFY] Failed: No matching record found for this email/OTP combination.`);
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }

    // 2. Check Expiry
    const now = new Date();
    const expiry = new Date(record.expires_at);
    
    console.log(`[${requestId}] [OTP_VERIFY] Record Found. Current Time: ${now.toISOString()} | Expiry Time: ${expiry.toISOString()}`);

    if (expiry < now) {
      console.warn(`[${requestId}] [OTP_VERIFY] Failed: OTP has expired.`);
      return res.status(400).json({ success: false, message: "OTP expired" });
    }

    // 3. Mark as Verified
    console.log(`[${requestId}] [OTP_VERIFY] OTP Valid. Updating 'is_verified' to 1 for record ID: ${record.id}`);
    await db.query(`UPDATE otp_verifications SET is_verified = 1 WHERE id = ?`, [record.id]);

    console.log(`[${requestId}] [OTP_VERIFY] Success: OTP verified.`);
    res.json({ success: true, message: "OTP verified" });

  } catch (error) {
    console.error(`[${requestId}] [OTP_VERIFY] CRITICAL ERROR:`, error);
    res.status(500).json({ success: false, message: "Error during verification" });
  }
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