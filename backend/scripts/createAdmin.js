import React, { useState, useRef, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Grid, Sphere, Sparkles } from '@react-three/drei';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

// ==========================================
// INLINE ICONS (To prevent lucide-react undefined errors)
// ==========================================
const UserIcon = (props) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
const MailIcon = (props) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>;
const LockIcon = (props) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>;
const ShieldCheckIcon = (props) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>;
const CpuIcon = (props) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect width="16" height="16" x="4" y="4" rx="2" ry="2"/><rect width="6" height="6" x="9" y="9" rx="1"/><path d="M15 2v2"/><path d="M15 20v2"/><path d="M2 15h2"/><path d="M2 9h2"/><path d="M20 15h2"/><path d="M20 9h2"/><path d="M9 2v2"/><path d="M9 20v2"/></svg>;
const ChevronRightIcon = (props) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="m9 18 6-6-6-6"/></svg>;
const AlertCircleIcon = (props) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>;

// ==========================================
// 3D SCENE COMPONENTS
// ==========================================

// Smooth parallax camera rig
function CameraRig() {
  useFrame((state) => {
    const targetX = state.pointer.x * 2;
    const targetY = 2 + state.pointer.y * 1;
    
    state.camera.position.x = THREE.MathUtils.lerp(state.camera.position.x, targetX, 0.05);
    state.camera.position.y = THREE.MathUtils.lerp(state.camera.position.y, targetY, 0.05);
    state.camera.position.z = THREE.MathUtils.lerp(state.camera.position.z, 8, 0.05);
    
    state.camera.lookAt(0, 0, 0);
  });
  return null;
}

// Procedural Hologram Car
function HologramCar() {
  const groupRef = useRef();

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.005; // Slow rotation
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime) * 0.2; // Subtle hover
    }
  });

  return (
    <group ref={groupRef} position={[0, 0.5, -2]}>
      {/* Car Body Base */}
      <mesh position={[0, 0.4, 0]}>
        <boxGeometry args={[2.2, 0.5, 4.5]} />
        <meshStandardMaterial color="#00f3ff" wireframe transparent opacity={0.4} emissive="#00f3ff" emissiveIntensity={0.8} />
      </mesh>
      {/* Car Cabin */}
      <mesh position={[0, 1.0, -0.5]}>
        <boxGeometry args={[1.8, 0.6, 2.2]} />
        <meshStandardMaterial color="#a855f7" wireframe transparent opacity={0.5} emissive="#a855f7" emissiveIntensity={0.8} />
      </mesh>
      {/* Wheels */}
      {[-1.1, 1.1].map((x, i) => 
        [-1.4, 1.4].map((z, j) => (
          <mesh key={`${i}-${j}`} position={[x, 0.2, z]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.4, 0.4, 0.2, 16]} />
            <meshStandardMaterial color="#00f3ff" wireframe emissive="#00f3ff" emissiveIntensity={1.2} />
          </mesh>
        ))
      )}
      
      {/* Core Energy */}
      <Sphere args={[0.3, 16, 16]} position={[0, 0.6, 0]}>
        <meshBasicMaterial color="#ffffff" />
      </Sphere>
    </group>
  );
}

// ==========================================
// MAIN UI COMPONENT
// ==========================================

export default function AdminSetup() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [status, setStatus] = useState('idle'); // idle | loading | success | error
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (status === 'error') setStatus('idle'); // Clear error when typing
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password) return;
    
    setStatus('loading');
    setErrorMessage('');
    
    try {
      // Real API integration
      const response = await fetch('/api/admin/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create admin');
      }

      // Store token if backend returns one
      if (data.token) {
        localStorage.setItem('adminToken', data.token);
      }

      setStatus('success');
      
      // Auto transition to dashboard after success animation
      setTimeout(() => {
        navigate('/admin');
      }, 2500);

    } catch (error) {
      console.error('Admin creation error:', error);
      setStatus('error');
      setErrorMessage(error.message || 'Network error occurred. Please try again.');
    }
  };

  return (
    <div className="relative w-full h-screen bg-[#030614] overflow-hidden text-white font-sans selection:bg-cyan-500/30">
      
      {/* 3D Background Canvas */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <Canvas camera={{ position: [0, 2, 8], fov: 50 }}>
          <Suspense fallback={null}>
            <color attach="background" args={['#030614']} />
            <fog attach="fog" args={['#030614', 5, 25]} />
            
            <ambientLight intensity={0.4} />
            <pointLight position={[0, 5, 0]} intensity={3} color="#a855f7" />
            <pointLight position={[0, 1, 4]} intensity={3} color="#00f3ff" />

            <CameraRig />
            
            {/* Replaced custom buffer particles with Sparkles for stability */}
            <Sparkles count={150} scale={20} size={5} speed={0.4} opacity={0.8} color="#00f3ff" />
            
            <HologramCar />

            {/* Tron-style Grid Floor */}
            <Grid 
              position={[0, -0.5, 0]} 
              args={[50, 50]} 
              cellSize={1} 
              cellThickness={1} 
              cellColor="#a855f7" 
              sectionSize={5} 
              sectionThickness={1.5} 
              sectionColor="#00f3ff" 
              fadeDistance={25} 
              fadeStrength={1} 
            />
          </Suspense>
        </Canvas>
      </div>

      {/* Floating Glassmorphism UI */}
      <div className="relative z-10 flex items-center justify-center w-full h-full p-4 pointer-events-auto">
        <AnimatePresence mode="wait">
          
          {/* FORM STATE */}
          {status !== 'success' && (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -30, scale: 0.95, filter: "blur(10px)" }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="w-full max-w-md p-8 backdrop-blur-xl bg-[#0a0f1c]/60 border border-white/10 shadow-[0_0_40px_rgba(0,243,255,0.1)] rounded-2xl"
              style={{ boxShadow: 'inset 0 0 20px rgba(255,255,255,0.02)' }}
            >
              {/* Header */}
              <div className="flex flex-col items-center mb-6">
                <div className="p-3 mb-4 rounded-full bg-cyan-500/10 border border-cyan-500/30 shadow-[0_0_15px_rgba(0,243,255,0.3)]">
                  <ShieldCheckIcon className="w-8 h-8 text-cyan-400" />
                </div>
                <h2 className="text-3xl font-bold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">
                  SYSTEM ADMIN
                </h2>
                <p className="text-sm tracking-widest text-cyan-200/50 uppercase mt-2">Initialize Core Access</p>
              </div>

              {/* Error Message */}
              <AnimatePresence>
                {status === 'error' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, y: -10 }}
                    animate={{ opacity: 1, height: 'auto', y: 0 }}
                    exit={{ opacity: 0, height: 0, y: -10 }}
                    className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-lg flex items-center text-red-400 text-sm overflow-hidden"
                  >
                    <AlertCircleIcon className="w-4 h-4 mr-2 flex-shrink-0" />
                    <span>{errorMessage}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-5">
                
                {/* Name Field */}
                <motion.div whileHover={{ scale: 1.02 }} className="relative group">
                  <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-cyan-500/50 group-focus-within:text-cyan-400 transition-colors" />
                  <input
                    type="text"
                    name="name"
                    required
                    disabled={status === 'loading'}
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Admin Designation"
                    className="w-full py-3.5 pl-12 pr-4 bg-black/40 border border-white/10 rounded-xl outline-none text-white placeholder-white/30 focus:border-cyan-400 focus:bg-cyan-900/10 focus:shadow-[0_0_20px_rgba(0,243,255,0.2)] transition-all duration-300 disabled:opacity-50"
                  />
                </motion.div>

                {/* Email Field */}
                <motion.div whileHover={{ scale: 1.02 }} className="relative group">
                  <MailIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-cyan-500/50 group-focus-within:text-cyan-400 transition-colors" />
                  <input
                    type="email"
                    name="email"
                    required
                    disabled={status === 'loading'}
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Secure Email Link"
                    className="w-full py-3.5 pl-12 pr-4 bg-black/40 border border-white/10 rounded-xl outline-none text-white placeholder-white/30 focus:border-cyan-400 focus:bg-cyan-900/10 focus:shadow-[0_0_20px_rgba(0,243,255,0.2)] transition-all duration-300 disabled:opacity-50"
                  />
                </motion.div>

                {/* Password Field */}
                <motion.div whileHover={{ scale: 1.02 }} className="relative group">
                  <LockIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-cyan-500/50 group-focus-within:text-cyan-400 transition-colors" />
                  <input
                    type="password"
                    name="password"
                    required
                    disabled={status === 'loading'}
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Encryption Key"
                    className="w-full py-3.5 pl-12 pr-4 bg-black/40 border border-white/10 rounded-xl outline-none text-white placeholder-white/30 focus:border-cyan-400 focus:bg-cyan-900/10 focus:shadow-[0_0_20px_rgba(0,243,255,0.2)] transition-all duration-300 disabled:opacity-50"
                  />
                </motion.div>

                {/* Submit Button */}
                <motion.button
                  whileHover={status !== 'loading' ? { scale: 1.03, boxShadow: "0px 0px 30px rgba(168,85,247,0.5)" } : {}}
                  whileTap={status !== 'loading' ? { scale: 0.98 } : {}}
                  disabled={status === 'loading'}
                  className="relative w-full py-4 mt-4 font-bold tracking-widest text-white uppercase overflow-hidden rounded-xl bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 transition-colors disabled:opacity-70 disabled:cursor-not-allowed group"
                >
                  {/* Button Glow Effect */}
                  {status !== 'loading' && (
                    <div className="absolute inset-0 w-full h-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 -translate-x-full group-hover:animate-shimmer" />
                  )}
                  
                  {status === 'loading' ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Authenticating...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center space-x-2">
                      <CpuIcon className="w-5 h-5" />
                      <span>Create Admin</span>
                    </div>
                  )}
                </motion.button>
              </form>
            </motion.div>
          )}

          {/* SUCCESS STATE */}
          {status === 'success' && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, type: "spring", bounce: 0.5 }}
              className="flex flex-col items-center justify-center text-center p-10 backdrop-blur-xl bg-[#0a0f1c]/60 border border-cyan-500/30 shadow-[0_0_60px_rgba(0,243,255,0.2)] rounded-3xl"
            >
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1, rotate: 360 }}
                transition={{ duration: 0.8, type: "spring" }}
                className="w-24 h-24 mb-6 rounded-full flex items-center justify-center bg-gradient-to-tr from-cyan-500 to-purple-600 shadow-[0_0_40px_rgba(0,243,255,0.6)]"
              >
                <ShieldCheckIcon className="w-12 h-12 text-white" />
              </motion.div>
              
              <h3 className="text-2xl font-bold text-white mb-2 tracking-wide">
                ACCESS GRANTED
              </h3>
              <p className="text-cyan-300/80 tracking-widest uppercase text-sm mb-8">
                Admin Initialized Successfully
              </p>

              <motion.div 
                animate={{ x: [0, 10, 0] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                className="flex items-center text-purple-400 font-medium tracking-widest text-xs uppercase"
              >
                Redirecting to Dashboard <ChevronRightIcon className="w-4 h-4 ml-1" />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Global Shimmer Animation for Button */}
      <style>{`
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
      `}</style>
    </div>
  );
}