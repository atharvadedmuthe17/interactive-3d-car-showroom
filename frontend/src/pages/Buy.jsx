import React, { useState, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useParams } from "react-router-dom";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Stage, useGLTF } from "@react-three/drei";
import { useCars } from "../context/CarContext";

// --- 3D ---
const Model = ({ path }) => {
  const { scene } = useGLTF(path);
  return <primitive object={scene} scale={1.4} />;
};

const CarCanvas = ({ modelPath }) => (
  <Canvas shadows dpr={[1, 2]} camera={{ position: [0, 0, 4], fov: 40 }}>
    <Suspense fallback={null}>
      <Stage environment="city" intensity={0.5}>
        <Model path={modelPath} />
      </Stage>
    </Suspense>
    <OrbitControls autoRotate autoRotateSpeed={3} enableZoom={false} />
  </Canvas>
);

export default function Buy() {
  const navigate = useNavigate();
  const { slug } = useParams();
  const { cars, loading } = useCars();

  // Find car using slug
  const car = cars.find((c) => c.slug === slug);

  const [step, setStep] = useState("payment");

  const verifyPayment = () => {
    setStep("verifying");

    setTimeout(() => {
      setStep("success");
      setTimeout(() => {
        navigate("/success", { state: { carName: car.name, carSlug: car.slug } });
      }, 2000);    }, 3500);
  };

  // Safety check before rendering
  if (loading) {
    return <div className="bg-[#020617] h-screen text-white flex items-center justify-center font-sans uppercase tracking-[0.5em]">Loading Neural Data...</div>;
  }

  if (!car) {
    return <div className="bg-[#020617] h-screen text-white flex items-center justify-center font-sans uppercase tracking-[0.5em]">Car Not Found</div>;
  }

  const modelPath = car.model_url || car.modelPath;

  return (
    <div className="min-h-screen bg-[#020617] text-white p-8 relative overflow-hidden font-sans">

      {/* Custom Styles & Animations */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(1deg); }
        }
        @keyframes glowPulse {
          0%, 100% { box-shadow: 0 0 20px rgba(0, 255, 255, 0.4), 0 0 60px rgba(0, 255, 255, 0.2); }
          50% { box-shadow: 0 0 40px rgba(0, 255, 255, 0.6), 0 0 100px rgba(0, 255, 255, 0.3); }
        }
        @keyframes scan {
          0% { top: 0%; }
          50% { top: 100%; }
          100% { top: 0%; }
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
        .cyber-grid {
          background-image: linear-gradient(rgba(0, 245, 255, 0.05) 1px, transparent 1px), 
                            linear-gradient(90deg, rgba(0, 245, 255, 0.05) 1px, transparent 1px);
          background-size: 50px 50px;
        }
        .glass-panel {
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(0, 255, 255, 0.15);
          box-shadow: 0 0 15px rgba(0, 245, 255, 0.05);
        }
        .glow-text {
          background: linear-gradient(to right, #3b82f6, #00f5ff);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .divider {
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(0, 245, 255, 0.2), transparent);
          width: 100%;
          margin: 1.5rem 0;
        }
      `}</style>

      {/* Background Layer */}
      <div 
        className="absolute inset-0 z-0"
        style={{
          background: "radial-gradient(circle at 20% 30%, #0f172a, #020617)"
        }}
      />
      <div className="absolute inset-0 z-0 cyber-grid opacity-40" />

      {/* Animated Particles (Subtle) */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0.1, scale: 1 }}
            animate={{ 
              opacity: [0.1, 0.3, 0.1],
              scale: [1, 1.2, 1],
              x: [0, 20, 0],
              y: [0, -20, 0]
            }}
            transition={{ duration: 5 + i, repeat: Infinity, ease: "easeInOut" }}
            className="absolute rounded-full blur-[100px] bg-cyan-500/10"
            style={{
              width: "300px",
              height: "300px",
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
          />
        ))}
      </div>

      <AnimatePresence mode="wait">

        {/* ---------------- PAYMENT UI ---------------- */}
        {step === "payment" && (
          <motion.div
            key="pay"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid lg:grid-cols-2 gap-8 max-w-7xl mx-auto relative z-10 py-12"
          >
            {/* LEFT SIDE - CAR DISPLAY & SUMMARY */}
            <div className="space-y-8">
              <motion.div 
                whileHover={{ perspective: 1000, rotateX: 1, rotateY: 1 }}
                className="glass-panel rounded-3xl p-8 relative overflow-hidden group transition-all duration-500"
              >
                <div className="absolute -inset-1 blur-3xl bg-cyan-500/5 group-hover:bg-cyan-500/10 transition-colors" />

                <p className="text-cyan-400 text-[10px] tracking-[0.4em] mb-2 uppercase font-bold">
                  Bespoke Deployment
                </p>

                <h1 className="text-5xl font-black italic mb-6 tracking-tight glow-text leading-tight">
                  {car.name}
                </h1>

                <div className="h-64 w-full mb-6 transform group-hover:scale-105 transition-transform duration-700">
                  {modelPath && (
                    <CarCanvas modelPath={modelPath} />
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="border-l-2 border-cyan-500/30 pl-4">
                    <p className="text-neutral-500 text-[10px] uppercase tracking-widest mb-1">Acceleration</p>
                    <p className="text-xl font-bold font-mono tracking-tighter text-cyan-50">
                      {car?.specs?.zeroToSixty || car?.accel || "N/A"}
                    </p>
                  </div>
                  <div className="border-l-2 border-blue-500/30 pl-4">
                    <p className="text-neutral-500 text-[10px] uppercase tracking-widest mb-1">Top Velocity</p>
                    <p className="text-xl font-bold font-mono tracking-tighter text-blue-50">
                      {car?.specs?.topSpeed || car?.speed || "N/A"}
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Order Summary Panel */}
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="glass-panel rounded-2xl p-8 border border-white/5"
              >
                <h3 className="text-xs font-bold tracking-[0.3em] uppercase text-cyan-400 mb-6 flex items-center">
                  <span className="w-2 h-2 bg-cyan-400 rounded-full mr-3 animate-pulse" />
                  Order Summary
                </h3>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-neutral-500 text-sm uppercase tracking-wider">Product</span>
                    <span className="text-white font-bold">{car.name}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-neutral-500 text-sm uppercase tracking-wider">Edition</span>
                    <span className="text-cyan-200/70 font-medium italic text-sm">Performance Edition</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-neutral-500 text-sm uppercase tracking-wider">Base Price</span>
                    <span className="text-white/80 font-mono">₹{car.price || "1,25,00,000"}</span>
                  </div>
                  
                  <div className="divider" />
                  
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-neutral-500 text-[10px] uppercase tracking-[0.2em] mb-1">Total Payable</p>
                      <p className="text-3xl font-black italic tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-cyan-300 shadow-cyan-500/50">
                        ₹{car.price || "1,25,00,000"}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-cyan-500/50 text-[10px] uppercase font-bold tracking-widest">Secure Payment</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* RIGHT SIDE - PAYMENT INTERFACE */}
            <div className="space-y-8">
              <motion.div 
                whileHover={{ perspective: 1000, rotateX: -1, rotateY: -1 }}
                className="glass-panel rounded-3xl p-10 relative flex flex-col items-center"
              >
                {/* Payment Instructions */}
                <div className="w-full mb-10">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-black glow-text tracking-wider uppercase">
                      Authorize
                    </h2>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-[blink_1s_infinite]" />
                      <span className="text-[10px] text-green-500 uppercase tracking-widest font-bold">Secure Channel Active</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { step: 1, label: "Scan QR" },
                      { step: 2, label: "Pay UPI" },
                      { step: 3, label: "Confirm" }
                    ].map((item, idx) => (
                      <div key={idx} className="relative group">
                        <div className="flex flex-col items-center p-3 rounded-xl bg-white/5 border border-white/5 group-hover:border-cyan-500/30 transition-all">
                          <span className="text-[10px] font-bold text-cyan-400/50 mb-1">0{item.step}</span>
                          <span className="text-[10px] uppercase tracking-widest text-white/70">{item.label}</span>
                        </div>
                        {idx < 2 && (
                          <div className="absolute top-1/2 -right-1 w-2 h-[1px] bg-cyan-500/20" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* QR SECTION */}
                <div className="flex flex-col items-center w-full">
                   <p className="text-[10px] text-neutral-500 uppercase tracking-[0.3em] mb-4">
                    SCAN TO INITIALIZE TRANSACTION
                  </p>

                  <div 
                    className="relative group p-1 rounded-2xl mb-6"
                    style={{ animation: 'float 4s ease-in-out infinite' }}
                  >
                    {/* Animated Border Pulse */}
                    <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl blur opacity-25 group-hover:opacity-60 transition duration-1000" />

                    <div className="relative bg-black p-4 rounded-xl overflow-hidden" style={{ animation: 'glowPulse 4s infinite' }}>
                      {/* Scanning Line Overlay */}
                      <div className="absolute left-0 w-full h-1 bg-cyan-400/40 blur-sm z-10 animate-[scan_3s_linear_infinite]" />
                      
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=UPI-PAYMENT-${car.slug}&color=00f5ff&bgcolor=000`}
                        alt="QR"
                        className="rounded-lg relative z-0"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-4 mb-8">
                     <span className="text-white/30 font-mono text-xs tracking-widest">
                      QR EXPIRES IN: <span className="text-cyan-400">04:59</span>
                    </span>
                  </div>

                  {/* Trust Indicators */}
                  <div className="flex gap-6 mb-10">
                    {[
                      { icon: "🛡️", text: "Secure UPI" },
                      { icon: "🔐", text: "Encrypted" },
                      { icon: "✅", text: "Verified" }
                    ].map((item, i) => (
                      <div key={i} className="flex flex-col items-center">
                        <span className="text-xs mb-1 grayscale opacity-50">{item.icon}</span>
                        <span className="text-[8px] uppercase tracking-widest text-neutral-500">{item.text}</span>
                      </div>
                    ))}
                  </div>

                  <div className="w-full space-y-4">
                    <motion.button
                      whileHover={{ scale: 1.02, boxShadow: "0 0 25px rgba(0, 245, 255, 0.4)" }}
                      whileTap={{ scale: 0.98 }}
                      onClick={verifyPayment}
                      className="w-full py-4 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-black rounded-xl uppercase tracking-[0.2em] shadow-lg transition-all duration-300 relative overflow-hidden group"
                    >
                      <span className="relative z-10 italic">I Have Paid</span>
                      <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                    </motion.button>
                    
                    <p className="text-center text-[10px] text-cyan-400/50 uppercase tracking-widest animate-pulse">
                      Waiting for payment confirmation...
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Upload Box */}
              <div className="w-full group">
                <div className="glass-panel rounded-2xl p-6 text-center bg-white/5 border-dashed hover:bg-white/10 hover:border-cyan-500/50 transition-all cursor-pointer">
                  <p className="text-neutral-400 text-[10px] tracking-widest uppercase mb-1">
                    Upload Transaction Receipt
                  </p>
                  <p className="text-neutral-600 text-[9px] uppercase">(Accelerates Verification Process)</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ---------------- VERIFY ---------------- */}
        {step === "verifying" && (
          <motion.div
            key="verify"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col justify-center items-center h-[80vh] relative z-10"
          >
            <div className="relative mb-8">
              <div className="w-24 h-24 border-2 border-cyan-500/20 rounded-full" />
              <div className="absolute top-0 left-0 w-24 h-24 border-t-2 border-cyan-400 rounded-full animate-spin" />
              <div className="absolute top-2 left-2 w-20 h-20 border-b-2 border-blue-400 rounded-full animate-spin-slow" />
            </div>

            <h3 className="text-cyan-400 text-xl font-bold tracking-[0.3em] uppercase mb-2">
              Neural Handshake...
            </h3>
            <p className="text-neutral-500 font-mono text-sm">
              VALIDATING ENCRYPTED TRANSACTION PACKETS
            </p>
          </motion.div>
        )}

        {/* ---------------- SUCCESS ---------------- */}
        {step === "success" && (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col justify-center items-center h-[80vh] relative z-10"
          >
            <div className="mb-8 relative">
               <motion.div 
                 initial={{ scale: 0 }}
                 animate={{ scale: 1 }}
                 transition={{ type: "spring", damping: 12 }}
                 className="w-32 h-32 bg-cyan-500/10 rounded-full flex items-center justify-center border border-cyan-500/50 shadow-[0_0_50px_rgba(0,245,255,0.2)]"
               >
                 <svg className="w-16 h-16 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                 </svg>
               </motion.div>
            </div>

            <h2 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 mb-4 uppercase italic tracking-widest">
              Authorized
            </h2>
            <p className="text-neutral-400 tracking-[0.5em] text-xs uppercase">
              Vehicle allocation in progress...
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}