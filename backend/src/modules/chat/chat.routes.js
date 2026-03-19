const express = require("express");
const router = express.Router();

const {
  sendMessage,
  getMessages
} = require("./chat.controller");

const authMiddleware = require("../../middleware/auth.middleware");

// ===============================
// SEND MESSAGE
// ===============================
router.post(
  "/send",
  authMiddleware,
  sendMessage
);

// ===============================
// GET CHAT MESSAGES (BY BOOKING)
// ===============================
router.get(
  "/:bookingId",
  authMiddleware,
  getMessages
);

module.exports = router;