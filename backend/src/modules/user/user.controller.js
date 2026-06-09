    const db = require("../../config/db");
const jwt = require("jsonwebtoken");
const generateOTP = require("../../utils/otp");
const { sendOTPEmail } = require("../../services/email.service");

// helper
async function getOne(query, params) {
  const [rows] = await db.query(query, params);
  return rows[0] || null;
}

// =================================
// SEND OTP
// =================================
exports.sendOTP = async (req, res) => {

  const { email } = req.body;

  try {

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email required"
      });
    }

    const otp = generateOTP();

    const expiresAt = new Date(
      Date.now() + 5 * 60 * 1000
    );

    // save otp
    await db.query(`
      INSERT INTO otp_verifications (
        email,
        otp,
        expires_at
      )
      VALUES (?, ?, ?)
    `, [email, otp, expiresAt]);

    // send mail
    await sendOTPEmail(email, otp);

    res.json({
      success: true,
      message: "OTP sent successfully"
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    });

  }
};

// =================================
// VERIFY OTP
// =================================
exports.verifyOTP = async (req, res) => {
  console.log("verifyOTP called");
  const { email, otp } = req.body;

  try {

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP required"
      });
    }

    // latest otp
    const record = await getOne(`
      SELECT * FROM otp_verifications
      WHERE email = ?
        AND otp = ?
      ORDER BY id DESC
      LIMIT 1
    `, [email, otp]);

    if (!record) {
  return res.status(400).json({
    success: false,
    message: "Invalid OTP"
  });
}

if (record.is_used) {

  return res.status(400).json({
    success: false,
    message: "OTP already used"
  });
}

    // expiry check
    const now = new Date();
    const expiry = new Date(record.expires_at);

    if (now > expiry) {
      return res.status(400).json({
        success: false,
        message: "OTP expired"
      });
    }

    // check booking user
    let user = await getOne(`
      SELECT * FROM booking_users
      WHERE email = ?
    `, [email]);

    // create if not exists
    if (!user) {

      const [result] = await db.query(`
        INSERT INTO booking_users (
          email,
          is_verified
        )
        VALUES (?, 1)
      `, [email]);

      user = {
        id: result.insertId,
        email
      };
    }
   
    await db.query(`
  UPDATE otp_verifications
  SET is_used = 1
  WHERE id = ?
`, [record.id]);


    // JWT
    const token = jwt.sign(
      {
        id: user.id,
        type: "BOOKING_USER"
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "30d"
      }
    );
    res.clearCookie("token");
    res.cookie("booking_token", token, {
    httpOnly: true,
    secure: false, // localhost
    sameSite: "Lax",
    maxAge: 30 * 24 * 60 * 60 * 1000
    });

    res.json({
      success: true,
      user
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    });

  }
};

// =================================
// GET ME
// =================================
exports.getMe = async (req, res) => {

  try {

    const user = await getOne(`
      SELECT * FROM booking_users
      WHERE id = ?
    `, [req.user.id]);

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

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    });

  }
};

exports.logout = async (req, res) => {

  res.clearCookie("booking_token", {
    httpOnly: true,
    secure: false,
    sameSite: "Lax"
  });

  res.json({
    success: true,
    message: "Logged out"
  });
};