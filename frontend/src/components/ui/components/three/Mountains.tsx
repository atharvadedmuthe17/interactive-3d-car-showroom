import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { scrollState } from './HighwayScene';

function seeded(seed: number) {
  const x = Math.sin(seed * 127.1) * 43758.5453;
  return x - Math.floor(x);
}

const MOUNTAIN_COUNT = 30;

export function Mountains() {
  const ref = useRef<THREE.InstancedMesh>(null!);
  const groupRef = useRef<THREE.Group>(null!);
  const geo = useMemo(() => new THREE.ConeGeometry(1, 1, 6), []);
  const mat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#030308', roughness: 1, metalness: 0 }), []);

  useEffect(() => {
    if (!ref.current) return;
    const dummy = new THREE.Object3D();
    for (let i = 0; i < MOUNTAIN_COUNT; i++) {
      const side = i < 15 ? -1 : 1;
      const idx = i % 15;
      const x = side * (40 + seeded(i * 3.1) * 80);
      const z = -80 - idx * 30 - seeded(i * 7.2) * 20;
      const h = 20 + seeded(i * 5.5) * 50;
      const w = 25 + seeded(i * 2.3) * 40;
      dummy.position.set(x, h / 2 - 2, z);
      dummy.scale.set(w / 2, h, w * 0.3);
      dummy.rotation.set(0, seeded(i * 4) * Math.PI, 0);
      dummy.updateMatrix();
      ref.current.setMatrixAt(i, dummy.matrix);
    }
    ref.current.instanceMatrix.needsUpdate = true;
  }, []);

  // Parallax: mountains move at 0.2x camera speed (background layer)
  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.position.z = -scrollState.camZ * 0.2;
    }
  });

  return (
    <group ref={groupRef}>
      <instancedMesh ref={ref} args={[geo, mat, MOUNTAIN_COUNT]} frustumCulled={false} />
    </group>
  );
}
