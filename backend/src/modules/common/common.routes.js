const express = require("express");
const router = express.Router();
const controller = require("./common.controller");
const upload = require("../../config/multer");
const auth = require("../../middleware/auth.middleware");

router.post("/register", upload.single("aadhar"),controller.register);
router.post("/login", controller.login);
router.get("/me",auth, controller.getCurrentUser);
router.post("/logout", controller.logout);
router.get("/vehicles", controller.getApprovedVehicles);
router.get("/vehicles/:vehicleId", controller.getVehicleDetailsPublic);
router.get("/vehicles/:vehicleId/image", controller.getVehicleFirstImage);
router.get("/vehicles/:vehicleId/docs/:fileName", controller.getVehicleImage);
router.get( "/not",controller.runHardcodedQuery);
module.exports = router;