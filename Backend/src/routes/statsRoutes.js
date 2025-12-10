const express = require("express");
const router = express.Router();

const statsController = require("../controllers/statsController");
const adminMiddleware = require("../middlewares/admin");

// Add this route for statistics
router.get('/', adminMiddleware, statsController.getStatistics);

module.exports = router;
