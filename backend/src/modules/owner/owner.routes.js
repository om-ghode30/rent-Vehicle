const express = require("express");
const router = express.Router();

const controller = require("./owner.controller");
const auth = require("../../middleware/auth.middleware");
const role = require("../../middleware/role.middleware");
const upload = require("../../config/multer");

router.use(auth, role("OWNER"));

router.post(
  "/vehicles",
  upload.fields([
  { name: "rc", maxCount: 1 },
  { name: "insurance", maxCount: 1 },
  { name: "puc", maxCount: 1 },
  { name: "noc", maxCount: 1 },
  { name: "images", maxCount: 5 }
]),
  controller.addVehicle
);

router.get("/vehicles", controller.getMyVehicles);
router.get("/bookings", controller.getOwnerBookings);
router.get("/bookings/:id", controller.getOwnerBookingDetails);
router.patch("/vehicles/:id/availability", controller.toggleAvailability);

module.exports = router;