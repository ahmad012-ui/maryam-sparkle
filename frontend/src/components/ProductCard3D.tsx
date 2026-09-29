import React, { useRef, useState, useEffect } from 'react';
import { Heart, ShoppingBag, Eye, Star, Box } from 'lucide-react';
import { Product } from '../types';
import { useAddToCartAnimation } from '../context/AddToCartAnimationContext';

interface ProductCard3DProps {
  product: Product;
  isWishlisted: boolean;
  onAddToCart: (product: Product) => void;
  onToggleWishlist: (product: Product) => void;
  onQuickView: (product: Product) => void;
  variant?: 'compact' | 'standard';
}

export const ProductCard3D: React.FC<ProductCard3DProps> = ({
  product,
  isWishlisted,
  onAddToCart,
  onToggleWishlist,
  onQuickView,
  variant = 'compact',
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const glareRef = useRef<HTMLDivElement>(null);
  const imageContainerRef = useRef<HTMLDivElement>(null);
  const { triggerFlyAnimation } = useAddToCartAnimation();

  const [canTilt, setCanTilt] = useState(false);
  const canTiltRef = useRef(false);
  const rafId = useRef<number | null>(null);

  useEffect(() => {
    // Only enable 3D tilt on devices with mouse/trackpad pointer and without reduced motion
    const finePointer = window.matchMedia('(pointer: fine)').matches;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const enabled = finePointer && !reducedMotion;
    setCanTilt(enabled);
    canTiltRef.current = enabled;

    return () => {
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!canTiltRef.current || !cardRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    // Normalized coordinates from -1 to 1 (0 at center)
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const x = (mouseX / width - 0.5) * 2;
    const y = (mouseY / height - 0.5) * 2;

    // Target tilt: rotateX ~ ±4 to 6 deg, rotateY ~ ±4 to 6 deg
    const maxTilt = 5.5;
    const rotX = -y * maxTilt;
    const rotY = x * maxTilt;

    // Shadow moves opposite to the virtual light source
    const shadowX = -x * 12;
    const shadowY = -y * 12 + 10;
    const shadowBlur = 24;

    const imgShiftX = x * 4;
    const imgShiftY = y * 4;
    const glareX = (mouseX / width) * 100;
    const glareY = (mouseY / height) * 100;

    if (rafId.current) cancelAnimationFrame(rafId.current);
    rafId.current = requestAnimationFrame(() => {
      if (cardRef.current) {
        cardRef.current.style.transform = `perspective(1000px) rotateX(${rotX.toFixed(2)}deg) rotateY(${rotY.toFixed(2)}deg) translateZ(4px)`;
        cardRef.current.style.boxShadow = `${shadowX.toFixed(1)}px ${shadowY.toFixed(1)}px ${shadowBlur}px rgba(45, 90, 97, 0.14)`;
      }
      if (imgRef.current) {
        imgRef.current.style.transform = `translateZ(18px) translate3d(${imgShiftX.toFixed(1)}px, ${imgShiftY.toFixed(1)}px, 0) scale(1.03)`;
      }
      if (glareRef.current) {
        glareRef.current.style.opacity = '0.15';
        glareRef.current.style.background = `radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0) 65%)`;
      }
    });
  };

  const handleMouseEnter = () => {
    if (!canTiltRef.current || !cardRef.current) return;
    cardRef.current.style.transition = 'transform 0.08s ease-out, box-shadow 0.15s ease-out';
    if (imgRef.current) {
      imgRef.current.style.transition = 'transform 0.08s ease-out';
    }
  };

  const handleMouseLeave = () => {
    if (!canTiltRef.current || !cardRef.current) return;
    if (rafId.current) cancelAnimationFrame(rafId.current);
    // Smoothly return to flat resting position
    cardRef.current.style.transition = 'transform 0.5s cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 0.5s ease';
    cardRef.current.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px)';
    cardRef.current.style.boxShadow = '';
    if (imgRef.current) {
      imgRef.current.style.transition = 'transform 0.5s cubic-bezier(0.2, 0.8, 0.2, 1)';
      imgRef.current.style.transform = 'translateZ(0px) translate3d(0, 0, 0) scale(1)';
    }
    if (glareRef.current) {
      glareRef.current.style.opacity = '0';
    }
  };

  const handleAddClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Trigger flying thumbnail animation toward cart icon
    if (imageContainerRef.current) {
      const rect = imageContainerRef.current.getBoundingClientRect();
      triggerFlyAnimation({
        imageUrl: product.image,
        sourceRect: rect,
      });
    }
    onAddToCart(product);
  };

  // Compact layout (used in BestSellers 6-col / 3-col)
  if (variant === 'compact') {
    return (
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        data-product-card
        style={{
          transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg)',
          transformStyle: 'preserve-3d',
        }}
        className="bg-[#fdfaf5] rounded-2xl p-4 shadow-sm border border-[#e0d8c8]/70 group flex flex-col justify-between relative will-change-transform"
      >
        {/* Subtle Glare Specular Highlight Overlay */}
        <div
          ref={glareRef}
          className="absolute inset-0 rounded-2xl pointer-events-none transition-opacity duration-300 z-30 opacity-0"
        />

        <div style={{ transformStyle: 'preserve-3d' }}>
          {/* Layered Image container */}
          <div
            ref={imageContainerRef}
            className="aspect-square rounded-xl overflow-hidden mb-3.5 relative bg-[#efe8dc] border border-[#e0d8c8]/40"
            style={{
              transform: 'translateZ(10px)',
              transformStyle: 'preserve-3d',
            }}
          >
            {/* Soft Ambient Contact Shadow Under Product */}
            <div
              className="absolute inset-x-4 bottom-2 h-6 bg-black/15 blur-md rounded-full pointer-events-none transition-transform duration-300 group-hover:scale-110 group-hover:translate-y-0.5"
            />

            {/* Product Image sitting with independent 3D parallax */}
            <img
              ref={imgRef}
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover cursor-pointer select-none transition-transform duration-300"
              style={{
                transform: 'translateZ(0px) scale(1)',
                transformStyle: 'preserve-3d',
              }}
              onClick={() => onQuickView(product)}
              loading="lazy"
            />

            {/* Wishlist button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleWishlist(product);
              }}
              style={{ transform: 'translateZ(26px)' }}
              className={`absolute top-2.5 right-2.5 p-1.5 rounded-full transition-all duration-200 shadow-xs z-20 cursor-pointer ${
                isWishlisted
                  ? 'bg-red-50 text-red-500 scale-110'
                  : 'bg-white/85 text-[#666666] hover:bg-white hover:text-red-500'
              }`}
              aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
            >
              <Heart
                className="w-4 h-4"
                fill={isWishlisted ? 'currentColor' : 'none'}
                strokeWidth={1.75}
              />
            </button>

            {/* Quick View Button overlay on hover */}
            <button
              onClick={() => onQuickView(product)}
              style={{ transform: 'translateZ(24px)' }}
              className="absolute inset-x-3 bottom-3 py-1.5 bg-white/95 text-[#2d5a61] text-xs font-semibold rounded-lg shadow-sm opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 hover:bg-[#2d5a61] hover:text-white cursor-pointer z-20"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Quick View</span>
            </button>

            {/* Badges */}
            <div
              style={{ transform: 'translateZ(24px)' }}
              className="absolute top-2.5 left-2.5 z-20 flex flex-col gap-1"
            >
              {product.isNew && (
                <span className="bg-[#2d5a61] text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-xs">
                  New
                </span>
              )}
              {Boolean(product.has3dModel || product.model3dUrl) && (
                <span className="bg-[#2d5a61] text-[#d4b982] text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-xs flex items-center gap-1 border border-[#d4b982]/30">
                  <Box className="w-2.5 h-2.5" />
                  <span>3D View</span>
                </span>
              )}
            </div>
          </div>

          {/* Product Info */}
          <div style={{ transform: 'translateZ(14px)' }}>
            <h3
              onClick={() => onQuickView(product)}
              className="font-serif text-sm text-[#333333] mb-1 truncate cursor-pointer hover:text-[#2d5a61] transition-colors"
              title={product.name}
            >
              {product.name}
            </h3>

            {/* Price */}
            <div className="flex items-baseline gap-2 mb-4">
              <p className="font-semibold text-sm text-[#333333]">
                Rs. {product.price.toLocaleString()}
              </p>
              {product.originalPrice && (
                <span className="text-xs text-[#888888] line-through">
                  Rs. {product.originalPrice.toLocaleString()}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Add to Bag Action */}
        <div style={{ transform: 'translateZ(16px)' }}>
          <button
            onClick={handleAddClick}
            className="w-full border border-[#e0d8c8] py-2.5 rounded-full text-xs font-medium text-[#333333] flex items-center justify-center gap-2 hover:bg-[#2d5a61] hover:text-white hover:border-[#2d5a61] transition-all duration-200 cursor-pointer shadow-2xs group/btn active:scale-95"
          >
            <span>Add to Bag</span>
            <ShoppingBag className="w-3.5 h-3.5 transition-transform group-hover/btn:scale-110" strokeWidth={1.5} />
          </button>
        </div>
      </div>
    );
  }

  // Standard layout (used in ShopPage 3-col / 4-col)
  return (
    <div
      ref={cardRef}
      id={`product-card-${product.id}`}
      data-product-card
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg)',
        transformStyle: 'preserve-3d',
      }}
      className="group bg-[#fdfaf5] rounded-2xl border border-[#e0d8c8]/80 overflow-hidden flex flex-col justify-between relative will-change-transform shadow-xs"
    >
      {/* Specular Glare */}
      <div
        ref={glareRef}
        className="absolute inset-0 pointer-events-none transition-opacity duration-300 z-30 opacity-0"
      />

      <div style={{ transformStyle: 'preserve-3d' }}>
        {/* Layered Image Container */}
        <div
          ref={imageContainerRef}
          className="relative aspect-square overflow-hidden bg-[#efe8dc]/50"
          style={{
            transform: 'translateZ(10px)',
            transformStyle: 'preserve-3d',
          }}
        >
          {/* Subtle Studio Contact Shadow */}
          <div
            className="absolute inset-x-8 bottom-3 h-8 bg-black/15 blur-lg rounded-full pointer-events-none transition-transform duration-300 group-hover:scale-110 group-hover:translate-y-0.5"
          />

          {/* Badges */}
          <div
            style={{ transform: 'translateZ(26px)' }}
            className="absolute top-3 left-3 z-20 flex flex-col gap-1.5"
          >
            {product.isBestSeller && (
              <span className="bg-[#2d5a61] text-white text-[10px] font-semibold tracking-wider uppercase px-2.5 py-1 rounded-full shadow-xs">
                Bestseller
              </span>
            )}
            {product.isNew && (
              <span className="bg-[#D4B982] text-[#1e3c41] text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-full shadow-xs">
                New Gem
              </span>
            )}
            {Boolean(product.has3dModel || product.model3dUrl) && (
              <span className="bg-[#2d5a61] text-[#d4b982] text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-full shadow-xs flex items-center gap-1 border border-[#d4b982]/30">
                <Box className="w-3 h-3" />
                <span>3D View</span>
              </span>
            )}
          </div>

          {/* Wishlist Button */}
          <button
            id={`wishlist-btn-${product.id}`}
            onClick={(e) => {
              e.stopPropagation();
              onToggleWishlist(product);
            }}
            style={{ transform: 'translateZ(26px)' }}
            className={`absolute top-3 right-3 z-20 p-2 rounded-full backdrop-blur-md transition-transform duration-200 hover:scale-110 cursor-pointer ${
              isWishlisted
                ? 'bg-[#2d5a61] text-white shadow-md'
                : 'bg-white/85 text-[#333333] hover:bg-white shadow-xs'
            }`}
            aria-label="Toggle Wishlist"
          >
            <Heart
              className="w-4 h-4"
              fill={isWishlisted ? 'currentColor' : 'none'}
            />
          </button>

          {/* Product Image */}
          <img
            ref={imgRef}
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover object-center transition-transform duration-300 cursor-pointer select-none"
            style={{
              transform: 'translateZ(0px) scale(1)',
              transformStyle: 'preserve-3d',
            }}
            onClick={() => onQuickView(product)}
            loading="lazy"
            referrerPolicy="no-referrer"
          />

          {/* Quick View Hover Overlay */}
          <div
            style={{ transform: 'translateZ(22px)' }}
            className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-4 z-20"
          >
            <button
              onClick={() => onQuickView(product)}
              className="bg-white/95 text-[#2d5a61] hover:bg-white text-xs font-semibold px-4 py-2 rounded-full shadow-lg flex items-center gap-1.5 transform translate-y-2 group-hover:translate-y-0 transition-all cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5" />
              Quick Look
            </button>
          </div>
        </div>

        {/* Product Details */}
        <div className="p-5 flex flex-col justify-between" style={{ transform: 'translateZ(14px)' }}>
          <div>
            <div className="flex items-center justify-between text-xs text-[#888888] mb-1">
              <span className="uppercase tracking-wider font-medium text-[10px] text-[#2d5a61]">
                {product.category}
              </span>
              {Boolean(product.rating && product.reviewsCount && product.reviewsCount > 0) && (
                <div className="flex items-center gap-1 text-[#D4B982]">
                  <Star className="w-3.5 h-3.5 fill-current" />
                  <span className="text-[11px] font-semibold text-[#444444]">
                    {product.rating} ({product.reviewsCount})
                  </span>
                </div>
              )}
            </div>

            <h3
              onClick={() => onQuickView(product)}
              className="font-serif text-lg text-[#333333] group-hover:text-[#2d5a61] transition-colors cursor-pointer line-clamp-1 mb-1"
            >
              {product.name}
            </h3>

            <p className="text-xs text-[#666666] line-clamp-2 leading-relaxed mb-3">
              {product.description}
            </p>
          </div>

          {/* Price & Add to Cart button */}
          <div className="pt-3 border-t border-[#e0d8c8]/50 flex items-center justify-between">
            <div className="flex items-baseline gap-2">
              <span className="font-serif text-base md:text-lg font-normal text-[#2d5a61]">
                Rs. {product.price.toLocaleString()}
              </span>
              {product.originalPrice && (
                <span className="text-xs text-[#999999] line-through">
                  Rs. {product.originalPrice.toLocaleString()}
                </span>
              )}
            </div>

            <button
              id={`add-bag-btn-${product.id}`}
              onClick={handleAddClick}
              className="bg-[#2d5a61] hover:bg-[#1e3c41] text-white p-2.5 sm:px-4 sm:py-2 rounded-full text-xs font-medium flex items-center gap-1.5 transition-all shadow-xs hover:shadow-md cursor-pointer group/btn active:scale-95"
              aria-label={`Add ${product.name} to Bag`}
            >
              <ShoppingBag className="w-3.5 h-3.5 transition-transform group-hover/btn:scale-110" />
              <span className="hidden sm:inline">Add to Bag</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
