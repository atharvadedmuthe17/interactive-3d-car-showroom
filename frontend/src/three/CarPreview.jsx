import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stage, Center, Environment } from '@react-three/drei';
import CarViewer from '../components/car/CarViewer';

export default function CarPreview({ modelPath, paintColor = "#ffffff" }) {
  return (
    /* Background ko transparent kiya taaki CarDetails ka glow dikhe */
    <div style={{ width: '100%', height: '100%', background: 'transparent' }}>
      <Canvas
        dpr={[1, 2]}
        shadows
        camera={{ position: [0, 2, 5], fov: 35 }} // Camera angle thoda reset kiya centering ke liye
        style={{ background: "transparent" }} 
      >
        <Suspense fallback={null}>
          {/* Stage car ko scale aur lighting khud manage karega */}
          <Stage environment="city" intensity={0.5} contactShadow={{ opacity: 0.7, blur: 2 }}>
            <Center top> 
              <CarViewer 
                modelPath={modelPath} 
                paintColor={paintColor} 
                isInterior={false} 
              />
            </Center>
          </Stage>
          <Environment preset="night" />
        </Suspense>

        {/* OrbitControls ko center par lock kiya hai */}
        <OrbitControls 
  enableZoom={false}          // Zoom disable rakho taaki card look kharab na ho
  enablePan={false}           // Pan bhi disable rakho
  autoRotate={true}           // 🔥 YE HAI FIX: Isse model apne aap ghumne lagega
  autoRotateSpeed={4}         // Rotation ki speed (apne hisaab se adjust karlo)
  makeDefault                 // Orbit settings ko prioritize karne ke liye
/>
      </Canvas>
    </div>
  );
}