import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

export default function ResetPassword() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  const session = location.state || JSON.parse(sessionStorage.getItem("authSession") || "{}");
  const { email, flow, otpVerified, otp } = session;

  useEffect(() => {
    if (!email || flow !== "forgot" || !otpVerified) {
      navigate("/forgot-password");
    }
  }, [email, flow, otpVerified, navigate]);

  if (!email || flow !== "forgot") return null;

  const handleReset = async () => {
    if (newPassword !== confirmPassword) return alert("Mismatch");
    const res = await fetch("http://localhost:5000/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password: newPassword })
    });
    if (res.ok) {
      alert("Updated!");
      sessionStorage.clear();
      navigate("/login");
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: "100px auto", textAlign: "center" }}>
      <h2>New Password</h2>
      <input type="password" placeholder="New Password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} style={{ width: "100%", padding: 10, marginBottom: 10 }} />
      <input type="password" placeholder="Confirm" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} style={{ width: "100%", padding: 10, marginBottom: 15 }} />
      <button onClick={handleReset} style={{ width: "100%", padding: 12, background: "#2563eb", color: "white" }}>Update Password</button>
    </div>
  );
}