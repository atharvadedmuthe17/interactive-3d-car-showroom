import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const SuccessPage = () => {
  const { state } = useLocation();
  const navigate = useNavigate();

  const carName = state?.carName || "ADYX Neural Node";
  const carSlug = state?.carSlug;
  const transactionId = "ADYX-" + Math.floor(Math.random() * 9999999);

  return (
    <div className="relative h-screen bg-[#050507] overflow-hidden flex items-center justify-center text-white">

      {/* Ambient Glow Background */}
      <div className="absolute top-[-200px] left-1/2 -translate-x-1/2 w-[800px] h-800px bg-cyan-500/10 blur-[200px] rounded-full" />
      <div className="absolute bottom-[-200px] right-[-200px] w-[600px] h-[600px] bg-cyan-400/5 blur-[180px] rounded-full" />

      {/* Holographic Grid */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, #fff 0, #fff 1px, transparent 0, transparent 40px), repeating-linear-gradient(90deg, #fff 0, #fff 1px, transparent 0, transparent 40px)"
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 60 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="relative z-10 max-w-2xl w-full mx-6"
      >
        {/* Confirmation Core */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.8, type: "spring" }}
          className="w-40 h-40 mx-auto rounded-full border border-cyan-500/40 flex items-center justify-center relative"
        >
          <div className="absolute inset-0 rounded-full bg-cyan-500/10 blur-2xl" />
          <div className="w-24 h-24 rounded-full bg-cyan-500 flex items-center justify-center shadow-[0_0_60px_rgba(6,182,212,0.8)]">
            <svg
              className="w-10 h-10 text-black"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </motion.div>

        {/* Headline */}
        <div className="text-center mt-14 space-y-6">
          <h1 className="text-6xl font-black italic uppercase tracking-tight leading-none">
            Deployment <br />
            <span className="text-cyan-500">Confirmed</span>
          </h1>

          <p className="text-white/40 uppercase text-[11px] tracking-[0.4em] italic">
            {carName} successfully secured on the ADYX network.
          </p>
        </div>

        {/* Data Panel */}
        <div className="mt-14 bg-white/[0.02] border border-white/10 backdrop-blur-2xl rounded-3xl p-8 space-y-6 shadow-[0_0_80px_rgba(6,182,212,0.1)]">

          <div className="flex justify-between text-[10px] uppercase tracking-widest">
            <span className="text-white/40">Transaction ID</span>
            <span className="text-cyan-400 font-mono">{transactionId}</span>
          </div>

          <div className="flex justify-between text-[10px] uppercase tracking-widest">
            <span className="text-white/40">Status</span>
            <span className="text-emerald-400 font-bold">Verified</span>
          </div>

          <div className="flex justify-between text-[10px] uppercase tracking-widest">
            <span className="text-white/40">Next Step</span>
            <span className="text-white">Neural Handshake</span>
          </div>

          {/* Email Confirmation Message */}
          <div className="pt-6 border-t border-white/10">
            <p className="text-[10px] text-cyan-400 uppercase tracking-[0.3em] italic text-center">
              Ownership data synced to global registry.
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="flex flex-col gap-4 mt-14">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate("/intro")}
            className="w-full py-6 rounded-2xl bg-white text-black uppercase tracking-[0.5em] text-[10px] font-black hover:bg-cyan-500 hover:text-white transition-all duration-500 shadow-[0_20px_50px_rgba(255,255,255,0.1)]"
          >
            Initialize Neural Drive
          </motion.button>
          
          <div className="grid grid-cols-2 gap-4">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate(carSlug ? `/car/${carSlug}` : "/cars", { state: { purchased: true } })}
              className="py-4 rounded-2xl border border-white/10 text-white uppercase tracking-[0.3em] text-[9px] font-bold hover:border-cyan-500 transition-all"
            >
              View Asset
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate("/cars")}
              className="py-4 rounded-2xl border border-white/10 text-white/40 uppercase tracking-[0.3em] text-[9px] font-bold hover:text-white transition-all"
            >
              Fleet Hub
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default SuccessPage;