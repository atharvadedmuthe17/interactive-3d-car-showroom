import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function VerifyRegisterOTP() {
  const [otp, setOtp] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(30);

  const navigate = useNavigate();

  const sessionStr = sessionStorage.getItem("authSession");
  const sessionData = sessionStr ? JSON.parse(sessionStr) : null;
  const email = sessionData?.email;

  useEffect(() => {
    if (timer <= 0) return;
    const t = setTimeout(() => setTimer((p) => p - 1), 1000);
    return () => clearTimeout(t);
  }, [timer]);

  if (!email) {
    return <h2 style={{ color: "white", textAlign: "center" }}>Invalid flow</h2>;
  }

  const handleVerify = async () => {
    setLoading(true);
    setMsg("");

    try {
      const res = await fetch(
        "http://localhost:5000/api/auth/register-step2",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, otp }),
        }
      );

      const data = await res.json();
      setLoading(false);

      if (!res.ok) {
        setMsg("Invalid OTP");
        return;
      }

      // 🔥🔥🔥 MAIN FIX
      sessionStorage.setItem(
        "authSession",
        JSON.stringify({
          ...sessionData,
          otpVerified: true,
          flow: "register",
        })
      );

      navigate("/set-register-password");
    } catch {
      setMsg("Server error");
      setLoading(false);
    }
  };

  const resendOTP = async () => {
    setTimer(30);

    await fetch("http://localhost:5000/api/auth/register-step1", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: sessionData.username,
        email,
      }),
    });

    setMsg("OTP sent again");
  };

  return (
    <div style={{ maxWidth: 400, margin: "80px auto", textAlign: "center" }}>
      <h2>Verify OTP</h2>

      {msg && <p>{msg}</p>}

      <input
        placeholder="OTP"
        value={otp}
        onChange={(e) => setOtp(e.target.value)}
      />

      <button onClick={handleVerify} disabled={loading}>
        {loading ? "Verifying..." : "Verify"}
      </button>

      <button disabled={timer > 0} onClick={resendOTP}>
        {timer > 0 ? `Resend in ${timer}` : "Resend"}
      </button>
    </div>
  );
}