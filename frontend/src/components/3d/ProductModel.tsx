import React, { useLayoutEffect, useMemo } from 'react';
import * as THREE from 'three';
import { useGLTF } from '@react-three/drei';
import { calculateModelBounds, ModelBoundsInfo, disposeThreeHierarchy } from '../../utils/modelBounds';

interface ProductModelProps {
  url: string;
  onBoundsReady?: (bounds: ModelBoundsInfo) => void;
}

export const ProductModel: React.FC<ProductModelProps> = ({ url, onBoundsReady }) => {
  // Load real GLB/GLTF model via drei
  const gltf = useGLTF(url);

  // Deep clone scene so multiple mounts do not mutate shared cached primitives
  const scene = useMemo(() => gltf.scene.clone(true), [gltf.scene]);

  useLayoutEffect(() => {
    if (!scene) return;

    // Enable shadows and PBR preservation on all meshes
    scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;

        if (mesh.material) {
          const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
          materials.forEach((mat) => {
            mat.side = THREE.DoubleSide;
            mat.needsUpdate = true;
          });
        }
      }
    });

    // Calculate bounds and center model at origin (0, 0, 0)
    const bounds = calculateModelBounds(scene, 45, 1.4);

    // Reposition scene center to world origin (0, 0, 0)
    scene.position.x = -bounds.center.x;
    scene.position.y = -bounds.center.y;
    scene.position.z = -bounds.center.z;

    if (onBoundsReady) {
      onBoundsReady(bounds);
    }

    return () => {
      disposeThreeHierarchy(scene);
    };
  }, [scene, onBoundsReady]);

  return <primitive object={scene} />;
};

// Preload helper for smooth UX
export function preloadProductModel(url: string) {
  if (url) {
    try {
      useGLTF.preload(url);
    } catch {
      // Ignore preload issues
    }
  }
}
