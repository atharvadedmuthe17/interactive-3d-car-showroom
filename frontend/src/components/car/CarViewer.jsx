import React, { useEffect, useMemo, useRef } from 'react';
import { useGLTF } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import { clone } from 'three/examples/jsm/utils/SkeletonUtils';
import * as THREE from 'three';

const CarViewer = ({ modelPath, paintColor, isInterior }) => {
  const { scene } = useGLTF(modelPath, 'https://www.gstatic.com/draco/versioned/decoders/1.5.5/');
  const { camera, controls } = useThree();
  const groupRef = useRef();

  // Clone scene for individual instances
  const clonedScene = useMemo(() => clone(scene), [scene]);

  // Color Logic
  useEffect(() => {
    if (clonedScene) {
      clonedScene.traverse((object) => {
        if (object.isMesh) {
          const name = object.name.toLowerCase();
          const matName = object.material?.name?.toLowerCase() || '';

          if (
            name.includes('body') || 
            name.includes('paint') || 
            name.includes('exterior') || 
            name.includes('car_body') ||
            matName.includes('body') || 
            matName.includes('paint') ||
            matName.includes('exterior')
          ) {
            object.material.map = null; 
            object.material.color.set(paintColor);
          }
          object.castShadow = true;
          object.receiveShadow = true;
        }
      });
    }
  }, [clonedScene, paintColor]);

  // The Final Fix: Auto-Fit + Proactive Framing
  useEffect(() => {
    if (!clonedScene || !groupRef.current) return;

    // 1. Reset
    clonedScene.updateMatrixWorld();
    clonedScene.rotation.set(0, 0, 0);
    clonedScene.position.set(0, 0, 0);
    clonedScene.scale.set(1, 1, 1);

    // 2. Center & Measure
    const box = new THREE.Box3().setFromObject(clonedScene);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());

    clonedScene.position.x = -center.x;
    clonedScene.position.y = -center.y;
    clonedScene.position.z = -center.z;

    // 3. Normalized Scale (Bigger Presence)
    const maxDim = Math.max(size.x, size.y, size.z);
    const targetSize = isInterior ? 4 : 8; // Smaller for interior, larger for exterior
    const normalizationScale = targetSize / maxDim;
    groupRef.current.scale.setScalar(normalizationScale);

    // 4. Proactive Camera Framing
    groupRef.current.updateMatrixWorld();
    const finalBox = new THREE.Box3().setFromObject(groupRef.current);
    const finalSize = finalBox.getSize(new THREE.Vector3());
    const finalCenter = finalBox.getCenter(new THREE.Vector3());
    const finalMaxDim = Math.max(finalSize.x, finalSize.y, finalSize.z);

    const fov = camera.fov * (Math.PI / 180);
    
    if (isInterior) {
      // Interior Config
      camera.position.set(0, targetSize * 0.15, targetSize * 0.05);
      camera.near = 0.01;
      camera.far = 100;
      if (controls) {
        controls.target.set(0, targetSize * 0.15, targetSize * 0.3);
        controls.update();
      }
    } else {
      // Exterior Config: Bring closer
      let distance = finalMaxDim / (2 * Math.tan(fov / 2));
      distance *= 0.85; // Fill the view
      
      camera.position.set(distance * 0.85, targetSize * 0.3, distance * 0.85);
      camera.near = 0.1;
      camera.far = distance * 20;
      
      if (controls) {
        controls.target.copy(finalCenter);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.update();
      }
    }

    camera.updateProjectionMatrix();
  }, [clonedScene, isInterior, modelPath, camera, controls]);

  return (
    <group ref={groupRef}>
      <primitive object={clonedScene} />
    </group>
  );
};

export default CarViewer;
