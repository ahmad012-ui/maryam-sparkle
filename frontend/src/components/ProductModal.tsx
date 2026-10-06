import React, { useState } from 'react';
import { X, Heart, ShoppingBag, Sparkles, Check, ShieldCheck, Truck, RefreshCw, Star, ChevronLeft, ChevronRight, Images, Share2 } from 'lucide-react';
import { Product } from '../types';
import { recentActivityService } from '../services/recentActivityService';
import { ProductMediaViewer } from './ProductMediaViewer';
import { useAddToCartAnimation } from '../context/AddToCartAnimationContext';

interface ProductModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (product: Product, size: string, finish: string, customNote: string) => void;
  isWishlisted: boolean;
  onToggleWishlist: (product: Product) => void;
}

export const ProductModal: React.FC<ProductModalProps> = ({
  product,
  isOpen,
  onClose,
  onAddToCart,
  isWishlisted,
  onToggleWishlist,
}) => {
  const defaultFinish = product?.finish || product?.availableFinishes?.[0] || 'Gold-Tone';
  const [selectedSize, setSelectedSize] = useState('Medium (6.5")');
  const [selectedFinish, setSelectedFinish] = useState(defaultFinish);
  const [customNote, setCustomNote] = useState('');
  const [addedAnimation, setAddedAnimation] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [copiedLink, setCopiedLink] = useState(false);
  const { triggerFlyAnimation } = useAddToCartAnimation();

  const galleryImages = (product?.images && product.images.length > 0)
    ? product.images
    : product?.image
    ? [product.image]
    : [];
  const currentImage = galleryImages[activeImageIndex] || product?.image || '';

  React.useEffect(() => {
    if (isOpen && product) {
      const initial = product.finish || product.availableFinishes?.[0] || 'Gold-Tone';
      setSelectedFinish(initial);
      setActiveImageIndex(0);
      setCopiedLink(false);

      // Authoritative recently viewed recording whenever canonical product-detail is opened/viewed
      recentActivityService.recordProductView(product.id);
    }
  }, [isOpen, product?.id]);

  if (!isOpen || !product) return null;

  const sizes = ['Small (6.0")', 'Medium (6.5")', 'Large (7.0")', 'Custom Fit'];
  const finishes = product.availableFinishes && product.availableFinishes.length > 0
    ? product.availableFinishes
    : product.finish
    ? [product.finish]
    : ['Gold-Tone', 'Silver-Tone'];

  const handleAdd = () => {
    if (!product.inStock) return;
    triggerFlyAnimation({
      imageUrl: currentImage,
    });
    onAddToCart(product, selectedSize, selectedFinish, customNote);
    setAddedAnimation(true);
    setTimeout(() => {
      setAddedAnimation(false);
      onClose();
    }, 900);
  };

  const handleShare = () => {
    const url = `${window.location.origin}/product/${product.slug}`;
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: product.shortDescription || product.description,
        url,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(url);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const handlePrevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveImageIndex((prev) => (prev > 0 ? prev - 1 : galleryImages.length - 1));
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveImageIndex((prev) => (prev < galleryImages.length - 1 ? prev + 1 : 0));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative bg-[#fdfaf5] rounded-2xl sm:rounded-[32px] max-w-3xl w-full max-h-[92vh] overflow-y-auto md:overflow-hidden shadow-2xl border border-[#e0d8c8] my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Top Right Action Buttons (Share & Close) */}
        <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-20 flex items-center gap-2">
          <button
            onClick={handleShare}
            className="p-2 bg-white/80 hover:bg-white text-[#333333] rounded-full transition-colors shadow-sm cursor-pointer"
            aria-label="Share product"
            title="Share product link"
          >
            {copiedLink ? <Check className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" /> : <Share2 className="w-4 h-4 sm:w-5 sm:h-5" />}
          </button>
          <button
            onClick={onClose}
            className="p-2 bg-white/80 hover:bg-white text-[#333333] rounded-full transition-colors shadow-sm cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Left: Interactive 3D Depth Visual Artwork Preview & Gallery Switcher */}
          <ProductMediaViewer
            product={product}
            currentImage={currentImage}
            galleryImages={galleryImages}
            activeImageIndex={activeImageIndex}
            onSelectImage={setActiveImageIndex}
            onPrevImage={handlePrevImage}
            onNextImage={handleNextImage}
            isWishlisted={isWishlisted}
            onToggleWishlist={() => onToggleWishlist(product)}
          />

          {/* Right: Product Details & Customization Options */}
          <div className="p-4 xs:p-5 sm:p-8 flex flex-col justify-between md:max-h-[85vh] md:overflow-y-auto">
            <div>
              {/* Category, Rating & Title Header with dedicated clearance for top-right action buttons */}
              <div className="pr-20 sm:pr-24 mb-3">
                <div className="flex items-center gap-2.5 text-xs mb-1.5 flex-wrap">
                  <span className="font-semibold uppercase tracking-widest text-[#2d5a61]">
                    {product.category}
                  </span>
                  {Boolean(product.rating && product.reviewsCount && product.reviewsCount > 0) ? (
                    <>
                      <span className="text-[#d8cfc0]">•</span>
                      <div className="flex items-center gap-1 text-[#D4B982] font-semibold">
                        <Star className="w-3.5 h-3.5 fill-[#D4B982]" />
                        <span>{product.rating}</span>
                        <span className="text-[#888888] font-normal">
                          ({product.reviewsCount} {product.reviewsCount === 1 ? 'review' : 'reviews'})
                        </span>
                      </div>
                    </>
                  ) : (
                    <>
                      <span className="text-[#d8cfc0]">•</span>
                      <span className="text-[11px] text-[#777777] font-normal">
                        Handcrafted Atelier Original
                      </span>
                    </>
                  )}
                </div>

                {/* Title */}
                <h2 className="font-serif text-2xl sm:text-3xl text-[#333333] font-medium leading-tight">
                  {product.name}
                </h2>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-2 mb-4">
                <span className="text-xl sm:text-2xl font-bold text-[#2d5a61]">
                  Rs. {product.price.toLocaleString()}
                </span>
                {product.originalPrice && (
                  <span className="text-sm text-[#888888] line-through">
                    Rs. {product.originalPrice.toLocaleString()}
                  </span>
                )}
                <span className="text-[11px] bg-[#efe8dc] text-[#2d5a61] px-2 py-0.5 rounded-full font-medium ml-1">
                  Tax included
                </span>
              </div>

              {/* Description */}
              <p className="text-xs sm:text-sm text-[#666666] leading-relaxed mb-5">
                {product.description}
              </p>

              {/* Materials Chips */}
              <div className="mb-5">
                <h4 className="text-xs font-semibold text-[#444444] mb-2 uppercase tracking-wide">
                  Handcrafted Materials
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {product.materials.map((mat, idx) => (
                    <span
                      key={idx}
                      className="text-xs bg-[#efe8dc] text-[#2d5a61] px-3 py-1 rounded-full font-medium"
                    >
                      {mat}
                    </span>
                  ))}
                </div>
              </div>

              {/* Size Selector */}
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-semibold text-[#444444] uppercase tracking-wide">
                    Select Size
                  </label>
                  <span className="text-[11px] text-[#2d5a61] font-medium">Wrist circumference</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {sizes.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setSelectedSize(s)}
                      className={`text-xs py-2 px-3 rounded-xl border text-center transition-all cursor-pointer ${
                        selectedSize === s
                          ? 'border-[#2d5a61] bg-[#2d5a61] text-white font-medium shadow-xs'
                          : 'border-[#e0d8c8] text-[#555555] hover:border-[#2d5a61]'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Metal Finish */}
              <div className="mb-5">
                <label className="block text-xs font-semibold text-[#444444] mb-2 uppercase tracking-wide">
                  Accent Finish
                </label>
                <div className="flex flex-wrap gap-2">
                  {finishes.map((f) => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => setSelectedFinish(f)}
                      className={`text-xs py-1.5 px-3 rounded-full border transition-all cursor-pointer ${
                        selectedFinish === f
                          ? 'border-[#2d5a61] bg-[#efe8dc] text-[#2d5a61] font-semibold'
                          : 'border-[#e0d8c8] text-[#666666] hover:border-[#2d5a61]'
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Note or Sizing Request */}
              <div className="mb-6">
                <label className="block text-xs font-semibold text-[#444444] mb-1.5 uppercase tracking-wide">
                  Custom Request or Gift Note (Optional)
                </label>
                <input
                  type="text"
                  value={customNote}
                  onChange={(e) => setCustomNote(e.target.value)}
                  placeholder="e.g. Custom 6.25 inch wrist or gift message"
                  className="w-full bg-white border border-[#e0d8c8] rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#2d5a61]"
                />
              </div>
            </div>

            {/* Action Buttons & Guarantees */}
            <div>
              <button
                onClick={handleAdd}
                disabled={!product.inStock}
                className={`w-full py-3.5 rounded-full font-medium text-sm flex items-center justify-center gap-2 transition-all duration-300 shadow-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                  addedAnimation
                    ? 'bg-green-700 text-white'
                    : 'bg-[#2d5a61] text-white hover:bg-[#1e3c41]'
                }`}
              >
                {addedAnimation ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Added to Sparkle Bag!</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" />
                    <span>{product.inStock ? `Add to Bag • Rs. ${product.price.toLocaleString()}` : 'Out of Stock'}</span>
                  </>
                )}
              </button>

              {/* Value propositions mini badge */}
              <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-[#e0d8c8]/60 text-[10px] text-[#666666] text-center">
                <div className="flex flex-col items-center">
                  <ShieldCheck className="w-4 h-4 text-[#2d5a61] mb-0.5" />
                  <span>100% Handmade</span>
                </div>
                <div className="flex flex-col items-center">
                  <Truck className="w-4 h-4 text-[#2d5a61] mb-0.5" />
                  <span>Tracked Delivery</span>
                </div>
                <div className="flex flex-col items-center">
                  <RefreshCw className="w-4 h-4 text-[#2d5a61] mb-0.5" />
                  <span>Free Resizing</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
