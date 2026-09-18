import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

export default function SetRegisterPassword() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [profile, setProfile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const session =
    location.state ||
    JSON.parse(sessionStorage.getItem("authSession") || "{}");

  const { email, flow, otpVerified, username } = session;

  useEffect(() => {
    if (!email || flow !== "register" || !otpVerified) {
      navigate("/register");
    }
  }, [email, flow, otpVerified, navigate]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async () => {
    if (password !== confirm) {
      alert("Passwords do not match!");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("email", email);
    formData.append("password", password);
    if (profile) {
      formData.append("profile_pic", profile);
    }

    try {
      const res = await fetch("http://localhost:5000/api/auth/register-step3", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      setLoading(false);

      if (!res.ok) {
        alert(data.message || "Registration failed");
        return;
      }

      sessionStorage.clear();
      // 🔥 FIXED: Registration ke baad intro par bhejega
      navigate("/intro");
    } catch (err) {
      setLoading(false);
      alert("Server error");
    }
  };

  return (
    <div className="min-h-screen bg-[#050507] text-white flex items-center justify-center font-sans px-6 relative overflow-hidden">
      {/* Abstract Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] -z-10"></div>

      <div className="w-full max-w-md bg-[#0f0f12] border border-white/5 p-10 rounded-[2.5rem] shadow-2xl relative">
        
        {/* Header Section */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-black italic tracking-tighter uppercase">
            Final <span className="text-blue-500">Step</span>
          </h2>
          <p className="text-white/40 text-[10px] uppercase tracking-[0.2em] mt-2">
            Setup your profile & password
          </p>
        </div>

        <div className="space-y-6">
          {/* Profile Upload Section */}
          <div className="flex flex-col items-center gap-4 mb-4">
            <div className="relative group">
              <div className="w-24 h-24 rounded-full border-2 border-dashed border-white/10 flex items-center justify-center overflow-hidden bg-white/[0.02] group-hover:border-blue-500/50 transition-all">
                {preview ? (
                  <img src={preview} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mx-auto text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                )}
              </div>
              <input 
                type="file" 
                id="pfp" 
                hidden 
                accept="image/*" 
                onChange={handleFileChange} 
              />
              <label 
                htmlFor="pfp" 
                className="absolute bottom-0 right-0 bg-blue-600 p-2 rounded-full cursor-pointer hover:bg-white hover:text-black transition-all shadow-lg"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </label>
            </div>
            <span className="text-[10px] text-white/30 uppercase font-bold tracking-widest">Upload Profile Picture</span>
          </div>

          {/* Input Fields */}
          <div className="space-y-4">
            <input
              type="password"
              placeholder="New Password"
              className="w-full p-4 bg-white/[0.03] border border-white/10 rounded-2xl outline-none focus:border-blue-500/50 transition-all text-sm placeholder:text-white/20"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <input
              type="password"
              placeholder="Confirm Password"
              className="w-full p-4 bg-white/[0.03] border border-white/10 rounded-2xl outline-none focus:border-blue-500/50 transition-all text-sm placeholder:text-white/20"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
            />
          </div>

          {/* Submit Button */}
          <button
            disabled={loading}
            onClick={handleSubmit}
            className="w-full bg-blue-600 hover:bg-white hover:text-black text-white font-black py-5 rounded-2xl text-[11px] uppercase tracking-[0.3em] transition-all duration-300 shadow-xl"
          >
            {loading ? "Creating Account..." : "Complete Registration"}
          </button>
        </div>

        {/* Footer info */}
        <p className="text-center mt-8 text-[9px] text-white/20 uppercase tracking-widest leading-relaxed">
          By clicking complete, you agree to the <br /> 
          <span className="text-white/40">ADYX Terms of Service</span>
        </p>
      </div>
    </div>
  );
}