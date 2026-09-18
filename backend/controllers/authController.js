const pool = require("../db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { sendEmail } = require("../utils/sendEmail");

const generateOTP = () => crypto.randomInt(100000, 999999).toString();

// ================= REGISTER =================
exports.register = async (req, res) => {
  try {
    const { username, email } = req.body;

    if (!username || !email) {
      return res.status(400).json({ message: "Username and Email required" });
    }

    // ✅ check if user already exists (verified)
    const existingUser = await pool.query(
      "SELECT * FROM users WHERE email=$1",
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ message: "User already registered" });
    }

    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000);

    // ✅ check pending registrations
    const pending = await pool.query(
      "SELECT * FROM pending_registrations WHERE email=$1",
      [email]
    );

    if (pending.rows.length > 0) {
      await pool.query(
        "UPDATE pending_registrations SET otp=$1, otp_expiry=$2, username=$3 WHERE email=$4",
        [otp, otpExpiry, username, email]
      );
    } else {
      await pool.query(
        "INSERT INTO pending_registrations (username,email,otp,otp_expiry) VALUES ($1,$2,$3,$4)",
        [username, email, otp, otpExpiry]
      );
    }

    await sendEmail(email, "Your ADYX Verification Code", otp);

    res.json({ success: true, email });
  } catch (err) {
    console.error("REGISTER ERROR:", err);
    res.status(500).json({ message: "Registration error" });
  }
};
// ================= VERIFY OTP (DURING REGISTRATION) =================
exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp, username } = req.body;
    const file = req.file;

    if (!email || !otp)
      return res.status(400).json({ message: "Email and OTP required" });

    const user = await pool.query("SELECT * FROM users WHERE email=$1", [email]);

    if (!user.rows.length)
      return res.status(404).json({ message: "User not found" });

    const dbUser = user.rows[0];

    if (dbUser.otp !== otp)
      return res.status(400).json({ message: "Invalid OTP" });

    if (new Date() > new Date(dbUser.otp_expiry))
      return res.status(400).json({ message: "OTP expired" });

    let profilePic = dbUser.profile_pic;
    if (file) {
      profilePic = `${req.protocol}://${req.get("host")}/uploads/${file.filename}`;
    }

    const updated = await pool.query(
      `UPDATE users 
       SET otp=NULL,
           otp_expiry=NULL,
           profile_pic=$1,
           username=COALESCE($2, username)
       WHERE email=$3
       RETURNING id, username, email, profile_pic`,
      [profilePic, username, email]
    );

    const userData = updated.rows[0];

    const token = jwt.sign(
      { id: userData.id },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({ success: true, token, user: userData });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "OTP verification failed" });
  }
};

// ================= RESEND OTP =================
exports.resendOTP = async (req, res) => {
  try {
    const { email } = req.body;
    const otp = generateOTP();
    const expiry = new Date(Date.now() + 5 * 60 * 1000);

    const result = await pool.query(
      "UPDATE users SET reset_otp=$1, reset_otp_expiry=$2 WHERE email=$3",
      [otp, expiry, email]
    );

    if (!result.rowCount)
      return res.status(404).json({ message: "User not found" });

    await sendEmail(email, "New OTP", otp);

    res.json({ success: true });
  } catch {
    res.status(500).json({ message: "Error resending OTP" });
  }
};

// ================= LOGIN =================
// ================= LOGIN =================
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await pool.query(
      "SELECT * FROM users WHERE username=$1",
      [username]
    );

    if (!user.rows.length)
      return res.status(400).json({ message: "Invalid credentials" });

    const match = await bcrypt.compare(password, user.rows[0].password);

    if (!match)
      return res.status(400).json({ message: "Invalid credentials" });

    const userData = user.rows[0];

    const token = jwt.sign(
      { id: userData.id, role: userData.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

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
    console.error(err);
    res.status(500).json({ message: "Login failed" });
  }
};

// ================= FORGOT PASSWORD (STEP 1: SEND OTP) =================
exports.forgotPassword = async (req, res) => {
  try {
    const { username } = req.body;
    if (!username) return res.status(400).json({ message: "Username required" });

    const user = await pool.query(
      "SELECT * FROM users WHERE username = $1",
      [username]
    );

    if (user.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const dbUser = user.rows[0];
    const email = dbUser.email;
    const otp = generateOTP();
    const expiry = new Date(Date.now() + 5 * 60 * 1000);

    // ✅ FIXED
    await pool.query(
      "UPDATE users SET reset_otp=$1, reset_otp_expiry=$2 WHERE email=$3",
      [otp, expiry, email]
    );

    await sendEmail(email, "Reset Your ADYX Password", otp);

    const maskedEmail = email.replace(
      /^(.)(.*)(.@.*)$/,
      (_, f, m, l) => f + m.replace(/./g, "*") + l
    );

    res.json({ success: true, email, maskedEmail });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ================= FORGOT PASSWORD (STEP 2: VERIFY OTP) =================
exports.verifyForgotOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await pool.query("SELECT * FROM users WHERE email=$1", [email]);

    if (!user.rows.length) return res.status(404).json({ message: "User not found" });

    if (user.rows[0].reset_otp !== otp) return res.status(400).json({ message: "Invalid OTP" });

    if (new Date() > new Date(user.rows[0].reset_otp_expiry))
      return res.status(400).json({ message: "OTP expired" });

    res.json({ success: true, message: "OTP Verified" });
  } catch (err) {
    res.status(500).json({ message: "Verification failed" });
  }
};

// ================= FORGOT PASSWORD (STEP 3: RESET FINAL) =================
exports.resetPassword = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    // 🔐 Hash new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 🔥 Update password + clear reset OTP fields
    await pool.query(
      `UPDATE users 
       SET password = $1, 
           reset_otp = NULL, 
           reset_otp_expiry = NULL
       WHERE email = $2`,
      [hashedPassword, email]
    );

    res.json({ success: true, message: "Password updated successfully" });
  } catch (err) {
    console.error("RESET PASSWORD ERROR:", err);
    res.status(500).json({ message: "Reset failed" });
  }
};
// ================= GET ME =================
exports.getMe = async (req, res) => {
  try {
    const user = await pool.query(
      "SELECT id, username, email, profile_pic FROM users WHERE id=$1",
      [req.user.id]
    );
    res.json({ success: true, user: user.rows[0] });
  } catch {
    res.status(500).json({ success: false });
  }
};
