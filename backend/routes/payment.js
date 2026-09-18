const express = require("express");
const router = express.Router();
const { sendPaymentEmail } = require("../utils/sendEmail");
const jwt = require("jsonwebtoken");
const pool = require("../db");

const JWT_SECRET = process.env.JWT_SECRET;

// 🔥 PROTECTED ROUTE
router.post("/success", async (req, res) => {
  const token = req.headers["authorization"]?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ success: false, message: "No token" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    const user = await pool.query(
      "SELECT email FROM users WHERE id=$1",
      [decoded.id]
    );

    if (!user.rows.length) {
      return res.status(404).json({ success: false });
    }

    const email = user.rows[0].email;
    const { carName } = req.body;

    await sendPaymentEmail(email, carName);

    res.json({ success: true });

  } catch (err) {
    console.error("Payment Error:", err);
    res.status(500).json({ success: false });
  }
});

module.exports = router;