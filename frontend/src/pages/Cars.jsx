import React, { useState, Suspense, memo } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF, Stage } from '@react-three/drei';
import { useCars } from '../context/CarContext';

// ================= 3D COMPONENTS (LOGIC UNCHANGED) =================
const Model = ({ path }) => {
  const { scene } = useGLTF(path);
  return <primitive object={scene} scale={1.5} />;
};

const CarCanvas = ({ modelPath }) => {
  return (
    <Canvas camera={{ position: [0, 0, 4], fov: 40 }}>
      <Suspense fallback={null}>
        <Stage environment="city" intensity={0.45}>
          <Model path={modelPath} />
        </Stage>
      </Suspense>
      <OrbitControls
        autoRotate
        autoRotateSpeed={2.5}
        enableZoom={false}
        enablePan={false}
        enableRotate={false}
      />
    </Canvas>
  );
};

// ================= CARD =================
const CarCard = memo(({ car, index, hoveredCar, setHoveredCar, navigate }) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const rotateX = useTransform(useSpring(y), [-0.5, 0.5], ["6deg", "-6deg"]);
  const rotateY = useTransform(useSpring(x), [-0.5, 0.5], ["-6deg", "6deg"]);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    x.set((e.clientX - rect.left) / rect.width - 0.5);
    y.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  const modelPath = car.model_url || car.modelPath;

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      style={{ rotateX, rotateY }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setHoveredCar(car.id)}
      onMouseLeave={() => setHoveredCar(null)}
      onClick={() => navigate(`/car/${car.slug || car.id}`)}
      className="group cursor-pointer relative"
    >
      <div className="rounded-[2.5rem] border border-white/10 overflow-hidden bg-[#0b0b0d] hover:border-cyan-400/50 hover:shadow-[0_0_40px_rgba(6,182,212,0.15)] transition-all duration-500">
        
        {/* Thumbnail + 3D */}
        <div className="h-72 relative overflow-hidden bg-gradient-to-b from-transparent to-cyan-900/10">
          <AnimatePresence mode="wait">
            {hoveredCar === car.id && modelPath ? (
              <motion.div 
                key="3d" 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full"
              >
                <CarCanvas modelPath={modelPath} />
              </motion.div>
            ) : (
              <motion.div 
                key="img" 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full relative"
              >
                {car.thumbnail && car.thumbnail.startsWith('http') ? (
                  <img
                    src={car.thumbnail}
                    alt={car.name}
                    className="w-full h-full object-cover grayscale contrast-125 brightness-75 group-hover:brightness-95 transition duration-700"
                  />
                ) : (
                  <div 
                    className="w-full h-full" 
                    style={{ background: car.thumbnail || 'linear-gradient(135deg, #0a0a0c 0%, #001f3f 100%)' }} 
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Cyan Reflection Gradient */}
          <div className="absolute bottom-0 left-0 w-full h-1/3 bg-gradient-to-t from-cyan-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

          {/* STATUS */}
          <div className="absolute top-5 left-5 text-[10px] uppercase tracking-widest text-cyan-400 opacity-0 group-hover:opacity-100 font-bold">
            {car.details?.status || "Available"}
          </div>
        </div>

        {/* CONTENT */}
        <div className="p-8">
          <h2 className="text-3xl font-black italic group-hover:text-cyan-400 transition-colors">
            {car.name}
          </h2>
          <p className="text-cyan-400 text-[10px] font-bold tracking-[0.3em] mt-3">
            Starting at ₹ {car.price}
          </p>

          <div className="w-10 h-[1px] bg-white/10 mt-8 mb-4 group-hover:w-full group-hover:bg-cyan-500/30 transition-all duration-700" />

          <div className="flex justify-between text-[11px] font-mono tracking-tighter text-white/40 group-hover:text-white/80">
            <span>0-100: {car.specs?.zeroToSixty || "—"}</span>
            <span>MAX: {car.specs?.topSpeed || "—"}</span>
          </div>

          {/* Ghost Button */}
          <div className="mt-6 overflow-hidden h-0 group-hover:h-10 transition-all duration-500">
             <div className="w-full border border-cyan-500/50 py-2 text-center text-[9px] uppercase tracking-widest font-black text-cyan-400">
                Book Test Drive
             </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
});

// ================= MAIN =================
const Cars = () => {
  const navigate = useNavigate();
  const [hoveredCar, setHoveredCar] = useState(null);
  const { cars, loading } = useCars();

  if (loading) return (
    <div className="min-h-screen bg-[#050507] text-white flex items-center justify-center text-cyan-400 tracking-widest uppercase text-sm">
      Loading Fleet...
    </div>
  );

  return (
    <div className="min-h-screen bg-[#050507] text-white p-10 overflow-x-hidden">
      
      {/* ENHANCED HEADER */}
      <header className="mb-24 relative">
        {/* Background Watermark */}
        <div className="absolute -top-10 -left-10 text-[15rem] font-black italic opacity-[0.03] select-none pointer-events-none tracking-tighter">
          ADYX
        </div>

        <div className="relative z-10">
          <h1 className="text-8xl font-black tracking-tight relative inline-block">
            ADYX
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ duration: 1, delay: 0.5 }}
              className="absolute -bottom-2 left-0 h-[2px] bg-gradient-to-r from-cyan-500 to-transparent" 
            />
          </h1>
          <p className="text-cyan-400 tracking-[0.4em] mt-4 text-xs font-bold">
            INTELLIGENCE • MOTION • EVOLUTION
          </p>
          <p className="text-white/40 mt-2 text-[10px] uppercase tracking-[0.2em] italic">
            India’s Next-Gen AI Performance Series
          </p>
        </div>

        {/* Stats Strip */}
        <div className="flex gap-12 mt-12 border-l border-white/5 pl -8">
            {[
              { label: "0–100 KM/H", val: "2.8s" },
              { label: "DRIVE", val: "AI ASSISTED" },
              { label: "COMPUTE", val: "EDGE ENABLED" },
              { label: "EDITION", val: "LIMITED" }
            ].map((s, idx) => (
              <div key={idx}>
                <p className="text-[7px] text-cyan-500/60 font-black uppercase tracking-widest">{s.label}</p>
                <p className="text-xs font-bold text-white/80">{s.val}</p>
              </div>
            ))}
        </div>
        
        {/* Header Glow */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-cyan-500/5 blur-[120px] rounded-full -translate-x-1/2 -translate-y-1/2" />
      </header>

      <div className="grid md:grid-cols-3 gap-12">
        {cars.map((car, i) => (
          <CarCard
            key={car.id}
            car={car}
            index={i}
            hoveredCar={hoveredCar}
            setHoveredCar={setHoveredCar}
            navigate={navigate}
          />
        ))}
      </div>
    </div>
  );
};

export default Cars;