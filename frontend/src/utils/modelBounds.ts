import * as THREE from 'three';

export interface ModelBoundsInfo {
  box: THREE.Box3;
  size: THREE.Vector3;
  center: THREE.Vector3;
  maxDimension: number;
  optimalDistance: number;
}

/**
 * Checks whether the client browser and environment supports WebGL.
 */
export function isWebGLAvailable(): boolean {
  try {
    const canvas = document.createElement('canvas');
    return Boolean(
      window.WebGLRenderingContext &&
        (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
    );
  } catch {
    return false;
  }
}

/**
 * Calculates the bounding box, center, and optimal camera distance
 * for any arbitrary 3D jewelry geometry.
 */
export function calculateModelBounds(
  object: THREE.Object3D,
  fov: number = 45,
  paddingFactor: number = 1.35
): ModelBoundsInfo {
  // Update world matrix first to ensure accurate world bounds
  object.updateMatrixWorld(true);

  const box = new THREE.Box3().setFromObject(object);
  const size = new THREE.Vector3();
  const center = new THREE.Vector3();

  box.getSize(size);
  box.getCenter(center);

  // If bounding box is empty/invalid, fallback to safe defaults
  const maxDim = Math.max(size.x, size.y, size.z, 0.01);

  // Distance formula based on vertical FOV in radians
  const fovRad = (fov * Math.PI) / 180;
  const optimalDistance = (maxDim / (2 * Math.tan(fovRad / 2))) * paddingFactor;

  return {
    box,
    size,
    center,
    maxDimension: maxDim,
    optimalDistance: Math.max(optimalDistance, 0.1),
  };
}

/**
 * Disposes of geometries and materials on an Object3D hierarchy
 * to prevent WebGL memory leaks when unmounting.
 */
export function disposeThreeHierarchy(object: THREE.Object3D): void {
  object.traverse((child) => {
    if ((child as THREE.Mesh).isMesh) {
      const mesh = child as THREE.Mesh;
      if (mesh.geometry) {
        mesh.geometry.dispose();
      }
      if (mesh.material) {
        if (Array.isArray(mesh.material)) {
          mesh.material.forEach((mat) => mat.dispose());
        } else {
          mesh.material.dispose();
        }
      }
    }
  });
}
