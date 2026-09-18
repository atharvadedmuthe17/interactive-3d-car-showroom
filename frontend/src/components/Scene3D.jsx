import { Canvas, useThree } from "@react-three/fiber";
import { useGLTF, Environment, ContactShadows, OrbitControls, Float } from "@react-three/drei";
import { Suspense, useRef, useEffect, Component } from "react";
import * as THREE from "three";

const FALLBACK_MODEL = "/models/car.glb";

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, lastModel: props.model };
  }
  static getDerivedStateFromError() { return { hasError: true }; }
  static getDerivedStateFromProps(props, state) {
    if (props.model !== state.lastModel) return { hasError: false, lastModel: props.model };
    return null;
  }
  render() {
    if (this.state.hasError) return <Car model={FALLBACK_MODEL} />;
    return this.props.children;
  }
}

function Car({ model }) {
  const { scene } = useGLTF(model || FALLBACK_MODEL, 'https://www.gstatic.com/draco/versioned/decoders/1.5.5/');
  const { camera, controls } = useThree();
  const groupRef = useRef();

  useEffect(() => {
    if (!scene || !groupRef.current) return;
    
    // 1. Reset
    scene.rotation.set(0, 0, 0);
    scene.position.set(0, 0, 0);
    scene.scale.set(1, 1, 1);

    scene.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        if (child.material) child.material.envMapIntensity = 1.5;
      }
    });

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

    // 4. Dynamic Framing (Closer)
    groupRef.current.updateMatrixWorld();
    const finalBox = new THREE.Box3().setFromObject(groupRef.current);
    const finalSize = finalBox.getSize(new THREE.Vector3());
    const finalCenter = finalBox.getCenter(new THREE.Vector3());
    const finalMaxDim = Math.max(finalSize.x, finalSize.y, finalSize.z);

    const fov = camera.fov * (Math.PI / 180);
    let distance = finalMaxDim / (2 * Math.tan(fov / 2));
    distance *= 0.85;

    camera.position.set(distance * 0.8, targetSize * 0.35, distance * 0.8);
    camera.lookAt(finalCenter);
    camera.near = 0.1;
    camera.far = distance * 20;
    camera.updateProjectionMatrix();

    if (controls) {
      controls.target.copy(finalCenter);
      controls.update();
    }
  }, [scene, model, camera, controls]);

  return (
    <group ref={groupRef}>
      <primitive object={scene} />
    </group>
  );
}

export default function Scene3D({ model = FALLBACK_MODEL }) {
  return (
    <div className="w-full h-full">
      <Canvas
        shadows
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        camera={{ fov: 40 }}
      >
        <Suspense fallback={null}>
          <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.2}>
            <ErrorBoundary model={model}>
              <Car model={model} />
              <ContactShadows position={[0, -0.01, 0]} opacity={0.5} scale={20} blur={3} far={5} />
            </ErrorBoundary>
          </Float>
          <Environment preset="night" />
        </Suspense>
        
        <OrbitControls
          makeDefault
          enableZoom={false}
          enablePan={false}
          autoRotate
          autoRotateSpeed={0.5}
          minPolarAngle={Math.PI / 3}
          maxPolarAngle={Math.PI / 2.1}
        />
      </Canvas>
    </div>
  );
}
