import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function ForgotPassword() {
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    sessionStorage.clear(); // Clear any previous auth sessions
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        const authData = { email: data.email, maskedEmail: data.maskedEmail, flow: "forgot" };
        sessionStorage.setItem("authSession", JSON.stringify(authData));
        navigate("/forgot-password-otp", { state: authData });
      } else {
        alert(data.message || "Invalid Username");
      }
    } catch {
      alert("Server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050507] text-white flex items-center justify-center font-sans px-6 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px]"></div>

      <div className="w-full max-w-md bg-[#0f0f12]/80 backdrop-blur-xl border border-white/5 p-10 rounded-[2.5rem] shadow-2xl relative z-10">
        
        {/* Header Section */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-blue-600/10 rounded-2xl mx-auto mb-6 flex items-center justify-center border border-blue-500/20">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h2 className="text-3xl font-black italic tracking-tighter uppercase mb-2">
            Reset <span className="text-blue-500">Access</span>
          </h2>
          <p className="text-white/40 text-[10px] uppercase tracking-[0.2em] font-medium">
            Enter your username to find account
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="relative group">
            <input
              /* 🔥 FIX: 'uppercase' class hata di hai, ab normal typing hogi */
              className="w-full bg-white/[0.03] border border-white/10 p-5 rounded-2xl outline-none focus:border-blue-500/50 focus:bg-white/[0.05] transition-all text-sm placeholder:text-white/20"
              placeholder="Username"
              value={username} 
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <button 
            disabled={loading} 
            className={`w-full py-5 rounded-2xl font-black uppercase tracking-[0.3em] text-[11px] transition-all duration-300 shadow-xl ${
              loading 
              ? "bg-white/5 text-white/20 cursor-not-allowed" 
              : "bg-blue-600 hover:bg-white hover:text-black shadow-blue-600/10"
            }`}
          >
            {loading ? "Searching Database..." : "Find Account"}
          </button>
        </form>

        <div className="mt-10 text-center border-t border-white/5 pt-6">
          <p 
            onClick={() => navigate("/login")}
            className="text-[9px] text-white/20 uppercase tracking-[0.2em] cursor-pointer hover:text-white transition-all"
          >
            Remembered password? <span className="text-blue-500/50 italic">Log In</span>
          </p>
        </div>
      </div>
    </div>
  );
}


