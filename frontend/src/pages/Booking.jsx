import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useCars } from "../context/CarContext";
import BookingCarViewer from "../components/BookingCarViewer";
import emailjs from "@emailjs/browser";
import axios from "axios"; 
import confetti from "canvas-confetti";
import { motion, AnimatePresence } from "framer-motion";

const Booking = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { cars, loading } = useCars();

  const car = cars.find((c) => c.slug === slug);

  const [isSending, setIsSending] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    city: "",
    preferredTime: "Morning",
    bookingType: "Direct Booking",
    specialRequest: "",
  });

  if (loading) return (
    <div className="bg-[#020205] h-screen text-blue-500 flex flex-col items-center justify-center font-sans uppercase tracking-[1em] animate-pulse">
      <div className="w-16 h-16 border-2 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mb-8" />
      Syncing Neural Hub
    </div>
  );
  
  if (!car) {
    return <div className="bg-[#020205] h-screen text-white flex items-center justify-center font-sans uppercase tracking-[0.5em]">Neural Link Failed: Asset Not Found</div>;
  }

  const modelPath = car.model_url || car.modelPath;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSending(true);

    try {
      const token = localStorage.getItem("token");
      await axios.post("http://localhost:5000/api/bookings/reserve", {
        car_name: car.name,
        car_model_id: car.id,
        booking_type: formData.bookingType,
        city: formData.city,
        price: car.price,
        duration: "Full-Ownership",
        pickup_location: `ADYX ${formData.city} Experience Center`
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const templateParams = {
        user_name: formData.fullName,
        user_email: formData.email,
        car_name: car.name,
        city: formData.city,
        booking_type: formData.bookingType,
        message: formData.specialRequest || "No special request",
      };

      await emailjs.send(
        'service_jek930p', 
        'template_pkbn74b', 
        templateParams,
        'zoSJWbcjfVA0rYOwx' 
      );

      setIsSending(false);
      setIsSubmitted(true);
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#2563eb', '#7c3aed', '#ffffff']
      });

    } catch (err) {
      console.error("Booking Error:", err);
      alert("Booking failed. Please ensure you are logged in.");
      setIsSending(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-[#020205] text-white flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-8xl font-black italic uppercase tracking-tighter mb-4">RESERVED.</h2>
        <p className="text-blue-500 uppercase tracking-widest font-bold">The ADYX Concierge will contact you shortly.</p>
        <button onClick={() => navigate("/profile")} className="mt-12 px-12 py-5 bg-blue-600 font-black uppercase text-xs">Return to Vault</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#010103] text-white font-sans overflow-x-hidden relative">
      
      {/* ── FORCE RENDER STYLES ── */}
      <style>{`
        .model-stage {
          position: relative;
          width: 100%;
          height: 600px; /* Lock height */
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: visible !important;
          z-index: 10;
        }

        /* 1. FORCE PLATFORM VISIBILITY (Z-INDEX 0) */
        .model-stage::after {
          content: "";
          position: absolute;
          bottom: 40px;
          left: 50%;
          transform: translateX(-50%) scaleX(1.8);
          width: 500px;
          height: 140px;
          background: radial-gradient(
            ellipse at center,
            rgba(37, 99, 235, 0.7) 0%,
            rgba(37, 99, 235, 0.3) 30%,
            rgba(124, 58, 237, 0.1) 60%,
            transparent 75%
          );
          filter: blur(30px);
          border-radius: 50%;
          z-index: 0;
          pointer-events: none;
        }

        /* 2. STRONG SPOTLIGHT (Z-INDEX 0) */
        .model-stage::before {
          content: "";
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 700px;
          height: 500px;
          background: radial-gradient(
            circle,
            rgba(37, 99, 235, 0.25) 0%,
            rgba(124, 58, 237, 0.15) 40%,
            transparent 70%
          );
          z-index: 0;
          pointer-events: none;
        }

        .canvas-wrapper {
          position: relative;
          width: 100%;
          height: 100%;
          z-index: 10; /* Ensure canvas is ABOVE the platform */
          display: flex;
          align-items: center;
          justify-content: center;
          animation: stageBreathe 5s ease-in-out infinite;
        }

        @keyframes stageBreathe {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
        }

        .glass-console {
          background: rgba(10, 10, 15, 0.8);
          backdrop-filter: blur(20px);
          border-left: 1px solid rgba(255, 255, 255, 0.1);
          z-index: 20;
        }
      `}</style>

      {/* Cinematic Vignette */}
      <div className="fixed inset-0 shadow-[inset_0_0_300px_rgba(0,0,0,1)] pointer-events-none z-20" />

      <div className="max-w-screen-2xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-0 min-h-screen relative z-10">
        
        {/* ── LEFT SIDE: THE CINEMATIC STAGE ── */}
        <div className="lg:col-span-7 flex flex-col justify-between p-8 lg:p-20 relative overflow-visible">
          
          <motion.div 
            initial={{ opacity: 0, x: -50 }} 
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4 relative z-30"
          >
            <div className="flex items-center gap-4">
              <span className="h-[2px] w-12 bg-blue-500 shadow-[0_0_10px_#2563eb]" />
              <span className="text-blue-500 font-black uppercase tracking-[0.6em] text-[10px]">NEURAL ASSET // IDENTIFIED</span>
            </div>
            <h1 className="text-7xl md:text-9xl font-black italic uppercase tracking-tighter leading-[0.8] text-white">
              {car.name}
            </h1>
            <p className="text-2xl text-neutral-500 italic font-light tracking-[0.2em] uppercase border-l-4 border-blue-600 pl-8 ml-2">
              {car.variant || "Performance Edition"}
            </p>
          </motion.div>

          {/* 🏎️ THE GROUNDED STAGE (FIXED VISIBILITY) */}
          <div className="model-stage">
            <div className="canvas-wrapper">
               <BookingCarViewer modelPath={modelPath} />
            </div>
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 30 }} 
            animate={{ opacity: 1, y: 0 }}
            className="flex items-end justify-between border-t border-white/5 pt-12 relative z-50"
          >
            <div className="space-y-1">
              <p className="text-[10px] text-blue-500 font-black uppercase tracking-[0.5em]">MARKET VALUATION</p>
              <p className="text-6xl md:text-7xl font-mono font-black tracking-tighter text-white">
                ₹{new Intl.NumberFormat("en-IN").format(car.price)}
              </p>
            </div>
            <div className="text-right">
               <p className="text-[10px] text-neutral-600 uppercase tracking-[0.5em] mb-2">ALLOCATION</p>
               <p className="text-2xl italic font-black text-white px-6 py-2 bg-blue-600/10 border border-blue-500/20">8-12 WEEKS</p>
            </div>
          </motion.div>
        </div>

        {/* ── RIGHT SIDE: COMMAND CONSOLE ── */}
        <div className="lg:col-span-5 glass-console min-h-screen flex flex-col justify-center p-12 lg:p-24 relative z-50 shadow-[-50px_0_100px_rgba(0,0,0,0.9)]">
          
          <div className="max-w-md mx-auto w-full space-y-16">
            <div className="space-y-6">
              <h2 className="text-5xl font-black italic uppercase tracking-tight leading-[0.85]">Initialize <br/> <span className="text-blue-500">Ownership</span></h2>
              <p className="text-neutral-500 text-[12px] uppercase tracking-[0.3em] font-bold">Sync your profile with the ADYX distributed ledger.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-12">
              <div className="space-y-10">
                {/* Name */}
                <div className="group relative">
                  <input type="text" name="fullName" required placeholder="HOLDER NAME" value={formData.fullName} onChange={handleChange} 
                    className="w-full bg-transparent border-b-2 border-white/10 py-5 outline-none focus:border-blue-500 transition-all placeholder:text-neutral-800 text-sm tracking-[0.4em] font-black uppercase" />
                  <div className="absolute bottom-0 left-0 w-0 h-[2px] bg-blue-500 group-focus-within:w-full transition-all duration-500 shadow-[0_0_15px_#2563eb]" />
                </div>

                {/* City */}
                <div className="group relative">
                  <input type="text" name="city" required placeholder="GRID ZONE / SECTOR" value={formData.city} onChange={handleChange} 
                    className="w-full bg-transparent border-b-2 border-white/10 py-5 outline-none focus:border-blue-500 transition-all placeholder:text-neutral-800 text-sm tracking-[0.4em] font-black uppercase" />
                  <div className="absolute bottom-0 left-0 w-0 h-[2px] bg-blue-500 group-focus-within:w-full transition-all duration-500 shadow-[0_0_15px_#2563eb]" />
                </div>

                {/* Email */}
                <div className="group relative">
                  <input type="email" name="email" required placeholder="NEURAL IDENTITY (EMAIL)" value={formData.email} onChange={handleChange} 
                    className="w-full bg-transparent border-b-2 border-white/10 py-5 outline-none focus:border-blue-500 transition-all placeholder:text-neutral-800 text-sm tracking-[0.4em] font-black uppercase" />
                  <div className="absolute bottom-0 left-0 w-0 h-[2px] bg-blue-500 group-focus-within:w-full transition-all duration-700 shadow-[0_0_25px_#2563eb]" />
                </div>
              </div>

              <div className="space-y-6">
                <p className="text-[10px] text-neutral-600 uppercase tracking-[0.6em] font-black">DEPLOYMENT MODE</p>
                <div className="flex gap-4 p-2 bg-black/40 border border-white/5 rounded-[1rem]">
                  {["Test Drive", "Direct Booking"].map((type) => (
                    <button key={type} type="button" onClick={() => setFormData({...formData, bookingType: type})} 
                      className={`flex-1 py-5 transition-all duration-500 text-[10px] font-black uppercase tracking-widest rounded-xl ${formData.bookingType === type ? "bg-blue-600 text-white shadow-[0_10px_30px_rgba(37,99,235,0.4)] border border-blue-400" : "bg-transparent text-neutral-700 hover:text-white"}`}>
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <motion.button 
                type="submit" 
                disabled={isSending}
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
                className={`w-full py-9 font-black uppercase tracking-[1em] text-[13px] transition-all duration-700 relative overflow-hidden group shadow-[0_30px_80px_rgba(37,99,235,0.5)] ${isSending ? 'bg-neutral-900 text-neutral-700' : 'bg-blue-600 text-white border-2 border-blue-400'}`}
              >
                <span className="relative z-10">{isSending ? "ENCRYPTING..." : "AUTHORIZE"}</span>
              </motion.button>
            </form>

            <p className="text-[9px] text-center text-neutral-700 uppercase tracking-[0.8em] font-black">© 2026 ADYX TERMINAL // SECURE</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Booking;