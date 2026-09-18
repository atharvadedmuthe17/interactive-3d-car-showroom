import React, { memo } from "react";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import ModelViewer from "./ModelViewer";

const FeatureBlock = memo(({ title, text, modelPath, isReversed }) => {
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  return (
    <div 
      ref={ref}
      className="w-full py-24 md:py-32 px-6 md:px-16 lg:px-24 bg-[#0b0b0f] min-h-screen flex items-center overflow-hidden"
    >
      <div className={`max-w-[1400px] mx-auto flex flex-col items-center gap-12 lg:gap-24 w-full ${isReversed ? 'lg:flex-row-reverse' : 'lg:flex-row'}`}>
        
        {/* Text Section */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="flex-1 space-y-8 text-left w-full"
        >
          <h2 className="text-5xl md:text-7xl font-black uppercase italic tracking-tight text-white leading-[0.9]">
            {title}
          </h2>
          <p className="text-lg md:text-xl text-white/60 font-medium max-w-lg leading-relaxed">
            {text}
          </p>
          
          <motion.div 
            initial={{ width: 0 }}
            animate={inView ? { width: "100px" } : {}}
            transition={{ duration: 1, delay: 0.5 }}
            className="h-[2px] bg-white/20"
          />
        </motion.div>

        {/* Model Section (Clean, Dominant Box) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={inView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="flex-1 w-full relative min-h-[500px] md:min-h-[600px] flex justify-center items-center"
        >
          {/* Main Container - Single Box Only */}
          <div className="absolute inset-0 bg-white/[0.03] backdrop-blur-2xl rounded-[3rem] border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.3)] overflow-hidden" />
          
          <div className="relative z-10 w-full h-full flex justify-center items-center p-4">
            {inView ? (
              <ModelViewer modelPath={modelPath} />
            ) : (
              <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                <p className="text-white/20 text-[10px] uppercase tracking-[0.4em] font-bold">Synchronizing...</p>
              </div>
            )}
          </div>
          
          {/* Subtle Glow (Not a box) */}
          <div className="absolute -z-10 w-[80%] h-[80%] bg-white/5 blur-[120px] rounded-full pointer-events-none" />
        </motion.div>
      </div>
    </div>
  );
});

export default FeatureBlock;
