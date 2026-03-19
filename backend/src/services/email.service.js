const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const sendOTPEmail = async (toEmail, otp) => {
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: toEmail,
    subject: "OTP Verification - Vehicle Rental",
    html: `
      <h2>Your OTP Code</h2>
      <p>Your OTP is: <b>${otp}</b></p>
      <p>This OTP is valid for 5 minutes.</p>
    `
  });
};

module.exports = { sendOTPEmail };