import React, { useEffect, useRef, useState } from 'react';
import { BrandLogoMark } from './BrandLogoMark';

/**
 * Custom Cursor Component for Maryam Sparkle
 *
 * Uses the canonical vertical-square/diamond logo mark.
 * Runs on a high-performance, zero-React-render RAF loop with hardware-accelerated GPU transforms.
 * Fully disabled on touch devices and respects prefers-reduced-motion.
 */
export const CustomCursor: React.FC = () => {
  const cursorRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);

  // Position and state references (avoiding React state on mousemove)
  const mousePos = useRef({ x: -100, y: -100 });
  const isClicking = useRef(false);
  const isOverInput = useRef(false);
  const isOverProduct = useRef(false);
  const isOverInteractive = useRef(false);
  const isVisible = useRef(false);

  // Media query checks
  const [isEnabled, setIsEnabled] = useState(false);

  useEffect(() => {
    // Only enable on devices with fine pointer (mouse/trackpad), not touch screens
    const finePointerMedia = window.matchMedia('(pointer: fine)');
    const reducedMotionMedia = window.matchMedia('(prefers-reduced-motion: reduce)');

    if (!finePointerMedia.matches) {
      setIsEnabled(false);
      return;
    }

    setIsEnabled(true);
    document.documentElement.classList.add('has-custom-cursor');

    const handlePointerMove = (e: PointerEvent) => {
      mousePos.current.x = e.clientX;
      mousePos.current.y = e.clientY;

      if (!isVisible.current) {
        isVisible.current = true;
        if (cursorRef.current && !isOverInput.current) {
          cursorRef.current.style.opacity = '1';
        }
      }

      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate3d(${e.clientX - 10}px, ${e.clientY - 10}px, 0)`;
      }
    };

    const handlePointerDown = () => {
      isClicking.current = true;
      updateVisualState();
    };

    const handlePointerUp = () => {
      isClicking.current = false;
      updateVisualState();
    };

    const handleMouseLeave = () => {
      isVisible.current = false;
      if (cursorRef.current) {
        cursorRef.current.style.opacity = '0';
      }
    };

    const handleMouseEnter = (e: MouseEvent) => {
      isVisible.current = true;
      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate3d(${e.clientX - 10}px, ${e.clientY - 10}px, 0)`;
      }
      updateVisualState();
    };

    // Fast event delegation to classify hover target
    const handleTargetCheck = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      // 1. Inputs / Textareas / Editables: hide custom cursor immediately
      const isInput = Boolean(
        target.closest('input, textarea, select, [contenteditable="true"], [role="textbox"], [type="text"], [type="email"], [type="password"], [type="number"]')
      );
      isOverInput.current = isInput;

      // 2. Product Cards: subtle scale + tilt
      const isProduct = Boolean(
        !isInput && (
          target.closest('[data-product-card]') ||
          target.closest('a[href^="/product/"]') ||
          target.closest('.group:has(img[alt])')
        )
      );
      isOverProduct.current = isProduct;

      // 3. General Clickable Controls: links, buttons, interactive items
      const isClickable = Boolean(
        !isInput && !isProduct && (
          target.closest('a, button, [role="button"], label[for], summary, [tabindex]:not([tabindex="-1"]), [onclick], .cursor-pointer')
        )
      );
      isOverInteractive.current = isClickable;

      updateVisualState();
    };

    const updateVisualState = () => {
      if (!innerRef.current || !cursorRef.current) return;

      if (!isVisible.current || isOverInput.current) {
        cursorRef.current.style.opacity = '0';
        return;
      }

      cursorRef.current.style.opacity = '1';

      const prefersReduced = reducedMotionMedia.matches;
      let scale = 1.0;
      let rotation = 0;
      let filter = 'drop-shadow(0 1px 2px rgba(45, 90, 97, 0.2))';

      if (isOverProduct.current) {
        scale = isClicking.current ? 1.15 : 1.35;
        rotation = prefersReduced ? 0 : 18;
        filter = 'drop-shadow(0 0 10px rgba(45, 90, 97, 0.45)) brightness(1.15)';
      } else if (isOverInteractive.current) {
        scale = isClicking.current ? 1.05 : 1.25;
        rotation = 0;
        filter = 'drop-shadow(0 0 8px rgba(45, 90, 97, 0.4)) brightness(1.1)';
      } else {
        scale = isClicking.current ? 0.82 : 1.0;
        rotation = 0;
        filter = 'drop-shadow(0 1px 3px rgba(45, 90, 97, 0.25))';
      }

      innerRef.current.style.transform = `scale(${scale}) rotate(${rotation}deg)`;
      innerRef.current.style.filter = filter;
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('pointerdown', handlePointerDown, { passive: true });
    window.addEventListener('pointerup', handlePointerUp, { passive: true });
    document.addEventListener('mouseover', handleTargetCheck, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);

    return () => {
      document.documentElement.classList.remove('has-custom-cursor');
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointerup', handlePointerUp);
      document.removeEventListener('mouseover', handleTargetCheck);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
    };
  }, []);

  if (!isEnabled) {
    return null;
  }

  return (
    <div
      ref={cursorRef}
      aria-hidden="true"
      className="fixed top-0 left-0 pointer-events-none z-[999999] will-change-transform opacity-0 transition-opacity duration-150 ease-out"
      style={{
        transform: 'translate3d(-100px, -100px, 0)',
      }}
    >
      <div
        ref={innerRef}
        className="w-5 h-5 text-[#2d5a61] transition-transform duration-150 ease-out origin-center"
      >
        <BrandLogoMark strokeWidth={1.75} innerStrokeWidth={1.25} dotRadius={3.5} />
      </div>
    </div>
  );
};
