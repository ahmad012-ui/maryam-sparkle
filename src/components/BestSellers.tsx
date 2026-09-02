import React from 'react';
import { ArrowRight, Heart, ShoppingBag, Eye, Sparkles } from 'lucide-react';
import { Product } from '../types';

interface BestSellersProps {
  products: Product[];
  wishlistIds: string[];
  selectedCategory: string | null;
  onAddToCart: (product: Product) => void;
  onToggleWishlist: (product: Product) => void;
  onQuickView: (product: Product) => void;
  onViewAll: () => void;
}

export const BestSellers: React.FC<BestSellersProps> = ({
  products,
  wishlistIds,
  selectedCategory,
  onAddToCart,
  onToggleWishlist,
  onQuickView,
  onViewAll,
}) => {
  return (
    <section className="max-w-7xl mx-auto px-6 md:px-8 py-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold uppercase tracking-widest text-[#2d5a61]">
              {selectedCategory ? `${selectedCategory} Collection` : 'Featured Artisan Selection'}
            </span>
            <Sparkles className="w-3.5 h-3.5 text-[#D4B982]" />
          </div>
          <h2 className="font-serif text-3xl md:text-4xl text-[#333333] decorative-sparkle">
            {selectedCategory ? `${selectedCategory}` : 'Best Sellers'}
          </h2>
        </div>

        <button
          onClick={onViewAll}
          className="text-sm font-medium text-[#2d5a61] hover:text-[#1e3c41] flex items-center group cursor-pointer"
        >
          <span>{selectedCategory ? 'Show all pieces' : 'View all'}</span>
          <ArrowRight className="w-4 h-4 ml-1.5 transition-transform duration-300 group-hover:translate-x-1" />
        </button>
      </div>

      {/* Grid of Product Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-5 sm:gap-6">
        {products.map((product) => {
          const isWishlisted = wishlistIds.includes(product.id);

          return (
            <div
              key={product.id}
              className="bg-[#fdfaf5] rounded-2xl p-4 shadow-sm border border-[#e0d8c8]/60 group flex flex-col justify-between hover:shadow-md transition-all duration-300 hover:-translate-y-1"
            >
              <div>
                {/* Image container */}
                <div className="aspect-square rounded-xl overflow-hidden mb-3.5 relative bg-[#efe8dc]">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 cursor-pointer"
                    onClick={() => onQuickView(product)}
                    loading="lazy"
                  />

                  {/* Wishlist button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleWishlist(product);
                    }}
                    className={`absolute top-2.5 right-2.5 p-1.5 rounded-full transition-all duration-200 shadow-xs z-10 ${
                      isWishlisted
                        ? 'bg-red-50 text-red-500 scale-110'
                        : 'bg-white/80 text-[#666666] hover:bg-white hover:text-red-500'
                    }`}
                    aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                  >
                    <Heart
                      className="w-4 h-4"
                      fill={isWishlisted ? 'currentColor' : 'none'}
                      strokeWidth={1.75}
                    />
                  </button>

                  {/* Quick View Button overlay on desktop */}
                  <button
                    onClick={() => onQuickView(product)}
                    className="absolute inset-x-3 bottom-3 py-1.5 bg-white/95 text-[#2d5a61] text-xs font-semibold rounded-lg shadow-sm opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 hover:bg-[#2d5a61] hover:text-white"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Quick View</span>
                  </button>

                  {/* Badges */}
                  {product.isNew && (
                    <span className="absolute top-2.5 left-2.5 bg-[#2d5a61] text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                      New
                    </span>
                  )}
                </div>

                {/* Product Info */}
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

              {/* Add to Bag action */}
              <button
                onClick={() => onAddToCart(product)}
                className="w-full border border-[#e0d8c8] py-2.5 rounded-full text-xs font-medium text-[#333333] flex items-center justify-center gap-2 hover:bg-[#2d5a61] hover:text-white hover:border-[#2d5a61] transition-all duration-200 cursor-pointer shadow-2xs group/btn"
              >
                <span>Add to Bag</span>
                <ShoppingBag className="w-3.5 h-3.5 transition-transform group-hover/btn:scale-110" strokeWidth={1.5} />
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
};
