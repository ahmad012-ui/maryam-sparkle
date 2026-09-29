import React, { Suspense, useState, useRef, useEffect, useCallback, Component, ErrorInfo } from 'react';
import * as THREE from 'three';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, ContactShadows } from '@react-three/drei';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { RotateCcw, Maximize2, Minimize2, Play, Pause, Compass, Sparkles } from 'lucide-react';
import { ProductModel } from './ProductModel';
import { ModelLoadingState } from './ModelLoadingState';
import { ModelErrorFallback } from './ModelErrorFallback';
import { isWebGLAvailable, ModelBoundsInfo } from '../../utils/modelBounds';

interface Real3DProductViewerProps {
  modelUrl?: string;
  poster: string;
  productName: string;
  className?: string;
  onSwitchToPhotos?: () => void;
}

interface ErrorBoundaryProps {
  fallback: (error: Error, reset: () => void) => React.ReactNode;
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ThreeErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.warn('Real3DProductViewer encountered a model rendering notice:', error, info);
  }

  reset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      return this.props.fallback(this.state.error, this.reset);
    }
    return this.props.children;
  }
}

/**
 * Controller inside Canvas to manage camera position and reset based on model bounds
 */
interface CameraManagerProps {
  bounds: ModelBoundsInfo | null;
  controlsRef: React.RefObject<OrbitControlsImpl | null>;
  autoRotate: boolean;
  onInteractionStart: () => void;
  onInteractionEnd: () => void;
}

const CameraManager: React.FC<CameraManagerProps> = ({
  bounds,
  controlsRef,
  autoRotate,
  onInteractionStart,
  onInteractionEnd,
}) => {
  const { camera } = useThree();
  const initialDistance = useRef<number>(2.5);

  useEffect(() => {
    if (!bounds) return;

    const dist = bounds.optimalDistance;
    initialDistance.current = dist;

    // Position camera along diagonal perspective view
    camera.position.set(dist * 0.75, dist * 0.45, dist * 0.85);
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();

    if (controlsRef.current) {
      controlsRef.current.target.set(0, 0, 0);
      controlsRef.current.minDistance = Math.max(dist * 0.35, 0.2);
      controlsRef.current.maxDistance = dist * 3.0;
      controlsRef.current.update();
    }
  }, [bounds, camera, controlsRef]);

  return (
    <OrbitControls
      ref={controlsRef}
      enableDamping
      dampingFactor={0.06}
      rotateSpeed={0.8}
      zoomSpeed={0.85}
      panSpeed={0.6}
      enablePan={false}
      autoRotate={autoRotate}
      autoRotateSpeed={1.0}
      onStart={onInteractionStart}
      onEnd={onInteractionEnd}
      makeDefault
    />
  );
};

export const Real3DProductViewer: React.FC<Real3DProductViewerProps> = ({
  modelUrl,
  poster,
  productName,
  className = '',
  onSwitchToPhotos,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const controlsRef = useRef<OrbitControlsImpl | null>(null);

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [autoRotate, setAutoRotate] = useState(true);
  const [modelBounds, setModelBounds] = useState<ModelBoundsInfo | null>(null);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [renderError, setRenderError] = useState<string | null>(null);
  const [reducedMotion, setReducedMotion] = useState(false);

  const idleTimerRef = useRef<number | null>(null);

  // Check WebGL and reduced-motion capability
  useEffect(() => {
    if (!isWebGLAvailable()) {
      setRenderError('WebGL is not supported on this browser or device.');
    }

    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(motionQuery.matches);
    if (motionQuery.matches) {
      setAutoRotate(false);
    }
  }, []);

  // Listen for fullscreen change
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  const handleInteractionStart = useCallback(() => {
    setHasInteracted(true);
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    // Pause auto-rotation immediately when user is actively exploring
    setAutoRotate(false);
  }, []);

  const handleInteractionEnd = useCallback(() => {
    if (reducedMotion) return;
    // Resume gentle auto-rotation after 3.5 seconds of inactivity
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    idleTimerRef.current = window.setTimeout(() => {
      setAutoRotate(true);
    }, 3500);
  }, [reducedMotion]);

  const handleResetCamera = () => {
    if (!controlsRef.current || !modelBounds) return;
    const dist = modelBounds.optimalDistance;
    controlsRef.current.reset();
    controlsRef.current.object.position.set(dist * 0.75, dist * 0.45, dist * 0.85);
    controlsRef.current.target.set(0, 0, 0);
    controlsRef.current.update();
  };

  const handleToggleFullscreen = async () => {
    if (!containerRef.current) return;

    if (!document.fullscreenElement) {
      try {
        await containerRef.current.requestFullscreen();
      } catch (err) {
        console.warn('Fullscreen request failed:', err);
      }
    } else {
      try {
        await document.exitFullscreen();
      } catch (err) {
        console.warn('Exit fullscreen failed:', err);
      }
    }
  };

  // If no model URL provided or WebGL failed, gracefully show fallback
  if (!modelUrl || renderError) {
    return (
      <div className={`relative w-full aspect-square max-h-[380px] rounded-2xl overflow-hidden border-4 border-[#efe8dc] ${className}`}>
        <ModelErrorFallback
          poster={poster}
          productName={productName}
          errorMessage={renderError || 'No 3D model asset has been linked for this piece.'}
          onSwitchToPhotos={onSwitchToPhotos}
        />
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`relative w-full aspect-square max-h-[380px] rounded-2xl overflow-hidden shadow-md border-4 border-[#efe8dc] bg-[#fdfaf5] group select-none ${
        isFullscreen ? 'fixed inset-0 z-[999999] max-h-none w-screen h-screen rounded-none border-none' : ''
      } ${className}`}
    >
      <ThreeErrorBoundary
        fallback={(error, reset) => (
          <ModelErrorFallback
            poster={poster}
            productName={productName}
            errorMessage={error.message || 'Unable to load 3D jewelry asset.'}
            onRetry={reset}
            onSwitchToPhotos={onSwitchToPhotos}
          />
        )}
      >
        <Suspense fallback={<ModelLoadingState productName={productName} />}>
          <Canvas
            shadows
            camera={{ fov: 45, position: [1.8, 1.2, 2.2], near: 0.05, far: 50 }}
            gl={{
              antialias: true,
              alpha: true,
              powerPreference: 'high-performance',
              toneMapping: THREE.ACESFilmicToneMapping,
              toneMappingExposure: 1.15,
            }}
            className="w-full h-full cursor-grab active:cursor-grabbing touch-none"
          >
            {/* Atelier Studio Lighting Setup */}
            <ambientLight color="#fff8f0" intensity={0.75} />
            <directionalLight
              position={[4, 6, 4]}
              intensity={1.25}
              color="#ffffff"
              castShadow
              shadow-mapSize-width={1024}
              shadow-mapSize-height={1024}
              shadow-bias={-0.0001}
            />
            <directionalLight
              position={[-4, 3, -3]}
              intensity={0.65}
              color="#e8f0fe"
            />
            <directionalLight
              position={[0, -3, -4]}
              intensity={0.35}
              color="#ffffff"
            />
            <directionalLight
              position={[0, 5, -2]}
              intensity={0.4}
              color="#fff0d0"
            />

            {/* Real 3D Jewelry Model */}
            <ProductModel
              url={modelUrl}
              onBoundsReady={setModelBounds}
            />

            {/* Subtle Studio Contact Shadow beneath piece */}
            <ContactShadows
              position={[0, modelBounds ? -modelBounds.size.y * 0.52 : -0.5, 0]}
              opacity={0.45}
              scale={modelBounds ? modelBounds.maxDimension * 2.2 : 2.5}
              blur={2.4}
              far={1.5}
            />

            {/* Interactive Orbit Controls with auto-fit */}
            <CameraManager
              bounds={modelBounds}
              controlsRef={controlsRef}
              autoRotate={autoRotate && !reducedMotion}
              onInteractionStart={handleInteractionStart}
              onInteractionEnd={handleInteractionEnd}
            />
          </Canvas>
        </Suspense>

        {/* Floating User Controls (Top Right) */}
        <div className="absolute top-3 right-3 z-20 flex items-center gap-1.5 bg-white/85 backdrop-blur-md p-1 rounded-full border border-[#e0d8c8] shadow-xs">
          {/* Reset Camera Position */}
          <button
            type="button"
            onClick={handleResetCamera}
            title="Reset 3D view"
            aria-label="Reset 3D camera position"
            className="p-1.5 text-[#555555] hover:text-[#2d5a61] hover:bg-[#efe8dc]/60 rounded-full transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {/* Toggle Auto Rotation */}
          {!reducedMotion && (
            <button
              type="button"
              onClick={() => setAutoRotate((prev) => !prev)}
              title={autoRotate ? 'Pause auto-rotation' : 'Play auto-rotation'}
              aria-label={autoRotate ? 'Pause auto-rotation' : 'Resume auto-rotation'}
              className="p-1.5 text-[#555555] hover:text-[#2d5a61] hover:bg-[#efe8dc]/60 rounded-full transition-colors cursor-pointer"
            >
              {autoRotate ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            </button>
          )}

          {/* Fullscreen Toggle */}
          <button
            type="button"
            onClick={handleToggleFullscreen}
            title={isFullscreen ? 'Exit fullscreen' : 'View in fullscreen'}
            aria-label={isFullscreen ? 'Exit fullscreen' : 'View in fullscreen'}
            className="p-1.5 text-[#555555] hover:text-[#2d5a61] hover:bg-[#efe8dc]/60 rounded-full transition-colors cursor-pointer"
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Interactive Helper Cue (Bottom Center - disappears on interaction) */}
        {!hasInteracted && (
          <div className="absolute bottom-3 inset-x-0 flex justify-center pointer-events-none z-10 transition-opacity duration-500">
            <div className="bg-[#2d5a61]/80 backdrop-blur-xs text-white text-[11px] font-medium px-3 py-1 rounded-full shadow-xs flex items-center gap-1.5 animate-pulse">
              <Compass className="w-3 h-3" />
              <span>Drag to rotate 3D jewelry • Pinch to zoom</span>
            </div>
          </div>
        )}

        {/* Active 3D Badge Indicator (Top Left) */}
        <div className="absolute top-3 left-3 z-20 pointer-events-none">
          <span className="inline-flex items-center gap-1 bg-[#2d5a61] text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-xs">
            <Sparkles className="w-3 h-3 text-[#d4b982]" />
            <span>Interactive 3D</span>
          </span>
        </div>
      </ThreeErrorBoundary>
    </div>
  );
};
