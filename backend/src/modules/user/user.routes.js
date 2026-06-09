const express = require("express");

const router = express.Router();

const controller = require("./user.controller");

const bookingAuth = require("../../middleware/bookingAuth.middleware");

router.post("/send-otp", controller.sendOTP);

router.post("/logout", controller.logout);

router.post("/verify-otp", controller.verifyOTP);

router.get("/me", bookingAuth, controller.getMe);

module.exports = router;