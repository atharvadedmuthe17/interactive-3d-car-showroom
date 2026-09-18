module.exports = function (app, pool, authenticateToken, isAdmin) {
  // Helper for audit logs
  const logAudit = async (adminId, action, targetType, targetId) => {
    try {
      await pool.query(
        "INSERT INTO audit_logs (admin_id, action, target_type, target_id) VALUES ($1, $2, $3, $4)",
        [adminId, action, targetType, targetId]
      );
    } catch (err) {
      console.error("Audit log error:", err);
    }
  };

  // =====================================================================
  // 👥 USER MANAGEMENT
  // =====================================================================
  app.get("/api/admin/users", authenticateToken, isAdmin, async (req, res) => {
    try {
      const result = await pool.query(
        "SELECT id, username, email, role, created_at, is_blocked FROM users ORDER BY created_at DESC"
      );
      res.json({ success: true, users: result.rows });
    } catch (err) {
      res.status(500).json({ success: false, message: "Server error" });
    }
  });

  app.patch("/api/admin/users/:id/block", authenticateToken, isAdmin, async (req, res) => {
    try {
      await pool.query("UPDATE users SET is_blocked = TRUE WHERE id = $1", [req.params.id]);
      await logAudit(req.user.id, "Blocked User", "users", req.params.id);
      res.json({ success: true, message: "User blocked successfully" });
    } catch (err) {
      res.status(500).json({ success: false, message: "Server error" });
    }
  });

  app.patch("/api/admin/users/:id/unblock", authenticateToken, isAdmin, async (req, res) => {
    try {
      await pool.query("UPDATE users SET is_blocked = FALSE WHERE id = $1", [req.params.id]);
      await logAudit(req.user.id, "Unblocked User", "users", req.params.id);
      res.json({ success: true, message: "User unblocked successfully" });
    } catch (err) {
      res.status(500).json({ success: false, message: "Server error" });
    }
  });

  // =====================================================================
  // 📊 BOOKING MANAGEMENT UPGRADE
  // =====================================================================
  app.get("/api/admin/bookings", authenticateToken, isAdmin, async (req, res) => {
    try {
      const result = await pool.query(
        `SELECT b.*, u.username, u.email 
         FROM bookings b 
         JOIN users u ON b.user_id = u.id 
         ORDER BY b.created_at DESC`
      );
      res.json({ success: true, bookings: result.rows });
    } catch (err) {
      res.status(500).json({ success: false, message: "Server error" });
    }
  });

  app.patch("/api/admin/bookings/:id/status", authenticateToken, isAdmin, async (req, res) => {
    try {
      const { status } = req.body;
      await pool.query("UPDATE bookings SET status = $1 WHERE id = $2", [status, req.params.id]);
      await logAudit(req.user.id, `Updated Booking Status: ${status}`, "bookings", req.params.id);
      res.json({ success: true, message: "Booking status updated" });
    } catch (err) {
      res.status(500).json({ success: false, message: "Server error" });
    }
  });

  // =====================================================================
  // 💰 PAYMENT TRACKING
  // =====================================================================
  app.get("/api/admin/payments", authenticateToken, isAdmin, async (req, res) => {
    try {
      // In this system we query the orders table as payments
      const result = await pool.query(
        `SELECT o.*, u.username, u.email 
         FROM orders o 
         LEFT JOIN users u ON o.user_id = u.id 
         ORDER BY o.created_at DESC`
      );
      res.json({ success: true, payments: result.rows });
    } catch (err) {
      res.status(500).json({ success: false, message: "Server error" });
    }
  });

  app.patch("/api/admin/payments/:id/refund", authenticateToken, isAdmin, async (req, res) => {
    try {
      await pool.query("UPDATE orders SET status = 'Refunded' WHERE id = $1", [req.params.id]);
      await logAudit(req.user.id, "Refunded Payment", "orders", req.params.id);
      res.json({ success: true, message: "Payment refunded" });
    } catch (err) {
      res.status(500).json({ success: false, message: "Server error" });
    }
  });

  // =====================================================================
  // 🧠 CONTENT MANAGEMENT
  // =====================================================================
  app.get("/api/admin/content", async (req, res) => {
    try {
      const result = await pool.query("SELECT key, value FROM content");
      const content = result.rows.reduce((acc, curr) => {
        acc[curr.key] = curr.value;
        return acc;
      }, {});
      res.json({ success: true, content });
    } catch (err) {
      res.status(500).json({ success: false, message: "Server error" });
    }
  });

  app.patch("/api/admin/content", authenticateToken, isAdmin, async (req, res) => {
    try {
      const { homepage_title, homepage_subtitle, show_featured_cars, banner_image } = req.body;
      
      const updates = [];
      if (homepage_title !== undefined) updates.push(["homepage_title", homepage_title]);
      if (homepage_subtitle !== undefined) updates.push(["homepage_subtitle", homepage_subtitle]);
      if (show_featured_cars !== undefined) updates.push(["show_featured_cars", String(show_featured_cars)]);
      if (banner_image !== undefined) updates.push(["banner_image", banner_image]);

      for (let update of updates) {
        await pool.query(
          "INSERT INTO content (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = CURRENT_TIMESTAMP",
          [update[0], update[1]]
        );
      }

      await logAudit(req.user.id, "Updated Content", "content", "various");
      res.json({ success: true, message: "Content updated successfully" });
    } catch (err) {
      res.status(500).json({ success: false, message: "Server error" });
    }
  });

  // =====================================================================
  // 🧾 AUDIT LOGS
  // =====================================================================
  app.get("/api/admin/audit-logs", authenticateToken, isAdmin, async (req, res) => {
    try {
      const result = await pool.query(
        `SELECT a.*, u.username 
         FROM audit_logs a 
         LEFT JOIN users u ON a.admin_id = u.id 
         ORDER BY a.created_at DESC 
         LIMIT 100`
      );
      res.json({ success: true, logs: result.rows });
    } catch (err) {
      res.status(500).json({ success: false, message: "Server error" });
    }
  });

  // Inventory Management Upgrades (Updating Stock & Featured fields)
  app.patch("/api/admin/cars/:id/stock", authenticateToken, isAdmin, async (req, res) => {
    try {
      const { stock, is_featured } = req.body;
      
      let query = "UPDATE cars SET ";
      let params = [];
      let updates = [];

      if (stock !== undefined) {
        updates.push(`stock = $${params.length + 1}`);
        params.push(stock);
      }
      
      if (is_featured !== undefined) {
        updates.push(`is_featured = $${params.length + 1}`);
        params.push(is_featured);
      }

      if (updates.length > 0) {
        params.push(req.params.id);
        query += updates.join(", ") + ` WHERE id = $${params.length}`;
        await pool.query(query, params);
        await logAudit(req.user.id, "Updated Car Details", "cars", req.params.id);
        res.json({ success: true, message: "Car updated successfully" });
      } else {
        res.status(400).json({ success: false, message: "No data provided" });
      }
    } catch (err) {
      res.status(500).json({ success: false, message: "Server error" });
    }
  });
};
