import React, { useRef, useEffect } from 'react';
import { ArrowRight, Heart, Sparkles } from 'lucide-react';
import { HERO_IMAGES } from '../data/products';

interface HeroProps {
  onShopNow: () => void;
  onExploreNew: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onShopNow, onExploreNew }) => {
  const containerRef = useRef<HTMLElement>(null);
  const archRef = useRef<HTMLDivElement>(null);
  const circleRef = useRef<HTMLDivElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);
  const bgMotifRef = useRef<HTMLDivElement>(null);
  const bgLeafRef = useRef<SVGSVGElement>(null);

  const canTiltRef = useRef(false);
  const targetPos = useRef({ x: 0, y: 0 });
  const scrollYRef = useRef(0);
  const isHoveredRef = useRef(false);
  const rafId = useRef<number | null>(null);

  const updateTransforms = () => {
    const x = isHoveredRef.current ? targetPos.current.x : 0;
    const y = isHoveredRef.current ? targetPos.current.y : 0;
    const scrollY = scrollYRef.current;

    // Scroll parallax offset
    const archScroll = scrollY * 0.05;
    const circleScroll = scrollY * 0.11;
    const bgScroll = scrollY * -0.04;

    // Arch transform & shadow (midground)
    const archRotX = -y * 3.5;
    const archRotY = x * 3.5;
    const archShiftX = x * 8;
    const archShiftY = y * 8 + archScroll;
    const archShadowX = -x * 16;
    const archShadowY = -y * 16 + 20;

    // Circle transform & shadow (foreground: higher parallax depth)
    const circleRotX = -y * 4.5;
    const circleRotY = x * 4.5;
    const circleShiftX = x * 16;
    const circleShiftY = y * 16 + circleScroll;
    const circleShadowX = -x * 22;
    const circleShadowY = -y * 22 + 24;

    // Badge transform (floating overlay layer)
    const badgeShiftX = x * 22;
    const badgeShiftY = y * 22 + circleScroll * 0.8;

    // Background motif counter-parallax (deep background)
    const bgShiftX = -x * 10;
    const bgShiftY = -y * 10 + bgScroll;

    if (archRef.current) {
      archRef.current.style.transform = `perspective(1000px) rotateX(${archRotX.toFixed(2)}deg) rotateY(${archRotY.toFixed(2)}deg) translate3d(${archShiftX.toFixed(1)}px, ${archShiftY.toFixed(1)}px, 15px)`;
      archRef.current.style.boxShadow = `${archShadowX.toFixed(1)}px ${archShadowY.toFixed(1)}px 36px rgba(45, 90, 97, 0.16)`;
    }
    if (circleRef.current) {
      circleRef.current.style.transform = `perspective(1000px) rotateX(${circleRotX.toFixed(2)}deg) rotateY(${circleRotY.toFixed(2)}deg) translate3d(${circleShiftX.toFixed(1)}px, ${circleShiftY.toFixed(1)}px, 45px)`;
      circleRef.current.style.boxShadow = `${circleShadowX.toFixed(1)}px ${circleShadowY.toFixed(1)}px 46px rgba(45, 90, 97, 0.22)`;
    }
    if (badgeRef.current) {
      badgeRef.current.style.transform = `translate3d(${badgeShiftX.toFixed(1)}px, ${badgeShiftY.toFixed(1)}px, 65px) rotateX(${(-y * 2).toFixed(1)}deg) rotateY(${(x * 2).toFixed(1)}deg)`;
    }
    if (bgMotifRef.current) {
      bgMotifRef.current.style.transform = `translate3d(${bgShiftX}px, ${bgShiftY}px, -20px)`;
    }
    if (bgLeafRef.current) {
      bgLeafRef.current.style.transform = `translate3d(${bgShiftX * 0.8}px, ${bgShiftY * 0.8}px, -15px)`;
    }
  };

  useEffect(() => {
    const finePointer = window.matchMedia('(pointer: fine)').matches;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    canTiltRef.current = finePointer && !reducedMotion;

    if (!reducedMotion) {
      const handleScroll = () => {
        if (window.scrollY < 800) {
          scrollYRef.current = window.scrollY;
          if (rafId.current) cancelAnimationFrame(rafId.current);
          rafId.current = requestAnimationFrame(updateTransforms);
        }
      };

      window.addEventListener('scroll', handleScroll, { passive: true });
      return () => {
        window.removeEventListener('scroll', handleScroll);
        if (rafId.current) cancelAnimationFrame(rafId.current);
      };
    }
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    if (!canTiltRef.current || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    targetPos.current.x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    targetPos.current.y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    isHoveredRef.current = true;

    if (archRef.current) {
      archRef.current.style.transition = 'transform 0.1s ease-out, box-shadow 0.15s ease-out';
    }
    if (circleRef.current) {
      circleRef.current.style.transition = 'transform 0.1s ease-out, box-shadow 0.15s ease-out';
    }
    if (badgeRef.current) {
      badgeRef.current.style.transition = 'transform 0.12s ease-out';
    }

    if (rafId.current) cancelAnimationFrame(rafId.current);
    rafId.current = requestAnimationFrame(updateTransforms);
  };

  const handleMouseLeave = () => {
    if (!canTiltRef.current) return;
    isHoveredRef.current = false;
    targetPos.current.x = 0;
    targetPos.current.y = 0;

    if (archRef.current) {
      archRef.current.style.transition = 'transform 0.7s cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 0.7s ease';
    }
    if (circleRef.current) {
      circleRef.current.style.transition = 'transform 0.7s cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 0.7s ease';
    }
    if (badgeRef.current) {
      badgeRef.current.style.transition = 'transform 0.7s cubic-bezier(0.2, 0.8, 0.2, 1)';
    }

    if (rafId.current) cancelAnimationFrame(rafId.current);
    rafId.current = requestAnimationFrame(updateTransforms);
  };

  return (
    <section
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative px-4 sm:px-6 md:px-12 pt-8 sm:pt-12 md:pt-16 pb-16 sm:pb-20 md:pb-28 overflow-hidden bg-[#efe8dc] select-none"
    >
      {/* Background Wireframe Motif - Layer 0 (Counter-parallax) */}
      <div
        ref={bgMotifRef}
        className="absolute top-8 right-[28%] text-[#2d5a61]/25 hidden md:block pointer-events-none select-none transition-transform duration-700 ease-out"
        style={{
          transform: 'translate3d(0, 0, -20px)',
        }}
      >
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
          <path d="M12 2v20M2 12h20M12 2a10 10 0 0110 10M12 22a10 10 0 01-10-10" />
        </svg>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
        {/* Left Column: Typography & Action */}
        <div className="z-10 lg:pr-6 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 text-[#2d5a61] italic font-serif text-base sm:text-lg md:text-xl mb-3 sm:mb-4 justify-center lg:justify-start">
            <span>Handmade with love</span>
            <Heart className="w-4 h-4 text-[#2d5a61]" fill="none" strokeWidth={1.5} />
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl md:text-6xl lg:text-7xl leading-[1.12] sm:leading-[1.08] text-[#333333] mb-4 sm:mb-6 tracking-tight">
            Colorful pieces,<br className="hidden sm:inline" />
            <span className="italic font-normal"> made just for you.</span>
          </h1>

          <p className="text-[#666666] text-sm sm:text-base md:text-lg mb-6 sm:mb-8 max-w-md mx-auto lg:mx-0 leading-relaxed font-light">
            Handmade jewellery crafted with love, inspired by nature and little moments of life.
          </p>

          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 sm:gap-4">
            <button
              onClick={onShopNow}
              className="inline-flex items-center justify-center bg-[#2d5a61] text-white px-7 sm:px-8 py-3 sm:py-3.5 rounded-full font-medium text-sm md:text-base hover:bg-[#1e3c41] transition-all duration-300 shadow-sm hover:shadow-md group cursor-pointer active:scale-95"
            >
              <span>Shop Now</span>
              <ArrowRight className="w-4 h-4 ml-2 transition-transform duration-300 group-hover:translate-x-1" />
            </button>

            <button
              onClick={onExploreNew}
              className="inline-flex items-center justify-center text-[#2d5a61] border border-[#2d5a61]/40 px-5 sm:px-6 py-3 sm:py-3.5 rounded-full font-medium text-sm md:text-base hover:bg-[#2d5a61]/10 transition-colors cursor-pointer active:scale-95"
            >
              Explore New In
            </button>
          </div>
        </div>

        {/* Right Column: Hero 3D Visual Artwork Composition with Multi-Layer Depth */}
        <div
          className="relative h-[340px] xs:h-[400px] sm:h-[500px] md:h-[560px] flex justify-center items-center w-full max-w-[440px] sm:max-w-[480px] mx-auto lg:max-w-none"
          style={{
            perspective: '1200px',
            transformStyle: 'preserve-3d',
          }}
        >
          {/* Main Arch Frame - Midground 3D Layer */}
          <div
            ref={archRef}
            className="absolute top-0 left-1/2 -translate-x-1/2 sm:left-auto sm:translate-x-0 sm:right-8 md:right-16 w-[210px] xs:w-[250px] sm:w-[310px] md:w-[360px] h-[310px] xs:h-[360px] sm:h-[450px] md:h-[510px] bg-[#e0d8c8] rounded-t-full overflow-hidden border-[4px] sm:border-[6px] md:border-[8px] border-[#efe8dc] z-10 will-change-transform"
            style={{
              transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) translate3d(0, 0, 15px)',
              boxShadow: '0 20px 30px -10px rgba(0,0,0,0.15)',
              transformStyle: 'preserve-3d',
            }}
          >
            <img
              src={HERO_IMAGES.arch}
              alt="Model wearing colorful handmade beaded bracelets"
              className="w-full h-full object-cover object-center scale-[1.03] transition-transform duration-700 ease-out"
              loading="eager"
            />
            {/* Subtle Studio Specular Light Sweep */}
            <div
              className="absolute inset-0 pointer-events-none opacity-20 bg-gradient-to-br from-white/35 to-transparent"
            />
          </div>

          {/* Circular Offset Image - Foreground 3D Layer (Enhanced Parallax & Float) */}
          <div
            ref={circleRef}
            className="absolute bottom-1 xs:bottom-3 sm:bottom-6 right-2 xs:right-4 sm:right-2 md:-right-4 translate-y-1 sm:translate-y-2 w-[130px] xs:w-[160px] sm:w-[230px] md:w-[270px] h-[130px] xs:h-[160px] sm:h-[230px] md:h-[270px] rounded-full overflow-hidden border-[4px] sm:border-[6px] md:border-[8px] border-[#efe8dc] z-20 will-change-transform"
            style={{
              transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) translate3d(0, 0, 45px)',
              boxShadow: '0 25px 35px -8px rgba(45, 90, 97, 0.25)',
              transformStyle: 'preserve-3d',
            }}
          >
            <img
              src={HERO_IMAGES.circle}
              alt="Close up of beaded bracelet with leaf charm"
              className="w-full h-full object-cover scale-[1.05]"
              loading="eager"
            />
            {/* Soft Ambient Depth Rim */}
            <div className="absolute inset-0 rounded-full border border-white/20 pointer-events-none" />
          </div>

          {/* Floating 'New Collection' Badge - Topmost 3D Depth Layer */}
          <div
            ref={badgeRef}
            className="absolute top-1/4 -right-2 lg:-right-10 z-30 max-w-[190px] bg-[#fdfaf5]/92 backdrop-blur-md p-4 rounded-2xl border border-[#e0d8c8] shadow-xl hidden md:block will-change-transform"
            style={{
              transform: 'translate3d(0, 0, 65px)',
            }}
          >
            <div className="flex items-center gap-1.5 text-[#2d5a61] italic font-serif text-base mb-1">
              <span>New Collection</span>
              <Sparkles className="w-3.5 h-3.5 text-[#D4B982]" />
            </div>
            <p className="text-xs text-[#666666] mb-3 leading-relaxed">
              Vibrant. Elegant. Unique. Just like you.
            </p>
            <button
              onClick={onExploreNew}
              className="inline-flex items-center text-xs font-medium text-[#2d5a61] border border-[#e0d8c8] px-3.5 py-1.5 rounded-full hover:bg-[#2d5a61] hover:text-white transition-colors cursor-pointer"
            >
              <span>Explore Now</span>
              <ArrowRight className="w-3 h-3 ml-1" />
            </button>
          </div>

          {/* Decorative Botanical Leaf Wireframe SVG - Deep Background */}
          <svg
            ref={bgLeafRef}
            className="absolute -bottom-8 -left-6 sm:left-4 w-40 sm:w-48 h-40 sm:h-48 text-[#2d5a61]/25 z-0 pointer-events-none transition-transform duration-700 ease-out"
            style={{
              transform: 'translate3d(0, 0, -15px)',
            }}
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M50 100 Q40 50 10 20 Q50 10 90 20 Q60 50 50 100 Z" stroke="currentColor" strokeWidth="1" />
            <path d="M50 100 Q30 70 20 40" stroke="currentColor" strokeWidth="1" />
          </svg>
        </div>
      </div>
    </section>
  );
};
