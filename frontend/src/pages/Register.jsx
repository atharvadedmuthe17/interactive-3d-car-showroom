import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setMsg("");
    setLoading(true);

    try {
      const res = await fetch(
        "http://localhost:5000/api/auth/register-step1",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, email }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setLoading(false);
        setMsg(data.message || "Something went wrong");
        return;
      }

      const session = {
        email,
        username,
        flow: "register",
      };

      sessionStorage.setItem("authSession", JSON.stringify(session));
      
      setLoading(false);
      navigate("/verify-otp", { state: session });

    } catch (err) {
      setLoading(false);
      setMsg("Server error connection");
    }
  };

  return (
    <div className="min-h-screen bg-[#050507] text-white flex items-center justify-center font-sans">
      {/* Background Glow Effect */}
      <div className="absolute w-64 h-64 bg-blue-600/20 rounded-full blur-[120px] -z-10 animate-pulse"></div>

      <div className="bg-[#0f0f12] p-10 rounded-[2rem] border border-white/5 w-full max-w-md shadow-[0_20px_50px_rgba(0,0,0,0.5)] mx-4">
        
        {/* Logo/Brand Section */}
        <div className="text-center mb-10">
          <h2 className="text-4xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600 uppercase">
            ADYX
          </h2>
          <p className="text-white/40 text-[10px] uppercase tracking-[0.3em] mt-1 font-semibold">
            Create your account
          </p>
        </div>

        {msg && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-xs mb-6 text-center font-medium">
            {msg}
          </div>
        )}

        <form onSubmit={handleSendOtp} className="flex flex-col gap-5">
          {/* Username Input */}
          <div className="relative group">
            <input
              type="text"
              placeholder="Username"
              className="w-full p-4 bg-white/[0.03] border border-white/10 rounded-2xl outline-none focus:border-blue-500/50 focus:bg-white/[0.05] transition-all duration-300 text-sm placeholder:text-white/20"
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          {/* Email Input */}
          <div className="relative group">
            <input
              type="email"
              placeholder="Email Address"
              className="w-full p-4 bg-white/[0.03] border border-white/10 rounded-2xl outline-none focus:border-blue-500/50 focus:bg-white/[0.05] transition-all duration-300 text-sm placeholder:text-white/20"
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {/* Submit Button */}
          <button
            disabled={loading}
            className={`w-full py-4 rounded-2xl font-bold uppercase tracking-widest text-[11px] mt-4 transition-all duration-500 relative overflow-hidden group ${
              loading 
              ? "bg-white/5 text-white/20 cursor-not-allowed" 
              : "bg-blue-600 hover:bg-white hover:text-black hover:shadow-[0_0_30px_rgba(37,99,235,0.4)]"
            }`}
          >
            <span className="relative z-10">
              {loading ? "Processing..." : "Continue to OTP"}
            </span>
          </button>
        </form>

        {/* Footer Link */}
        <div className="text-center mt-10">
          <p className="text-[11px] text-white/30 uppercase tracking-widest">
            Already have an account?{" "}
            <span 
              className="text-blue-500 font-bold cursor-pointer hover:text-white transition-colors ml-1"
              onClick={() => navigate("/login")}
            >
              Log In
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}