import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axios from "axios";

export default function Profile() {
  const { user, login, logout } = useAuth();
  const navigate = useNavigate();
  
  const [username, setUsername] = useState(user?.username || "");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(user?.profile_pic || "");
  const [loading, setLoading] = useState(false);
  const [bookings, setBookings] = useState([]); 
  const [msg, setMsg] = useState("");
  const [showDelete, setShowDelete] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleting, setDeleting] = useState(false);

  // Logic to calculate portfolio value
  const totalPortfolioValue = bookings.reduce((acc, curr) => acc + (Number(curr.price) || 0), 0);

  // Indian Price Formatter
  const formatINR = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price).replace('₹', '₹ ');
  };

  const handleDeleteAccount = async () => {
    if (!deletePassword) { alert("Enter password"); return; }
    const token = localStorage.getItem("token");
    try {
      setDeleting(true);
      await axios.delete("http://localhost:5000/api/auth/delete-account", {
        headers: { Authorization: `Bearer ${token}` },
        data: { password: deletePassword },
      });
      alert("Account deleted");
      localStorage.clear();
      navigate("/");
      window.location.reload();
    } catch (err) {
      alert(err?.response?.data?.message || "Delete failed");
    } finally { setDeleting(false); }
  };

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:5000/api/bookings/my", {
          headers: { Authorization: `Bearer ${token}` }
        });
        setBookings(res.data.bookings);
      } catch (err) {
        // No bookings found yet.
      }
    };
    if (user?.id) fetchHistory();
  }, [user?.id]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    sessionStorage.clear();
    logout();
    navigate("/login");
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg("");
    const currentToken = localStorage.getItem("token");
    const formData = new FormData();
    formData.append("username", username);
    if (file) formData.append("profile_pic", file); 

    try {
      const res = await axios.put("http://localhost:5000/api/auth/update-profile", formData, {
        headers: { "Content-Type": "multipart/form-data", Authorization: `Bearer ${currentToken}` },
      });

      if (res.data.success) {
        setMsg("PROFILE SYNCED!");
        login(res.data.user, currentToken); 
        setPreview(res.data.user.profile_pic);
        setTimeout(() => setMsg(""), 3000);
      }
    } catch (err) { setMsg("Sync failed."); } 
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-[#050507] text-white pt-32 pb-20 px-6 font-sans selection:bg-cyan-500 selection:text-white">
      {/* Premium Ambient Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-cyan-600/5 blur-[140px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
        
        {/* Left Col: Identity Card */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-[#0f0f12] p-8 rounded-[2.5rem] border border-white/5 shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative overflow-hidden group">
            {/* Animated background glow */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-cyan-600/10 rounded-full blur-3xl group-hover:bg-cyan-600/20 transition-all duration-1000 animate-pulse"></div>
            
            <h2 className="text-xl font-black italic tracking-tighter uppercase mb-10 flex items-center gap-3">
              <span className="w-8 h-[2px] bg-cyan-500"></span> Identity
            </h2>

            <form onSubmit={handleUpdate} className="space-y-10">
              <div className="flex flex-col items-center">
                <div className="relative group/pfp">
                  {/* Outer Glow Ring */}
                  <div className="absolute inset-0 bg-cyan-500/20 rounded-full blur-xl group-hover/pfp:blur-2xl transition-all duration-500"></div>
                  <div className="relative w-36 h-36 rounded-full p-[2px] bg-gradient-to-tr from-cyan-600 to-blue-400 shadow-2xl">
                    <img 
                      src={preview || "https://cdn-icons-png.flaticon.com/512/149/149071.png"} 
                      className="w-full h-full rounded-full object-cover border-4 border-[#0f0f12]" 
                      alt="Profile" 
                    />
                  </div>
                  <input 
                    type="file" 
                    id="fileInput" 
                    onChange={(e) => {setFile(e.target.files[0]); setPreview(URL.createObjectURL(e.target.files[0]))}} 
                    className="hidden" 
                  />
                  <label htmlFor="fileInput" className="absolute bottom-2 right-2 bg-cyan-500 p-3 rounded-full cursor-pointer hover:bg-white hover:text-black transition-all shadow-xl active:scale-90 z-10">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </label>
                </div>
              </div>

              <div className="space-y-5">
                <div className="group">
                  <p className="text-[9px] uppercase tracking-[0.3em] text-white/20 mb-2 font-black ml-1">Secure Email</p>
                  <input value={user?.email || ""} disabled className="w-full bg-white/[0.01] border border-white/5 p-4 rounded-2xl text-white/20 text-xs font-mono cursor-not-allowed" />
                </div>
                <div className="group">
                  <p className="text-[9px] uppercase tracking-[0.3em] text-white/20 mb-2 font-black ml-1">Signature Name</p>
                  <input value={username} onChange={(e) => setUsername(e.target.value)} className="w-full bg-white/[0.03] border border-white/10 p-4 rounded-2xl outline-none focus:border-cyan-500/50 transition-all font-bold text-sm italic tracking-tight" />
                </div>
              </div>

              {msg && <p className="text-[10px] text-cyan-400 font-black uppercase text-center animate-pulse">{msg}</p>}

              <button disabled={loading} type="submit" className="w-full bg-cyan-600 py-5 rounded-2xl font-black uppercase tracking-[0.4em] text-[10px] hover:bg-white hover:text-black hover:scale-[1.02] active:scale-95 transition-all duration-500 shadow-lg shadow-cyan-600/10">
                {loading ? "Synchronizing..." : "Update Identity"}
              </button>

              <button
                type="button"
                onClick={handleLogout}
                className="w-full border border-red-500/30 text-red-400/70 py-5 rounded-2xl font-black uppercase tracking-[0.4em] text-[10px] hover:bg-red-500/10 hover:border-red-500 hover:text-red-400 active:scale-95 transition-all duration-500"
              >
                Logout
              </button>
            </form>
          </div>

          {/* Danger Zone - Refined */}
          <div className="bg-gradient-to-b from-red-500/[0.05] to-transparent border border-red-500/10 p-8 rounded-[2.5rem] transition-all group">
            <h3 className="text-red-500/60 uppercase font-black tracking-[0.2em] text-[10px] mb-6 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span> Critical Settings
            </h3>

            {!showDelete ? (
              <button onClick={() => setShowDelete(true)} className="w-full text-red-500/30 text-[9px] uppercase font-bold tracking-[0.3em] hover:text-red-500 transition-colors py-2 border border-transparent hover:border-red-500/20 rounded-xl">
                Terminate Account Access
              </button>
            ) : (
              <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                <input type="password" placeholder="Verify Master Password" value={deletePassword} onChange={(e) => setDeletePassword(e.target.value)} className="w-full bg-red-500/5 border border-red-500/20 p-4 rounded-xl outline-none focus:border-red-500 text-sm text-red-200" />
                <div className="flex gap-2">
                  <button onClick={handleDeleteAccount} disabled={deleting} className="flex-1 bg-red-600 hover:bg-red-700 py-3 rounded-xl font-black uppercase text-[9px] tracking-widest transition-colors">Confirm</button>
                  <button onClick={() => setShowDelete(false)} className="flex-1 border border-white/10 py-3 rounded-xl uppercase text-[9px] font-bold hover:bg-white/5 transition-colors">Cancel</button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Col: Stats & History */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* 4️⃣ Upgrade Stats Bar (Top Right) */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Account Rank", val: "Elite", color: "text-cyan-500" },
              { label: "Member Since", val: "Mar 2026", color: "text-white" },
              { label: "Vehicles Owned", val: bookings.length, color: "text-white" },
              { label: "Portfolio Value", val: formatINR(totalPortfolioValue), color: "text-cyan-500" }
            ].map((stat, i) => (
              <div key={i} className="bg-[#0f0f12]/60 backdrop-blur-md border border-white/5 p-6 rounded-3xl relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <p className="text-[8px] uppercase tracking-[0.3em] text-white/30 font-black mb-2 relative z-10">{stat.label}</p>
                <h3 className={`text-xs ${stat.color} uppercase font-black italic relative z-10`}>{stat.val}</h3>
              </div>
            ))}
          </div>

          {/* 1️⃣ Portfolio Summary Section (NEW) */}
          <div className="bg-gradient-to-r from-cyan-600/10 via-[#0f0f12] to-transparent border border-cyan-500/20 p-8 rounded-[2.5rem] backdrop-blur-xl shadow-[0_0_40px_rgba(6,182,212,0.05)]">
             <div className="flex flex-col md:flex-row gap-12 items-center">
                <div>
                   <p className="text-[9px] uppercase tracking-[0.4em] text-white/40 font-black mb-3">Total Owned</p>
                   <h2 className="text-5xl font-black italic text-white tracking-tighter">{bookings.length}</h2>
                </div>
                <div className="hidden md:block w-[1px] h-12 bg-white/10"></div>
                <div>
                   <p className="text-[9px] uppercase tracking-[0.4em] text-white/40 font-black mb-3">Portfolio Value</p>
                   <h2 className="text-5xl font-black italic text-cyan-500 tracking-tighter">{formatINR(totalPortfolioValue)}</h2>
                </div>
                <div className="ml-auto text-right">
                   <p className="text-[9px] uppercase tracking-[0.4em] text-white/40 font-black mb-3">Active Status</p>
                   <div className="flex items-center gap-2 justify-end">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                      <span className="text-xs font-black uppercase text-white italic">Operational</span>
                   </div>
                </div>
             </div>
          </div>

          {/* 2️⃣ Concierge Log Layout */}
          <div className="bg-[#0f0f12] border border-white/5 rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden">
            <div className="flex justify-between items-center mb-10">
              <h2 className="text-2xl font-black uppercase italic tracking-tighter flex items-center gap-4">
                Concierge Log <span className="text-[11px] not-italic bg-cyan-500/10 text-cyan-500 px-4 py-1.5 rounded-full border border-cyan-500/20">Active Node: {bookings.length}</span>
              </h2>
            </div>

            <div className="space-y-6">
              {bookings.length > 0 ? bookings.map((booking, i) => (
                <div key={i} className="group relative bg-white/[0.01] border border-white/5 rounded-[2rem] p-7 hover:bg-white/[0.03] hover:border-cyan-500/20 hover:scale-[1.01] transition-all duration-500 cursor-default shadow-lg">
                  {/* Left Accent Line */}
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-0 group-hover:h-[60%] bg-cyan-500 transition-all duration-500 rounded-r-full shadow-[0_0_15px_rgba(6,182,212,0.8)]"></div>
                  
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="flex items-center gap-6">
                      {/* Round Thumbnail / Gradient Placeholder */}
                      <div className="w-16 h-16 rounded-full overflow-hidden border border-white/10 bg-gradient-to-br from-cyan-600/20 to-blue-900/40 p-[2px]">
                         {booking.car_image ? (
                           <img src={booking.car_image} alt={booking.car_name} className="w-full h-full object-cover rounded-full" />
                         ) : (
                           <div className="w-full h-full flex items-center justify-center bg-[#1a1a1f] rounded-full text-cyan-500/50">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                           </div>
                         )}
                      </div>
                      <div>
                        <h4 className="text-xl font-black italic uppercase group-hover:text-cyan-400 transition-colors tracking-tight">{booking.car_name}</h4>
                        <p className="text-[10px] text-white/30 uppercase tracking-[0.3em] font-bold mt-1">{new Date(booking.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-12 w-full md:w-auto border-t md:border-t-0 border-white/5 pt-5 md:pt-0">
                      {/* Price Section */}
                      <div className="text-right">
                        <p className="text-[8px] uppercase text-white/20 font-black mb-1 tracking-[0.2em]">Ex-Showroom</p>
                        <p className="text-xl font-black text-white italic tracking-tighter">{formatINR(booking.price)}</p>
                      </div>
                      {/* Status Badge */}
                      <div className="text-right min-w-[120px]">
                        <p className="text-[8px] uppercase text-white/20 font-black mb-2 tracking-[0.2em]">Deployment</p>
                        <div className="inline-flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/20 px-4 py-2 rounded-full shadow-[0_0_20px_rgba(6,182,212,0.1)]">
                           <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
                           <span className="text-[10px] text-cyan-400 font-black uppercase tracking-widest">Confirmed</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )) : (
                /* 3️⃣ Improved Empty State */
                <div className="py-24 text-center border-2 border-dashed border-white/5 rounded-[3rem] bg-white/[0.01]">
                  <div className="w-16 h-16 bg-white/[0.02] border border-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white/10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                  </div>
                  <h3 className="text-white/20 uppercase tracking-[0.6em] text-xs font-black">No Vehicle Allocations Yet</h3>
                  <p className="text-white/10 text-[9px] uppercase tracking-widest mt-4">Your elite portfolio is currently awaiting its first acquisition.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}