const express = require("express");
const router = express.Router();
const controller = require("./booking.controller");
const auth = require("../../middleware/bookingAuth.middleware");
const role = require("../../middleware/role.middleware");
const upload = require("../../config/multer");

router.use(auth);
router.post(
  "/",
  upload.fields([
  { name: "license", maxCount: 1 },
  { name: "aadhar", maxCount: 1 }
]),
  controller.createBooking
);

router.get("/my", controller.getMyBookings);

router.post("/check-availability",controller.checkAvailability);

router.get(
  "/vehicles/:id/availability",
  controller.getVehicleAvailability
);

router.get("/:id",controller.getPerticularBooking);


module.exports = router;