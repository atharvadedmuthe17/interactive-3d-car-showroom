import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useCars } from '../context/CarContext';
import CarPreview from '../three/CarPreview';

const CarDetails = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { cars, loading } = useCars();
  
  // match strictly by slug
  const car = cars?.find((c) => c.slug === slug);
  const isPurchased = location.state?.purchased || false;

  const [activeColor, setActiveColor] = useState("#050505");
  const [showCheckout, setShowCheckout] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processMessage, setProcessMessage] = useState("");

  // Update color if car has colors
  useEffect(() => {
    if (car?.colors?.length > 0) {
      setActiveColor(car.colors[0].hex);
    }
  }, [car]);

  if (loading) {
    return (
      <div className="h-screen bg-black text-cyan-500 flex flex-col items-center justify-center font-black uppercase tracking-[1em]">
        <div className="w-16 h-16 border-2 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin mb-8" />
        Initializing Dashboard...
      </div>
    );
  }

  if (!car) {
    return (
      <div className="h-screen bg-black text-white flex flex-col items-center justify-center font-black uppercase tracking-[0.5em] gap-8">
        <p className="text-cyan-500 animate-pulse text-2xl">Neural Node Not Found</p>
        <button 
          onClick={() => navigate("/cars")}
          className="px-8 py-4 border border-cyan-500/50 text-cyan-500 text-xs tracking-widest hover:bg-cyan-500/10 transition-all"
        >
          Return to Fleet Hub
        </button>
      </div>
    );
  }

  const modelPath = car.model_url || car.modelPath;

  const handlePayment = async (e) => {
    if (e) e.preventDefault();

    setIsProcessing(true);
    setProcessMessage(
      paymentMethod === "card"
        ? "Encrypting Neural Authorization..."
        : "Handshaking with UPI Gateway..."
    );

    try {
      await fetch("http://localhost:5000/api/payment/success", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          carName: car.name,
        }),
      });

      setTimeout(() => {
        navigate("/payment-success", { state: { carName: car.name, carSlug: car.slug, purchased: true } });
      }, 2000);
    } catch (error) {
      console.error("Payment API Error:", error);
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row h-screen bg-[#020203] overflow-hidden font-sans selection:bg-cyan-500">
      
      {/* Custom Styles for Stage */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
        }
        .stage-base {
          position: absolute;
          bottom: 15%;
          left: 50%;
          transform: translateX(-50%);
          width: 80%;
          height: 15%;
          background: radial-gradient(ellipse at center, rgba(0, 245, 255, 0.15) 0%, transparent 70%);
          filter: blur(20px);
          z-index: 1;
        }
        .stage-shadow {
          position: absolute;
          bottom: 22%;
          left: 50%;
          transform: translateX(-50%);
          width: 60%;
          height: 5%;
          background: rgba(0, 0, 0, 0.8);
          filter: blur(15px);
          border-radius: 100%;
          z-index: 2;
        }
        .stage-highlight {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 100%;
          height: 100%;
          background: radial-gradient(circle at center, rgba(37, 99, 235, 0.05) 0%, transparent 60%);
          z-index: 0;
        }
        .car-container {
          filter: brightness(1.1) contrast(1.05);
          animation: float 6s ease-in-out infinite;
        }
      `}</style>

      {/* LEFT: THE INTELLIGENCE VIEW */}
      <div className="flex-[1.5] h-[45vh] lg:h-full relative flex items-center justify-center bg-[#050507] overflow-hidden group">
        
        {/* Background stage lighting */}
        <div className="stage-highlight" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-64 bg-cyan-500/5 blur-[100px] pointer-events-none" />
        
        {/* Grounding elements */}
        <div className="stage-base" />
        <div className="stage-shadow" />

        {/* Floor Reflection Gradient */}
        <div className="absolute bottom-0 w-full h-[40%] bg-gradient-to-t from-cyan-500/10 via-transparent to-transparent pointer-events-none z-0" />

        <div className="absolute top-10 left-10 z-20 space-y-3">
            <div className="flex items-center gap-3 text-[10px] font-black text-cyan-500 tracking-[0.3em] uppercase">
                <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse shadow-[0_0_10px_#06b2d2]" /> 
                {isPurchased ? "Ownership Active" : "Edge Network Online"}
            </div>
            <div className="flex flex-col gap-1">
               <span className="text-[7px] text-white/20 uppercase tracking-widest font-mono">Sync_Node: {car.id}04X</span>
               <span className="text-[7px] text-white/20 uppercase tracking-widest font-mono">Channel: Encrypted_AES</span>
            </div>
        </div>

        <div className="absolute inset-0 flex items-center justify-center opacity-[0.02] select-none pointer-events-none">
          <h1 className="text-[25vw] font-black italic uppercase tracking-tighter text-white leading-none">
            {car?.name?.split(' ')[1] || car?.name || "CAR"}
          </h1>
        </div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }} 
          animate={{ opacity: 1, scale: 1 }} 
          transition={{ duration: 1.5 }}
          className="relative z-10 w-full h-full flex items-center justify-center car-container"
        >
          {modelPath && (
            <CarPreview modelPath={modelPath} paintColor={activeColor} autoRotate={true} />
          )}
        </motion.div>

        {/* Floating Asset Stats */}
        <div className="absolute bottom-12 left-12 z-20 hidden md:block">
           <div className="space-y-6">
              <div className="p-4 bg-white/[0.02] backdrop-blur-md border border-white/5 rounded-xl">
                 <p className="text-[8px] text-cyan-400 font-bold uppercase tracking-widest mb-1">Current Health</p>
                 <div className="w-32 h-1 bg-white/10 rounded-full overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: "98%" }} transition={{ duration: 2, delay: 1 }} className="h-full bg-cyan-500 shadow-[0_0_10px_#06b2d2]" />
                 </div>
              </div>
              <div className="p-4 bg-white/[0.02] backdrop-blur-md border border-white/5 rounded-xl">
                 <p className="text-[8px] text-blue-400 font-bold uppercase tracking-widest mb-1">Neural Sync</p>
                 <p className="text-xl font-mono text-white">100%</p>
              </div>
           </div>
        </div>
      </div>

      {/* RIGHT: COMMAND & OWNERSHIP CONSOLE */}
      <div className="w-full lg:w-[580px] h-full bg-[#08080a] border-l border-white/5 flex flex-col relative z-30 shadow-[-30px_0_100px_rgba(0,0,0,0.8)] overflow-y-auto custom-scrollbar">
        
        <div className="p-8 lg:p-12 space-y-12">
          
          {/* ── HEADER ── */}
          <div className="space-y-4">
            <div className="flex justify-between items-start">
               <h1 className="text-5xl font-black italic uppercase tracking-tighter text-white leading-none">
                 {car?.name}<span className="text-cyan-500">.</span>
               </h1>
               <div className="px-3 py-1 bg-cyan-500/10 border border-cyan-500/20 rounded-full text-[8px] font-black text-cyan-400 uppercase tracking-widest">
                  Asset Rev. 2.0
               </div>
            </div>
            <p className="text-white/40 text-[10px] uppercase leading-relaxed tracking-widest border-l-2 border-cyan-500/30 pl-4 italic">
               Advanced neural propulsion architecture. post-human performance standards.
            </p>
          </div>

          {/* ── OWNERSHIP PANEL ── */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="p-8 bg-gradient-to-br from-white/[0.03] to-transparent border border-white/10 rounded-3xl relative overflow-hidden group"
          >
             <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 blur-3xl rounded-full -mr-16 -mt-16 group-hover:bg-cyan-500/10 transition-colors" />
             
             <h3 className="text-[10px] font-black text-cyan-500 uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
                <div className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse shadow-[0_0_8px_#06b2d2]" />
                {isPurchased ? "Owner Credentials" : "Asset Status"}
             </h3>

             <div className="grid grid-cols-2 gap-y-8">
                <div>
                  <p className="text-[8px] text-white/30 uppercase tracking-widest mb-1">Registered Owner</p>
                  <p className="text-sm font-bold text-white uppercase tracking-tight">{isPurchased ? "ADYX" : "UNALLOCATED"}</p>
                </div>
                <div>
                  <p className="text-[8px] text-white/30 uppercase tracking-widest mb-1">Status</p>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-black text-emerald-400 uppercase italic">Active</p>
                  </div>
                </div>
                <div>
                  <p className="text-[8px] text-white/30 uppercase tracking-widest mb-1">Asset ID</p>
                  <p className="text-xs font-mono text-cyan-200/50 uppercase">ADYX-992-KLR-01</p>
                </div>
                <div>
                  <p className="text-[8px] text-white/30 uppercase tracking-widest mb-1">Purchase Date</p>
                  <p className="text-xs font-bold text-white/80 uppercase">26 APR 2026</p>
                </div>
             </div>
          </motion.div>

          {/* ── DETAILED SPECIFICATIONS ── */}
          <div className="space-y-6">
             <div className="flex items-center gap-4">
                <h4 className="text-[10px] font-black text-white uppercase tracking-[0.4em] whitespace-nowrap">Technical Matrix</h4>
                <div className="h-[1px] w-full bg-white/5" />
             </div>

             <div className="grid grid-cols-2 gap-4">
                {[
                  { label: "Engine", val: "Quattro-Motor / Fusion" },
                  { label: "Drivetrain", val: "All-Wheel Drive (L4)" },
                  { label: "Transmission", val: "Neural Smart-Shift" },
                  { label: "Fuel Type", val: "Solid-State / Ionic" },
                  { label: "Range", val: car?.specs?.range || "480 Miles" },
                  { label: "Top Velocity", val: car?.specs?.topSpeed || "205 MPH" },
                  { label: "Acceleration", val: car?.specs?.zeroToSixty || "2.8 SEC" },
                  { label: "Edition", val: "Performance Series" }
                ].map((s, idx) => (
                  <div key={idx} className="p-4 bg-white/[0.02] border border-white/5 rounded-xl hover:border-white/10 transition-colors">
                     <p className="text-[7px] text-cyan-500/60 font-black uppercase tracking-widest mb-1">{s.label}</p>
                     <p className="text-[10px] font-bold text-white uppercase tracking-tight italic">{s.val}</p>
                  </div>
                ))}
             </div>
          </div>

          {/* ── DELIVERY STATUS ── */}
          <div className="p-8 border border-cyan-500/10 bg-cyan-500/[0.02] rounded-3xl space-y-8">
             <div className="flex justify-between items-center">
                <h4 className="text-[10px] font-black text-white uppercase tracking-[0.4em]">Logistics Hub</h4>
                <span className="text-[9px] font-mono text-cyan-400">ETA: 12 DAYS</span>
             </div>

             <div className="relative">
                <div className="absolute top-1/2 left-0 w-full h-1 bg-white/5 -translate-y-1/2" />
                <div className="relative flex justify-between">
                   {[1, 1, 1, 0.4].map((op, i) => (
                     <div key={i} className="w-3 h-3 rounded-full bg-cyan-500 shadow-[0_0_10px_#06b2d2]" style={{ opacity: op }} />
                   ))}
                </div>
             </div>

             <div className="space-y-4">
                <div className="flex justify-between text-[9px] uppercase font-bold tracking-widest">
                   <span className="text-white">Current Location</span>
                   <span className="text-cyan-400">MUMBAI_TERMINAL_04</span>
                </div>
                <div className="flex justify-between text-[9px] uppercase font-bold tracking-widest">
                   <span className="text-white/40">Status</span>
                   <span className="text-white/40 italic">In Final QC Transit</span>
                </div>
             </div>
          </div>

          {/* ── DIGITAL CERTIFICATE ── */}
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="p-1 w-full bg-gradient-to-r from-blue-600/50 via-cyan-400/50 to-blue-600/50 rounded-3xl"
          >
             <div className="bg-[#0b0b0d] p-8 rounded-[22px] flex items-center justify-between">
                <div className="space-y-2">
                   <h5 className="text-[11px] font-black text-white uppercase italic tracking-widest">Digital Ownership Certificate</h5>
                   <p className="text-[8px] text-white/30 uppercase tracking-[0.3em]">Verified via ADYX Distributed Ledger</p>
                </div>
                <div className="w-12 h-12 flex items-center justify-center border-2 border-cyan-500/20 rounded-full">
                   <svg className="w-6 h-6 text-cyan-400 shadow-[0_0_10px_#06b2d2]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                   </svg>
                </div>
             </div>
          </motion.div>

          {/* ── ACTION FOOTER ── */}
          <div className="pt-8 space-y-4">
             {isPurchased ? (
               <div className="flex flex-col gap-4">
                  <div className="grid grid-cols-2 gap-4">
                    <button className="flex-1 border border-white/10 bg-white/[0.03] text-white py-5 font-black uppercase text-[9px] tracking-[0.3em] hover:bg-white hover:text-black transition-all">Download Invoice</button>
                    <button className="flex-1 border border-white/10 bg-white/[0.03] text-white py-5 font-black uppercase text-[9px] tracking-[0.3em] hover:bg-white hover:text-black transition-all">Track Order</button>
                  </div>
                  <button onClick={() => navigate("/cars")} className="w-full bg-cyan-600 text-white py-6 font-black uppercase text-[10px] tracking-[0.4em] hover:bg-cyan-500 transition-all shadow-[0_20px_50px_rgba(6,182,212,0.2)]">Back to Dashboard</button>
               </div>
             ) : (
               <div className="flex flex-col gap-4">
                  <div className="flex justify-between items-end bg-cyan-500/5 p-6 rounded-2xl border border-cyan-500/10 mb-4">
                    <div>
                      <p className="text-[9px] font-black text-white/40 uppercase tracking-widest mb-1">Asset Value</p>
                      <h2 className="text-4xl font-mono font-bold text-white italic tracking-tighter">₹ {car.price}</h2>
                    </div>
                    <p className="text-[8px] text-cyan-500 font-bold uppercase animate-pulse">Node Available</p>
                  </div>
                  <button onClick={() => navigate(`/booking/${car.slug}`, { state: { car, activeColor } })} className="w-full bg-white text-black py-5 font-black uppercase text-[10px] tracking-[0.4em] hover:bg-cyan-500 hover:text-white transition-all shadow-xl shadow-black">Book Test Drive</button>
                  <button onClick={() => navigate(`/buy/${car.slug}`, { state: { car, activeColor } })} className="w-full border border-cyan-500/50 text-cyan-500 py-5 font-black uppercase text-[10px] tracking-[0.4em] hover:bg-cyan-500/10 transition-all">Buy Neural Asset</button>
               </div>
             )}
          </div>

          <div className="text-center pt-8">
             <p className="text-[7px] text-white/10 uppercase tracking-[1em]">© 2026 ADYX INDIA // SYSTEMS ONLINE</p>
          </div>
        </div>
      </div>

      {/* UPI/CREDIT MODAL */}
      <AnimatePresence>
        {showCheckout && car && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10 bg-black/90 backdrop-blur-[20px]">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="bg-[#0a0a0c] border border-cyan-500/20 w-full max-w-6xl rounded-[40px] overflow-hidden flex flex-col md:flex-row shadow-[0_0_100px_rgba(6,182,212,0.15)]">
              
              <div className="w-full md:w-[45%] bg-gradient-to-br from-white/[0.03] to-transparent p-12 flex flex-col justify-between border-r border-white/5">
                <div className="space-y-6">
                  <span className="text-cyan-500 text-[10px] font-black uppercase tracking-[0.5em]">Bespoke Deployment</span>
                  <h2 className="text-5xl font-black italic uppercase text-white leading-none">{car?.name}</h2>
                  <div className="h-64 w-full relative">
                    {modelPath && (
                      <CarPreview modelPath={modelPath} paintColor={activeColor} autoRotate={false} />
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-4">
                   <div className="p-4 bg-white/[0.02] rounded-xl border border-white/5">
                      <p className="text-[7px] text-white/30 uppercase">Protocol</p>
                      <p className="text-[10px] text-white font-mono uppercase tracking-tighter">ADYX-NORD-SYNC</p>
                   </div>
                   <div className="p-4 bg-white/[0.02] rounded-xl border border-white/5">
                      <p className="text-[7px] text-white/30 uppercase">Server</p>
                      <p className="text-[10px] text-white font-mono uppercase tracking-tighter">MUMBAI-SOUTH-01</p>
                   </div>
                </div>
              </div>

              <div className="w-full md:w-[55%] p-12 flex flex-col relative bg-[#0d0d0f]">
                <button onClick={() => setShowCheckout(false)} className="absolute top-10 right-10 w-10 h-10 flex items-center justify-center rounded-full border border-white/5 text-white/20 hover:text-white hover:border-white/20 transition-all">✕</button>
                <h3 className="text-2xl font-black italic uppercase text-white mb-10 tracking-tight">Authorization Method</h3>

                {isProcessing ? (
                  <div className="flex-1 flex flex-col items-center justify-center space-y-6">
                    <div className="w-20 h-20 border-4 border-cyan-500/10 border-t-cyan-500 rounded-full animate-spin" />
                    <p className="text-cyan-500 font-black uppercase tracking-[0.4em] text-sm animate-pulse">{processMessage}</p>
                  </div>
                ) : (
                  <>
                    <div className="flex gap-8 mb-12 border-b border-white/5">
                      <button onClick={() => setPaymentMethod('card')} className={`pb-5 px-2 text-[10px] font-black uppercase transition-all ${paymentMethod === 'card' ? "text-cyan-400 border-b-2 border-cyan-400" : "text-white/20"}`}>Credit Card</button>
                      <button onClick={() => setPaymentMethod('upi')} className={`pb-5 px-2 text-[10px] font-black uppercase transition-all flex items-center gap-2 ${paymentMethod === 'upi' ? "text-cyan-400 border-b-2 border-cyan-400" : "text-white/20"}`}>UPI / QR Pay <span className="text-[14px]">🇮🇳</span></button>
                    </div>

                    <AnimatePresence mode="wait">
                      {paymentMethod === 'card' ? (
                        <motion.form key="card" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-8" onSubmit={handlePayment}>
                          <div className="space-y-1">
                            <label className="text-[7px] font-black text-white/30 uppercase tracking-widest ml-1">Cardholder Name</label>
                            <input type="text" placeholder="NAME AS PER RECORDS" required className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-6 py-4 outline-none focus:border-cyan-500 text-[10px] font-bold uppercase text-white transition-all" />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[7px] font-black text-white/30 uppercase tracking-widest ml-1">Card Number</label>
                            <input type="text" placeholder="XXXX XXXX XXXX XXXX" required className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-6 py-4 outline-none focus:border-cyan-500 text-[10px] font-bold uppercase text-white transition-all" />
                          </div>
                          <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-1">
                              <label className="text-[7px] font-black text-white/30 uppercase tracking-widest ml-1">Expiry</label>
                              <input type="text" placeholder="MM/YY" required className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-6 py-4 outline-none focus:border-cyan-500 text-[10px] font-bold uppercase text-white transition-all" />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[7px] font-black text-white/30 uppercase tracking-widest ml-1">Security Code</label>
                              <input type="password" placeholder="CVV" required className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-6 py-4 outline-none focus:border-cyan-500 text-[10px] font-bold uppercase text-white transition-all" />
                            </div>
                          </div>
                          <button className="w-full bg-cyan-600 text-white py-6 rounded-2xl font-black uppercase text-[11px] mt-10 hover:bg-white hover:text-black transition-all shadow-lg shadow-cyan-900/20">Authorize Transaction</button>
                        </motion.form>
                      ) : (
                        <motion.div key="upi" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col gap-10">
                           <div className="flex flex-col md:flex-row gap-12 items-center bg-white/[0.02] p-8 rounded-3xl border border-white/5">
                              <div
                                onClick={handlePayment}
                                className="p-4 bg-white rounded-2xl cursor-pointer shadow-[0_0_50px_rgba(6,182,212,0.2)] hover:scale-105 transition-all"
                              >
                                {(() => {
                                  const upiLink = `upi://pay?pa=7498463025@ibl&pn=ADYX&am=11&cu=INR&tn=ADYXPayment`;
                                  const encodedLink = encodeURIComponent(upiLink);

                                  return (
                                    <img
                                      src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodedLink}`}
                                      alt="Scan to Pay"
                                      className="w-40 h-40"
                                    />
                                  );
                                })()}
                              </div>
                              <div className="flex-1 space-y-6 text-center md:text-left">
                                 <div className="flex justify-center md:justify-start gap-4 opacity-50">
                                    <img src="https://upload.wikimedia.org/wikipedia/commons/e/e1/UPI-Logo-vector.svg" alt="UPI" className="h-5" />
                                    <img src="https://upload.wikimedia.org/wikipedia/commons/f/f2/Google_Pay_Logo.svg" alt="GPay" className="h-5" />
                                 </div>
                                 <div className="space-y-4">
                                    <div className="p-4 bg-black/40 border border-white/5 rounded-xl">
                                       <p className="text-[8px] text-white/30 uppercase font-black">Merchant ID</p>
                                       <p className="text-[11px] text-cyan-500 font-mono italic">ADYX_INDIA_CORP</p>
                                    </div>
                                    <div className="p-4 bg-black/40 border border-white/5 rounded-xl">
                                       <p className="text-[8px] text-white/30 uppercase font-black">Secure Status</p>
                                       <p className="text-[10px] text-emerald-400 font-bold uppercase">Ready for Scan</p>
                                    </div>
                                 </div>
                              </div>
                           </div>
                           <p className="text-[9px] text-white/20 italic uppercase tracking-[0.2em] text-center">Authorized payment console secured by 256-bit encryption protocol.</p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CarDetails;