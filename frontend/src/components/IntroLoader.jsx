import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function IntroLoader({ onComplete }) {
  const [progress, setProgress] = useState(0);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const duration = 3500; // 3.5 seconds sequence
    const intervalTime = 25; 
    const steps = duration / intervalTime;
    const increment = 100 / steps;

    const timer = setInterval(() => {
      setProgress((prev) => {
        const next = prev + increment;
        if (next >= 100) {
          clearInterval(timer);
          setTimeout(() => {
            setIsExiting(true);
            setTimeout(() => {
              sessionStorage.setItem("introPlayed", "true");
              onComplete();
            }, 1000);
          }, 800);
          return 100;
        }
        return next;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {!isExiting && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ 
            opacity: 0, 
            scale: 1.08, 
            filter: "blur(20px)",
            transition: { duration: 0.8, ease: "easeIn" } 
          }}
          className="fixed inset-0 z-[9999] bg-[#000000] flex flex-col items-center justify-center overflow-hidden"
        >
          {/* ── BACKGROUND LAYER ── */}
          <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_center,_#0f172a_0%,_#000000_100%)] opacity-80" />
          
          {/* Subtle Ambient Light (Cyan) */}
          <motion.div 
            animate={{ 
              opacity: progress > 70 ? [0.1, 0.25, 0.1] : 0.05,
              scale: progress > 70 ? [1, 1.2, 1] : 1
            }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] bg-cyan-500/10 blur-[150px] rounded-full pointer-events-none"
          />

          {/* ── MAIN CONTENT ── */}
          <div className="relative z-10 flex flex-col items-center gap-12 w-full max-w-4xl px-12">
            
            {/* CAR LINE DRAWING (The Hero) */}
            <div className="relative w-full aspect-[21/9] max-w-2xl flex items-center justify-center">
              <svg 
                viewBox="0 0 800 300" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
                className="w-full h-auto"
              >
                {/* Car Silhouette Path */}
                <motion.path
                  d="M100 240 L120 240 Q130 210 160 210 Q190 210 200 240 L600 240 Q610 210 640 210 Q670 210 680 240 L700 240 L720 210 L720 180 Q720 140 680 120 L580 100 Q480 60 350 60 L200 70 Q120 80 80 140 L70 190 Z"
                  stroke={progress > 70 ? "#00e0ff" : "white"}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  initial={{ pathLength: 0, opacity: 0.2 }}
                  animate={{ 
                    pathLength: progress / 100,
                    opacity: 0.2 + (progress / 100) * 0.8,
                    filter: progress > 85 ? "drop-shadow(0 0 15px #00e0ff)" : "none"
                  }}
                  transition={{ duration: 0.5 }}
                />
                
                {/* Chassis Detail Lines */}
                <motion.path
                  d="M200 70 L350 160 M580 100 L580 160 M80 140 L720 180"
                  stroke="white"
                  strokeWidth="0.5"
                  opacity={progress > 50 ? 0.15 : 0}
                />

                {/* Pulse Glow Effect (Triggered after 70%) */}
                {progress > 70 && (
                  <motion.circle
                    cx="400"
                    cy="150"
                    r="100"
                    fill="url(#cyanGlow)"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: [0.1, 0.3, 0.1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                )}

                <defs>
                  <radialGradient id="cyanGlow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#00e0ff" stopOpacity="0.5" />
                    <stop offset="100%" stopColor="#00e0ff" stopOpacity="0" />
                  </radialGradient>
                </defs>
              </svg>
            </div>

            {/* PROGRESS SYSTEM */}
            <div className="flex flex-col items-center gap-4">
              <div className="flex items-end gap-2 h-14 overflow-hidden">
                <motion.span 
                  key={Math.floor(progress)}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="text-6xl font-black italic tracking-tighter metallic-text"
                >
                  {Math.round(progress)}
                </motion.span>
                <span className="text-sm font-black text-cyan-500/50 mb-2 uppercase tracking-widest">
                  % COMPLETED
                </span>
              </div>

              {/* Progress Bar (Minimal) */}
              <div className="w-64 h-[1px] bg-white/10 relative overflow-hidden">
                <motion.div 
                  className="absolute inset-0 bg-cyan-400"
                  style={{ width: `${progress}%` }}
                />
              </div>

              <motion.p 
                animate={{ opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-[9px] font-bold uppercase tracking-[1em] text-white/40 mt-2"
              >
                Precision_Assembly_In_Progress
              </motion.p>
            </div>

          </div>

          {/* VIGNETTE OVERLAY */}
          <div className="absolute inset-0 pointer-events-none z-20 shadow-[inset_0_0_150px_rgba(0,0,0,0.9)]" />

          {/* HUD CORNER DETAILS */}
          <div className="absolute top-10 left-10 opacity-20 pointer-events-none font-mono">
            <p className="text-[7px] uppercase tracking-widest text-white mb-1">ADYX_ENGINE_V4.0</p>
            <p className="text-[7px] uppercase tracking-widest text-cyan-400">STATUS: INITIALIZING</p>
          </div>

          <style>{`
            .metallic-text {
              background: linear-gradient(to bottom, #fff 20%, #94a3b8 50%, #fff 80%);
              -webkit-background-clip: text;
              -webkit-text-fill-color: transparent;
            }
          `}</style>

        </motion.div>
      )}
    </AnimatePresence>
  );
}
