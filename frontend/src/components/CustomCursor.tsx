import React, { useEffect, useRef, useState } from 'react';
import { BrandLogoMark } from './BrandLogoMark';

/**
 * Maryam Sparkle custom pointer.
 *
 * Desktop/trackpad: replaces the native pointer with the brand mark.
 * Touch/tablet: shows the same mark while the user is touching/moving,
 * without disabling native scrolling or gestures.
 */
export const CustomCursor: React.FC = () => {
  const cursorRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const hideTimerRef = useRef<number | null>(null);

  const isVisible = useRef(false);
  const isClicking = useRef(false);
  const isOverInput = useRef(false);
  const currentMode = useRef<'default' | 'interactive'>('default');
  const [isEnabled, setIsEnabled] = useState(false);

  useEffect(() => {
    const finePointerMedia = window.matchMedia('(pointer: fine)');
    const reducedMotionMedia = window.matchMedia('(prefers-reduced-motion: reduce)');
    const touchCapable = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

    setIsEnabled(!reducedMotionMedia.matches);

    if (!reducedMotionMedia.matches && finePointerMedia.matches) {
      document.documentElement.classList.add('has-custom-cursor');
    }

    const showCursor = (x: number, y: number, temporary = false) => {
      const cursor = cursorRef.current;
      if (!cursor) return;

      cursor.style.transform = `translate3d(${x - 10}px, ${y - 10}px, 0)`;
      isVisible.current = true;

      if (!isOverInput.current || temporary) {
        cursor.style.opacity = '1';
      }

      if (hideTimerRef.current !== null) {
        window.clearTimeout(hideTimerRef.current);
      }

      if (temporary) {
        hideTimerRef.current = window.setTimeout(() => {
          if (!isClicking.current && cursorRef.current) {
            cursorRef.current.style.opacity = '0';
            isVisible.current = false;
          }
        }, 900);
      }
    };

    const updateTransform = () => {
      if (!innerRef.current || isOverInput.current) return;

      let scale = 1;
      let rotation = 0;

      if (isClicking.current) {
        scale = 0.82;
      } else if (currentMode.current === 'interactive') {
        scale = 1.25;
        rotation = reducedMotionMedia.matches ? 0 : 12;
      }

      innerRef.current.style.transform = `scale(${scale}) rotate(${rotation}deg)`;
    };

    const handlePointerMove = (event: PointerEvent) => {
      showCursor(event.clientX, event.clientY, event.pointerType === 'touch');
    };

    const handlePointerDown = (event: PointerEvent) => {
      isClicking.current = true;
      showCursor(event.clientX, event.clientY, event.pointerType === 'touch');
      updateTransform();
    };

    const handlePointerUp = () => {
      isClicking.current = false;
      updateTransform();
    };

    const handlePointerCancel = () => {
      isClicking.current = false;
      if (cursorRef.current && touchCapable) {
        cursorRef.current.style.opacity = '0';
      }
      updateTransform();
    };

    const handlePointerOver = (event: PointerEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target) return;

      const isInput = Boolean(
        target.closest('input, textarea, select, [contenteditable="true"], [role="textbox"]')
      );

      if (isInput !== isOverInput.current) {
        isOverInput.current = isInput;
        if (cursorRef.current) {
          cursorRef.current.style.opacity = isInput ? '0' : isVisible.current ? '1' : '0';
        }
      }

      if (isInput) return;

      const isInteractive = Boolean(
        target.closest(
          'a, button, [role="button"], label[for], summary, [data-product-card], [data-category-card], .cursor-pointer'
        )
      );

      currentMode.current = isInteractive ? 'interactive' : 'default';
      updateTransform();
    };

    const handlePointerLeave = () => {
      if (cursorRef.current) cursorRef.current.style.opacity = '0';
      isVisible.current = false;
    };

    window.addEventListener('pointermove', handlePointerMove, { capture: true, passive: true });
    window.addEventListener('pointerdown', handlePointerDown, { capture: true, passive: true });
    window.addEventListener('pointerup', handlePointerUp, { capture: true, passive: true });
    window.addEventListener('pointercancel', handlePointerCancel, { capture: true, passive: true });
    document.addEventListener('pointerover', handlePointerOver, { passive: true });
    document.addEventListener('mouseleave', handlePointerLeave);

    return () => {
      if (hideTimerRef.current !== null) window.clearTimeout(hideTimerRef.current);
      document.documentElement.classList.remove('has-custom-cursor');
      window.removeEventListener('pointermove', handlePointerMove, { capture: true });
      window.removeEventListener('pointerdown', handlePointerDown, { capture: true });
      window.removeEventListener('pointerup', handlePointerUp, { capture: true });
      window.removeEventListener('pointercancel', handlePointerCancel, { capture: true });
      document.removeEventListener('pointerover', handlePointerOver);
      document.removeEventListener('mouseleave', handlePointerLeave);
    };
  }, []);

  if (!isEnabled) return null;

  return (
    <div
      ref={cursorRef}
      aria-hidden="true"
      className="fixed top-0 left-0 pointer-events-none z-[999999] will-change-transform opacity-0"
      style={{ transform: 'translate3d(-100px, -100px, 0)' }}
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
