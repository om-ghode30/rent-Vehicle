require("dotenv").config();

const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

exports.sendOTPEmail = async (email, otp) => {
  try {
    const response = await resend.emails.send({
      from: "otp@bike-rent.in",
      to: email,
      subject: "Your OTP Code",
      html: `
        <h2>Your OTP is: ${otp}</h2>
        <p>Valid for 5 minutes.</p>
      `
    });

    console.log("Resend Response:", response);

    return response;

  } catch (error) {

    console.error("Email Error:", error);

    throw new Error("Failed to send OTP email");
  }
};