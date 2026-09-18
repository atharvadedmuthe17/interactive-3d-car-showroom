import React, { useEffect, useState, Suspense, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCars } from "../context/CarContext";
import { motion, AnimatePresence } from "framer-motion";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls, useGLTF, ContactShadows, Environment, MeshReflectorMaterial, Circle, Center, Float } from "@react-three/drei";
import * as THREE from "three";

// ── PREMIUM CAR DATA (Moved outside for stability) ──────────────────────
const PREMIUM_CARS = [
  {
    name: "ADYX SPECTRE",
    price: "₹ 1.25 Cr",
    description: "Stealth performance coupe engineered for surgical precision.",
    performance: { speed: "320 km/h", horsepower: "750 HP", torque: "850 Nm" },
    battery: { range: "620 km", charging: "20 min Ultra-Fast" },
    interior: { infotainment: "18\" Curved OLED", seats: "Neural Silk Leather" },
    safety: { airbags: "12 Systems", abs: "Quantum ABS", adas: "Level 4" },
    model_url: "/models/audi_r8.glb"
  },
  {
    name: "ADYX NEXUS",
    price: "₹ 85 Lakh",
    description: "Hyper-connected grand tourer with distributed AI intelligence.",
    performance: { speed: "280 km/h", horsepower: "520 HP", torque: "600 Nm" },
    battery: { range: "550 km", charging: "35 min Fast Charge" },
    interior: { infotainment: "Floating Glass Dash", seats: "Active Massage" },
    safety: { airbags: "9 Airbags", abs: "Dynamic ABS", adas: "Level 3+" },
    model_url: "/models/venom.glb"
  },
  {
    name: "ADYX VORTEX",
    price: "₹ 1.10 Cr",
    description: "Zero-drag aerodynamics paired with relentless twin-motor power.",
    performance: { speed: "305 km/h", horsepower: "680 HP", torque: "780 Nm" },
    battery: { range: "580 km", charging: "25 min Rapid Mode" },
    interior: { infotainment: "Cinematic Rear Stage", seats: "Zero-G Foam" },
    safety: { airbags: "10 Airbags", abs: "E-Brake Pro", adas: "Active Shield" },
    model_url: "/models/bmw_m4.glb"
  }
];

// ── 3D CAR COMPONENT (ULTRA ROBUST) ──────────────────────────────────
function LandingCar({ modelPath }) {
  const { scene } = useGLTF(modelPath);

  // Optimize materials once on load
  useEffect(() => {
    scene.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        if (child.material) {
          child.material.envMapIntensity = 2;
          child.material.needsUpdate = true;
        }
      }
    });
  }, [scene]);

  return (
    <Center top>
      <primitive object={scene} scale={2.5} />
    </Center>
  );
}

// ── BASE PLATFORM ──────────────────────────────────────────────────
function BasePlatform() {
  return (
    <group position={[0, -0.01, 0]}>
      {/* Reflector Floor */}
      <Circle args={[6, 64]} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]}>
        <MeshReflectorMaterial
          blur={[300, 100]}
          resolution={1024}
          mixBlur={1}
          mixStrength={50}
          roughness={1}
          depthScale={1.2}
          minDepthThreshold={0.4}
          maxDepthThreshold={1.4}
          color="#050505"
          metalness={0.5}
        />
      </Circle>
      
      {/* Decorative Glow Ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[5.8, 6, 64]} />
        <meshStandardMaterial color="#00f3ff" emissive="#00f3ff" emissiveIntensity={2} transparent opacity={0.3} />
      </mesh>
    </group>
  );
}

export default function Landing() {
  const navigate = useNavigate();
  const [activeIdx, setActiveIdx] = useState(0);
  const [isExiting, setIsExiting] = useState(false);

  const featuredCar = PREMIUM_CARS[activeIdx];

  const handleEnter = (target = "/intro") => {
    setIsExiting(true);
    setTimeout(() => {
      sessionStorage.setItem("entered_experience", "true");
      navigate(target);
    }, 800);
  };

  return (
    <div className={`h-screen w-full bg-[#000000] text-white font-sans overflow-hidden relative transition-all duration-1000 ${isExiting ? 'opacity-0 scale-110' : 'opacity-100'}`}>
      
      {/* ── BACKGROUND LAYER ── */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,_#0f172a_0%,_#000000_100%)]" />
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
      </div>

      {/* ── TOP NAV / HUD ── */}
      <div className="absolute top-10 left-12 right-12 z-50 flex justify-between items-start pointer-events-none">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 1 }}>
          <span className="text-cyan-400 text-[10px] font-black uppercase tracking-[0.8em]">ADYX AUTOMOTIVE</span>
          <h2 className="text-xl font-black italic uppercase tracking-tighter text-white mt-1">Virtual Showroom v4.0</h2>
        </motion.div>
        
        <div className="flex gap-4 pointer-events-auto">
           {["GEN_7", "NEURAL_LINK", "SOLID_STATE"].map(stat => (
             <span key={stat} className="px-4 py-1.5 border border-white/5 rounded-full text-[8px] font-black tracking-widest text-white/30 backdrop-blur-md">
               {stat}
             </span>
           ))}
        </div>
      </div>

      {/* ── MAIN SHOWROOM GRID ── */}
      <div className="relative z-10 grid lg:grid-cols-12 h-full items-center px-12 pt-16">
        
        {/* LEFT: 3D STAGE (Auto-Fit & Centered) */}
        <div className="lg:col-span-7 h-[50vh] lg:h-[80vh] relative group">
           <Canvas 
             key={featuredCar.model_url} // Force clean mount on model change
             shadows 
             camera={{ position: [0, 1.5, 11], fov: 35 }}
           >
             <Suspense fallback={null}>
               <ambientLight intensity={1.5} />
               <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={2} castShadow />
               <directionalLight position={[-10, 5, 2]} intensity={1} />
               <pointLight position={[0, 5, -5]} intensity={1} color="#00f3ff" />
               
               <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.5}>
                 <LandingCar modelPath={featuredCar.model_url} />
               </Float>

               <BasePlatform />
               <Environment preset="city" />
               <ContactShadows position={[0, -0.01, 0]} opacity={0.8} scale={12} blur={3} far={10} />
               
               <OrbitControls 
                 autoRotate autoRotateSpeed={0.5} 
                 enableZoom={false} enablePan={false}
                 maxPolarAngle={Math.PI / 2.1} minPolarAngle={Math.PI / 2.5}
               />
             </Suspense>
           </Canvas>
           
           {/* Center Visual Guide */}
           <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(0,243,255,0.03)_0%,_transparent_70%)] pointer-events-none" />
        </div>

        {/* RIGHT: INFO PANEL */}
        <div className="lg:col-span-5 flex flex-col justify-center h-full py-20 lg:pl-10">
           <AnimatePresence mode="wait">
             <motion.div 
               key={featuredCar.name}
               initial={{ opacity: 0, x: 40 }}
               animate={{ opacity: 1, x: 0 }}
               exit={{ opacity: 0, x: -20 }}
               className="space-y-6"
             >
                {/* Header Card */}
                <div className="p-10 bg-white/[0.02] border border-white/10 rounded-[3rem] backdrop-blur-3xl">
                   <span className="text-cyan-500 text-[10px] font-black uppercase tracking-[0.6em]">Premium Asset</span>
                   <h1 className="text-7xl font-black italic uppercase tracking-tighter leading-none text-white mt-3">{featuredCar.name}</h1>
                   <p className="text-3xl font-mono font-bold text-cyan-400 mt-4">{featuredCar.price}</p>
                   <p className="text-[11px] text-white/40 leading-relaxed uppercase tracking-widest mt-8 font-medium">
                     {featuredCar.description}
                   </p>
                </div>

                {/* Performance Grid */}
                <div className="grid grid-cols-3 gap-4">
                   {Object.entries(featuredCar.performance).map(([key, val]) => (
                     <div key={key} className="p-5 bg-white/[0.03] border border-white/5 rounded-[2rem] text-center">
                        <p className="text-[8px] text-white/20 uppercase tracking-widest mb-1">{key}</p>
                        <p className="text-xs font-black text-white">{val}</p>
                     </div>
                   ))}
                </div>

                {/* Detail Cards */}
                <div className="grid grid-cols-2 gap-4">
                   <div className="p-6 bg-white/[0.02] border border-white/5 rounded-[2.5rem]">
                      <p className="text-[8px] text-cyan-500/50 font-black uppercase tracking-[0.3em] mb-3">Autonomy</p>
                      <p className="text-xs font-bold text-white uppercase">{featuredCar.safety.adas}</p>
                      <p className="text-[9px] text-white/20 uppercase mt-1">Active AI Shield</p>
                   </div>
                   <div className="p-6 bg-white/[0.02] border border-white/5 rounded-[2.5rem]">
                      <p className="text-[8px] text-emerald-500/50 font-black uppercase tracking-[0.3em] mb-3">Efficiency</p>
                      <p className="text-xs font-bold text-white uppercase">{featuredCar.battery.range}</p>
                      <p className="text-[9px] text-white/20 uppercase mt-1">Smart Management</p>
                   </div>
                </div>

                {/* CTA */}
                <div className="flex gap-4 pt-6">
                   <button onClick={() => handleEnter("/home")} className="flex-1 bg-white text-black py-6 font-black uppercase text-[10px] tracking-[0.5em] rounded-full hover:bg-cyan-500 hover:text-white transition-all">
                     View Details
                   </button>
                   <button onClick={() => handleEnter(`/cars`)} className="flex-1 border border-white/10 text-white py-6 font-black uppercase text-[10px] tracking-[0.5em] rounded-full hover:border-cyan-400 transition-all">
                     Configure
                   </button>
                </div>
             </motion.div>
           </AnimatePresence>
        </div>
      </div>

      {/* ── BOTTOM CAROUSEL ── */}
      <div className="absolute bottom-10 left-12 right-12 z-50 flex items-end justify-between">
         <div className="flex gap-6">
            {PREMIUM_CARS.map((car, i) => (
              <button 
                key={i}
                onClick={() => setActiveIdx(i)}
                className={`group relative w-60 p-6 rounded-[2rem] border transition-all duration-500 ${activeIdx === i ? 'bg-cyan-500/10 border-cyan-500/50 -translate-y-3 scale-105' : 'bg-white/[0.02] border-white/5 hover:border-white/20'}`}
              >
                 <div className="flex justify-between items-start mb-3">
                    <span className="text-[8px] text-white/20 uppercase tracking-widest italic">Model_0{i+1}</span>
                    <div className={`w-1.5 h-1.5 rounded-full ${activeIdx === i ? 'bg-cyan-500 shadow-[0_0_15px_#06b6d4]' : 'bg-white/5'}`} />
                 </div>
                 <p className="text-sm font-black uppercase tracking-[0.2em] text-white">{car.name.split(' ')[1]}</p>
                 <p className="text-[9px] font-mono text-cyan-500/50 mt-1">{car.price}</p>
              </button>
            ))}
         </div>
      </div>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        ::selection { background: #00f3ff; color: #000; }
      `}</style>
    </div>
  );
}
