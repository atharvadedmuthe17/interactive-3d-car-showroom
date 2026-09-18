require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const pool = require("./db");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const app = express();

// 🔥 MIDDLEWARE
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 🔥 Payment rout 
const paymentRoutes = require("./routes/payment");
app.use("/api/payment", paymentRoutes);

// request maail 
const contactRoute = require("./routes/contact");
app.use("/api/contact", contactRoute);

// 🔥 AUTH ROUTES
const authRoutes = require("./routes/auth");
app.use("/api/auth", authRoutes);

// Booking rout 
const bookingRoutes = require("./routes/bookings");
app.use("/api/bookings", bookingRoutes);

// 🔥 SAFE FOLDER CREATION
const uploadDir = path.join(__dirname, "uploads");
fs.mkdirSync(uploadDir, { recursive: true });

// 🔥 MULTER
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) =>
    cb(null, "profile-" + Date.now() + path.extname(file.originalname)),
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 },
});

// 🔥 STATIC ACCESS
app.use("/uploads", express.static(uploadDir));

const JWT_SECRET = process.env.JWT_SECRET || "devsecret";

// =====================================================================
// 🛡️ JWT AUTH MIDDLEWARES
// =====================================================================
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  
  if (!token) {
    return res.status(401).json({ success: false, message: "No token provided" });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ success: false, message: "Invalid or expired token" });
    }
    req.user = user;
    next();
  });
};

// =====================================================================
// 🛡️ ADMIN CHECK MIDDLEWARE
// =====================================================================
const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    return res.status(403).json({ success: false, message: "Access denied. Admins only." });
  }
};

// =====================================================================
// 👑 ADMIN CREATION ROUTE
// =====================================================================
app.post("/api/admin/create", async (req, res) => {
  // Frontend might send 'name' instead of 'username', handle both seamlessly
  const { name, username, email, password, adminSecret } = req.body;
  const finalUsername = username || name;

  // Secure admin route with secret check
  const expectedSecret = process.env.ADMIN_SECRET;
  if (!expectedSecret || adminSecret !== expectedSecret) {
    return res.status(403).json({ success: false, message: "Unauthorized: Invalid admin secret" });
  }

  if (!finalUsername || !email || !password) {
    return res.status(400).json({ success: false, message: "All fields are required" });
  }

  try {
    // 1. Check if any admin already exists in the system
    const adminCheck = await pool.query("SELECT id FROM users WHERE role = 'admin'");
    if (adminCheck.rows.length > 0) {
      return res.status(403).json({ success: false, message: "An admin already exists in the system." });
    }

    // 2. Check if the username or email is already taken
    const existingUser = await pool.query(
      "SELECT id FROM users WHERE email = $1 OR username = $2",
      [email, finalUsername]
    );
    
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ success: false, message: "Email or username is already registered." });
    }

    // 3. Hash the password and create the admin
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const result = await pool.query(
      `INSERT INTO users (username, email, password, role)
       VALUES ($1, $2, $3, 'admin') RETURNING id, username, email, role`,
      [finalUsername, email, hashedPassword]
    );

    res.status(201).json({
      success: true,
      message: "Admin created successfully",
      user: result.rows[0]
    });

  } catch (err) {
    console.error("ADMIN CREATE ERROR:", err);
    res.status(500).json({ success: false, message: "Server error during admin creation" });
  }
});

// =====================================================================
// 👤 GET CURRENT USER
// =====================================================================
app.get("/api/auth/me", authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, username, email, role, profile_pic, created_at FROM users WHERE id = $1",
      [req.user.id]
    );
    res.json({ success: true, user: result.rows[0] });
  } catch {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// =====================================================================
// 🔄 UPDATE PROFILE
// =====================================================================
app.put(
  "/api/auth/update-profile",
  authenticateToken,
  upload.single("profile_pic"),
  async (req, res) => {
    const { username } = req.body;
    const userId = req.user.id;

    let pic = null;
    if (req.file) {
      pic = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
    }

    try {
      const result = await pool.query(
        pic
          ? "UPDATE users SET username = COALESCE($1, username), profile_pic = $2 WHERE id = $3 RETURNING *"
          : "UPDATE users SET username = COALESCE($1, username) WHERE id = $2 RETURNING *",
        pic ? [username, pic, userId] : [username, userId]
      );

      res.json({ success: true, user: result.rows[0] });
    } catch {
      res.status(500).json({ success: false, message: "Server error" });
    }
  }
);

// =====================================================================
// 🏎️ BOOKINGS
// =====================================================================
app.post("/api/bookings/reserve", authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `INSERT INTO bookings 
      (user_id, car_name, car_model_id, booking_type, city, price, duration, pickup_location, status, created_at) 
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,'Confirmed',NOW()) RETURNING *`,
      [
        req.user.id,
        req.body.car_name,
        req.body.car_model_id,
        req.body.booking_type,
        req.body.city,
        req.body.price,
        req.body.duration,
        req.body.pickup_location,
      ]
    );
    res.json({ success: true, booking: result.rows[0] });
  } catch {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// =====================================================================
// 🔥 REGISTER FLOW
// =====================================================================

app.post("/api/auth/register-step1", async (req, res) => {
  const { username, email } = req.body;

  try {
    // 🔥 CHECK USERNAME EXISTS
    const usernameCheck = await pool.query(
      "SELECT id FROM users WHERE username = $1",
      [username]
    );

    if (usernameCheck.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Username already taken",
      });
    }

    // 🔥 CHECK EMAIL EXISTS
    const emailCheck = await pool.query(
      "SELECT id FROM users WHERE email = $1",
      [email]
    );

    if (emailCheck.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Email already registered",
      });
    }

    // OTP
    const otp = crypto.randomInt(100000, 999999).toString();
    const expiry = new Date(Date.now() + 300000);

    await pool.query(
      `INSERT INTO pending_registrations (username,email,otp,otp_expiry)
       VALUES ($1,$2,$3,$4)
       ON CONFLICT (email)
       DO UPDATE SET otp=$3, otp_expiry=$4`,
      [username, email, otp, expiry]
    );

    // Email send
    try {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
      });

      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: "ADYX OTP",
        html: `<h2>${otp}</h2>`,
      });
    } catch (emailErr) {
      console.error("EMAIL SEND ERROR:", emailErr.message);
    }

    res.json({ success: true, message: "OTP sent (check console in dev)" });

  } catch (err) {
    console.error("REGISTER STEP1 ERROR:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

app.post("/api/auth/register-step2", async (req, res) => {
  const { email, otp } = req.body;
  const check = await pool.query(
    "SELECT * FROM pending_registrations WHERE email=$1 AND otp=$2",
    [email, otp]
  );
  if (check.rows.length === 0)
    return res.status(400).json({ success: false, message: "Invalid OTP" });
  res.json({ success: true });
});

app.post(
  "/api/auth/register-step3",
  upload.single("profile_pic"),
  async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email or Password missing",
      });
    }

    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      // 🔥 pending check
      const pend = await client.query(
        "SELECT username FROM pending_registrations WHERE email = $1",
        [email]
      );

      if (pend.rows.length === 0) {
        await client.query("ROLLBACK");
        return res.status(400).json({
          success: false,
          message: "Registration expired. Please start again.",
        });
      }

      let username = pend.rows[0].username;

      // 🔥 unique username check
      const existingUser = await client.query(
        "SELECT id FROM users WHERE username = $1",
        [username]
      );

      if (existingUser.rows.length > 0) {
        await client.query("ROLLBACK");
        return res.status(400).json({
          success: false,
          message: "Username already taken. Please choose another one.",
        });
      }

      // 🔥 email check
      const existingEmail = await client.query(
        "SELECT id FROM users WHERE email = $1",
        [email]
      );

      if (existingEmail.rows.length > 0) {
        await client.query("ROLLBACK");
        return res.status(400).json({
          success: false,
          message: "Email already registered",
        });
      }

      // 🔥 hash
      const hash = await bcrypt.hash(password, 10);

      // 🔥 profile pic handling
      let profilePic = null;
      if (req.file) {
        profilePic = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
      }

      // 🔥 insert
      const result = await client.query(
        `INSERT INTO users (username, email, password, role, profile_pic)
         VALUES ($1, $2, $3, 'user', $4)
         RETURNING id, username, email, role, profile_pic`,
        [username, email, hash, profilePic]
      );

      await client.query(
        "DELETE FROM pending_registrations WHERE email = $1",
        [email]
      );

      await client.query("COMMIT");

      // Includes role in JWT token
      const token = jwt.sign(
        { id: result.rows[0].id, role: result.rows[0].role },
        JWT_SECRET,
        { expiresIn: "24h" }
      );

      res.json({
        success: true,
        token,
        user: {
          id: result.rows[0].id,
          username: result.rows[0].username,
          email: result.rows[0].email,
          role: result.rows[0].role
        },
      });

    } catch (err) {
      console.error("REGISTER STEP3 ERROR:", err);
      await client.query("ROLLBACK");

      res.status(500).json({
        success: false,
        message: "Server error",
      });
    } finally {
      client.release();
    }
  }
);

// =====================================================================
// 🚀 FIXED: LOGIN SYSTEM
// =====================================================================
app.post("/api/auth/login", async (req, res) => {
  const { username, email, password } = req.body;
  
  // Accept both 'username' or 'email' keys from frontend
  const identifier = username || email;

  if (!identifier || !password) {
    return res.status(400).json({ success: false, message: "Please provide your username/email and password" });
  }

  try {
    // Check either username or email
    const user = await pool.query(
      "SELECT * FROM users WHERE username = $1 OR email = $1",
      [identifier]
    );

    if (!user.rows.length) {
      return res.status(400).json({ success: false, message: "Invalid credentials" });
    }

    const match = await bcrypt.compare(password, user.rows[0].password);
    if (!match) {
      return res.status(400).json({ success: false, message: "Invalid credentials" });
    }

    const userData = user.rows[0];

    // Added Role into token
    const token = jwt.sign(
      { id: userData.id, role: userData.role },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    // Improved JSON Response matching frontend expectations
    res.json({ 
      success: true, 
      token, 
      user: {
        id: userData.id,
        username: userData.username,
        email: userData.email,
        role: userData.role
      } 
    });
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// =====================================================================
// 🗑️ DELETE ACCOUNT
// =====================================================================
app.delete("/api/auth/delete-account", authenticateToken, async (req, res) => {
  const { password } = req.body;

  try {
    // 🔥 user fetch
    const user = await pool.query(
      "SELECT * FROM users WHERE id=$1",
      [req.user.id]
    );

    if (!user.rows.length) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // 🔥 verify password
    const match = await bcrypt.compare(
      password,
      user.rows[0].password
    );

    if (!match) {
      return res.status(400).json({
        success: false,
        message: "Incorrect password",
      });
    }

    // 🔥 delete bookings first (FK safe)
    await pool.query(
      "DELETE FROM bookings WHERE user_id=$1",
      [req.user.id]
    );

    // 🔥 delete user
    await pool.query(
      "DELETE FROM users WHERE id=$1",
      [req.user.id]
    );

    res.json({
      success: true,
      message: "Account deleted",
    });

  } catch (err) {
    console.error("DELETE ACCOUNT ERROR:", err);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// =====================================================================
// 🚗 CAR MANAGEMENT ROUTES (Added dynamically)
// =====================================================================

// GET all cars
app.get("/api/cars", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM cars ORDER BY created_at DESC");
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error("GET CARS ERROR:", err);
    res.status(500).json({ success: false, message: "Server error fetching cars" });
  }
});

// POST Add new car (Admin only)
app.post("/api/admin/add-car", authenticateToken, isAdmin, upload.single("model"), async (req, res) => {
  try {
    const { name, price } = req.body;

    if (!name || !price || isNaN(price)) {
      return res.status(400).json({ success: false, message: "Valid name and price are required" });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: "Model file is required" });
    }

    const model_url = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
    const baseSlug = "adyx-" + name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    const slug = baseSlug + "-" + Date.now();

    const result = await pool.query(
      "INSERT INTO cars (name, price, model_url, slug) VALUES ($1, $2, $3, $4) RETURNING *",
      [name, price, model_url, slug]
    );

    res.status(201).json({ success: true, message: "Car added successfully", data: result.rows[0] });
  } catch (err) {
    console.error("ADD CAR ERROR:", err);
    res.status(500).json({ success: false, message: err.message || "Server error adding car" });
  }
});

// PUT Update car (Admin only)
app.put("/api/admin/update-car/:id", authenticateToken, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price } = req.body;

    // Add validation
    if (!name || !price || isNaN(price)) {
      return res.status(400).json({ success: false, message: "Valid name and price are required" });
    }

    const result = await pool.query(
      "UPDATE cars SET name = $1, price = $2 WHERE id = $3 RETURNING *",
      [name, price, id]
    );

    // Check if the car existed before updating
    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, message: "Car not found" });
    }

    res.json({ success: true, message: "Car updated successfully", data: result.rows[0] });
  } catch (err) {
    console.error("UPDATE CAR ERROR:", err);
    res.status(500).json({ success: false, message: "Server error updating car" });
  }
});

// DELETE Car (Admin only)
app.delete("/api/admin/delete-car/:id", authenticateToken, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query("DELETE FROM cars WHERE id = $1 RETURNING id", [id]);

    // Check if the car existed before deleting
    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, message: "Car not found" });
    }

    res.json({ success: true, message: "Car deleted successfully" });
  } catch (err) {
    console.error("DELETE CAR ERROR:", err);
    res.status(500).json({ success: false, message: "Server error deleting car" });
  }
});

const PORT = process.env.PORT || 5000;

// 🔥 INJECT NEW ADMIN UPGRADE FEATURES
require("./routes/adminFeatures")(app, pool, authenticateToken, isAdmin);

app.listen(PORT, () => console.log("Server running on", PORT));