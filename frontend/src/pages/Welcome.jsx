import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";

// Portfolio Components
import FeatureBlocksSection from "../components/portfolio/FeatureBlocksSection";
import SelectedWorks from "../components/portfolio/SelectedWorks";
import VectorBridge from "../components/portfolio/VectorBridge";
import Footer from "../components/portfolio/Footer";
import Contact from "../components/portfolio/Contact";
import Testimonial from "../components/portfolio/Testimonial";
import Navigation from "../components/portfolio/Navigation";

const BrandLogo = () => (
  <div className="fixed top-6 left-6 md:top-8 md:left-10 z-50 mix-blend-difference">
    <h1 className="font-sans font-black text-2xl md:text-4xl tracking-tighter text-white flex items-start">
      ADYX
      <span className="text-xs md:text-lg font-medium ml-1 -mt-1 md:-mt-2">®</span>
    </h1>
  </div>
);

const AvailabilityBadge = () => (
  <motion.div
    initial={{ opacity: 0, y: -10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, ease: "easeOut" }}
    className="absolute z-10 left-1/2 -translate-x-1/2 hidden md:flex items-center gap-2 pointer-events-none"
    style={{ top: "2.25rem" }}
  >
    <span className="relative flex h-1.5 w-1.5">
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-400" />
    </span>
    <span className="font-sans font-black text-[9px] tracking-[0.25em] uppercase text-white">
      Available for work
    </span>
  </motion.div>
);

const SocialStrip = () => {
  const socials = [
    { label: "GitHub", href: "https://github.com/atharvadedmuthe17" },
    { label: "LinkedIn", href: "https://www.linkedin.com/in/adyx-dev/" },
    { label: "Instagram", href: "https://www.instagram.com/_adyx_/" },
    { label: "Email", href: "mailto:adyx@gmail.com" },
  ];
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="absolute z-20 hidden md:flex flex-col items-center"
      style={{ right: "64px", top: "112px", bottom: "194px", justifyContent: "center", gap: "1rem" }}
    >
      <span className="w-[1px] h-8 bg-white/30 flex-shrink-0" />
      {socials.map(({ label, href }) => (
        <a
          key={label}
          href={href}
          target={href.startsWith("mailto") ? "_self" : "_blank"}
          rel="noopener noreferrer"
          title={label}
          className="group flex-shrink-0"
          style={{ writingMode: "vertical-rl", textOrientation: "mixed" }}
        >
          <span className="font-sans font-black text-[10px] tracking-[0.22em] uppercase text-white group-hover:opacity-100 transition-opacity duration-300">
            {label}
          </span>
        </a>
      ))}
      <span className="w-[1px] h-8 bg-white/30 flex-shrink-0" />
    </motion.div>
  );
};

const SpinningCTA = () => (
  <motion.div
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    className="absolute md:z-30 lg:z-10 hidden md:flex items-center justify-center"
    style={{ bottom: "4rem", right: "4rem" }}
  >
    <style>{`
      @keyframes ctaSpin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      .cta-ring { animation: ctaSpin var(--cta-spin-duration, 10s) linear infinite; transform-origin: center; }
      .cta-wrap:hover .cta-ring { --cta-spin-duration: 3s; }
      .cta-wrap { transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
      .cta-wrap:hover { transform: scale(1.08); }
    `}</style>
    <a href="#contact" className="cta-wrap group relative flex items-center justify-center w-[130px] h-[130px]" aria-label="Get in touch">
      <svg viewBox="0 0 130 130" className="absolute inset-0 w-full h-full pointer-events-none">
        <circle cx="65" cy="65" r="62" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5" />
      </svg>
      <svg viewBox="0 0 130 130" className="cta-ring absolute inset-0 w-full h-full pointer-events-none">
        <defs>
          <path id="cta-circle-path" d="M65,65 m-50,0 a50,50 0 1,1 100,0 a50,50 0 1,1 -100,0" />
        </defs>
        <text fill="rgba(255,255,255,1)" fontSize="8.5" fontFamily="'Inter', sans-serif" fontWeight="900" letterSpacing="4">
          <textPath href="#cta-circle-path">GET IN TOUCH · GET IN TOUCH · GET IN TOUCH ·&nbsp;</textPath>
        </text>
      </svg>
      <span className="absolute inset-4 rounded-full bg-white scale-0 group-hover:scale-100 transition-transform duration-500 ease-in-out" style={{ transformOrigin: "center" }} />
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="relative z-10 w-6 h-6 text-white group-hover:text-black" style={{ transition: "color 0.3s ease" }}>
        <path d="M7 17L17 7M17 7H7M17 7v10" />
      </svg>
    </a>
  </motion.div>
);

export default function Welcome() {
  const navigate = useNavigate();
  const [isExiting, setIsExiting] = useState(false);
  const footerContainerRef = useRef(null);
  
  const { scrollYProgress } = useScroll({
    target: footerContainerRef,
    offset: ["start end", "end end"]
  });

  const footerY = useTransform(scrollYProgress, [0, 1], ["-50%", "0%"]);

  const handleEnterExperience = () => {
    setIsExiting(true);
    setTimeout(() => {
      navigate("/intro");
    }, 1000);
  };

  return (
    <div className={`min-h-screen relative bg-black selection:bg-white selection:text-black overflow-x-hidden transition-all duration-1000 ${isExiting ? 'scale-110 opacity-0 blur-2xl' : 'opacity-100'}`}>
      <BrandLogo />
      <Navigation />

      {/* Hero */}
      <section className="relative h-screen overflow-hidden bg-[#050507]">
        {/* Background Video (z-0) */}
        <video 
          autoPlay 
          loop 
          muted 
          playsInline 
          className="absolute top-0 left-0 w-full h-full object-cover z-0"
        >
          <source src="/videos/hero.mp4" type="video/mp4" />
        </video>
        
        {/* Dark Overlay (z-1) */}
        <div className="absolute inset-0 bg-black/40 z-[1]" />

        {/* Content Layer (z-2) */}
        <div className="relative z-[2] h-full flex flex-col px-6 py-12 md:px-16 md:py-16">
          <AvailabilityBadge />
          <SocialStrip />
          <SpinningCTA />

          {/* Mobile Midpoint Buffer */}
          <div className="h-[32px] w-full md:hidden" />

          <div className="mt-auto mb-6 md:mb-8 text-white">
            <motion.div
              initial={{ opacity: 0, y: 60 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="w-fit"
            >
              <h1 className="font-sans font-bold text-7xl md:text-8xl lg:text-[9rem] xl:text-[11rem] leading-[0.85] tracking-tighter uppercase text-left">
                Driven<br />by logic
              </h1>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 w-full gap-4 mb-8 md:mb-0">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
              className="col-span-1 md:col-span-5 lg:col-span-4"
            >
              <div className="w-12 h-[2px] bg-white mb-6 md:hidden" />
              <p className="font-sans text-xs md:text-sm font-medium text-white leading-relaxed tracking-wide uppercase text-left">
                Building robust software, automating the complex and focused on transforming static systems into intelligent ones.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Content stack */}
      <div className="relative z-20 w-full bg-transparent">
        <div id="about" className="relative z-20">
          <FeatureBlocksSection />
        </div>

        <div id="work" className="bg-black text-white relative z-20">
          <SelectedWorks />
        </div>

        <div className="bg-white text-black relative z-20">
          <VectorBridge />
        </div>

        <div className="bg-black text-white relative z-20">
          <Testimonial />
        </div>

        <div id="contact" className="relative z-20 bg-white text-black">
          <Contact />
        </div>
      </div>

      {/* ── FINAL CTA SECTION ── */}
      <section className="relative z-20 h-[60vh] bg-white text-black flex flex-col items-center justify-center px-6 py-20 border-t border-black/5">
         <motion.div 
           initial={{ opacity: 0, y: 40 }}
           whileInView={{ opacity: 1, y: 0 }}
           viewport={{ once: true }}
           transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
           className="text-center space-y-8"
         >
            <h2 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter">
              Experience <span className="text-gray-400">The Future.</span>
            </h2>
            <p className="text-xs md:text-sm text-black/40 uppercase tracking-[0.4em] font-bold max-w-md mx-auto">
              Ready to explore the 3D automotive universe?
            </p>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleEnterExperience}
              className="group relative px-12 py-5 bg-black text-white rounded-full transition-all overflow-hidden shadow-2xl"
            >
               <span className="relative z-10 font-sans font-black uppercase tracking-[0.3em] text-[10px]">Enter Experience</span>
               <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
            </motion.button>
         </motion.div>
      </section>

      {/* Parallax Footer Reveal Stack */}
      <div ref={footerContainerRef} className="relative z-0 h-screen w-full overflow-hidden bg-black text-white">
        <motion.div style={{ y: footerY }} className="h-full w-full">
          <Footer />
        </motion.div>
      </div>
      
      <style>{`
        /* Custom scrollbar */
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #000; }
        ::-webkit-scrollbar-thumb { background: #333; border-radius: 10px; }
        ::-webkit-scrollbar-thumb:hover { background: #444; }
      `}</style>
    </div>
  );
}
