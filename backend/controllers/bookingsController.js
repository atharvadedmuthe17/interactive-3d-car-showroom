const pool = require("../db");

exports.getMyBookings = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM bookings WHERE user_id=$1 ORDER BY created_at DESC",
      [req.user.id]
    );

    res.json({ success: true, bookings: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching bookings" });
  }
};