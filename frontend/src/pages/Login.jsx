import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false); 
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (loading) return; 
    
    setMsg("");
    setLoading(true);

    try {
      const res = await fetch(
        "http://localhost:5000/api/auth/login",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password }),
        }
      );

      const data = await res.json();
      setLoading(false);

      if (!res.ok) {
        setMsg(data.message || "Invalid credentials"); 
        return;
      }

      // ✅ Store token + role in context
      login(data.user, data.token);

      // ✅ Session handling
      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.user.role || "user");

      // 🔥 FIXED: Login ke baad intro par bhejega
      navigate("/intro");

    } catch (error) {
      setLoading(false);
      setMsg("Server error. Please try again later."); 
    }
  };

  return (
    <div className="h-screen bg-[#050507] text-white flex items-center justify-center font-sans">
      <div className="bg-white/5 backdrop-blur-xl p-10 rounded-2xl border border-white/10 w-96 shadow-2xl">
        <h2 className="text-3xl font-black italic uppercase mb-6 text-blue-500 text-center tracking-tighter">
          Login
        </h2>

        {msg && (
          <div className="bg-red-500/20 border border-red-500/50 text-red-500 p-3 rounded-lg text-xs mb-4 uppercase font-bold tracking-widest text-center">
            {msg}
          </div>
        )}

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <input
            className="bg-white/5 border border-white/10 p-4 rounded-xl outline-none focus:border-blue-500 transition-all text-sm"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            disabled={loading}
          />

          <div className="relative">
            <input
              className="bg-white/5 border border-white/10 p-4 rounded-xl outline-none focus:border-blue-500 transition-all text-sm w-full"
              type={showPassword ? "text" : "password"} 
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white transition-all text-xs uppercase font-bold tracking-tighter"
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>

          <div className="flex justify-end">
            <span 
              onClick={() => navigate("/forgot-password")}
              className="text-[10px] text-white/40 uppercase tracking-widest cursor-pointer hover:text-blue-500 transition-all"
            >
              Forgot Password?
            </span>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`p-4 rounded-full font-black uppercase tracking-widest text-[10px] mt-2 transition-all ${
              loading ? "bg-white/10 text-white/20 cursor-not-allowed" : "bg-blue-600 hover:bg-white hover:text-black"
            }`}
          >
            {loading ? "Verifying..." : "Enter Adyx"}
          </button>

          {/* New Admin Login Button */}
          <button
            type="button"
            onClick={() => navigate("/admin/login")}
            className="p-4 rounded-full font-black uppercase tracking-widest text-[10px] transition-all border border-white/10 text-white/50 hover:text-white hover:border-white/30 hover:bg-white/5"
          >
            Login as Admin
          </button>
        </form>

        <p
          className="text-center mt-8 text-[10px] text-white/40 uppercase tracking-widest cursor-pointer hover:text-white transition-all"
          onClick={() => navigate("/register")}
        >
          No account? <span className="text-blue-500 font-black">Create One</span>
        </p>
      </div>
    </div>
  );
}