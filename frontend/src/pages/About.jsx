import React, { useEffect } from "react";
import gsap from "gsap";

const About = () => {
 useEffect(() => {
  gsap.fromTo(
    ".about-title",
    { opacity: 0, y: 50 },
    { opacity: 1, y: 0, duration: 1, ease: "power4.out" }
  );

  gsap.fromTo(
    ".about-card",
    { opacity: 0, y: 30 },
    { 
      opacity: 1, 
      y: 0, 
      stagger: 0.2, 
      duration: 1, 
      delay: 0.5, 
      ease: "power3.out" 
    }
  );
}, []);

  return (
    <div className="relative min-h-screen bg-[#050507] text-white pt-32 pb-20 px-10 md:px-20 overflow-hidden font-sans">
      
      {/* high-brightness radiant glows - matching your contact page energy */}
      <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-blue-600/20 blur-[140px] rounded-full pointer-events-none animate-pulse" />
      <div className="absolute bottom-[10%] right-[-5%] w-[40%] h-[40%] bg-blue-500/15 blur-[120px] rounded-full pointer-events-none" />
      
      {/* subtle mesh gradient for texture */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(59,130,246,0.1),transparent_50%)] pointer-events-none" />

      <div className="relative z-10">
        {/* header section */}
        <div className="max-w-4xl">
          <h4 className="text-blue-400 font-bold uppercase tracking-[0.5em] text-[12px] mb-6 about-title italic">
            the future of motion
          </h4>
          <h1 className="text-6xl md:text-8xl font-black italic uppercase tracking-tighter leading-[0.9] about-title">
            driven by <span className="text-blue-500 drop-shadow-[0_0_30px_rgba(59,130,246,0.8)]">soul</span>,<br /> 
            powered by ai.
          </h1>
        </div>

        {/* philosophy & stats grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-20 mt-32 italic">
          <div className="space-y-10 about-card">
            <h3 className="text-3xl font-bold italic border-l-4 border-blue-500 pl-8 uppercase tracking-widest text-white">our philosophy</h3>
            <div className="text-white leading-relaxed text-xl font-light space-y-8">
              <p className="drop-shadow-sm">
                adyx exists at the intersection of raw kinetic energy and synthetic intelligence. we do not build vehicles; we architect intelligent systems that co-exist with the driver, turning every kilometer into a data-driven symphony of performance.
              </p>
              <p className="text-white/80">
                traditional luxury is static. adyx is fluid. by integrating cloud-native neural networks into the chassis, we have broken the barrier between mechanical hardware and cognitive software.
              </p>
              <p className="text-white/80">
                this is the balance of the emotional and the analytic. born from indian innovation, engineered for global dominance.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 about-card">
            {/* brightened stats - high contrast */}
            <div className="p-10 bg-white/[0.08] border border-white/20 rounded-3xl backdrop-blur-3xl text-center group hover:border-blue-400 hover:bg-white/[0.12] transition-all duration-500">
              <h2 className="text-5xl font-black text-blue-400 italic drop-shadow-[0_0_10px_rgba(96,165,250,0.4)]">2.1s</h2>
              <p className="text-[12px] uppercase tracking-widest text-white/70 mt-3 font-bold">0-100 km/h</p>
            </div>
            <div className="p-10 bg-white/[0.08] border border-white/20 rounded-3xl backdrop-blur-3xl text-center group hover:border-blue-400 hover:bg-white/[0.12] transition-all duration-500">
              <h2 className="text-5xl font-black text-blue-400 italic drop-shadow-[0_0_10px_rgba(96,165,250,0.4)]">neural</h2>
              <p className="text-[12px] uppercase tracking-widest text-white/70 mt-3 font-bold">drive os</p>
            </div>
            <div className="p-10 bg-white/[0.08] border border-white/20 rounded-3xl backdrop-blur-3xl text-center group hover:border-blue-400 hover:bg-white/[0.12] transition-all duration-500 col-span-2">
              <div className="flex justify-around items-center">
                  <div>
                      <h2 className="text-5xl font-black text-blue-400 italic">800kw</h2>
                      <p className="text-[12px] uppercase tracking-widest text-white/70 mt-3 font-bold">peak output</p>
                  </div>
                  <div className="w-px h-16 bg-white/20"></div>
                  <div>
                      <h2 className="text-5xl font-black text-blue-400 italic">synapse</h2>
                      <p className="text-[12px] uppercase tracking-widest text-white/70 mt-3 font-bold">adaptive ai</p>
                  </div>
              </div>
            </div>
          </div>
        </div>

        {/* why adyx exists - increased text brightness */}
        <div className="mt-48 border-t border-white/20 pt-24 about-card italic">
          <h3 className="text-5xl font-black uppercase tracking-tighter mb-16 text-blue-50">why adyx exists</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
            <p className="text-white leading-relaxed font-light text-lg">
              the era of the conventional automobile is over. legacy brands remain tethered to analog philosophies. performance is no longer measured solely in horsepower, but in the latency between thought and execution.
            </p>
            <p className="text-white/90 leading-relaxed font-light text-lg">
              we saw a void where intelligence should be. adyx was born to eliminate the friction between human desire and machine capability. our systems are cloud-native, meaning your vehicle evolves every single day.
            </p>
            <p className="text-white/90 leading-relaxed font-light text-lg">
              india is the new frontier for deep-tech innovation. adyx leverages this cognitive capital to build the first truly ai-native automotive architecture.
            </p>
          </div>
        </div>

        {/* vision roadmap - high visibility container */}
        <div className="mt-48 bg-gradient-to-br from-blue-600/20 via-blue-900/10 to-transparent p-16 rounded-[4rem] border border-white/20 about-card italic backdrop-blur-md">
          <h3 className="text-5xl font-black uppercase tracking-tighter mb-16 text-center text-white">the adyx vision</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-20">
            <div className="space-y-12">
              <div className="flex gap-8 items-start">
                <span className="text-blue-400 font-black text-3xl drop-shadow-[0_0_10px_rgba(96,165,250,0.5)]">01</span>
                <div>
                  <h4 className="text-xl font-bold uppercase tracking-widest text-white">ai-native architecture</h4>
                  <p className="text-white/60 mt-3 text-base">hardware designed to serve the algorithm. a chassis built for neural integration.</p>
                </div>
              </div>
              <div className="flex gap-8 items-start">
                <span className="text-blue-400 font-black text-3xl drop-shadow-[0_0_10px_rgba(96,165,250,0.5)]">02</span>
                <div>
                  <h4 className="text-xl font-bold uppercase tracking-widest text-white">ota evolution</h4>
                  <p className="text-white/60 mt-3 text-base">continuous deployment of torque curves and aero-mapping via the adyx cloud.</p>
                </div>
              </div>
            </div>
            <div className="space-y-12">
              <div className="flex gap-8 items-start">
                <span className="text-blue-400 font-black text-3xl drop-shadow-[0_0_10px_rgba(96,165,250,0.5)]">03</span>
                <div>
                  <h4 className="text-xl font-bold uppercase tracking-widest text-white">digital ownership</h4>
                  <p className="text-white/60 mt-3 text-base">blockchain-verified performance history and encrypted biometric access.</p>
                </div>
              </div>
              <div className="flex gap-8 items-start">
                <span className="text-blue-400 font-black text-3xl drop-shadow-[0_0_10px_rgba(96,165,250,0.5)]">04</span>
                <div>
                  <h4 className="text-xl font-bold uppercase tracking-widest text-white">autonomous-ready</h4>
                  <p className="text-white/60 mt-3 text-base">lvl 5 compute capability baked into every unit. prepared for the post-driver era.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* closing statement - max glow */}
        <div className="mt-48 text-center about-card pb-32">
          <p className="text-blue-400 uppercase tracking-[0.5em] text-[12px] mb-8 font-bold">manifesto 1.0</p>
          <h2 className="text-4xl md:text-7xl font-black italic uppercase leading-tight tracking-tighter">
            adyx is not built for today.<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-white to-blue-400 drop-shadow-[0_0_20px_rgba(96,165,250,0.3)]">
              it is engineered for what comes next.
            </span>
          </h2>
        </div>
      </div>
    </div>
  );
};

export default About;