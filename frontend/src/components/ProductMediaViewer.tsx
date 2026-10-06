import React, { useRef, useState, useEffect } from 'react';
import { Heart, ChevronLeft, ChevronRight, Images, Sparkles, Box } from 'lucide-react';
import { Product } from '../types';
import { Real3DProductViewer } from './3d/Real3DProductViewer';

interface ProductMediaViewerProps {
  product: Product;
  currentImage: string;
  galleryImages: string[];
  activeImageIndex: number;
  onSelectImage: (index: number) => void;
  onPrevImage: (e: React.MouseEvent) => void;
  onNextImage: (e: React.MouseEvent) => void;
  isWishlisted: boolean;
  onToggleWishlist: () => void;
}

export const ProductMediaViewer: React.FC<ProductMediaViewerProps> = ({
  product,
  currentImage,
  galleryImages,
  activeImageIndex,
  onSelectImage,
  onPrevImage,
  onNextImage,
  isWishlisted,
  onToggleWishlist,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const glareRef = useRef<HTMLDivElement>(null);
  const canTiltRef = useRef(false);
  const rafId = useRef<number | null>(null);

  // Real 3D Model viewer state: active mode ('photo' vs '3d')
  const hasReal3DModel = Boolean(product.model3dUrl || product.has3dModel);
  const [activeMediaMode, setActiveMediaMode] = useState<'photo' | '3d'>('photo');

  useEffect(() => {
    setActiveMediaMode(hasReal3DModel ? '3d' : 'photo');
  }, [product.id, hasReal3DModel]);

  useEffect(() => {
    const finePointer = window.matchMedia('(pointer: fine)').matches;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    canTiltRef.current = finePointer && !reducedMotion;

    return () => {
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!canTiltRef.current || !containerRef.current || activeMediaMode === '3d') return;

    const rect = containerRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const x = (mouseX / width - 0.5) * 2;
    const y = (mouseY / height - 0.5) * 2;

    const maxTilt = 4.5;
    const rotX = -y * maxTilt;
    const rotY = x * maxTilt;

    const percentX = (mouseX / width) * 100;
    const percentY = (mouseY / height) * 100;

    if (rafId.current) cancelAnimationFrame(rafId.current);
    rafId.current = requestAnimationFrame(() => {
      if (containerRef.current) {
        containerRef.current.style.transform = `perspective(1000px) rotateX(${rotX.toFixed(2)}deg) rotateY(${rotY.toFixed(2)}deg) scale3d(1.02, 1.02, 1.02)`;
      }
      if (imgRef.current) {
        imgRef.current.style.transformOrigin = `${percentX}% ${percentY}%`;
        imgRef.current.style.transform = 'scale(1.18)';
      }
      if (glareRef.current) {
        glareRef.current.style.opacity = '0.2';
        glareRef.current.style.background = `radial-gradient(circle at ${percentX}% ${percentY}%, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0) 65%)`;
      }
    });
  };

  const handleMouseEnter = () => {
    if (!canTiltRef.current || activeMediaMode === '3d') return;
    if (containerRef.current) {
      containerRef.current.style.transition = 'transform 0.08s ease-out';
    }
  };

  const handleMouseLeave = () => {
    if (!canTiltRef.current || activeMediaMode === '3d') return;
    if (rafId.current) cancelAnimationFrame(rafId.current);
    if (containerRef.current) {
      containerRef.current.style.transition = 'transform 0.5s cubic-bezier(0.2, 0.8, 0.2, 1)';
      containerRef.current.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
    }
    if (imgRef.current) {
      imgRef.current.style.transformOrigin = 'center center';
      imgRef.current.style.transform = 'scale(1)';
    }
    if (glareRef.current) {
      glareRef.current.style.opacity = '0';
    }
  };

  return (
    <div className="relative bg-[#efe8dc] flex flex-col items-center justify-center p-3 xs:p-4 sm:p-8 select-none">
      {/* 3D / Photography Media Switcher (Architected for real GLB/GLTF models) */}
      {hasReal3DModel && (
        <div className="mb-3 flex items-center bg-[#e0d8c8] p-1 rounded-full text-xs z-20 shadow-xs">
          <button
            type="button"
            onClick={() => setActiveMediaMode('photo')}
            className={`px-3 py-1 rounded-full font-medium transition-all ${
              activeMediaMode === 'photo'
                ? 'bg-[#2d5a61] text-white shadow-xs'
                : 'text-[#555555] hover:text-[#2d5a61]'
            }`}
          >
            Photos
          </button>
          <button
            type="button"
            onClick={() => setActiveMediaMode('3d')}
            className={`px-3 py-1 rounded-full font-medium flex items-center gap-1 transition-all ${
              activeMediaMode === '3d'
                ? 'bg-[#2d5a61] text-white shadow-xs'
                : 'text-[#555555] hover:text-[#2d5a61]'
            }`}
          >
            <Box className="w-3.5 h-3.5" />
            <span>3D Model</span>
          </button>
        </div>
      )}

      {/* Main Interactive Stage */}
      {activeMediaMode === '3d' && hasReal3DModel ? (
        <Real3DProductViewer
          modelUrl={product.model3dUrl}
          poster={product.model3dPoster || currentImage}
          productName={product.name}
          onSwitchToPhotos={() => setActiveMediaMode('photo')}
        />
      ) : (
        /* High-Fidelity 2D Depth Layered Canvas */
        <div
          ref={containerRef}
          onMouseMove={handleMouseMove}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          style={{
            transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)',
            transformStyle: 'preserve-3d',
          }}
          className="relative w-full aspect-square max-h-[380px] rounded-2xl overflow-hidden shadow-md border-4 border-[#efe8dc] group cursor-crosshair bg-[#efe8dc]"
        >
          {/* Realistic Dynamic Shadow Beneath Canvas */}
          <div
            className="absolute inset-x-8 bottom-3 h-10 bg-black/20 blur-xl rounded-full pointer-events-none transition-transform duration-300 group-hover:scale-105 group-hover:translate-y-1"
          />

          {/* Product Image with smooth hover zoom & perspective */}
          <img
            ref={imgRef}
            src={currentImage}
            alt={product.name}
            style={{
              transformOrigin: 'center center',
              transform: 'scale(1)',
              transition: 'transform 0.25s ease-out',
            }}
            className="w-full h-full object-cover transition-all"
          />

          {/* Foreground Specular Glare / Reflection Layer */}
          <div
            ref={glareRef}
            className="absolute inset-0 pointer-events-none transition-opacity duration-200 z-20 opacity-0"
          />

          {/* Wishlist Button */}
          <button
            onClick={onToggleWishlist}
            style={{ transform: 'translateZ(26px)' }}
            className={`absolute top-3 left-3 p-2.5 rounded-full transition-all shadow-md z-30 cursor-pointer ${
              isWishlisted
                ? 'bg-red-50 text-red-500 scale-110'
                : 'bg-white/85 text-[#666666] hover:bg-white hover:text-red-500'
            }`}
            aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <Heart className="w-5 h-5" fill={isWishlisted ? 'currentColor' : 'none'} />
          </button>

          {/* Subtle Depth Sparkle Badge */}
          <div
            style={{ transform: 'translateZ(20px)' }}
            className="absolute top-3 right-3 bg-white/85 backdrop-blur-xs text-[#2d5a61] text-[10px] font-medium px-2 py-0.5 rounded-full flex items-center gap-1 shadow-2xs z-30 opacity-70 group-hover:opacity-100 transition-opacity"
          >
            <Sparkles className="w-3 h-3 text-[#D4B982]" />
            <span>Artisan Detail</span>
          </div>

          {/* Arrow navigation if multiple images */}
          {galleryImages.length > 1 && (
            <>
              <button
                type="button"
                onClick={onPrevImage}
                style={{ transform: 'translateZ(28px)' }}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/45 hover:bg-black/75 text-white backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-opacity z-30 cursor-pointer"
                aria-label="Previous image"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={onNextImage}
                style={{ transform: 'translateZ(28px)' }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/45 hover:bg-black/75 text-white backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-opacity z-30 cursor-pointer"
                aria-label="Next image"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <span
                style={{ transform: 'translateZ(24px)' }}
                className="absolute bottom-2.5 left-2.5 bg-black/60 text-white text-[10px] px-2.5 py-0.5 rounded-full font-medium backdrop-blur-xs flex items-center gap-1 z-30"
              >
                <Images className="w-2.5 h-2.5" />
                {activeImageIndex + 1} / {galleryImages.length}
              </span>
            </>
          )}
        </div>
      )}

      {/* Thumbnail selector strip if more than 1 image */}
      {galleryImages.length > 1 && (
        <div className="flex items-center gap-2 mt-3.5 overflow-x-auto max-w-full pb-1 px-1 no-scrollbar">
          {galleryImages.map((img, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => onSelectImage(idx)}
              className={`relative w-12 h-12 rounded-lg overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                idx === activeImageIndex
                  ? 'border-[#2d5a61] shadow-md scale-105'
                  : 'border-transparent opacity-60 hover:opacity-100'
              }`}
            >
              <img src={img} alt={`View ${idx + 1}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
