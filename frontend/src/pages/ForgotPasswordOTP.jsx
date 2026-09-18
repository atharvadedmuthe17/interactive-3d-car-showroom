import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";

export default function ForgotPasswordOTP() {
  const [otp, setOtp] = useState("");
  const [timer, setTimer] = useState(30);
  const navigate = useNavigate();
  const location = useLocation();
  const timerRef = useRef(null);

  const session = location.state || JSON.parse(sessionStorage.getItem("authSession") || "{}");
  const { email, maskedEmail, flow } = session;

  useEffect(() => {
    if (!email || flow !== "forgot") {
      navigate("/forgot-password");
    } else {
      sessionStorage.setItem("authSession", JSON.stringify(session));
    }
  }, [email, flow, navigate, session]);

  useEffect(() => {
    if (timer > 0) {
      timerRef.current = setInterval(() => setTimer((t) => t - 1), 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [timer]);

  if (!email || flow !== "forgot") return null;

  const handleVerify = async () => {
    const res = await fetch("http://localhost:5000/api/auth/verify-forgot-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otp })
    });
    const data = await res.json();
    if (res.ok && data.success) {
      navigate("/reset-password", { state: { ...session, otpVerified: true, otp } });
    } else {
      alert("Invalid OTP");
    }
  };

  return (
    <div className="h-screen bg-[#050507] text-white flex items-center justify-center">
      <div className="bg-white/5 backdrop-blur-xl p-10 rounded-2xl border border-white/10 w-96 text-center">
        <h2 className="text-2xl font-black italic text-blue-500 mb-2 uppercase">Verify</h2>
        <p className="text-[10px] text-white/40 uppercase mb-8">Code sent to: {maskedEmail}</p>
        <input type="text" maxLength="6" value={otp} onChange={(e) => /^\d*$/.test(e.target.value) && setOtp(e.target.value)} className="w-full bg-white/5 border-2 border-blue-600 p-4 rounded-xl text-center text-2xl font-black tracking-[0.5em] outline-none mb-6" />
        <button onClick={handleVerify} disabled={timer === 0} className="w-full bg-[#68a063] p-4 rounded-xl font-black uppercase text-[10px]">Confirm OTP</button>
      </div>
    </div>
  );
}