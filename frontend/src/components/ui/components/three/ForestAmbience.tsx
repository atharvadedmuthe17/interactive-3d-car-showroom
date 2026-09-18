import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { scrollState } from './HighwayScene';

function seeded(s: number) {
  const x = Math.sin(s * 127.1) * 43758.5453;
  return x - Math.floor(x);
}

// =============================================
// FIREFLIES — sin-based drifting, kept off-road
// =============================================
const FLY_COUNT = 40;

function Fireflies() {
  const meshRef = useRef<THREE.InstancedMesh>(null!);
  const matRef = useRef<THREE.MeshBasicMaterial>(null!);

  const flyData = useMemo(() =>
    Array.from({ length: FLY_COUNT }, (_, i) => {
      const side = i % 2 === 0 ? -1 : 1;
      return {
        baseX: side * (8 + seeded(i * 3.1) * 14),
        baseY: 0.5 + seeded(i * 5.7) * 4,
        baseZ: -seeded(i * 7.3) * 120,
        freqX: 0.2 + seeded(i * 2.1) * 0.4,
        freqY: 0.15 + seeded(i * 4.3) * 0.3,
        freqZ: 0.1 + seeded(i * 6.5) * 0.25,
        ampX: 0.8 + seeded(i * 1.9) * 1.5,
        ampY: 0.3 + seeded(i * 8.1) * 0.6,
        ampZ: 0.5 + seeded(i * 9.3) * 1.0,
        phase: seeded(i * 11.7) * Math.PI * 2,
        brightness: 0.5 + seeded(i * 13.1) * 0.5,
      };
    }), []);

  const geo = useMemo(() => new THREE.SphereGeometry(0.04, 4, 4), []);

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.elapsedTime;
    const dummy = new THREE.Object3D();

    for (let i = 0; i < FLY_COUNT; i++) {
      const d = flyData[i];
      const x = d.baseX + Math.sin(t * d.freqX + d.phase) * d.ampX;
      const y = d.baseY + Math.sin(t * d.freqY + d.phase * 1.3) * d.ampY;
      const z = d.baseZ + Math.sin(t * d.freqZ + d.phase * 0.7) * d.ampZ;
      const pulse = 0.6 + Math.sin(t * 1.5 + d.phase) * 0.4;
      const s = d.brightness * pulse;
      dummy.position.set(x, Math.max(0.2, y), z);
      dummy.scale.setScalar(s);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;

    // Follow camera
    meshRef.current.position.z = scrollState.camZ * 0.6;
  });

  return (
    <instancedMesh ref={meshRef} args={[geo, undefined!, FLY_COUNT]} frustumCulled={false}>
      <meshBasicMaterial
        ref={matRef}
        color="#FFD700"
        toneMapped={false}
        transparent
        opacity={0.8}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </instancedMesh>
  );
}

// =============================================
// HEADLIGHT BEAM DUST — small particles in beam cone
// =============================================
const DUST_COUNT = 50;

function BeamDust() {
  const meshRef = useRef<THREE.InstancedMesh>(null!);

  const dustData = useMemo(() =>
    Array.from({ length: DUST_COUNT }, (_, i) => ({
      x: (seeded(i * 2.3) - 0.5) * 3,
      y: 0.2 + seeded(i * 4.7) * 1.2,
      z: 2 + seeded(i * 6.1) * 14,
      freqX: 0.1 + seeded(i * 8.3) * 0.3,
      freqY: 0.08 + seeded(i * 10.5) * 0.2,
      driftZ: -0.02 - seeded(i * 12.7) * 0.04,
      phase: seeded(i * 14.9) * Math.PI * 2,
      size: 0.3 + seeded(i * 16.1) * 0.7,
    })), []);

  const geo = useMemo(() => new THREE.SphereGeometry(0.02, 3, 3), []);

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.elapsedTime;
    const dummy = new THREE.Object3D();
    const carZ = scrollState.camZ < -60 ? -120 : undefined;

    // Only show when car is visible
    const p = scrollState.progress;
    meshRef.current.visible = p > 0.55;
    if (!meshRef.current.visible) return;

    for (let i = 0; i < DUST_COUNT; i++) {
      const d = dustData[i];
      const fadePhase = (Math.sin(t * 0.5 + d.phase) + 1) * 0.5;
      const x = d.x + Math.sin(t * d.freqX + d.phase) * 0.5;
      const y = d.y + Math.sin(t * d.freqY + d.phase * 1.5) * 0.15;
      const z = d.z + ((t * d.driftZ * 10) % 14);
      dummy.position.set(x, y, (carZ ?? -120) + z);
      dummy.scale.setScalar(d.size * fadePhase);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[geo, undefined!, DUST_COUNT]} frustumCulled={false}>
      <meshBasicMaterial
        color="#FFD700"
        toneMapped={false}
        transparent
        opacity={0.3}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </instancedMesh>
  );
}

// =============================================
// DEER SILHOUETTE — distant, mostly hidden
// =============================================
function DeerSilhouette() {
  const groupRef = useRef<THREE.Group>(null!);

  const geo = useMemo(() => {
    // Simple low-poly deer shape from boxes
    const body = new THREE.BoxGeometry(0.4, 0.5, 1.2);
    body.translate(0, 1.2, 0);
    const neck = new THREE.BoxGeometry(0.15, 0.6, 0.15);
    neck.translate(0, 1.7, 0.5);
    neck.rotateX(-0.3);
    const head = new THREE.BoxGeometry(0.12, 0.2, 0.3);
    head.translate(0, 2.15, 0.65);

    // Merge
    const geos: THREE.BufferGeometry[] = [body, neck, head];
    // Simple legs
    for (let lx = -1; lx <= 1; lx += 2) {
      for (let lz = -1; lz <= 1; lz += 2) {
        const leg = new THREE.BoxGeometry(0.08, 1.0, 0.08);
        leg.translate(lx * 0.12, 0.5, lz * 0.4);
        geos.push(leg);
      }
    }
    // Antlers
    for (let ax = -1; ax <= 1; ax += 2) {
      const antler = new THREE.CylinderGeometry(0.015, 0.02, 0.5, 3);
      antler.translate(ax * 0.08, 2.4, 0.6);
      antler.rotateZ(ax * 0.3);
      geos.push(antler);
    }

    const merged = new THREE.BufferGeometry();
    let totalVerts = 0;
    geos.forEach(g => totalVerts += g.attributes.position.count);
    const pos = new Float32Array(totalVerts * 3);
    const norm = new Float32Array(totalVerts * 3);
    const indices: number[] = [];
    let vOff = 0, iOff = 0;
    geos.forEach(g => {
      const p = g.attributes.position;
      const n = g.attributes.normal;
      for (let i = 0; i < p.count; i++) {
        pos[(vOff + i) * 3] = p.getX(i);
        pos[(vOff + i) * 3 + 1] = p.getY(i);
        pos[(vOff + i) * 3 + 2] = p.getZ(i);
        norm[(vOff + i) * 3] = n.getX(i);
        norm[(vOff + i) * 3 + 1] = n.getY(i);
        norm[(vOff + i) * 3 + 2] = n.getZ(i);
      }
      if (g.index) for (let i = 0; i < g.index.count; i++) indices.push(g.index.array[i] + iOff);
      iOff += p.count;
      vOff += p.count;
    });
    merged.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    merged.setAttribute('normal', new THREE.BufferAttribute(norm, 3));
    if (indices.length) merged.setIndex(indices);
    return merged;
  }, []);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;
    // Very slow walk
    groupRef.current.position.x = -28 + Math.sin(t * 0.05) * 2;
    groupRef.current.position.z = -80 + Math.sin(t * 0.03) * 3;
    // Subtle head bob
    groupRef.current.rotation.y = Math.sin(t * 0.08) * 0.15 + Math.PI * 0.3;
  });

  return (
    <group ref={groupRef} position={[-28, 0, -80]}>
      <mesh geometry={geo}>
        <meshStandardMaterial color="#060606" roughness={1} metalness={0} />
      </mesh>
    </group>
  );
}

// =============================================
// FLYING BATS — dark silhouettes above the forest
// =============================================
const BAT_COUNT = 6;

function BatWing({ side }: { side: number }) {
  const geo = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(0, 0);
    shape.lineTo(side * 0.15, 0.02);
    shape.lineTo(side * 0.28, 0.06);
    shape.lineTo(side * 0.35, 0.01);
    shape.lineTo(side * 0.22, -0.02);
    shape.lineTo(side * 0.1, -0.01);
    shape.lineTo(0, 0);
    return new THREE.ShapeGeometry(shape);
  }, [side]);

  return geo;
}

function FlyingBats() {
  const meshRef = useRef<THREE.InstancedMesh>(null!);

  const batData = useMemo(() =>
    Array.from({ length: BAT_COUNT }, (_, i) => {
      const side = i % 2 === 0 ? -1 : 1;
      return {
        baseX: side * (12 + seeded(i * 3.7) * 18),
        baseY: 8 + seeded(i * 5.1) * 6,
        baseZ: -seeded(i * 9.3) * 80,
        freqX: 0.12 + seeded(i * 2.9) * 0.15,
        freqY: 0.3 + seeded(i * 4.1) * 0.4,
        freqZ: 0.04 + seeded(i * 6.7) * 0.06,
        ampX: 1.5 + seeded(i * 1.3) * 2.5,
        ampY: 0.3 + seeded(i * 8.5) * 0.5,
        speed: 0.8 + seeded(i * 7.1) * 0.6,
        phase: seeded(i * 11.3) * Math.PI * 2,
        scale: 0.8 + seeded(i * 13.7) * 0.6,
      };
    }), []);

  // Simple flat diamond shape for bat silhouette
  const geo = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(0, 0);
    shape.lineTo(-0.35, 0.05);
    shape.lineTo(-0.2, -0.02);
    shape.lineTo(0, 0.02);
    shape.lineTo(0.2, -0.02);
    shape.lineTo(0.35, 0.05);
    shape.lineTo(0, 0);
    return new THREE.ShapeGeometry(shape);
  }, []);

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.elapsedTime;
    const dummy = new THREE.Object3D();

    for (let i = 0; i < BAT_COUNT; i++) {
      const d = batData[i];
      const x = d.baseX + Math.sin(t * d.freqX + d.phase) * d.ampX;
      const y = d.baseY + Math.sin(t * d.freqY * 2 + d.phase) * d.ampY;
      const z = d.baseZ + Math.sin(t * d.freqZ + d.phase * 0.5) * 8;

      // Wing flap via scaleX oscillation
      const flapX = 1 + Math.sin(t * 4 + d.phase) * 0.3;

      dummy.position.set(x, y, z);
      dummy.scale.set(d.scale * flapX, d.scale, d.scale);
      dummy.rotation.set(0, Math.sin(t * d.freqX + d.phase) * 0.4, Math.sin(t * 4 + d.phase) * 0.15);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;

    // Follow camera loosely
    meshRef.current.position.z = scrollState.camZ * 0.5;
  });

  return (
    <instancedMesh ref={meshRef} args={[geo, undefined!, BAT_COUNT]} frustumCulled={false}>
      <meshBasicMaterial color="#030303" side={THREE.DoubleSide} />
    </instancedMesh>
  );
}

// =============================================
// MAIN EXPORT
// =============================================
export function ForestAmbience() {
  return (
    <>
      <Fireflies />
      <BeamDust />
      <DeerSilhouette />
      <FlyingBats />
    </>
  );
}
