import { useRef, useEffect, Suspense, useMemo, useState } from 'react';
import { Canvas, useFrame, useThree, ThreeEvent } from '@react-three/fiber';
import { Environment, useTexture, Text3D, Center, Text } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import * as THREE from 'three';
import { useNavigate } from 'react-router-dom';

// Auth hook
import { useAuth } from '../../../../context/AuthContext';

import { Mountains } from './Mountains';
import { ForestAmbience } from './ForestAmbience';
import ScrollCars from "./ScrollCars";
import { cars } from "../../../../data/cars";

const SEGMENT_LENGTH = 40;
const NUM_SEGMENTS = 10;
const TOTAL_LENGTH = SEGMENT_LENGTH * NUM_SEGMENTS;

export const scrollState = { 
  progress: 0,
  velocity: 0,
  camZ: 8,
  smoothVel: 0,
  smoothProgress: 0,
  step: 0,
  orbitAngle: 0,
  targetOrbitAngle: 0
};

export function updateScroll(progress: number, velocity: number): void {
  scrollState.progress = progress;
  scrollState.velocity = velocity;
}

function SmoothScrollSystem() {
  useFrame((state, delta: number) => {
    const lerp = 1 - Math.pow(0.001, delta);
    scrollState.smoothProgress = THREE.MathUtils.lerp(
      scrollState.smoothProgress,
      scrollState.progress,
      lerp
    );
    scrollState.smoothVel = THREE.MathUtils.lerp(
      scrollState.smoothVel,
      scrollState.velocity,
      lerp
    );
  });
  return null;
}

function StepScrollController() {
  const cooldown = useRef<boolean>(false);
  
  useEffect(() => {
    const onWheel = (e: WheelEvent) => {
      if (cooldown.current) return;
      if (Math.abs(e.deltaY) < 10) return;
      
      cooldown.current = true;
      
      if (e.deltaY > 0) {
        scrollState.step += 1;
      } else {
        scrollState.step -= 1;
      }
      
      if (scrollState.step < 0) scrollState.step = 0;
      
      setTimeout(() => {
        cooldown.current = false;
      }, 600);
    };
    
    window.addEventListener("wheel", onWheel);
    return () => window.removeEventListener("wheel", onWheel);
  }, []);
  
  return null;
}

// 360 Drag Interaction for Stage 1 (Side View)
function OrbitInteraction() {
  useEffect(() => {
    let isDragging = false;
    let previousX = 0;

    const onPointerDown = (e: PointerEvent) => {
      isDragging = true;
      previousX = e.clientX;
    };
    
    const onPointerMove = (e: PointerEvent) => {
      if (isDragging) {
        const deltaX = e.clientX - previousX;
        // Only allow orbiting when in Stage 1 (Side View)
        if (scrollState.step % 3 === 1) {
          scrollState.targetOrbitAngle += deltaX * 0.008; // Orbit speed
        }
        previousX = e.clientX;
      }
    };
    
    const onPointerUp = () => {
      isDragging = false;
    };

    window.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);

    return () => {
      window.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
    };
  }, []);

  return null;
}

// =============================================
// DYNAMIC CAR LIGHTING
// =============================================
function DynamicCarLighting() {
  const lightGroupRef = useRef<THREE.Group>(null!);
  
  useFrame(() => {
    if (!lightGroupRef.current) return;
    const step = scrollState.step;
    const carIndexFromStep = Math.floor(step / 3);
    const targetZ = -carIndexFromStep * 35;
    
    lightGroupRef.current.position.z = THREE.MathUtils.lerp(
      lightGroupRef.current.position.z,
      targetZ,
      0.1
    );
  });

  return (
    <group ref={lightGroupRef}>
      <pointLight position={[0, 4, 2]} distance={15} intensity={8} color="#38bdf8" />
      <pointLight position={[0, 0.5, 3]} distance={8} intensity={4} color="#ef4444" />
    </group>
  );
}

// =============================================
// EPIC NIGHT ENVIRONMENT
// =============================================
function EpicMoon() {
  const moonGroupRef = useRef<THREE.Group>(null!);
  const { camera } = useThree();
  const texture = useTexture("/moon_1024.jpg");

  useFrame((state) => {
    moonGroupRef.current.position.x = camera.position.x;
    moonGroupRef.current.position.y = camera.position.y + 45 + Math.sin(state.clock.elapsedTime * 0.5) * 2;
    moonGroupRef.current.position.z = camera.position.z - 180;
  });

  return (
    <group ref={moonGroupRef}>
      <mesh>
        <sphereGeometry args={[8, 64, 64]} />
        <meshBasicMaterial map={texture} color="#ffffff" toneMapped={false} />
      </mesh>
      <mesh>
        <sphereGeometry args={[8.6, 32, 32]} />
        <meshBasicMaterial color="#fef08a" transparent opacity={0.15} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      <mesh>
        <sphereGeometry args={[14, 32, 32]} />
        <meshBasicMaterial color="#38bdf8" transparent opacity={0.06} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      <directionalLight color="#e0f2fe" intensity={0.3} position={[0, 10, 10]} />
    </group>
  );
}

function CinematicStars() {
  const pointsRef = useRef<THREE.Points>(null!);
  const starCount = 800;

  const starGeometry = useMemo(() => {
    const positions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 600;      
      positions[i+1] = Math.random() * 200 + 10;       
      positions[i+2] = (Math.random() - 0.5) * 600;    
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return geometry;
  }, []);

  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = state.clock.elapsedTime * 0.005;
    }
  });

  return (
    <points ref={pointsRef} geometry={starGeometry}>
      <pointsMaterial size={0.7} color="#ffffff" transparent opacity={0.8} sizeAttenuation={true} blending={THREE.AdditiveBlending} depthWrite={false} />
    </points>
  );
}

function HorizonCityGlow() {
  const { camera } = useThree();
  const glowRef = useRef<THREE.Mesh>(null!);
  
  useFrame(() => {
    glowRef.current.position.z = camera.position.z - 200;
    glowRef.current.position.x = camera.position.x;
  });

  return (
    <mesh ref={glowRef} position={[0, 0, -200]}>
      <planeGeometry args={[800, 150]} />
      <meshBasicMaterial color="#0c1d36" transparent opacity={0.5} blending={THREE.AdditiveBlending} depthWrite={false} />
    </mesh>
  );
}

// =============================================
// CITY SKYLINE COMPONENTS
// =============================================
interface BuildingData {
  x: number;
  z: number;
  w: number;
  h: number;
}

function CitySkyline() {
  const skylineRef = useRef<THREE.Group>(null!);
  
  const buildings = useMemo<BuildingData[]>(() => {
    return Array.from({ length: 80 }).map(() => {
      const side = Math.random() > 0.5 ? 1 : -1;
      return {
        x: (14 + Math.random() * 30) * side,
        z: -(Math.random() * 600),
        w: 6 + Math.random() * 8,
        h: 25 + Math.random() * 80
      };
    });
  }, []);

  useFrame(() => {
    if (!skylineRef.current) return;
    const camZ = scrollState.camZ;
    skylineRef.current.position.z = Math.floor(camZ / 600) * 600;
  });

  return (
    <group ref={skylineRef}>
      <SkylineLayer buildings={buildings} offset={0} />
      <SkylineLayer buildings={buildings} offset={-600} />
      <SkylineLayer buildings={buildings} offset={600} />
    </group>
  );
}

interface SkylineLayerProps {
  buildings: BuildingData[];
  offset: number;
}

function SkylineLayer({ buildings, offset }: SkylineLayerProps) {
  return (
    <group position={[0, 0, offset]}>
      {buildings.map((b, i) => (
        <SkylineBuilding key={i} x={b.x} z={b.z} w={b.w} h={b.h} />
      ))}
    </group>
  );
}

function SkylineBuilding({ x, z, w, h }: BuildingData) {
  const depth = useMemo(() => 4 + Math.random() * 6, []);
  const rows = Math.floor(h / 2);
  const cols = Math.floor(w * 2);

  const bldgColor = useMemo(() => {
    const colors = ['#050b14', '#071226', '#0a0f1c', '#09101c', '#020617'];
    return colors[Math.floor(Math.random() * colors.length)];
  }, []);

  const windows = useMemo(() => {
    const list: { x: number; y: number; z: number }[] = [];
    for (let y = 0; y < rows; y++) {
      if (Math.random() > 0.75) continue; 
      
      for (let winX = 0; winX < cols; winX++) {
        if (Math.random() > 0.60) continue; 
        
        list.push({
          x: (winX - cols / 2) * 0.5,
          y: (y - rows / 2),
          z: depth / 2 + 0.05
        });
      }
    }
    return list;
  }, [rows, cols, depth]);

  const doors = useMemo(() => {
    const arr: { x: number; y: number; z: number; isOpen: boolean; color: string }[] = [];
    const numDoors = 1 + Math.floor(Math.random() * 3);
    for (let i = 0; i < numDoors; i++) {
      const isOpen = Math.random() > 0.4;
      const xPos = (i - numDoors / 2) * 2 + 1;
      if (Math.abs(xPos) > w / 2 - 0.8) continue;
      arr.push({
        x: xPos,
        y: -h / 2 + 1,
        z: depth / 2 + 0.06,
        isOpen,
        color: isOpen ? ['#fef08a', '#38bdf8', '#ffedd5', '#a7f3d0'][Math.floor(Math.random() * 4)] : '#020617'
      });
    }
    return arr;
  }, [w, h, depth]);

  const roofFeature = useMemo(() => {
    const type = Math.floor(Math.random() * 4);
    const offset = (Math.random() * (w / 2 - 1)) * (Math.random() > 0.5 ? 1 : -1);
    return { type, offset };
  }, [w]);

  const windowGeometry = useMemo(() => new THREE.PlaneGeometry(0.35, 0.45), []);
  const windowMaterial = useMemo(() => new THREE.MeshBasicMaterial({ toneMapped: false, transparent: true, opacity: 0.9 }), []);

  const instancedMeshRef = useRef<THREE.InstancedMesh>(null!);

  useEffect(() => {
    if (!instancedMeshRef.current || windows.length === 0) return;
    
    const dummy = new THREE.Object3D();
    const tempColor = new THREE.Color();
    const windowColors = ['#e0f2fe', '#fef08a', '#38bdf8', '#fdba74', '#1e3a8a'];

    windows.forEach((win, i) => {
      dummy.position.set(win.x, win.y, win.z);
      dummy.updateMatrix();
      instancedMeshRef.current.setMatrixAt(i, dummy.matrix);
      tempColor.set(windowColors[Math.floor(Math.random() * windowColors.length)]);
      instancedMeshRef.current.setColorAt(i, tempColor);
    });
    
    instancedMeshRef.current.instanceMatrix.needsUpdate = true;
    if (instancedMeshRef.current.instanceColor) {
      instancedMeshRef.current.instanceColor.needsUpdate = true;
    }
    
    if (instancedMeshRef.current.geometry) {
      instancedMeshRef.current.computeBoundingSphere();
    }
  }, [windows]);

  return (
    <group position={[x, h / 2, z]}>
      <mesh>
        <boxGeometry args={[w, h, depth]} />
        <meshStandardMaterial color={bldgColor} roughness={0.9} metalness={0.2} />
      </mesh>

      {doors.map((door, idx) => (
        <group key={`door-${idx}`} position={[door.x, door.y, door.z]}>
          <mesh>
             <planeGeometry args={[1.2, 2]} />
             {door.isOpen ? (
               <meshBasicMaterial color={door.color} toneMapped={false} />
             ) : (
               <meshStandardMaterial color={door.color} roughness={0.8} />
             )}
          </mesh>
          <mesh position={[0, 1.1, 0.2]}>
             <boxGeometry args={[1.4, 0.1, 0.4]} />
             <meshStandardMaterial color="#1e293b" roughness={0.9} />
          </mesh>
        </group>
      ))}

      {windows.length > 0 && (
        <instancedMesh 
          ref={instancedMeshRef} 
          args={[windowGeometry, windowMaterial, windows.length]}
          frustumCulled={false} 
        />
      )}

      <group position={[0, h / 2, 0]}>
        <mesh position={[0, 0.25, 0]}>
          <boxGeometry args={[w, 0.5, depth]} />
          <meshStandardMaterial color={bldgColor} roughness={1} />
        </mesh>
        
        {roofFeature.type === 1 && (
          <mesh position={[roofFeature.offset, 1.5, 0]}>
            <boxGeometry args={[2, 2, 2]} />
            <meshStandardMaterial color="#1e293b" roughness={0.7} />
          </mesh>
        )}
        {roofFeature.type === 2 && (
          <mesh position={[roofFeature.offset, 3, 0]}>
            <cylinderGeometry args={[0.02, 0.1, 6]} />
            <meshBasicMaterial color="#ef4444" toneMapped={false} />
          </mesh>
        )}
        {roofFeature.type === 3 && (
          <mesh position={[0, 1.5, 0]}>
            <boxGeometry args={[w - 2, 2, 0.5]} />
            <meshStandardMaterial color="#0f172a" roughness={0.9} />
          </mesh>
        )}
      </group>
    </group>
  );
}

// =============================================
// FOOTPATH PROPS (CAT, TRASH, PAPERS)
// =============================================
interface LowPolyCatProps {
  position: [number, number, number];
  side: number;
}

function LowPolyCat({ position, side }: LowPolyCatProps) {
  return (
    <group position={position} rotation={[0, side === 1 ? -Math.PI / 2 : Math.PI / 2, 0]}>
      <mesh position={[0, 0.15, 0]} castShadow>
        <boxGeometry args={[0.3, 0.2, 0.15]} />
        <meshStandardMaterial color="#020617" roughness={1} />
      </mesh>
      <mesh position={[0.15, 0.3, 0]} castShadow>
        <boxGeometry args={[0.15, 0.15, 0.15]} />
        <meshStandardMaterial color="#020617" roughness={1} />
      </mesh>
      <mesh position={[0.15, 0.4, 0.04]}>
        <coneGeometry args={[0.03, 0.08, 4]} />
        <meshStandardMaterial color="#020617" roughness={1} />
      </mesh>
      <mesh position={[0.15, 0.4, -0.04]}>
        <coneGeometry args={[0.03, 0.08, 4]} />
        <meshStandardMaterial color="#020617" roughness={1} />
      </mesh>
      <mesh position={[-0.15, 0.2, 0]} rotation={[0, 0, -Math.PI / 4]}>
         <cylinderGeometry args={[0.015, 0.015, 0.25]} />
         <meshStandardMaterial color="#020617" roughness={1} />
      </mesh>
    </group>
  );
}

// =============================================
// ROAD & LIGHTS
// =============================================
interface RoadSegmentProps {
  index: number;
}

function RoadSegment({ index }: RoadSegmentProps) {
  const groupRef = useRef<THREE.Group>(null!);
  
  useFrame(() => {
    if (!groupRef.current) return;
    const camZ = scrollState.camZ;
    let baseZ = -index * SEGMENT_LENGTH;
    while (baseZ > camZ + SEGMENT_LENGTH) baseZ -= TOTAL_LENGTH;
    while (baseZ < camZ - TOTAL_LENGTH + SEGMENT_LENGTH) baseZ += TOTAL_LENGTH;
    groupRef.current.position.z = baseZ;
  });

  const footpathProps = useMemo(() => {
    const props: { type: 'bin' | 'paper' | 'cat'; side: number; z: number; rot?: number }[] = [];
    const numBins = 1 + Math.floor(Math.random() * 2);
    for (let i = 0; i < numBins; i++) {
      props.push({ type: 'bin', side: Math.random() > 0.5 ? 1 : -1, z: -Math.random() * SEGMENT_LENGTH });
    }
    for (let i = 0; i < 6; i++) {
      props.push({ type: 'paper', side: Math.random() > 0.5 ? 1 : -1, z: -Math.random() * SEGMENT_LENGTH, rot: Math.random() * Math.PI });
    }
    if (Math.random() > 0.8) {
      props.push({ type: 'cat', side: Math.random() > 0.5 ? 1 : -1, z: -Math.random() * SEGMENT_LENGTH });
    }
    return props;
  }, []);

  return (
    <group ref={groupRef}>
      <mesh position={[0, -0.01, -SEGMENT_LENGTH / 2]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[8, SEGMENT_LENGTH]} />
        <meshStandardMaterial color="#0f172a" roughness={0.95} metalness={0} />
      </mesh>
      
      {[-9, 9].map((x, i) => (
        <mesh key={`footpath-${i}`} position={[x, 0.02, -SEGMENT_LENGTH / 2]} receiveShadow>
          <boxGeometry args={[10, 0.05, SEGMENT_LENGTH]} />
          <meshStandardMaterial color="#2d3748" roughness={0.9} metalness={0.1} />
        </mesh>
      ))}

      {[-9, 9].map((x, sideIdx) => (
        <group key={`joints-${sideIdx}`}>
          {Array.from({ length: 8 }).map((_, i) => (
            <mesh key={`joint-${i}`} position={[x, 0.021, -i * 5]} receiveShadow>
              <boxGeometry args={[10, 0.051, 0.05]} />
              <meshStandardMaterial color="#1a202c" roughness={1} />
            </mesh>
          ))}
        </group>
      ))}

      {[-4.1, 4.1].map((x, i) => (
        <mesh key={`curb-${i}`} position={[x, 0.06, -SEGMENT_LENGTH / 2]} receiveShadow>
          <boxGeometry args={[0.3, 0.15, SEGMENT_LENGTH]} />
          <meshStandardMaterial color="#4a5568" roughness={0.8} />
        </mesh>
      ))}

      {[-4.3, 4.3].map((x, i) => (
        <mesh key={`paint-${i}`} position={[x, 0.046, -SEGMENT_LENGTH / 2]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.05, SEGMENT_LENGTH]} />
          <meshStandardMaterial color="#eab308" roughness={0.5} emissive="#eab308" emissiveIntensity={0.2} toneMapped={false} />
        </mesh>
      ))}

      {[-3.9, 3.9].map((x, i) => (
        <mesh key={i} position={[x, 0.001, -SEGMENT_LENGTH / 2]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.1, SEGMENT_LENGTH]} />
          <meshStandardMaterial color="#ffffff" opacity={0.8} transparent />
        </mesh>
      ))}

      {Array.from({ length: 6 }).map((_, i) => (
        <mesh key={i} position={[0, 0.002, -(i * 7) - 2]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.08, 3]} />
          <meshStandardMaterial color="#FFD700" emissive="#FFD700" emissiveIntensity={2} />
        </mesh>
      ))}

      {Array.from({ length: 4 }).map((_, i) => (
        <group key={i}>
          {[-4, 4].map((x) => (
            <mesh key={x} position={[x, 0.05, -(i * 10) - 5]}>
              <boxGeometry args={[0.05, 0.05, 0.05]} />
              <meshStandardMaterial color="#ffe082" emissive="#ffd54f" emissiveIntensity={2} toneMapped={false} />
            </mesh>
          ))}
        </group>
      ))}

      {footpathProps.map((prop, idx) => {
        if (prop.type === 'bin') {
          return (
            <mesh key={`prop-${idx}`} position={[prop.side * (4.5 + Math.random()), 0.3, prop.z]}>
              <cylinderGeometry args={[0.2, 0.15, 0.5, 8]} />
              <meshStandardMaterial color="#475569" roughness={0.8} />
            </mesh>
          );
        } else if (prop.type === 'paper') {
          return (
            <mesh key={`prop-${idx}`} position={[prop.side * (4.5 + Math.random() * 3), 0.05, prop.z]} rotation={[-Math.PI / 2, 0, prop.rot ?? 0]}>
              <planeGeometry args={[0.3, 0.4]} />
              <meshStandardMaterial color="#e2e8f0" roughness={0.9} />
            </mesh>
          );
        } else if (prop.type === 'cat') {
          return <LowPolyCat key={`prop-${idx}`} position={[prop.side * (4.8 + Math.random()), 0.05, prop.z]} side={prop.side} />;
        }
        return null;
      })}
    </group>
  );
}

interface StreetLightSegmentProps {
  index: number;
}

function StreetLightSegment({ index }: StreetLightSegmentProps) {
  const groupRef = useRef<THREE.Group>(null!);
  const side = index % 2 === 0 ? -1 : 1;
  const POLE_H = 7;

  useFrame(() => {
    if (!groupRef.current) return;
    const camZ = scrollState.camZ;
    let baseZ = -index * SEGMENT_LENGTH;
    while (baseZ > camZ + SEGMENT_LENGTH) baseZ -= TOTAL_LENGTH;
    while (baseZ < camZ - TOTAL_LENGTH + SEGMENT_LENGTH) baseZ += TOTAL_LENGTH;
    groupRef.current.position.z = baseZ;
  });

  return (
    <group ref={groupRef}>
      <mesh position={[side * 6, POLE_H / 2, -SEGMENT_LENGTH / 2]}>
        <cylinderGeometry args={[0.05, 0.1, POLE_H]} />
        <meshStandardMaterial color="#111" />
      </mesh>
      <mesh position={[side * 5.2, POLE_H, -SEGMENT_LENGTH / 2]}>
        <boxGeometry args={[1.5, 0.2, 0.5]} />
        <meshStandardMaterial color="#222" />
      </mesh>
      <mesh position={[side * 5, POLE_H - 0.15, -SEGMENT_LENGTH / 2]}>
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshStandardMaterial color="#FFD700" emissive="#FFD700" emissiveIntensity={5} toneMapped={false} />
      </mesh>
    </group>
  );
}

// =============================================
// SCROLL WATCHER & CAMERA
// =============================================
interface ScrollWatcherProps {
  setCurrentCar: (v: number) => void;
  setViewMode: (v: "preview" | "detail") => void;
}

function ScrollWatcher({ setCurrentCar, setViewMode }: ScrollWatcherProps) {
  const lastCarRef = useRef<number>(0);

  useFrame(() => {
    const activeCarIndex = Math.min(
      Math.floor(scrollState.step / 3),
      cars.length - 1
    );
    
    if (lastCarRef.current !== activeCarIndex) {
      lastCarRef.current = activeCarIndex;
      setCurrentCar(activeCarIndex);
    }
    
    if (scrollState.velocity !== 0) {
      setViewMode("preview");
    }
  });
  return null;
}

interface CinematicCameraProps {
  viewMode: "preview" | "detail";
  carIndex: number;
}

function CinematicCamera({ viewMode, carIndex }: CinematicCameraProps) {
  const { camera } = useThree();
  const smoothPos = useRef<THREE.Vector3>(new THREE.Vector3());
  const smoothTarget = useRef<THREE.Vector3>(new THREE.Vector3());

  useEffect(() => {
    smoothPos.current.set(0, 2.5, 8);
    smoothTarget.current.set(0, 1.0, -2);
    camera.position.copy(smoothPos.current);
    camera.lookAt(smoothTarget.current);
  }, [camera]);

  useFrame((state, delta: number) => {
    const lerp = 1 - Math.pow(0.00001, delta);
    
    scrollState.orbitAngle = THREE.MathUtils.lerp(scrollState.orbitAngle, scrollState.targetOrbitAngle, 0.1);
    
    const step = scrollState.step;
    const stage = step % 3;
    const carIndexFromStep = Math.floor(step / 3);
    const carZ = -carIndexFromStep * 35;

    const pos = new THREE.Vector3();
    const look = new THREE.Vector3();

    if (stage === 0) {
      scrollState.targetOrbitAngle = 0; 
      pos.set(0, 2.2, carZ + 7.5);
      look.set(0, 0.9, carZ - 3);
    } else if (stage === 1) {
      const radius = 8.5;
      pos.set(Math.cos(scrollState.orbitAngle) * radius, 1.2, carZ + Math.sin(scrollState.orbitAngle) * radius);
      look.set(0, 0.8, carZ);
    } else {
      scrollState.targetOrbitAngle = 0; 
      pos.set(3.2, 1.3, carZ + 1.8);
      look.set(0, 1.0, carZ - 0.8);
    }

    smoothPos.current.lerp(pos, lerp);
    smoothTarget.current.lerp(look, lerp);
    
    scrollState.camZ = smoothPos.current.z;

    camera.position.copy(smoothPos.current);
    camera.lookAt(smoothTarget.current);
  });
  
  return null;
}

// =============================================
// CYBER PARTICLES (Ambient Effect)
// =============================================
function CyberParticles() {
  const count = 300;
  const pointsRef = useRef<THREE.Points>(null!);
  
  const positions = useMemo(() => new Float32Array(count * 3), [count]);
  const speeds = useMemo(() => new Float32Array(count), [count]);

  useEffect(() => {
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 30;     
      positions[i * 3 + 1] = Math.random() * 8;          
      positions[i * 3 + 2] = (Math.random() - 0.5) * 30; 
      speeds[i] = 0.005 + Math.random() * 0.015;
    }
    if (pointsRef.current) {
        pointsRef.current.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    }
  }, [count, positions, speeds]);

  useFrame(() => {
    if (!pointsRef.current) return;
    const positionsAtt = pointsRef.current.geometry.attributes.position as THREE.BufferAttribute;
    
    const carZ = -Math.floor(scrollState.step / 3) * 35; 

    for (let i = 0; i < count; i++) {
      let y = positionsAtt.getY(i);
      y += speeds[i];
      if (y > 8) y = 0;
      positionsAtt.setY(i, y);
    }
    
    positionsAtt.needsUpdate = true;
    pointsRef.current.position.z = THREE.MathUtils.lerp(pointsRef.current.position.z, carZ, 0.05);
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry />
      <pointsMaterial size={0.08} color="#38bdf8" transparent opacity={0.6} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
    </points>
  );
}

// =============================================
// FUTURISTIC 3D SHOWCASE UI COMPONENTS
// =============================================
interface CarData {
  id?: string | number; 
  slug?: string;
  name?: string;
  price?: number | string;
  model?: string;
  description?: string;
  speed?: string;
  accel?: string;
  hp?: string;
  range?: string;
  drivetrain?: string;
  battery?: string;
}

interface Futuristic3DUIProps {
  currentCar: number;
  navigate: ReturnType<typeof useNavigate>;
}

interface HologramButtonProps {
  position: [number, number, number];
  text: string;
  primary?: boolean;
  onClick: () => void;
}

function HologramButton({ position, text, primary, onClick }: HologramButtonProps) {
  const meshRef = useRef<THREE.Mesh>(null!);
  const [hovered, setHovered] = useState(false);

  useFrame(() => {
    const targetScale = hovered ? 1.08 : 1;
    meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.15);
  });

  return (
    <group position={position}>
      <mesh 
        ref={meshRef}
        onPointerDown={(e: ThreeEvent<PointerEvent>) => { 
          e.stopPropagation(); 
          onClick(); 
        }}
        onPointerOver={(e: ThreeEvent<PointerEvent>) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = 'pointer'; }}
        onPointerOut={(e: ThreeEvent<PointerEvent>) => { e.stopPropagation(); setHovered(false); document.body.style.cursor = 'auto'; }}
        renderOrder={999}
      >
        <boxGeometry args={[0.75, 0.18, 0.04]} />
        <meshBasicMaterial 
          color={primary ? "#0ea5e9" : "#0f172a"} 
          transparent 
          opacity={hovered ? 0.9 : 0.6} 
          toneMapped={false} 
          blending={THREE.NormalBlending}
          depthTest={false}
        />
        
        <mesh renderOrder={999}>
           <boxGeometry args={[0.79, 0.21, 0.02]} />
           <meshBasicMaterial 
              color={primary ? "#38bdf8" : "#38bdf8"} 
              transparent 
              opacity={hovered ? 0.8 : 0.2} 
              wireframe 
              blending={THREE.AdditiveBlending} 
              toneMapped={false}
              depthTest={false}
           />
        </mesh>
        
        <Text position={[0, 0, 0.03]} fontSize={0.06} letterSpacing={0.1} renderOrder={1000}>
          {text}
          <meshBasicMaterial color={primary ? "#ffffff" : "#38bdf8"} toneMapped={false} depthTest={false} transparent />
        </Text>
      </mesh>
    </group>
  );
}

// =============================================
// GLOBAL PERSISTENT HUD (Login & Avatar)
// =============================================
function SmallHologramButton({ position, text, primary, onClick }: HologramButtonProps) {
  const meshRef = useRef<THREE.Mesh>(null!);
  const [hovered, setHovered] = useState(false);

  useFrame(() => {
    const targetScale = hovered ? 1.1 : 1;
    meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.15);
  });

  return (
    <group position={position}>
      <mesh 
        ref={meshRef}
        onPointerDown={(e: ThreeEvent<PointerEvent>) => { 
          e.stopPropagation(); 
          onClick(); 
        }}
        onPointerOver={(e: ThreeEvent<PointerEvent>) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = 'pointer'; }}
        onPointerOut={(e: ThreeEvent<PointerEvent>) => { e.stopPropagation(); setHovered(false); document.body.style.cursor = 'auto'; }}
      >
        <boxGeometry args={[0.7, 0.18, 0.02]} />
        <meshBasicMaterial 
          color={primary ? "#38bdf8" : "#0f172a"} 
          transparent 
          opacity={hovered ? 0.9 : 0.6} 
          toneMapped={false} 
          blending={THREE.NormalBlending}
        />
        
        <mesh>
           <boxGeometry args={[0.74, 0.21, 0.01]} />
           <meshBasicMaterial 
              color={primary ? "#ffffff" : "#38bdf8"} 
              transparent 
              opacity={hovered ? 0.8 : 0.3} 
              wireframe 
              blending={THREE.AdditiveBlending} 
              toneMapped={false}
           />
        </mesh>
        
        <Text position={[0, 0, 0.02]} fontSize={0.06} color={primary ? "#020617" : "#38bdf8"} letterSpacing={0.1} fontWeight={900}>
          {text}
        </Text>
      </mesh>
    </group>
  );
}

function AvatarHologramButton({ position, onClick }: { position: [number, number, number], onClick: () => void }) {
  const groupRef = useRef<THREE.Group>(null!);
  const [hovered, setHovered] = useState(false);
  
  const { gl } = useThree();
  const { user } = useAuth();
  const profileTexture = user?.profile_pic ? useTexture(user.profile_pic) : null;

  useEffect(() => {
    if (profileTexture && profileTexture.image) {
      profileTexture.colorSpace = THREE.SRGBColorSpace;
      profileTexture.anisotropy = gl.capabilities.getMaxAnisotropy();
      profileTexture.minFilter = THREE.LinearMipmapLinearFilter;
      profileTexture.magFilter = THREE.LinearFilter;
      
      const aspect = profileTexture.image.width / profileTexture.image.height;
      if (aspect > 1) {
        profileTexture.repeat.set(1 / aspect, 1);
        profileTexture.offset.set((1 - 1 / aspect) / 2, 0);
      } else {
        profileTexture.repeat.set(1, aspect);
        profileTexture.offset.set(0, (1 - aspect) / 2);
      }
      
      profileTexture.needsUpdate = true;
    }
  }, [profileTexture, gl]);

  useFrame((state) => {
    const baseScale = hovered ? 1.1 : 1.0;
    const pulse = Math.sin(state.clock.elapsedTime * 3) * 0.03;
    const targetScale = baseScale + pulse;
    groupRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.15);
  });

  return (
    <group 
      ref={groupRef} 
      position={position}
      onPointerDown={(e: ThreeEvent<PointerEvent>) => { 
        e.stopPropagation(); 
        onClick(); 
      }}
      onPointerOver={(e: ThreeEvent<PointerEvent>) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = 'pointer'; }}
      onPointerOut={(e: ThreeEvent<PointerEvent>) => { e.stopPropagation(); setHovered(false); document.body.style.cursor = 'auto'; }}
    >
      <mesh position={[0, 0, 0]} renderOrder={999}>
        <circleGeometry args={[0.13, 64]} />
        {profileTexture ? (
          <meshBasicMaterial map={profileTexture} color={[1.3, 1.3, 1.3]} transparent={false} toneMapped={false} depthTest={false} />
        ) : (
          <meshBasicMaterial color="#0f172a" transparent opacity={0.9} toneMapped={false} depthTest={false} />
        )}
      </mesh>
      
      <mesh position={[0, 0, 0.01]} renderOrder={1000}>
        <ringGeometry args={[0.13, 0.16, 64]} />
        <meshBasicMaterial 
           color="#38bdf8" 
           transparent 
           opacity={hovered ? 1 : 0.6} 
           blending={THREE.AdditiveBlending} 
           toneMapped={false} 
           depthTest={false}
        />
      </mesh>

      {!profileTexture && (
        <Text position={[0, -0.015, 0.02]} fontSize={0.12} fontWeight="bold" renderOrder={1001}>
          {user?.name?.charAt(0).toUpperCase() || "U"}
          <meshBasicMaterial color={hovered ? "#ffffff" : "#38bdf8"} toneMapped={false} depthTest={false} transparent />
        </Text>
      )}
    </group>
  );
}

function GlobalHUD({ navigate }: { navigate: ReturnType<typeof useNavigate> }) {
  const groupRef = useRef<THREE.Group>(null!);
  
  const { user } = useAuth();

  useFrame((state) => {
    if (!groupRef.current) return;
    
    const camera = state.camera as THREE.PerspectiveCamera;
    const dist = 4; 
    
    const vFov = THREE.MathUtils.degToRad(camera.fov);
    const vHeight = 2 * Math.tan(vFov / 2) * dist;
    const vWidth = vHeight * camera.aspect;

    const xOffset = (vWidth / 2) - 0.8; 
    const yOffset = (vHeight / 2) - 0.5;
    
    const offset = new THREE.Vector3(xOffset, yOffset, -dist);
    offset.y += Math.sin(state.clock.elapsedTime * 2) * 0.03;
    
    offset.applyQuaternion(camera.quaternion);
    
    groupRef.current.position.copy(camera.position).add(offset);
    groupRef.current.quaternion.copy(camera.quaternion);
  });

  return (
    <group ref={groupRef}>
       {user ? (
         <AvatarHologramButton position={[0, 0, 0]} onClick={() => navigate('/profile')} />
       ) : (
         <SmallHologramButton position={[0, 0, 0]} text="LOGIN" primary onClick={() => navigate('/login')} />
       )}
    </group>
  );
}

// =============================================
// MAIN CAR SHOWCASE UI
// =============================================
function Floating3DTitle({ currentCar }: { currentCar: number }) {
  const groupRef = useRef<THREE.Group>(null!);
  const car = cars[currentCar] as CarData | undefined;

  useFrame((state) => {
    if (!groupRef.current) return;
    
    const activeCarIndex = Math.floor(scrollState.step / 3);
    const carZ = -activeCarIndex * 35;
    const stage = scrollState.step % 3;
    
    const targetY = 2.0; 
    const targetX = -0.6; 
    const targetPos = new THREE.Vector3(targetX, targetY + Math.sin(state.clock.elapsedTime * 1.5) * 0.05, carZ + 1.2);
    
    groupRef.current.position.lerp(targetPos, 0.08);
    groupRef.current.lookAt(state.camera.position);

    const isOutOfBounds = activeCarIndex >= cars.length;
    const targetScale = (stage === 2 && !isOutOfBounds) ? 1 : 0;
    
    groupRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.08);

    if (groupRef.current.scale.x < 0.01 && targetScale === 0) {
       groupRef.current.visible = false;
    } else {
       groupRef.current.visible = true;
    }
  });

  return (
    <group ref={groupRef} position={[-0.6, 2.0, 0]} scale={0}>
      <Center>
        <Text3D 
          font="https://cdn.jsdelivr.net/npm/three/examples/fonts/helvetiker_bold.typeface.json"
          size={0.18} 
          height={0.01} 
          curveSegments={4}
          bevelEnabled
          bevelThickness={0.002}
          bevelSize={0.001}
          bevelSegments={1}
        >
          {car?.name || "SPECTRE"}
          <meshStandardMaterial color="#38bdf8" emissive="#38bdf8" emissiveIntensity={2.5} toneMapped={false} depthTest={false} transparent />
        </Text3D>
      </Center>
      <Center position={[0, -0.22, 0]}>
        <Text3D 
          font="https://cdn.jsdelivr.net/npm/three/examples/fonts/helvetiker_bold.typeface.json"
          size={0.06} 
          height={0.005} 
          curveSegments={4}
        >
          {car?.model || "PREMIUM EDITION"}
          <meshStandardMaterial color="#fef08a" emissive="#fef08a" emissiveIntensity={1.5} toneMapped={false} depthTest={false} transparent />
        </Text3D>
      </Center>
    </group>
  );
}

function InteractiveHologramPanel({ currentCar, navigate }: Futuristic3DUIProps) {
  const groupRef = useRef<THREE.Group>(null!);
  const detailsRef = useRef<THREE.Group>(null!);
  const [showDetails, setShowDetails] = useState(false);
  const car = cars[currentCar] as CarData | undefined;

  const specs = useMemo(() => [
    { label: "TOP SPEED", value: car?.speed || "320 KM/H" },
    { label: "0-100 RAFTAR", value: car?.accel || "2.1 SEC" },
    { label: "TAAQAT (HP)", value: car?.hp || "1020 HP" },
    { label: "MAX RANGE", value: car?.range || "650 KM" },
    { label: "DRIVETRAIN", value: car?.drivetrain || "AWD Dual" },
    { label: "BATTERY", value: car?.battery || "120 kWh" },
  ], [car]);

  useFrame((state) => {
    if (!groupRef.current) return;
    
    const step = scrollState.step;
    const stage = step % 3;
    const activeCarIndex = Math.floor(step / 3);
    
    const isOutOfBounds = activeCarIndex >= cars.length;
    const isActive = stage === 2 && !isOutOfBounds;
    
    const carZ = -activeCarIndex * 35;
    
    const targetY = 1.3; 
    const targetX = -0.6;
    const targetPos = new THREE.Vector3(targetX, targetY + Math.sin(state.clock.elapsedTime * 1.2) * 0.05, carZ + 1.2);

    groupRef.current.position.lerp(targetPos, 0.08); 
    groupRef.current.lookAt(state.camera.position);

    const targetScale = isActive ? 1 : 0;
    groupRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.08);

    if (groupRef.current.scale.x < 0.01 && targetScale === 0) {
      groupRef.current.visible = false;
    } else {
      groupRef.current.visible = true;
    }

    if (!isActive && showDetails) setShowDetails(false);

    if (detailsRef.current) {
      const detailScale = showDetails ? 1 : 0;
      detailsRef.current.scale.lerp(new THREE.Vector3(detailScale, detailScale, detailScale), 0.15);
    }
  });

  return (
    <group ref={groupRef} scale={0}>
       <Text position={[0, 0.35, 0]} fontSize={0.08} letterSpacing={0.1} renderOrder={1000}>
          PRICE: ₹{car?.price || "11 Crore"}
          <meshBasicMaterial color="#FFD700" toneMapped={false} depthTest={false} transparent />
       </Text>
       
       <HologramButton position={[0, 0.20, 0]} text="BOOK NOW" primary onClick={() => car?.slug && navigate(`/booking/${car.slug}`)} />
       <HologramButton position={[0, -0.05, 0]} text="BUY NOW" primary onClick={() => car?.slug && navigate(`/buy/${car.slug}`)} />
       <HologramButton position={[0, -0.30, 0]} text="MORE INFO" onClick={() => navigate('/showroom')} />
       <HologramButton position={[0, -0.55, 0]} text={showDetails ? "HIDE STATS" : "QUICK STATS"} onClick={() => setShowDetails(!showDetails)} />


       <group ref={detailsRef} position={[1.4, -0.1, 0]} scale={0}>
          <mesh renderOrder={998}>
            <planeGeometry args={[1.8, 2.0]} />
            <meshBasicMaterial color="#020617" transparent opacity={0.7} side={THREE.DoubleSide} blending={THREE.NormalBlending} depthTest={false} />
          </mesh>
          <mesh renderOrder={999}>
            <boxGeometry args={[1.85, 2.05, 0.01]} />
            <meshBasicMaterial color="#38bdf8" transparent opacity={0.4} wireframe blending={THREE.AdditiveBlending} toneMapped={false} depthTest={false} />
          </mesh>
          
          <Text position={[0, 0.8, 0.02]} fontSize={0.1} letterSpacing={0.1} renderOrder={1000}>
            ABOUT CAR
            <meshBasicMaterial color="#38bdf8" toneMapped={false} depthTest={false} transparent />
          </Text>
          <mesh position={[0, 0.65, 0.02]} renderOrder={999}>
            <planeGeometry args={[1.5, 0.01]} />
            <meshBasicMaterial color="#38bdf8" transparent opacity={0.5} blending={THREE.AdditiveBlending} toneMapped={false} depthTest={false} />
          </mesh>

          {specs.map((spec, i) => (
             <group key={i} position={[-0.7, 0.45 - i * 0.2, 0.02]}>
                <Text position={[0, 0, 0]} fontSize={0.06} anchorX="left" renderOrder={1000}>
                   {spec.label}
                   <meshBasicMaterial color="#94a3b8" toneMapped={false} depthTest={false} transparent />
                </Text>
                <Text position={[1.4, 0, 0]} fontSize={0.08} anchorX="right" renderOrder={1000}>
                   {spec.value}
                   <meshBasicMaterial color="#fef08a" toneMapped={false} depthTest={false} transparent />
                </Text>
             </group>
          ))}
       </group>
    </group>
  );
}

function SideViewInfoPanel({ currentCar }: { currentCar: number }) {
  const groupRef = useRef<THREE.Group>(null!);
  const car = cars[currentCar] as CarData | undefined;

  useFrame((state) => {
    if (!groupRef.current) return;
    
    const step = scrollState.step;
    const stage = step % 3;
    const activeCarIndex = Math.floor(step / 3);
    
    const isOutOfBounds = activeCarIndex >= cars.length;
    const carZ = -activeCarIndex * 35;
    
    const targetY = 2.4;
    const targetPos = new THREE.Vector3(0, targetY + Math.sin(state.clock.elapsedTime * 1.2) * 0.1, carZ);

    groupRef.current.position.lerp(targetPos, 0.08);
    groupRef.current.lookAt(state.camera.position);

    const targetScale = (stage === 1 && !isOutOfBounds) ? 0.9 : 0;
    groupRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.08);

    if (groupRef.current.scale.x < 0.01 && targetScale === 0) {
      groupRef.current.visible = false;
    } else {
      groupRef.current.visible = true;
    }
  });

  return (
    <group ref={groupRef} scale={0}>
      <mesh position={[0, 0, -0.05]} renderOrder={998}>
        <planeGeometry args={[2.8, 1.2]} />
        <meshBasicMaterial color="#020617" transparent opacity={0.7} blending={THREE.NormalBlending} depthTest={false} />
      </mesh>
      <mesh position={[0, 0, -0.04]} renderOrder={999}>
        <boxGeometry args={[2.85, 1.25, 0.01]} />
        <meshBasicMaterial color="#38bdf8" transparent opacity={0.5} wireframe blending={THREE.AdditiveBlending} toneMapped={false} depthTest={false} />
      </mesh>

      <Text position={[0, 0.35, 0]} fontSize={0.16} letterSpacing={0.05} renderOrder={1000}>
        PRICE: ₹{car?.price || "11 Crore"}
        <meshBasicMaterial color="#FFD700" toneMapped={false} depthTest={false} transparent />
      </Text>
      <Text position={[0, 0.05, 0]} fontSize={0.12} letterSpacing={0.05} renderOrder={1000}>
        RANGE: <meshBasicMaterial color="#a5f3fc" toneMapped={false} depthTest={false} transparent />{car?.range || "610 km"}
      </Text>
      <Text position={[0, -0.15, 0]} fontSize={0.12} letterSpacing={0.05} renderOrder={1000}>
        TAAQAT: <meshBasicMaterial color="#a5f3fc" toneMapped={false} depthTest={false} transparent />{car?.hp || "920 HP"}
      </Text>
      <Text position={[0, -0.35, 0]} fontSize={0.12} letterSpacing={0.05} renderOrder={1000}>
        TOP SPEED: <meshBasicMaterial color="#a5f3fc" toneMapped={false} depthTest={false} transparent />{car?.speed || "340 km/h"}
      </Text>

      <Text position={[0, -1.8, 0]} fontSize={0.1} letterSpacing={0.2} renderOrder={1000}>
        {"< DRAG TO ROTATE 360° >"}
        <meshBasicMaterial color="#38bdf8" toneMapped={false} depthTest={false} transparent opacity={0.8} />
      </Text>
    </group>
  );
}

function EndSceneUI({ navigate }: { navigate: ReturnType<typeof useNavigate> }) {
  const groupRef = useRef<THREE.Group>(null!);
  const portalRef = useRef<THREE.Mesh>(null!);

  useFrame((state) => {
    if (!groupRef.current) return;
    
    const activeCarIndex = Math.floor(scrollState.step / 3);
    const isEnd = activeCarIndex >= cars.length;
    
    const endZ = -cars.length * 35;
    
    const targetY = 1.8; 
    const targetX = 0; 
    const floatingY = targetY + Math.sin(state.clock.elapsedTime * 1.5) * 0.1;
    
    const targetPos = new THREE.Vector3(targetX, floatingY, endZ + 1.5);
    
    groupRef.current.position.lerp(targetPos, 0.08);
    groupRef.current.lookAt(state.camera.position);

    const targetScale = isEnd ? 1 : 0;
    groupRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.08);

    if (groupRef.current.scale.x < 0.01 && targetScale === 0) {
       groupRef.current.visible = false;
    } else {
       groupRef.current.visible = true;
    }

    if (portalRef.current) {
      portalRef.current.rotation.z = state.clock.elapsedTime * 0.5;
    }
  });

  return (
    <group ref={groupRef} scale={0}>
      <mesh position={[0, 0, -2]} renderOrder={990}>
        <circleGeometry args={[4, 64]} />
        <meshBasicMaterial color="#0ea5e9" transparent opacity={0.03} blending={THREE.AdditiveBlending} depthTest={false} toneMapped={false} />
      </mesh>
      <group ref={portalRef} position={[0, 0, -1.9]}>
        <mesh renderOrder={991}>
          <ringGeometry args={[3.8, 4.0, 64]} />
          <meshBasicMaterial color="#38bdf8" transparent opacity={0.6} blending={THREE.AdditiveBlending} depthTest={false} toneMapped={false} />
        </mesh>
        <mesh renderOrder={991}>
          <ringGeometry args={[3.4, 3.45, 64]} />
          <meshBasicMaterial color="#fef08a" transparent opacity={0.3} blending={THREE.AdditiveBlending} depthTest={false} toneMapped={false} />
        </mesh>
      </group>

      <Center position={[0, 0.8, 0]}>
        <Text3D 
          font="https://cdn.jsdelivr.net/npm/three/examples/fonts/helvetiker_bold.typeface.json"
          size={0.24} 
          height={0.02} 
          curveSegments={4}
          bevelEnabled
          bevelThickness={0.005}
          bevelSize={0.002}
          bevelSegments={1}
        >
          THANK YOU FOR VISITING OUR EXPERIENCE
          <meshStandardMaterial color="#38bdf8" emissive="#38bdf8" emissiveIntensity={3} toneMapped={false} depthTest={false} transparent />
        </Text3D>
      </Center>
      
      <Text position={[0, 0.1, 0]} fontSize={0.08} textAlign="center" maxWidth={4} lineHeight={1.6} renderOrder={1000}>
        {"We truly appreciate your time, and if you have any feedback or suggestions, feel free to reach out. Your journey doesn’t end here."}
        <meshBasicMaterial color="#e2e8f0" toneMapped={false} depthTest={false} transparent />
      </Text>

      <HologramButton position={[0, -0.5, 0]} text="CONTACT US →" primary onClick={() => navigate('/contact')} />
    </group>
  );
}

function Futuristic3DUI({ currentCar, navigate }: Futuristic3DUIProps) {
  return (
    <>
      <Floating3DTitle currentCar={currentCar} />
      <InteractiveHologramPanel currentCar={currentCar} navigate={navigate} />
      <SideViewInfoPanel currentCar={currentCar} />
      <EndSceneUI navigate={navigate} />
    </>
  );
}

// =============================================
// MAIN SCENE
// =============================================
export function HighwayScene() {
  const [viewMode, setViewMode] = useState<"preview" | "detail">("preview");
  const [currentCar, setCurrentCar] = useState<number>(0);
  const segments = useMemo(() => Array.from({ length: NUM_SEGMENTS }, (_, i) => i), []);
  const navigate = useNavigate();

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: '#030612', touchAction: 'none', zIndex: 50 }}>
      
      <OrbitInteraction />

      <Canvas 
        dpr={[1, 1.5]} 
        gl={{ 
          antialias: false, 
          powerPreference: "high-performance",
          toneMapping: THREE.ACESFilmicToneMapping, 
          toneMappingExposure: 0.5 
        }} 
        camera={{ fov: 58, near: 0.5, far: 400 }}
      >
        <color attach="background" args={['#030612']} />
        <fog attach="fog" args={['#030612', 20, 220]} />
        
        <CinematicCamera viewMode={viewMode} carIndex={currentCar} />
        <ScrollWatcher setCurrentCar={setCurrentCar} setViewMode={setViewMode} />
        <SmoothScrollSystem />
        <StepScrollController />
        
        <DynamicCarLighting />

        <Suspense fallback={null}>
          <ambientLight intensity={0.4} color="#0f172a" />
          <Environment preset="sunset" background={false} environmentIntensity={0.1} />
          
          <HorizonCityGlow />
          <CinematicStars />
          <EpicMoon /> 
          
          <CyberParticles />
          <Futuristic3DUI currentCar={currentCar} navigate={navigate} />
          
          <GlobalHUD navigate={navigate} />
          
          <ForestAmbience />
          <Mountains />
          <CitySkyline />
          <ScrollCars />
          
          <mesh position={[0, 1.5, -320]}>
            <planeGeometry args={[500, 20]} />
            <meshBasicMaterial color="#FFD700" transparent opacity={0.015} side={THREE.DoubleSide} />
          </mesh>

          {segments.map(i => <RoadSegment key={`r-${i}`} index={i} />)}
          {segments.map(i => <StreetLightSegment key={`l-${i}`} index={i} />)}

          <EffectComposer multisampling={0}>
            <Bloom intensity={1.3} luminanceThreshold={0.4} mipmapBlur radius={0.5} />
            <Vignette darkness={0.9} offset={0.1} />
          </EffectComposer>
        </Suspense>
      </Canvas>
    </div>
  );
}