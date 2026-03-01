const express = require("express");
const router = express.Router();
const controller = require("./admin.controller");
const auth = require("../../middleware/auth.middleware");
const role = require("../../middleware/role.middleware");

router.use(auth, role("ADMIN"));

router.get("/vehicles/pending", controller.getPendingVehicles);
router.get("/vehicles/:vehicleId", controller.getVehicleDetails);
router.patch("/vehicles/:id/approve", controller.approveVehicle);
router.patch("/vehicles/:id/reject", controller.rejectVehicle);
router.get("/vehicles/:vehicleId/docs/:fileName", controller.viewVehicleDoc);

router.get("/users/pending", controller.getPendingUsers);
router.patch("/users/:id/approve", controller.approveUser);
router.patch("/users/:id/reject", controller.rejectUser);
router.get("/users/:userId/docs/aadhar", controller.viewUserDoc);

router.get("/owners/:ownerId/docs/aadhar", controller.viewOwnerDoc);

router.get("/payments/pending", controller.getPendingPayments);
router.patch("/payments/:id/approve", controller.approvePayment);
router.post("/payments/sync-completed", controller.syncCompletedPayments);


// ================= ANALYTICS =================
router.get("/analytics/vehicles", controller.getAllVehiclesAnalytics);
router.get("/analytics/owners", controller.getAllOwnersAnalytics);
router.get("/analytics/users", controller.getAllUsersAnalytics);

// ================= DETAILS =================
router.get("/owners/:id", controller.getOwnerDetails);
router.get("/vehicles/:id/details", controller.getVehicleDetailsFull);
router.get("/users/:id/details", controller.getUserDetailsFull);
router.get("/bookings/:id", controller.getBookingDetails);


router.patch("/users/:id/status", controller.updateUserBlockStatus);
router.patch("/vehicles/:id/status", controller.updateVehicleBlockStatus);
module.exports = router;
module.exports = router;