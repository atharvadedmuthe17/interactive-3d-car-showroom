export const cars = [
  {
    id: 1,
    slug: "adyx-spectre",
    name: "ADYX Spectre",
    price: 11,
    description: "A phantom on the road. Engineered with stealth technology and neural-link steering.",
    modelPath: "/models/car.glb",
    // We keep the property but can use it for a "Fallback Gradient" or BlurHash
    thumbnail: "linear-gradient(135deg, #050505 0%, #1a1a1a 100%)", 
    colors: [
      { name: "Obsidian", hex: "#050505" },
      { name: "Liquid Chrome", hex: "#e0e0e0" },
      { name: "Blood Moon", hex: "#4a0000" }
    ],
    specs: { range: "480 mi", topSpeed: "185 mph", zeroToSixty: "2.8s" },
    details: { 
      year: "2026", 
      fuel: "Solid-State", 
      drive: "AWD", 
      transmission: "Neural", 
      engine: "Quattro-Motor", 
      status: "Active" 
    },
    themeColor: "#00F3FF" // Cyber Cyan accent
  },
  {
    id: 2,
    slug: "adyx-nexus",
    name: "ADYX Nexus",
    price: 11,
    description: "The ultimate driver's interface. Where distributed intelligence meets raw aerodynamic power.",
    modelPath: "/models/venom.glb",
    thumbnail: "linear-gradient(135deg, #0a0a0a 0%, #001f3f 100%)", 
    colors: [
      { name: "Neon Pulse", hex: "#39FF14" },
      { name: "Void Black", hex: "#0a0a0a" },
      { name: "Electric Cobalt", hex: "#0047AB" }
    ],
    specs: { range: "410 mi", topSpeed: "225 mph", zeroToSixty: "1.8s" },
    details: { 
      year: "2026", 
      fuel: "Fusion-Core", 
      drive: "RWD", 
      transmission: "Direct", 
      engine: "Hyper-Flux", 
      status: "In-Stock" 
    },
    themeColor: "#39FF14" // Pulse Green accent
  },
  {
    id: 3,
    slug: "adyx-vortex",
    name: "ADYX Vortex",
    price: 11,
    description: "Zero-drag architecture. A mid-size powerhouse designed for the urban grid of 2030.",
    modelPath: "/models/audi_r8.glb",
    thumbnail: "linear-gradient(135deg, #000000 0%, #331100 100%)", 
    colors: [
      { name: "Ghost White", hex: "#F8F8F8" },
      { name: "Anthracite", hex: "#2C2C2C" },
      { name: "Plasma Orange", hex: "#FF8C00" }
    ],
    specs: { range: "550 mi", topSpeed: "160 mph", zeroToSixty: "3.5s" },
    details: { 
      year: "2026", 
      fuel: "Hybrid-X", 
      drive: "AWD", 
      transmission: "Smart-Shift", 
      engine: "V6-Turbo", 
      status: "Bespoke" 
    },
    themeColor: "#FF8C00" // Plasma Orange accent
  },
  {
    id: 4,
    slug: "adyx-titan-x",
    name: "ADYX Titan X",
    price: 11,
    description: "Heavy-duty luxury. Built for off-world aesthetics and unparalleled off-road dominance.",
    modelPath: "/models/kia_sportage.glb",
    thumbnail: "linear-gradient(135deg, #0a0f0a 0%, #1b3022 100%)", 
    colors: [
      { name: "Sahara Dust", hex: "#A09383" },
      { name: "Deep Moss", hex: "#1B3022" },
      { name: "Tungsten", hex: "#333333" }
    ],
    specs: { range: "420 mi", topSpeed: "145 mph", zeroToSixty: "3.9s" },
    details: { 
      year: "2026", 
      fuel: "Electric", 
      drive: "6WD", 
      transmission: "Auto", 
      engine: "Octa-Drive", 
      status: "Ready" 
    },
    themeColor: "#A09383" // Earth/Tungsten accent
  },
  {
    id: 5,
    slug: "adyx-zenith",
    name: "ADYX Zenith",
    price: 11,
    description: "The peak of the ADYX fleet. A limited Grand Tourer for those who rule the skyline.",
    modelPath: "/models/bmw_i8.glb",
    thumbnail: "linear-gradient(135deg, #000000 0%, #443300 100%)", 
    colors: [
      { name: "Solaris Gold", hex: "#BF953F" },
      { name: "Deep Onyx", hex: "#000000" },
      { name: "Lunar Silver", hex: "#BDC3C7" }
    ],
    specs: { range: "450 mi", topSpeed: "205 mph", zeroToSixty: "2.4s" },
    details: { 
      year: "2026", 
      fuel: "Ionic", 
      drive: "AWD", 
      transmission: "Infinite", 
      engine: "V12-Digital", 
      status: "Exclusive" 
    },
    themeColor: "#BF953F" // Solaris Gold accent
  },
  {
    id: 6,
    slug: "adyx-apex",
    name: "ADYX Apex",
    price: 11,
    description: "Pure agility. Small footprint, massive intelligence. The entry point to performance.",
    modelPath: "/models/bmw_m4_widebody.glb",
    thumbnail: "linear-gradient(135deg, #0d001a 0%, #2b004d 100%)", 
    colors: [
      { name: "Ultraviolet", hex: "#5D3FD3" },
      { name: "Static Grey", hex: "#4F4F4F" },
      { name: "Cyber Red", hex: "#FF003C" }
    ],
    specs: { range: "350 mi", topSpeed: "140 mph", zeroToSixty: "4.5s" },
    details: { 
      year: "2024", 
      fuel: "Electric", 
      drive: "RWD", 
      transmission: "Single", 
      engine: "E-Motor", 
      status: "Available" 
    },
    themeColor: "#5D3FD3" // Ultraviolet accent
  }
];