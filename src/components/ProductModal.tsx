import React, { useState } from 'react';
import { X, Heart, ShoppingBag, Sparkles, Check, ShieldCheck, Truck, RefreshCw, Star, ChevronLeft, ChevronRight, Images } from 'lucide-react';
import { Product } from '../types';

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

  const galleryImages = (product?.images && product.images.length > 0)
    ? product.images
    : product?.image
    ? [product.image]
    : [];
  const currentImage = galleryImages[activeImageIndex] || product?.image || '';

  React.useEffect(() => {
    if (product) {
      const initial = product.finish || product.availableFinishes?.[0] || 'Gold-Tone';
      setSelectedFinish(initial);
      setActiveImageIndex(0);
    }
  }, [product]);

  if (!isOpen || !product) return null;

  const sizes = ['Small (6.0")', 'Medium (6.5")', 'Large (7.0")', 'Custom Fit'];
  const finishes = product.availableFinishes && product.availableFinishes.length > 0
    ? product.availableFinishes
    : product.finish
    ? [product.finish]
    : ['Gold-Tone', 'Silver-Tone'];

  const handleAdd = () => {
    onAddToCart(product, selectedSize, selectedFinish, customNote);
    setAddedAnimation(true);
    setTimeout(() => {
      setAddedAnimation(false);
      onClose();
    }, 900);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative bg-[#fdfaf5] rounded-[32px] max-w-3xl w-full overflow-hidden shadow-2xl border border-[#e0d8c8] my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 bg-white/80 hover:bg-white text-[#333333] rounded-full transition-colors shadow-sm cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Left: Visual Artwork Preview & Gallery Switcher */}
          <div className="relative bg-[#efe8dc] flex flex-col items-center justify-center p-6 sm:p-8">
            <div className="relative w-full aspect-square max-h-[380px] rounded-2xl overflow-hidden shadow-md border-4 border-[#efe8dc] group">
              <img
                src={currentImage}
                alt={product.name}
                className="w-full h-full object-cover transition-all duration-300"
              />

              {/* Wishlist Button */}
              <button
                onClick={() => onToggleWishlist(product)}
                className={`absolute top-3 right-3 p-2.5 rounded-full transition-all shadow-md z-10 ${
                  isWishlisted
                    ? 'bg-red-50 text-red-500 scale-110'
                    : 'bg-white/80 text-[#666666] hover:bg-white hover:text-red-500'
                }`}
              >
                <Heart className="w-5 h-5" fill={isWishlisted ? 'currentColor' : 'none'} />
              </button>

              {/* Arrow navigation if multiple images */}
              {galleryImages.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={handlePrevImage}
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={handleNextImage}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-label="Next image"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                  <span className="absolute bottom-2.5 left-2.5 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded-full font-medium backdrop-blur-xs flex items-center gap-1">
                    <Images className="w-2.5 h-2.5" />
                    {activeImageIndex + 1} / {galleryImages.length}
                  </span>
                </>
              )}
            </div>

            {/* Thumbnail selector strip if more than 1 image */}
            {galleryImages.length > 1 && (
              <div className="flex items-center gap-2 mt-3 overflow-x-auto max-w-full pb-1 px-1 no-scrollbar">
                {galleryImages.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImageIndex(idx)}
                    className={`relative w-12 h-12 rounded-lg overflow-hidden shrink-0 border-2 transition-all ${
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

          {/* Right: Product Details & Customization Options */}
          <div className="p-6 sm:p-8 flex flex-col justify-between max-h-[85vh] overflow-y-auto">
            <div>
              {/* Category & Rating */}
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="font-semibold uppercase tracking-widest text-[#2d5a61]">
                  {product.category}
                </span>
                <div className="flex items-center gap-1 text-[#D4B982] font-semibold">
                  <Star className="w-3.5 h-3.5 fill-[#D4B982]" />
                  <span>{product.rating || 4.9}</span>
                  <span className="text-[#888888]">({product.reviewsCount || 42} reviews)</span>
                </div>
              </div>

              {/* Title */}
              <h2 className="font-serif text-2xl sm:text-3xl text-[#333333] mb-2 font-medium leading-tight">
                {product.name}
              </h2>

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
                className={`w-full py-3.5 rounded-full font-medium text-sm flex items-center justify-center gap-2 transition-all duration-300 shadow-md cursor-pointer ${
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
                    <span>Add to Bag • Rs. {product.price.toLocaleString()}</span>
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
