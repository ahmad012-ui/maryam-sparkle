import React, { useEffect, useState } from 'react';
import { BrandLogoMark } from './BrandLogoMark';

interface FullScreenLoaderProps {
  isReady: boolean;
}

/**
 * Full-Screen Application Startup Loader for Maryam Sparkle
 *
 * Sequence:
 * 1. APPEAR: Logo fades in smoothly.
 * 2. EXPAND: Logo gently scales up from a smaller size.
 * 3. ROTATE: Slow, elegant 360° rotation.
 * 4. PULSE: Very subtle glow/pulse around the logo.
 * 5. EXIT: Logo fades/scales out smoothly as the overlay transitions away.
 *
 * Exits as soon as the application is genuinely ready with zero artificial delays.
 */
export const FullScreenLoader: React.FC<FullScreenLoaderProps> = ({ isReady }) => {
  const [mounted, setMounted] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [isRemoved, setIsRemoved] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    // Check reduced motion preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);

    // Trigger appear + expand on initial mount
    const rAF = requestAnimationFrame(() => {
      setMounted(true);
    });

    return () => cancelAnimationFrame(rAF);
  }, []);

  useEffect(() => {
    if (isReady && !isExiting) {
      setIsExiting(true);
      // Cleanly unmount overlay after exit transition finishes
      const timer = setTimeout(() => {
        setIsRemoved(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isReady, isExiting]);

  if (isRemoved) {
    return null;
  }

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Loading Maryam Sparkle"
      className={`fixed inset-0 z-[100000] flex items-center justify-center bg-[#efe8dc] transition-all duration-500 ease-in-out ${
        isExiting ? 'opacity-0 pointer-events-none' : 'opacity-100 pointer-events-auto'
      }`}
    >
      {/* Centered Brand Diamond Logo Mark */}
      <div
        className={`relative flex items-center justify-center transition-all duration-500 ease-out ${
          !mounted
            ? 'opacity-0 scale-85'
            : isExiting
            ? 'opacity-0 scale-105'
            : 'opacity-100 scale-100'
        }`}
      >
        <div
          className={`w-14 h-14 sm:w-16 sm:h-16 text-[#2d5a61] ${
            !reducedMotion ? 'animate-ms-loader-spin animate-ms-loader-pulse' : ''
          }`}
        >
          <BrandLogoMark
            strokeWidth={1.75}
            innerStrokeWidth={1.25}
            dotRadius={3.5}
            className="w-full h-full text-[#2d5a61]"
          />
        </div>
      </div>
    </div>
  );
};
