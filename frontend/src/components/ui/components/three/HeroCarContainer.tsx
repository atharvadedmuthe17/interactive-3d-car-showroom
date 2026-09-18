import { useRef, Suspense, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html, Sparkles } from '@react-three/drei';
import * as THREE from 'three';


interface Props {
  position: [number, number, number];
}

// =============================================
// LOW-POLY CAR BODY — curved hood, cabin, trunk
// =============================================
function CarBody() {
  const mat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#111111',
    metalness: 0.8,
    roughness: 0.25,
    envMapIntensity: 1.5,
  }), []);

  const bodyGeo = useMemo(() => {
    const shape = new THREE.Shape();
    // Side profile: start at front bumper, go along bottom, up rear, across roof, down windshield, hood
    shape.moveTo(-2.4, 0);      // front bottom
    shape.lineTo(2.4, 0);       // rear bottom
    shape.lineTo(2.4, 0.35);    // rear bumper rise
    shape.lineTo(2.2, 0.5);     // trunk start
    shape.lineTo(1.6, 0.55);    // trunk top
    shape.lineTo(1.2, 0.9);     // rear window base
    shape.lineTo(0.8, 1.15);    // roof rear
    shape.lineTo(-0.4, 1.15);   // roof front
    shape.lineTo(-0.9, 0.85);   // windshield top
    shape.lineTo(-1.3, 0.55);   // hood rear
    shape.lineTo(-2.0, 0.42);   // hood front (curved)
    shape.lineTo(-2.4, 0.35);   // front bumper
    shape.lineTo(-2.4, 0);      // close

    const extrudeSettings = {
      steps: 1,
      depth: 1.7,
      bevelEnabled: true,
      bevelThickness: 0.08,
      bevelSize: 0.06,
      bevelSegments: 2,
    };

    const geo = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    geo.center();
    geo.rotateY(Math.PI / 2); // orient along Z axis (front = +Z)
    return geo;
  }, []);

  return <mesh geometry={bodyGeo} material={mat} position={[0, 0.45, 0]} />;
}

// =============================================
// WHEEL with rim
// =============================================
function Wheel({ position }: { position: [number, number, number] }) {
  const tireMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#111111', roughness: 0.8, metalness: 0.3,
  }), []);
  const rimMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#333333', roughness: 0.15, metalness: 0.9,
  }), []);

  return (
    <group position={position}>
      {/* Tire */}
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.28, 0.28, 0.18, 12]} />
        <primitive object={tireMat} attach="material" />
      </mesh>
      {/* Rim */}
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.18, 0.18, 0.19, 8]} />
        <primitive object={rimMat} attach="material" />
      </mesh>
      {/* Hub cap */}
      <mesh rotation={[0, 0, Math.PI / 2]} position={[0.1, 0, 0]}>
        <circleGeometry args={[0.12, 6]} />
        <meshStandardMaterial color="#444444" metalness={0.95} roughness={0.1} />
      </mesh>
    </group>
  );
}

// =============================================
// VOLUMETRIC LIGHT BEAM
// =============================================
function VolumetricBeam({ position, rotation }: { position: [number, number, number]; rotation?: [number, number, number] }) {
  const meshRef = useRef<THREE.Mesh>(null!);

  const coneGeo = useMemo(() => {
    const geo = new THREE.ConeGeometry(3.5, 16, 16, 1, true);
    geo.translate(0, 8, 0);
    geo.rotateX(-Math.PI / 2);
    return geo;
  }, []);

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.elapsedTime;
    const mat = meshRef.current.material as THREE.MeshBasicMaterial;
    mat.opacity = 0.045 + Math.sin(t * 3.7) * 0.01 + Math.sin(t * 7.3) * 0.006;
  });

  return (
    <mesh ref={meshRef} position={position} rotation={rotation || [0, 0, 0]}>
      <primitive object={coneGeo} attach="geometry" />
      <meshBasicMaterial
        color="#FFD700"
        transparent
        opacity={0.04}
        blending={THREE.AdditiveBlending}
        side={THREE.DoubleSide}
        depthWrite={false}
      />
    </mesh>
  );
}

// =============================================
// HEADLIGHT ASSEMBLY — bulb + point light + beam + halo
// =============================================
function HeadlightAssembly({ side }: { side: number }) {
  const pointRef = useRef<THREE.PointLight>(null!);
  const x = side * 0.7;

  useFrame((state) => {
    if (!pointRef.current) return;
    const t = state.clock.elapsedTime;
    const flicker = 1 + Math.sin(t * 5.3) * 0.05 + Math.sin(t * 11.7) * 0.03;
    pointRef.current.intensity = 8 * flicker;
  });

  return (
    <group>
      {/* Emissive bulb */}
      <mesh position={[x, 0.45, 2.3]}>
        <sphereGeometry args={[0.1, 8, 8]} />
        <meshBasicMaterial color="#FFD700" toneMapped={false} />
      </mesh>

      {/* Inner glow halo */}
      <mesh position={[x, 0.45, 2.35]}>
        <sphereGeometry args={[0.22, 8, 8]} />
        <meshBasicMaterial
          color="#FFD700"
          transparent
          opacity={0.2}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* Outer bloom halo */}
      <mesh position={[x, 0.45, 2.4]}>
        <sphereGeometry args={[0.4, 8, 8]} />
        <meshBasicMaterial
          color="#FFD700"
          transparent
          opacity={0.06}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* Point light for local illumination */}
      <pointLight
        ref={pointRef}
        position={[x, 0.45, 2.5]}
        color="#FFD700"
        intensity={8}
        distance={15}
        decay={2}
      />

      {/* SpotLight for road illumination */}
      <spotLight
        position={[x, 0.45, 2.5]}
        target-position={[x * 2, 0, 18]}
        color="#FFD700"
        intensity={30}
        distance={25}
        angle={Math.PI / 5}
        penumbra={0.8}
        decay={2}
      />

      {/* Volumetric beam cone */}
      <VolumetricBeam position={[x, 0.45, 2.3]} rotation={[0.05, side * 0.03, 0]} />
    </group>
  );
}

// =============================================
// TAIL LIGHT — subtle red glow
// =============================================
function TailLight({ side }: { side: number }) {
  const x = side * 0.7;

  return (
    <group>
      {/* Emissive strip */}
      <mesh position={[x, 0.45, -2.3]}>
        <boxGeometry args={[0.3, 0.06, 0.04]} />
        <meshBasicMaterial color="#ff2a2a" toneMapped={false} />
      </mesh>
      {/* Glow sphere */}
      <mesh position={[x, 0.45, -2.35]}>
        <sphereGeometry args={[0.18, 6, 6]} />
        <meshBasicMaterial
          color="#ff2a2a"
          transparent
          opacity={0.08}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
      {/* Subtle point light */}
      <pointLight
        position={[x, 0.45, -2.4]}
        color="#ff2a2a"
        intensity={1.5}
        distance={5}
        decay={2}
      />
    </group>
  );
}

// =============================================
// HEADLIGHT DUST PARTICLES
// =============================================
function HeadlightDust() {
  const groupRef = useRef<THREE.Group>(null!);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;
    groupRef.current.position.x = Math.sin(t * 0.3) * 0.5;
    groupRef.current.position.z = Math.sin(t * 0.2) * 0.3;
  });

  return (
    <group ref={groupRef}>
      <Sparkles
        count={60}
        scale={[4, 2, 10]}
        size={1.5}
        speed={0.15}
        opacity={0.25}
        color="#FFD700"
        position={[0, 0.5, 6]}
      />
      <Sparkles
        count={30}
        scale={[3, 1.5, 8]}
        size={2}
        speed={0.08}
        opacity={0.12}
        color="#FFFFFF"
        position={[0, 0.3, 5]}
      />
    </group>
  );
}

// =============================================
// HERO CAR CONTAINER — main export
// =============================================
export function HeroCarContainer({ position }: Props) {
  const groupRef = useRef<THREE.Group>(null!);
  const glowRef = useRef<THREE.Mesh>(null!);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;

    // Car visible based on camera Z distance
    const cameraZ = state.camera.position.z;
    const revealStart = -50;
    const revealEnd = -70;
    const carOpacity = THREE.MathUtils.clamp(
      (cameraZ - revealStart) / (revealEnd - revealStart),
      0,
      1
    );
    groupRef.current.visible = carOpacity > 0.01;

    // Idle suspension breathing
    if (groupRef.current.visible) {
      groupRef.current.position.y = position[1] + Math.sin(t * 0.5) * 0.02;
      groupRef.current.position.x = position[0] + Math.sin(t * 0.3) * 0.015;
    }

    // Ground glow pulse
    if (glowRef.current) {
      const mat = glowRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = carOpacity * (0.08 + Math.sin(t * 1.5) * 0.03);
    }
  });

  return (
    <group ref={groupRef} position={position}>
      <Suspense
        fallback={
          <Html center>
            <div style={{
              color: '#FFD700',
              fontSize: '14px',
              fontFamily: 'Space Grotesk, sans-serif',
              letterSpacing: '0.3em',
              textTransform: 'uppercase',
              textShadow: '0 0 20px rgba(255,215,0,0.5)',
            }}>
              Loading...
            </div>
          </Html>
        }
      >
        {/* Car body */}
        <CarBody />

        {/* Wheels: front-left, front-right, rear-left, rear-right */}
        <Wheel position={[-0.75, 0.28, 1.5]} />
        <Wheel position={[0.75, 0.28, 1.5]} />
        <Wheel position={[-0.75, 0.28, -1.5]} />
        <Wheel position={[0.75, 0.28, -1.5]} />

        {/* Wheel arch shadows */}
        {[[-0.75, 1.5], [0.75, 1.5], [-0.75, -1.5], [0.75, -1.5]].map(([x, z], i) => (
          <mesh key={`arch-${i}`} position={[x, 0.28, z]} rotation={[0, 0, Math.PI / 2]}>
            <torusGeometry args={[0.32, 0.04, 4, 8, Math.PI]} />
            <meshStandardMaterial color="#080808" metalness={0.6} roughness={0.4} />
          </mesh>
        ))}

        {/* Headlights */}
        <HeadlightAssembly side={-1} />
        <HeadlightAssembly side={1} />

        {/* Tail lights */}
        <TailLight side={-1} />
        <TailLight side={1} />

        {/* Headlight dust */}
        <HeadlightDust />

        {/* Windshield — dark tinted glass */}
        <mesh position={[0, 0.95, 0.6]} rotation={[0.35, 0, 0]}>
          <planeGeometry args={[1.4, 0.5]} />
          <meshStandardMaterial
            color="#050510"
            metalness={0.3}
            roughness={0.05}
            transparent
            opacity={0.7}
            side={THREE.DoubleSide}
          />
        </mesh>

        {/* Rear window */}
        <mesh position={[0, 0.9, -1.0]} rotation={[-0.4, 0, 0]}>
          <planeGeometry args={[1.3, 0.4]} />
          <meshStandardMaterial
            color="#050510"
            metalness={0.3}
            roughness={0.05}
            transparent
            opacity={0.7}
            side={THREE.DoubleSide}
          />
        </mesh>
      </Suspense>

      {/* Ground glow ring */}
      <mesh ref={glowRef} position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[2.5, 4, 32]} />
        <meshBasicMaterial color="#FFD700" transparent opacity={0.08} toneMapped={false} side={THREE.DoubleSide} />
      </mesh>

      {/* Ground light pool from headlights */}
      <mesh position={[0, 0.02, 6]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[4, 24]} />
        <meshBasicMaterial
          color="#FFD700"
          transparent
          opacity={0.06}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}
