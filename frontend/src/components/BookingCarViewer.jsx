import React, { Suspense, useEffect, useRef } from "react";
import * as THREE from "three";
import { Canvas, useThree } from "@react-three/fiber";
import { useGLTF, OrbitControls, Environment, ContactShadows, Html } from "@react-three/drei";

function AutoFitModel({ path }) {
  const { scene } = useGLTF(path, 'https://www.gstatic.com/draco/versioned/decoders/1.5.5/');
  const { camera, controls } = useThree();
  const groupRef = useRef();

  useEffect(() => {
    if (!scene || !groupRef.current) return;

    // 1. Reset
    scene.rotation.set(0, 0, 0);
    scene.position.set(0, 0, 0);
    scene.scale.set(1, 1, 1);

    // 2. Measure & Center
    const box = new THREE.Box3().setFromObject(scene);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());

    scene.position.x = -center.x;
    scene.position.y = -center.y;
    scene.position.z = -center.z;

    // 3. Normalize Scale (Bigger Presence)
    const maxDim = Math.max(size.x, size.y, size.z);
    const targetSize = 8;
    const normalizationScale = targetSize / maxDim;
    groupRef.current.scale.setScalar(normalizationScale);

    // 4. Proactive Framing (Closer)
    groupRef.current.updateMatrixWorld();
    const finalBox = new THREE.Box3().setFromObject(groupRef.current);
    const finalSize = finalBox.getSize(new THREE.Vector3());
    const finalCenter = finalBox.getCenter(new THREE.Vector3());
    const finalMaxDim = Math.max(finalSize.x, finalSize.y, finalSize.z);

    const fov = camera.fov * (Math.PI / 180);
    let distance = finalMaxDim / (2 * Math.tan(fov / 2));
    distance *= 0.85;

    camera.position.set(distance * 0.9, targetSize * 0.35, distance * 0.9);
    camera.lookAt(finalCenter);
    camera.near = 0.1;
    camera.far = distance * 20;
    camera.updateProjectionMatrix();

    if (controls) {
      controls.target.copy(finalCenter);
      controls.update();
    }
    
  }, [scene, path, camera, controls]);

  return (
    <group ref={groupRef}>
      <primitive object={scene} />
    </group>
  );
}

const BookingCarViewer = ({ modelPath }) => {
  return (
    <div className="w-full h-full relative" style={{ minHeight: '500px' }}>
      <Canvas 
        dpr={[1, 2]} 
        shadows 
        gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
        camera={{ fov: 40 }}
        style={{ pointerEvents: 'auto', zIndex: 10 }}
      >
        <ambientLight intensity={0.7} />
        <spotLight position={[10, 15, 10]} intensity={2} />
        
        <Suspense fallback={<Html center><div className="text-white/20 uppercase tracking-widest text-[10px] font-black">Syncing machine...</div></Html>}>
          <AutoFitModel path={modelPath} />
          <Environment preset="night" />
          <ContactShadows position={[0, -0.01, 0]} opacity={0.6} scale={20} blur={2.5} far={5} />
        </Suspense>

        <OrbitControls enableZoom={false} minPolarAngle={Math.PI / 4} maxPolarAngle={Math.PI / 2.1} makeDefault />
      </Canvas>
    </div>
  );
};

export default BookingCarViewer;
