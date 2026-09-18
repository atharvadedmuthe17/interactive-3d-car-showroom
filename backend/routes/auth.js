

const express = require("express");
const router = express.Router();
const auth = require("../controllers/authController");

router.post("/register", auth.register);
router.post("/verify-otp", auth.verifyOTP);
router.post("/login", auth.login);
router.post("/forgot-password", auth.forgotPassword);
router.post("/verify-forgot-otp", auth.verifyForgotOTP);
router.post("/reset-password", auth.resetPassword);

module.exports = router;

