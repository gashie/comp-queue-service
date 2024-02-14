const express = require("express");
const { SystemLogs } = require("../controllers/logs");
const { SystemControl } = require("../controllers/control");
const router = express.Router();


//routes

///roles
router.route("/logs").post(SystemLogs);
router.route("/control").post(SystemControl);
module.exports = router;
