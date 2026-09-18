import React from "react";
import { motion } from "framer-motion";

export default function RouteLoader() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-md pointer-events-none"
    >
      <div className="flex flex-col items-center gap-4">
        {/* Cinematic Bar */}
        <div className="w-[120px] h-[2px] bg-white/10 relative overflow-hidden">
          <motion.div 
            animate={{ 
              x: ["-100%", "100%"] 
            }}
            transition={{ 
              duration: 1, 
              repeat: Infinity, 
              ease: "linear" 
            }}
            className="absolute inset-0 bg-gradient-to-r from-transparent via-[#00e0ff] to-transparent"
          />
        </div>
        
        {/* Subtle Text */}
        <span className="text-[8px] uppercase tracking-[0.6em] text-white/40 font-black italic">
          Initializing Engine
        </span>
      </div>
    </motion.div>
  );
}
