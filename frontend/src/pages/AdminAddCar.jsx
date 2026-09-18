import React, { useState, useRef } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

export default function AdminAddCar() {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [file, setFile] = useState(null);
  const [statusMessage, setStatusMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const fileInputRef = useRef(null);

  const handleAddCar = async () => {
    if (!name || !price || !file) {
      setStatusMessage("❌ All fields are required");
      return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
      setStatusMessage("❌ Unauthorized. Please login again.");
      return;
    }

    try {
      setLoading(true);
      setStatusMessage("");

      const formData = new FormData();
      formData.append("name", name);
      formData.append("price", price);
      formData.append("model", file);

      const response = await fetch(
        "http://localhost:5000/api/admin/add-car",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      const data = await response.json();

      if (response.ok) {
        setStatusMessage("✅ Car added successfully");

        setName("");
        setPrice("");
        setFile(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
        
        setTimeout(() => navigate('/admin'), 1500);
      } else {
        setStatusMessage(data.message || "❌ Failed to add car");
      }
    } catch (error) {
      console.error(error);
      setStatusMessage("❌ Server error");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: "100%",
    padding: "16px",
    borderRadius: "12px",
    border: "1px solid rgba(255,255,255,0.1)",
    background: "rgba(0,0,0,0.6)",
    color: "#fff",
    outline: "none",
    boxShadow: "0 0 10px rgba(0,255,255,0.05)",
  };

  return (
    <div className="min-h-screen bg-[#050507] text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vh] bg-[radial-gradient(circle_at_center,_rgba(0,224,255,0.05)_0%,_transparent_70%)]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-md p-10 bg-white/[0.02] border border-white/5 rounded-3xl backdrop-blur-2xl shadow-2xl"
      >
        <button onClick={() => navigate('/admin')} className="text-[10px] text-cyan-400 font-black uppercase tracking-widest mb-6 hover:text-white transition-colors">
          ← Back to Dashboard
        </button>

        <h2 className="text-3xl font-black italic uppercase tracking-tighter text-white mb-8 text-shadow-glow">
          Add New <span className="text-cyan-400">Machine</span>
        </h2>

        {/* STATUS */}
        {statusMessage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`p-4 mb-6 rounded-xl text-center text-sm font-bold tracking-wider ${
              statusMessage.includes("success")
                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                : "bg-red-500/10 text-red-400 border border-red-500/30"
            }`}
          >
            {statusMessage}
          </motion.div>
        )}

        <div className="space-y-5">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Vehicle Name"
            style={inputStyle}
          />

          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="Valuation (₹)"
            style={inputStyle}
          />

          <div className="p-4 bg-black/60 border border-white/10 rounded-xl">
            <label className="block text-[10px] text-white/40 uppercase tracking-widest mb-2 font-bold">3D Asset (.glb)</label>
            <input
              type="file"
              accept=".glb"
              onChange={(e) => setFile(e.target.files[0])}
              ref={fileInputRef}
              className="text-sm text-white/60 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-[10px] file:font-black file:uppercase file:tracking-widest file:bg-cyan-500/20 file:text-cyan-400 hover:file:bg-cyan-500/30 cursor-pointer"
            />
          </div>
        </div>

        {/* BUTTON */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleAddCar}
          disabled={loading}
          className="w-full mt-8 py-5 bg-cyan-500 text-black font-black uppercase text-[11px] tracking-[0.5em] rounded-xl hover:bg-cyan-400 transition-all shadow-[0_0_20px_rgba(0,224,255,0.3)] disabled:opacity-50"
        >
          {loading ? "Processing..." : "Deploy Asset"}
        </motion.button>
      </motion.div>
    </div>
  );
}
