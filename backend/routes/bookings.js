const express = require("express");
const router = express.Router();
const { getMyBookings } = require("../controllers/bookingsController");
const authMiddleware = require("../middleware/auth");

// 🔥 Fetch logged in user bookings
router.get("/my", authMiddleware, getMyBookings);

module.exports = router;