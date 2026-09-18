import React, { useState, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { useNavigate } from "react-router-dom";
import CarPreview from "../../../three/CarPreview";

const CarCard = memo(({ car }) => {
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();
  const { ref, inView } = useInView({ threshold: 0.1, triggerOnce: true });

  return (
    <div
      ref={ref}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => navigate(`/car/${car.id}`)}
      className="relative w-full h-[450px] bg-[#0d0d0d] rounded-2xl overflow-hidden border border-white/5 cursor-pointer group"
    >
      <div className="absolute top-8 left-8 z-30 pointer-events-none">
        <h3 className="text-white text-3xl font-black uppercase italic tracking-tighter">{car.name}</h3>
        <p className="text-blue-500 font-mono text-[10px] mt-2 tracking-widest font-bold">FROM ${car.price.toLocaleString()}</p>
      </div>

      <AnimatePresence mode="wait">
        {!isHovered ? (
          <motion.div key="img" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full h-full">
            <img src={car.thumbnail || "https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=1200"} className="w-full h-full object-cover grayscale opacity-40 group-hover:scale-110 transition-transform duration-1000" />
            <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-60" />
          </motion.div>
        ) : (
          <motion.div key="3d" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full h-full">
            {inView && <CarPreview modelPath={car.modelPath} isHovered={isHovered} />}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="absolute bottom-8 left-8 right-8 flex justify-between items-center z-30">
        <div className="flex gap-6">
          <div><p className="text-white/20 text-[8px] font-bold tracking-widest uppercase">0-60 MPH</p><p className="text-white text-xs font-bold">{car.specs.zeroToSixty}</p></div>
          <div><p className="text-white/20 text-[8px] font-bold tracking-widest uppercase">Top Speed</p><p className="text-white text-xs font-bold">{car.specs.topSpeed}</p></div>
        </div>
      </div>
    </div>
  );
});

export default CarCard;
