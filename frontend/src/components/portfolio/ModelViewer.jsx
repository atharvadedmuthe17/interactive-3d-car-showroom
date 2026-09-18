import React, { Suspense, useEffect, useRef, memo } from "react";
import * as THREE from "three";
import { Canvas, useThree } from "@react-three/fiber";
import { useGLTF, OrbitControls, Environment, ContactShadows, Html } from "@react-three/drei";

// 1. Loader Component
const Loader = () => (
  <Html center>
    <div className="flex flex-col items-center gap-4 bg-black/80 p-10 rounded-[2.5rem] backdrop-blur-2xl border border-white/10 shadow-2xl min-w-[240px]">
      <div className="w-14 h-14 border-4 border-white/5 border-t-cyan-500 rounded-full animate-spin" />
      <div className="text-center">
        <p className="text-white font-black uppercase tracking-[0.4em] text-[11px] mb-1">Engines Priming</p>
        <p className="text-white/30 text-[9px] uppercase tracking-widest">Normalizing Viewport...</p>
      </div>
    </div>
  </Html>
);

// 2. Error Boundary
class ModelErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() { return { hasError: true }; }
  render() {
    if (this.state.hasError) {
      return (
        <Html center>
          <div className="bg-red-500/10 backdrop-blur-2xl p-10 rounded-[2.5rem] border border-red-500/20 text-center min-w-[320px]">
            <p className="text-red-500 font-black uppercase tracking-widest text-xs mb-3">Sync Error</p>
            <button onClick={() => window.location.reload()} className="px-10 py-3 bg-white text-black text-[10px] font-black uppercase tracking-widest rounded-full">Retry</button>
          </div>
        </Html>
      );
    }
    return this.props.children;
  }
}

// 3. THE NORMALIZATION ENGINE
function AutoFitModel({ path }) {
  const { scene } = useGLTF(path, 'https://www.gstatic.com/draco/versioned/decoders/1.5.5/');
  const { camera, controls } = useThree();
  const groupRef = useRef();

  useEffect(() => {
    if (!scene || !groupRef.current) return;

    // --- RESET ---
    scene.updateMatrixWorld();
    scene.rotation.set(0, 0, 0);
    scene.position.set(0, 0, 0);
    scene.scale.set(1, 1, 1);

    // --- MEASURE & CENTER ---
    const box = new THREE.Box3().setFromObject(scene);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());

    // Fix pivot to 0,0,0 (Geometric Center)
    scene.position.x = -center.x;
    scene.position.y = -center.y;
    scene.position.z = -center.z;

    // --- DYNAMIC SCALING (Target 75% Viewport Fill) ---
    const maxDim = Math.max(size.x, size.y, size.z);
    // targetSize = 10 units for robust math
    const targetSize = 10; 
    const normalizationScale = targetSize / maxDim;
    groupRef.current.scale.setScalar(normalizationScale);

    // --- CAMERA FRAMING ---
    groupRef.current.updateMatrixWorld();
    const finalBox = new THREE.Box3().setFromObject(groupRef.current);
    const finalSize = finalBox.getSize(new THREE.Vector3());
    const finalCenter = finalBox.getCenter(new THREE.Vector3()); // Should be 0,0,0

    const fov = camera.fov * (Math.PI / 180);
    // Calculate distance based on FOV to fill ~75%
    let distance = Math.max(finalSize.x, finalSize.y, finalSize.z) / (2 * Math.tan(fov / 2));
    
    // Fill ~75% of container
    distance /= 0.75; 

    // Position camera at a cinematic but centered angle
    // Using finalCenter.y (which is 0) to ensure car is vertically centered
    camera.position.set(distance * 0.8, 0, distance * 0.8);
    camera.lookAt(finalCenter); 
    
    // Near/Far planes
    camera.near = 0.1;
    camera.far = distance * 10;
    camera.updateProjectionMatrix();

    // --- SYNC ORBIT CONTROLS ---
    if (controls) {
      controls.target.copy(finalCenter); // Target origin
      controls.enableDamping = true;
      controls.dampingFactor = 0.05;
      controls.autoRotate = true;
      controls.autoRotateSpeed = 1.5;
      controls.update();
    }

  }, [scene, path, camera, controls]);

  return (
    <group ref={groupRef}>
      <primitive object={scene} />
    </group>
  );
}

const ModelViewer = memo(({ modelPath }) => {
  return (
    <div className="w-full h-full relative">
      <Canvas
        shadows
        dpr={[1, 2]}
        gl={{ 
          antialias: true, 
          alpha: true, 
          powerPreference: "high-performance",
          preserveDrawingBuffer: true 
        }}
        camera={{ fov: 40 }}
      >
        <ambientLight intensity={0.8} />
        <spotLight position={[10, 20, 10]} angle={0.2} intensity={3} castShadow />
        <pointLight position={[-10, 5, -10]} intensity={2} color="#0088ff" />

        <Suspense fallback={<Loader />}>
          <ModelErrorBoundary>
            <AutoFitModel path={modelPath} />
            <Environment preset="city" />
            <ContactShadows 
              position={[0, -2, 0]} 
              opacity={0.6} 
              scale={25} 
              blur={2} 
              far={5} 
            />
          </ModelErrorBoundary>
        </Suspense>

        <OrbitControls 
          makeDefault 
          enableZoom={false} 
          enablePan={false} 
          minPolarAngle={Math.PI / 4} 
          maxPolarAngle={Math.PI / 1.8} 
        />
      </Canvas>
    </div>
  );
});

export default ModelViewer;
