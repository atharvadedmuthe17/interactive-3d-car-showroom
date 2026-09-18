import React from 'react';

const MarketplaceSections = () => {
  return (
    <div className="relative z-[150] bg-[#050507] text-white">
      
      {/* 1. How It Works Section */}
      <section className="py-20 px-12 border-t border-white/5">
        <h2 className="text-4xl font-black italic mb-12 uppercase tracking-tighter">How it works</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {[
            { step: "01", title: "Post Car", desc: "Upload details and let our AI generate a 3D model." },
            { step: "02", title: "Get Verified", desc: "Our partners inspect the car for 100% transparency." },
            { step: "03", title: "Connect", desc: "Chat directly with verified buyers or sellers." },
            { step: "04", title: "Secure Deal", desc: "Complete the transaction through our secure escrow." },
          ].map((item, i) => (
            <div key={i} className="p-6 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all">
              <span className="text-blue-500 font-bold text-sm">{item.step}</span>
              <h3 className="text-xl font-bold mt-2 mb-2">{item.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 2. Featured 3D Cars (Placeholder for UI) */}
      <section className="py-20 px-12 bg-white/[0.02]">
        <div className="flex justify-between items-end mb-12">
          <h2 className="text-4xl font-black italic uppercase tracking-tighter">Featured Collection</h2>
          <button className="text-blue-500 font-bold text-xs uppercase tracking-widest border-b border-blue-500 pb-1">View All</button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[1, 2, 3].map((item) => (
            <div key={item} className="group bg-black border border-white/10 rounded-3xl overflow-hidden hover:border-blue-500/50 transition-all">
              <div className="h-48 bg-gradient-to-b from-gray-800 to-black flex items-center justify-center relative">
                 <span className="text-white/20 font-black italic text-4xl uppercase tracking-tighter group-hover:scale-110 transition-transform">3D Preview</span>
                 <div className="absolute top-4 left-4 bg-blue-600 text-[10px] font-bold px-3 py-1 rounded-full uppercase">Verified</div>
              </div>
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold italic">ADYX Concept X{item}</h3>
                    <p className="text-gray-500 text-xs mt-1">New Delhi, India</p>
                  </div>
                  <span className="text-xl font-black text-blue-500">$45,000</span>
                </div>
                <button className="w-full py-3 bg-white/5 border border-white/10 rounded-xl text-[10px] font-bold uppercase tracking-widest group-hover:bg-white group-hover:text-black transition-all">
                  Inspect in 3D
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Trust Section */}
      <section className="py-32 px-12 text-center">
        <h2 className="text-5xl font-black italic uppercase tracking-tighter mb-6">Why Trust ADYX?</h2>
        <p className="text-gray-400 max-w-2xl mx-auto mb-16 text-lg">We are rebuilding car commerce with transparency at its core.</p>
        <div className="flex flex-wrap justify-center gap-12">
           <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-blue-600/20 flex items-center justify-center text-blue-500 text-2xl">🛡️</div>
              <span className="font-bold uppercase tracking-widest text-xs">Fraud Protection</span>
           </div>
           <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-blue-600/20 flex items-center justify-center text-blue-500 text-2xl">🔍</div>
              <span className="font-bold uppercase tracking-widest text-xs">Expert Inspection</span>
           </div>
           <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-blue-600/20 flex items-center justify-center text-blue-500 text-2xl">📑</div>
              <span className="font-bold uppercase tracking-widest text-xs">Verified Docs</span>
           </div>
        </div>
      </section>

      {/* 4. Footer */}
      <footer className="py-12 px-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="text-2xl font-black italic tracking-tighter">ADYX</div>
        <div className="flex gap-8 text-[10px] font-bold uppercase tracking-widest text-white/40">
           <a href="#" className="hover:text-white transition-all">About</a>
           <a href="#" className="hover:text-white transition-all">Privacy</a>
           <a href="#" className="hover:text-white transition-all">Terms</a>
           <a href="#" className="hover:text-white transition-all">Contact</a>
        </div>
        <p className="text-[10px] text-white/20 uppercase tracking-[0.3em]">© 2026 Engineered to Dominate.</p>
      </footer>
    </div>
  );
};

export default MarketplaceSections;
