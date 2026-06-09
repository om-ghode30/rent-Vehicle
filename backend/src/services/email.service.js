
// const axios = require("axios");

// exports.sendOTPEmail = async (email, otp) => {

//   try {

//     const response = await axios.post(
//       "http://localhost/mail/send_mail.php",
//       {
//         email,
//         subject: "Your OTP Code",
//         message: `
//           <h2>Your OTP is: ${otp}</h2>
//           <p>Valid for 5 minutes.</p>
//         `
//       },
//       {
//         headers: {
//           "Content-Type": "application/json"
//         }
//       }
//     );

//     console.log("Mail API Response:", response.data);

//     return response.data;

//   } catch (error) {

//     console.log(
//       "Mail Service Error:",
//       error.response?.data || error.message
//     );

//     throw new Error("Failed to send OTP email");
//   }
// };
// const SibApiV3Sdk = require("sib-api-v3-sdk");

// const defaultClient = SibApiV3Sdk.ApiClient.instance;

// defaultClient.authentications["api-key"].apiKey =
// process.env.BREVO_API_KEY;

// const apiInstance =
// new SibApiV3Sdk.TransactionalEmailsApi();

// exports.sendOTPEmail = async (email, otp) => {
// try {

// const result = await apiInstance.sendTransacEmail({
//   sender: {
//     name: "Bike Rent",
//     email: "otp@bike-rent.in"
//   },

//   to: [
//     {
//       email: email
//     }
//   ],

//   subject: "Your OTP Code",

//   htmlContent: `
//     <h2>Your OTP is: ${otp}</h2>
//     <p>Valid for 5 minutes.</p>
//   `
// });

// console.log("Email Sent:", result);

// return result;


// } catch (error) {

// console.error(
//   "Mail Service Error:",
//   error.response?.body || error.message
// );

// throw new Error("Failed to send OTP email");


// }
// };
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