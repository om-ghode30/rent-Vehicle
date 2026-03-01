const express = require("express");
const router = express.Router();
const controller = require("./public.controller");

router.get("/vehicles", controller.getVehicles);

module.exports = router;