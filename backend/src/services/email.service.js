const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

const sendOTPEmail = async (toEmail, otp) => {
  try {
    const response = await resend.emails.send({
      from: "onboarding@resend.dev", 
      to: toEmail,
      subject: "OTP Verification - Vehicle Rental",
      html: `
        <h2>Your OTP Code</h2>
        <p>Your OTP is: <b>${otp}</b></p>
        <p>This OTP is valid for 5 minutes.</p>
      `,
    });

    console.log("✅ Email sent:", response);
  } catch (error) {
    console.error("❌ Email failed:", error);
  }
};

module.exports = { sendOTPEmail };