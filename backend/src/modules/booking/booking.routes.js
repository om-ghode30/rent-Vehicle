const express = require("express");
const router = express.Router();
const controller = require("./booking.controller");
const auth = require("../../middleware/auth.middleware");
const role = require("../../middleware/role.middleware");
const upload = require("../../config/multer");

router.use(auth, role("USER"));

router.post(
  "/",
  upload.single("license"),
  controller.createBooking
);

router.get("/my", controller.getMyBookings);
router.patch("/:id/cancel", controller.cancelBooking);

module.exports = router;