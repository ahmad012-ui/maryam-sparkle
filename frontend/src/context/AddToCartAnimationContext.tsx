import React, { createContext, useContext, useCallback, useRef } from 'react';

interface FlyItemOptions {
  imageUrl: string;
  sourceRect?: DOMRect | { x: number; y: number; width?: number; height?: number };
}

interface AddToCartAnimationContextType {
  triggerFlyAnimation: (options: FlyItemOptions) => void;
}

const AddToCartAnimationContext = createContext<AddToCartAnimationContextType>({
  triggerFlyAnimation: () => {},
});

export const useAddToCartAnimation = () => useContext(AddToCartAnimationContext);

export const AddToCartAnimationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const triggerFlyAnimation = useCallback(({ imageUrl, sourceRect }: FlyItemOptions) => {
    // Respect prefers-reduced-motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    // Determine target cart element (desktop header button or mobile dynamic island nav button)
    const desktopCartBtn = document.getElementById('cart-header-btn') as HTMLElement | null;
    const mobileCartBtn = document.querySelector<HTMLElement>('nav[aria-label="Mobile Navigation"] a[href="/cart"]');
    
    // Choose appropriate visible target element
    let targetEl: HTMLElement | null = null;
    if (desktopCartBtn && desktopCartBtn.offsetParent !== null) {
      targetEl = desktopCartBtn;
    } else if (mobileCartBtn && mobileCartBtn.offsetParent !== null) {
      targetEl = mobileCartBtn;
    } else {
      targetEl = desktopCartBtn || mobileCartBtn;
    }

    const targetRect = targetEl?.getBoundingClientRect() || {
      top: 24,
      left: window.innerWidth - 60,
      width: 40,
      height: 40,
    };

    // Determine start coordinates
    let startX = window.innerWidth / 2;
    let startY = window.innerHeight / 2;
    let startSize = 72;

    if (sourceRect) {
      const w = sourceRect.width || 72;
      const h = sourceRect.height || 72;
      startX = sourceRect.x + w / 2;
      startY = sourceRect.y + h / 2;
      startSize = Math.min(Math.max(w, 48), 100);
    }

    const endX = targetRect.left + (targetRect.width || 40) / 2;
    const endY = targetRect.top + (targetRect.height || 40) / 2;

    // Create the flying ghost element
    const ghost = document.createElement('div');
    ghost.className = 'ms-fly-cart-ghost';
    ghost.style.cssText = `
      position: fixed;
      left: ${startX}px;
      top: ${startY}px;
      width: ${startSize}px;
      height: ${startSize}px;
      margin-left: -${startSize / 2}px;
      margin-top: -${startSize / 2}px;
      pointer-events: none;
      z-index: 99999;
      border-radius: 9999px;
      overflow: hidden;
      box-shadow: 0 10px 25px -3px rgba(45, 90, 97, 0.4), 0 0 16px rgba(212, 185, 130, 0.5);
      border: 2px solid #efe8dc;
      background-color: #efe8dc;
      transform-origin: center center;
      transform: translate3d(0, 0, 0) scale(1);
      transition: transform 600ms cubic-bezier(0.2, 0.9, 0.3, 1), opacity 600ms ease-in, box-shadow 400ms ease;
      will-change: transform, opacity;
    `;

    const img = document.createElement('img');
    img.src = imageUrl;
    img.alt = 'Flying to bag';
    img.style.cssText = `
      width: 100%;
      height: 100%;
      object-fit: cover;
    `;
    ghost.appendChild(img);
    document.body.appendChild(ghost);

    // Step 1: Initial subtle lift & glow (0ms -> 80ms)
    requestAnimationFrame(() => {
      ghost.style.transform = `translate3d(0, -14px, 0) scale(1.1)`;
      ghost.style.boxShadow = `0 16px 32px -4px rgba(45, 90, 97, 0.5), 0 0 20px rgba(212, 185, 130, 0.7)`;

      // Step 2: Arc flight toward the destination cart (80ms -> 600ms)
      setTimeout(() => {
        const deltaX = endX - startX;
        const deltaY = endY - startY;

        ghost.style.transform = `translate3d(${deltaX}px, ${deltaY}px, 0) scale(0.22)`;
        ghost.style.opacity = '0.2';

        // Step 3: Landing bounce on cart icon (600ms)
        setTimeout(() => {
          if (ghost.parentNode) {
            ghost.parentNode.removeChild(ghost);
          }

          // Trigger bounce effect on target cart button
          if (targetEl) {
            targetEl.classList.remove('animate-ms-cart-bounce');
            // Force reflow
            void (targetEl as HTMLElement).offsetWidth;
            targetEl.classList.add('animate-ms-cart-bounce');

            setTimeout(() => {
              targetEl?.classList.remove('animate-ms-cart-bounce');
            }, 600);
          }

          // Dispatch synthetic event for any listener
          window.dispatchEvent(new CustomEvent('ms-item-added-to-cart'));
        }, 580);
      }, 80);
    });
  }, []);

  return (
    <AddToCartAnimationContext.Provider value={{ triggerFlyAnimation }}>
      {children}
      <div ref={containerRef} aria-hidden="true" />
    </AddToCartAnimationContext.Provider>
  );
};
