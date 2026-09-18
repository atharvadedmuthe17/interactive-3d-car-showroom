import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";

export default function VerifyRegisterOTP() {
  const [otp, setOtp] = useState("");
  const [timer, setTimer] = useState(30);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const timerRef = useRef(null);

  const session =
    location.state ||
    JSON.parse(sessionStorage.getItem("authSession") || "{}");

  const { email, flow, username } = session;

  useEffect(() => {
    if (!email || flow !== "register") {
      navigate("/register");
    } else {
      sessionStorage.setItem("authSession", JSON.stringify(session));
    }
  }, [email, flow, navigate, session]);

  // 🔥 Timer Logic Fix: Har baar timer change hone par interval clear karke naya set karega
  useEffect(() => {
    if (timer > 0) {
      timerRef.current = setInterval(() => {
        setTimer((t) => t - 1);
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [timer]);

  // 🔥 Resend Function: Backend call aur Timer reset
  const handleResend = async () => {
    try {
      setTimer(30); // Reset Timer to 30
      setOtp("");   // Clear OTP input
      
      await fetch("http://localhost:5000/api/auth/register-step1", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email }),
      });
      
    } catch (err) {
      console.error("Resend error:", err);
    }
  };

  const handleVerify = async () => {
    setLoading(true);
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
        alert(data.message || "Invalid OTP");
        return;
      }

      const updated = { ...session, otpVerified: true };
      sessionStorage.setItem("authSession", JSON.stringify(updated));
      navigate("/set-register-password", { state: updated });
    } catch (err) {
      setLoading(false);
      alert("Server connection failed");
    }
  };

  return (
    <div className="min-h-screen bg-[#050507] text-white flex items-center justify-center font-sans px-6 relative overflow-hidden">
      
      {/* Dynamic Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px] animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-purple-600/10 rounded-full blur-[100px]"></div>

      <div className="w-full max-w-md bg-[#0f0f12]/80 backdrop-blur-xl border border-white/5 p-10 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative z-10">
        
        {/* Header Section */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-gradient-to-tr from-blue-600 to-cyan-400 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-[0_0_20px_rgba(37,99,235,0.3)]">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor font-bold">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="Step 9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-3xl font-black italic tracking-tighter uppercase mb-2">
            Verify <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">Identity</span>
          </h2>
          <p className="text-white/40 text-[10px] uppercase tracking-[0.2em] font-medium leading-relaxed">
            We've sent a 6-digit code to <br />
            <span className="text-blue-400/80 lowercase">{email}</span>
          </p>
        </div>

        {/* Input Section */}
        <div className="space-y-8">
          <div className="relative group">
            <input
              maxLength="6"
              value={otp}
              placeholder="0 0 0 0 0 0"
              onChange={(e) => /^\d*$/.test(e.target.value) && setOtp(e.target.value)}
              className="w-full bg-white/[0.03] border border-white/10 rounded-2xl p-5 text-center text-3xl font-mono tracking-[0.5em] focus:border-blue-500/50 focus:bg-white/[0.05] transition-all outline-none placeholder:text-white/5 placeholder:tracking-normal placeholder:text-sm"
            />
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-[2px] bg-blue-500 group-focus-within:w-[80%] transition-all duration-500"></div>
          </div>

          <button 
            onClick={handleVerify}
            disabled={loading || otp.length < 6}
            className="w-full bg-blue-600 hover:bg-white hover:text-black text-white font-black py-5 rounded-2xl text-[11px] uppercase tracking-[0.3em] transition-all duration-300 shadow-[0_10px_20px_rgba(37,99,235,0.2)] active:scale-[0.98] disabled:opacity-20"
          >
            {loading ? "Verifying..." : "Verify & Secure Account"}
          </button>

          {/* Timer & Resend */}
          <div className="flex flex-col items-center gap-4 pt-2">
            <div className="flex items-center gap-2">
              {timer > 0 && <div className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-ping"></div>}
              <span className={`text-[11px] font-mono ${timer > 0 ? "text-white/60" : "text-red-500/40"}`}>
                {timer > 0 ? `00:${timer < 10 ? `0${timer}` : timer}` : "EXPIRED"}
              </span>
            </div>
            
            <button 
              type="button"
              disabled={timer > 0}
              onClick={handleResend}
              className={`text-[10px] uppercase font-bold tracking-widest transition-all ${
                timer > 0 ? "text-white/10" : "text-blue-500 hover:text-cyan-400 cursor-pointer"
              }`}
            >
              Didn't get the code? <span className="underline underline-offset-4">Resend</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center border-t border-white/5 pt-6">
          <p 
            onClick={() => navigate("/register")}
            className="text-[9px] text-white/20 uppercase tracking-[0.2em] cursor-pointer hover:text-white transition-all"
          >
            Entered wrong email? <span className="text-blue-500/50 italic">Go back</span>
          </p>
        </div>

      </div>
    </div>
  );
}