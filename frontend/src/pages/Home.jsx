import { useState, useCallback, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useCars } from "../context/CarContext";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import Scene3D from "../components/Scene3D";
import MarketplaceSections from "../components/MarketplaceSections";
import Navbar from "../components/Navbar";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// --- Sub-component for structured car details ---
function CarDetailCard({ car, isActive }) {
  const navigate = useNavigate();

  // Dummy safety/interior data if not present in car object
  const safety = car.safety || ["9 Airbags", "Level 2 ADAS", "ABS with EBD"];
  const interior = car.interior || ["15.5\" Cinematic Display", "Heated Premium Seats", "Dolby Atmos Audio"];

  return (
    <motion.div
      initial={{ opacity: 0, x: -50 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: false, amount: 0.3 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="min-h-screen w-full flex flex-col lg:flex-row items-center justify-between px-6 md:px-20 py-24 gap-12 pointer-events-none"
    >
      {/* Left: Performance & Technical Specs */}
      <div className="w-full lg:w-1/3 space-y-8 pointer-events-auto">
        <div className="space-y-2">
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            className="text-cyan-400 font-black uppercase tracking-[0.4em] text-[10px]"
          >
            Engineering Excellence
          </motion.p>
          <h2 className="text-6xl md:text-8xl font-black italic uppercase tracking-tighter leading-[0.8] text-white">
            {car.name}
          </h2>
          <p className="text-2xl font-mono font-bold text-white/40 italic">₹ {car.price}</p>
        </div>

        <div className="grid grid-cols-2 gap-6 pt-4">
          <div className="p-4 bg-white/[0.03] border border-white/5 rounded-xl backdrop-blur-sm group hover:border-cyan-500/30 transition-all">
            <p className="text-[9px] text-white/30 uppercase tracking-widest mb-1">Top Speed</p>
            <p className="text-xl font-black text-white">{car.specs?.topSpeed || "250 km/h"}</p>
          </div>
          <div className="p-4 bg-white/[0.03] border border-white/5 rounded-xl backdrop-blur-sm group hover:border-cyan-500/30 transition-all">
            <p className="text-[9px] text-white/30 uppercase tracking-widest mb-1">0-100 km/h</p>
            <p className="text-xl font-black text-white">{car.specs?.zeroToSixty || "3.2s"}</p>
          </div>
          <div className="p-4 bg-white/[0.03] border border-white/5 rounded-xl backdrop-blur-sm group hover:border-cyan-500/30 transition-all">
            <p className="text-[9px] text-white/30 uppercase tracking-widest mb-1">Range</p>
            <p className="text-xl font-black text-white">{car.specs?.range || "520 km"}</p>
          </div>
          <div className="p-4 bg-white/[0.03] border border-white/5 rounded-xl backdrop-blur-sm group hover:border-cyan-500/30 transition-all">
            <p className="text-[9px] text-white/30 uppercase tracking-widest mb-1">Drive</p>
            <p className="text-xl font-black text-white">{car.details?.drive || "AWD"}</p>
          </div>
        </div>

        {/* Feature Highlights Grid */}
        <div className="space-y-4 pt-6">
           <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 border-b border-white/5 pb-2">Why Choose This Machine</h3>
           <div className="grid grid-cols-1 gap-3">
              {[
                { title: "Precision Control", desc: "Proprietary neural-link steering for ultimate response." },
                { title: "Sustainable Power", desc: "Next-gen fusion core or solid-state battery tech." },
                { title: "Safe Intelligence", desc: "360° LiDAR shield with real-time threat avoidance." }
              ].map((h, i) => (
                <div key={i} className="flex gap-4 items-start">
                   <div className="w-1 h-1 bg-cyan-500 rounded-full mt-2" />
                   <div>
                      <p className="text-[11px] font-black uppercase text-white/80">{h.title}</p>
                      <p className="text-[10px] text-white/40 leading-relaxed">{h.desc}</p>
                   </div>
                </div>
              ))}
           </div>
        </div>
      </div>

      {/* Center: Invisible spacer for 3D model */}
      <div className="flex-1" />

      {/* Right: Interior & Safety Stats */}
      <div className="w-full lg:w-1/3 space-y-10 text-right pointer-events-auto">
        <div className="space-y-6">
          <div className="space-y-2">
            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-cyan-400">Interior Luxury</h4>
            <div className="flex flex-col gap-2">
               {interior.map((item, i) => (
                 <p key={i} className="text-sm font-medium text-white/60">{item}</p>
               ))}
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-400">Safety Rating</h4>
            <div className="flex flex-col gap-2">
               {safety.map((item, i) => (
                 <p key={i} className="text-sm font-medium text-white/60">{item}</p>
               ))}
            </div>
          </div>
        </div>

        <div className="pt-8 flex flex-col items-end gap-4">
           <button 
             onClick={() => navigate(`/car/${car.slug}`)}
             className="w-full md:w-64 py-5 bg-white text-black font-black uppercase text-[10px] tracking-[0.5em] hover:bg-cyan-500 hover:text-white transition-all shadow-2xl"
           >
             Configure Asset
           </button>
           <button 
             onClick={() => navigate(`/buy/${car.slug}`)}
             className="w-full md:w-64 py-5 border border-white/20 text-white font-black uppercase text-[10px] tracking-[0.5em] hover:border-cyan-400 hover:text-cyan-400 transition-all"
           >
             Secure Purchase
           </button>
        </div>
      </div>
    </motion.div>
  );
}

export default function Home() {
  const { cars = [], loading } = useCars();
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const containerRef = useRef();
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Mouse move for parallax
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePos({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20,
      });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Scroll logic to update active car
  useEffect(() => {
    if (!cars.length) return;

    const sections = gsap.utils.toArray(".car-section");
    const triggers = [];

    sections.forEach((section, i) => {
      triggers.push(
        ScrollTrigger.create({
          trigger: section,
          start: "top center",
          end: "bottom center",
          onEnter: () => setCurrentIndex(i),
          onEnterBack: () => setCurrentIndex(i),
        })
      );
    });

    return () => triggers.forEach(t => t.kill());
  }, [cars]);

  const currentCar = cars && cars.length > 0 ? cars[currentIndex] : null;

  if (loading && (!cars || cars.length === 0)) {
    return (
      <div className="h-screen w-full bg-[#020617] flex items-center justify-center">
        <div className="text-cyan-500 font-mono text-xs animate-pulse uppercase tracking-[0.5em]">
          Syncing_Neural_Assets...
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative w-full overflow-x-hidden bg-[#020617]">
      {/* Premium Dark Radial Background */}
      <div 
        className="fixed inset-0 -z-20 transition-colors duration-1000"
        style={{
          background: `radial-gradient(circle at 30% 40%, #0f172a 0%, #020617 70%)`
        }}
      />
      
      {/* Subtle Neon Accents */}
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-cyan-500/10 blur-[120px] rounded-full -z-10 animate-pulse" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 blur-[120px] rounded-full -z-10 animate-pulse" />

      {/* 3D Scene — fixed background for detail sections */}
      <div className="fixed top-0 left-0 w-full h-screen -z-10 opacity-60">
        <Scene3D 
          model={currentCar?.modelPath || currentCar?.model_url || "/models/car.glb"} 
        />
        <div className="absolute bottom-[20%] left-1/2 -translate-x-1/2 w-[60vw] h-[1px] bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent blur-[2px]" />
      </div>

      <div className="relative z-10">
        <Navbar />

        {/* ── HERO SECTION ── */}
        <section className="min-h-screen w-full flex flex-col lg:flex-row items-center justify-center px-6 md:px-20 py-20 relative gap-12">
          {/* LEFT: CONTENT */}
          <motion.div
            style={{ x: mousePos.x, y: mousePos.y }}
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="flex-1 space-y-8 z-20 text-center lg:text-left"
          >
            <div className="space-y-2">
              <span className="text-cyan-400 text-xs font-black uppercase tracking-[0.8em] block mb-4">ADYX AUTOMOTIVE</span>
              <h1 className="text-[clamp(2.5rem,8vw,6rem)] font-black uppercase leading-[0.9] text-white tracking-tighter">
                PRECISION<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-cyan-500/50">IN MOTION</span>
              </h1>
            </div>
            
            <p className="text-white/40 text-sm md:text-base uppercase tracking-[0.3em] max-w-xl lg:mx-0 mx-auto leading-relaxed border-l-2 border-cyan-500/30 pl-6">
              Step into the next generation of performance machines. <br />
              Precision engineering meets autonomous luxury.
            </p>

            <div className="pt-6 flex flex-wrap gap-4 justify-center lg:justify-start">
              <button 
                onClick={() => document.getElementById('collection').scrollIntoView({ behavior: 'smooth' })}
                className="px-12 py-5 bg-white text-black font-black uppercase text-[10px] tracking-[0.4em] rounded-sm hover:bg-cyan-500 hover:text-white transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(6,182,212,0.4)]"
              >
                Explore Fleet
              </button>
              <button 
                onClick={() => navigate('/about')}
                className="px-12 py-5 border border-white/10 text-white font-black uppercase text-[10px] tracking-[0.4em] rounded-sm hover:border-cyan-500/50 hover:bg-white/5 transition-all"
              >
                Our Legacy
              </button>
            </div>
          </motion.div>

          {/* RIGHT: MODEL CONTAINER (Glassmorphism) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.5, delay: 0.2 }}
            className="flex-1 w-full max-w-2xl h-[400px] md:h-[600px] relative group"
          >
            {/* Glass Box */}
            <div className="absolute inset-0 bg-white/[0.02] backdrop-blur-md border border-white/10 rounded-3xl overflow-hidden shadow-2xl group-hover:border-cyan-500/30 transition-all duration-700">
              {/* Internal Glows */}
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-cyan-500/5 via-transparent to-purple-500/5 pointer-events-none" />
              
              <Scene3D 
                model="/models/car.glb" 
              />

              {/* Interaction Hint */}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center gap-3">
                 <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-ping" />
                 <span className="text-[10px] text-white/40 uppercase tracking-[0.2em] font-bold">Interactive Drive</span>
              </div>
            </div>

            {/* Decorative Edges */}
            <div className="absolute -top-4 -right-4 w-24 h-24 border-t-2 border-r-2 border-cyan-500/20 rounded-tr-3xl" />
            <div className="absolute -bottom-4 -left-4 w-24 h-24 border-b-2 border-l-2 border-purple-500/20 rounded-bl-3xl" />
          </motion.div>
          
          {/* Scroll prompt */}
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-20">
             <span className="text-[9px] font-black uppercase tracking-widest text-white">Drive Down</span>
             <motion.div 
               animate={{ y: [0, 10, 0] }}
               transition={{ duration: 2, repeat: Infinity }}
               className="w-[1px] h-10 bg-gradient-to-b from-white to-transparent" 
             />
          </div>
        </section>

        {/* ── COLLECTION SHOWCASE ── */}
        <div id="collection" className="relative pt-20">
          <div className="text-center pb-20">
             <h2 className="text-white/20 text-[10vw] font-black uppercase tracking-tighter leading-none select-none">COLLECTION</h2>
          </div>
          {cars.map((car, i) => (
            <div key={car.id || i} className="car-section">
              <CarDetailCard car={car} isActive={currentIndex === i} />
            </div>
          ))}
        </div>

        {/* ── MARKETPLACE ── */}
        <div id="main-content" className="min-h-screen bg-[#020617]/80 backdrop-blur-3xl border-t border-white/5 relative z-20">
          <div className="absolute inset-x-0 -top-24 h-24 bg-gradient-to-t from-[#020617] to-transparent pointer-events-none" />
          <MarketplaceSections />
        </div>

        {/* ── FOOTER / THANK YOU ── */}
        <div className="min-h-[80vh] flex flex-col items-center justify-center bg-[#01030a] border-t border-white/5 relative z-20 overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-cyan-500/5 blur-[120px] rounded-full pointer-events-none" />
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="text-center space-y-8 relative z-10 px-6"
          >
            <p className="text-cyan-400 text-[10px] uppercase tracking-[0.5em] font-bold">The End Of Ordinary</p>
            <h2 className="text-5xl md:text-8xl font-black italic uppercase tracking-tighter text-white leading-[0.8]">
              JOIN THE<br />EVOLUTION
            </h2>
            <p className="text-white/40 text-sm tracking-[0.2em] uppercase max-w-md mx-auto">Step into the future of automotive excellence. Your machine awaits.</p>
            <div className="pt-8">
              <button
                onClick={() => navigate("/contact")}
                className="px-16 py-6 bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-black uppercase text-[11px] tracking-[0.4em] hover:scale-105 transition-all shadow-[0_0_30px_rgba(6,182,212,0.3)]"
              >
                Inquire Now
              </button>
            </div>
          </motion.div>
        </div>
      </div>
      <style>{`
        ::selection {
          background: #06b6d4;
          color: #fff;
        }
      `}</style>
    </div>
  );
}
