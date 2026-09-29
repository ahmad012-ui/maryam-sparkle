import React, { useEffect, useRef, useState } from 'react';
import { BrandLogoMark } from './BrandLogoMark';

/**
 * Custom Cursor Component for Maryam Sparkle
 *
 * Uses the canonical vertical-square/diamond logo mark.
 * Runs on zero-latency, direct hardware-synchronous transforms (capturing mousemove).
 * Fully disabled on touch devices and respects prefers-reduced-motion.
 */
export const CustomCursor: React.FC = () => {
  const cursorRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);

  const isVisible = useRef(false);
  const isClicking = useRef(false);
  const isOverInput = useRef(false);
  const currentMode = useRef<'default' | 'interactive' | 'input'>('default');

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

    // Immediate zero-latency pointer positioning (capture mode for earliest dispatch)
    const handleMove = (e: MouseEvent) => {
      const x = e.clientX;
      const y = e.clientY;

      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate3d(${x - 10}px, ${y - 10}px, 0)`;
        if (!isVisible.current) {
          isVisible.current = true;
          if (!isOverInput.current) {
            cursorRef.current.style.opacity = '1';
          }
        }
      }
    };

    const updateTransform = () => {
      if (!innerRef.current) return;
      if (isOverInput.current) return;

      const prefersReduced = reducedMotionMedia.matches;
      let scale = 1.0;
      let rotation = 0;

      if (isClicking.current) {
        scale = 0.82;
      } else if (currentMode.current === 'interactive') {
        scale = 1.25;
        rotation = prefersReduced ? 0 : 12;
      }

      innerRef.current.style.transform = `scale(${scale}) rotate(${rotation}deg)`;
    };

    const handlePointerDown = () => {
      isClicking.current = true;
      updateTransform();
    };

    const handlePointerUp = () => {
      isClicking.current = false;
      updateTransform();
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
        if (!isOverInput.current) {
          cursorRef.current.style.opacity = '1';
        }
      }
    };

    // Fast, lightweight event delegation (no expensive :has() selectors)
    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      const isInput = Boolean(
        target.closest('input, textarea, select, [contenteditable="true"], [role="textbox"]')
      );

      if (isInput !== isOverInput.current) {
        isOverInput.current = isInput;
        if (cursorRef.current) {
          cursorRef.current.style.opacity = isInput ? '0' : (isVisible.current ? '1' : '0');
        }
      }

      if (isInput) return;

      const isInteractive = Boolean(
        target.closest('a, button, [role="button"], label[for], summary, [data-product-card], [data-category-card], .cursor-pointer')
      );

      const nextMode = isInteractive ? 'interactive' : 'default';
      if (currentMode.current !== nextMode) {
        currentMode.current = nextMode;
        updateTransform();
      }
    };

    // Use capturing mousemove for instant response before other handlers
    window.addEventListener('mousemove', handleMove, { capture: true, passive: true });
    window.addEventListener('pointermove', handleMove, { capture: true, passive: true });
    window.addEventListener('mousedown', handlePointerDown, { capture: true, passive: true });
    window.addEventListener('mouseup', handlePointerUp, { capture: true, passive: true });
    document.addEventListener('mouseover', handleMouseOver, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);

    return () => {
      document.documentElement.classList.remove('has-custom-cursor');
      window.removeEventListener('mousemove', handleMove, { capture: true });
      window.removeEventListener('pointermove', handleMove, { capture: true });
      window.removeEventListener('mousedown', handlePointerDown, { capture: true });
      window.removeEventListener('mouseup', handlePointerUp, { capture: true });
      document.removeEventListener('mouseover', handleMouseOver);
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
      className="fixed top-0 left-0 pointer-events-none z-[999999] will-change-transform opacity-0"
      style={{
        transform: 'translate3d(-100px, -100px, 0)',
      }}
    >
      <div
        ref={innerRef}
        className="w-5 h-5 text-[#2d5a61] transition-transform duration-100 ease-out origin-center drop-shadow-[0_1px_2px_rgba(45,90,97,0.3)]"
      >
        <BrandLogoMark strokeWidth={1.8} innerStrokeWidth={1.25} dotRadius={3.5} />
      </div>
    </div>
  );
};
