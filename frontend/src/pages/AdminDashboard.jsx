import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";

// Sub-components
import AdminCars from "../components/admin/AdminCars";
import AdminUsers from "../components/admin/AdminUsers";
import AdminBookings from "../components/admin/AdminBookings";
import AdminPayments from "../components/admin/AdminPayments";
import AdminContent from "../components/admin/AdminContent";
import AdminAudit from "../components/admin/AdminAudit";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("cars");
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/admin/login");
  };

  const navItems = [
    { id: "cars", label: "Inventory" },
    { id: "users", label: "Users" },
    { id: "bookings", label: "Bookings" },
    { id: "payments", label: "Payments" },
    { id: "content", label: "Content" },
    { id: "audit", label: "Audit Logs" }
  ];

  return (
    <div className="flex h-screen bg-[#050507] text-white font-sans overflow-hidden">
      
      {/* ── SIDEBAR ── */}
      <div className="w-64 border-r border-white/5 bg-black/50 backdrop-blur-xl flex flex-col z-20 shadow-2xl">
        <div className="p-8 border-b border-white/5">
          <span className="text-[10px] text-cyan-400 font-black uppercase tracking-[0.5em]">ADYX</span>
          <h1 className="text-2xl font-black italic uppercase tracking-tighter text-white mt-1">Control Panel</h1>
        </div>

        <nav className="flex-1 p-6 space-y-2 overflow-y-auto">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full text-left px-5 py-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 ${
                activeTab === item.id 
                  ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-[0_0_15px_rgba(0,224,255,0.1)]' 
                  : 'text-white/40 hover:text-white hover:bg-white/5 border border-transparent'
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-6 border-t border-white/5">
          <button 
            onClick={handleLogout}
            className="w-full px-5 py-4 bg-red-500/10 text-red-400 border border-red-500/20 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-500/20 transition-all"
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* ── MAIN CONTENT AREA ── */}
      <div className="flex-1 relative overflow-hidden bg-[radial-gradient(circle_at_top_right,_rgba(0,224,255,0.03)_0%,_transparent_50%)]">
        <div className="absolute inset-0 pointer-events-none opacity-[0.02]" style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        
        <div className="h-full overflow-y-auto p-10 pb-24 relative z-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              {activeTab === "cars" && <AdminCars />}
              {activeTab === "users" && <AdminUsers />}
              {activeTab === "bookings" && <AdminBookings />}
              {activeTab === "payments" && <AdminPayments />}
              {activeTab === "content" && <AdminContent />}
              {activeTab === "audit" && <AdminAudit />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

    </div>
  );
}
