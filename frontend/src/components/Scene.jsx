import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";

function Cube() {
  return (
    <mesh>
      <boxGeometry />
      <meshStandardMaterial color="hotpink" />
    </mesh>
  );
}

export default function Scene() {
  return (
    <Canvas camera={{ position: [2, 2, 5] }}>
      <ambientLight />
      <directionalLight position={[2, 2, 2]} />
      <Cube />
      <OrbitControls />
    </Canvas>
  );
}

