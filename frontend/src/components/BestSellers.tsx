import React from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Product } from '../types';
import { ProductCard3D } from './ProductCard3D';

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
    <section className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-10 sm:py-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3 sm:gap-4 mb-8 sm:mb-10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold uppercase tracking-widest text-[#2d5a61]">
              {selectedCategory ? `${selectedCategory} Collection` : 'Featured Artisan Selection'}
            </span>
            <Sparkles className="w-3.5 h-3.5 text-[#D4B982]" />
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl text-[#333333] decorative-sparkle">
            {selectedCategory ? `${selectedCategory}` : 'Best Sellers'}
          </h2>
        </div>

        <button
          onClick={onViewAll}
          className="text-xs sm:text-sm font-medium text-[#2d5a61] hover:text-[#1e3c41] flex items-center group cursor-pointer"
        >
          <span>{selectedCategory ? 'Show all pieces' : 'View all'}</span>
          <ArrowRight className="w-4 h-4 ml-1.5 transition-transform duration-300 group-hover:translate-x-1" />
        </button>
      </div>

      {/* Grid of Interactive 3D Product Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 md:gap-5">
        {products.map((product) => (
          <ProductCard3D
            key={product.id}
            product={product}
            isWishlisted={wishlistIds.includes(product.id)}
            onAddToCart={onAddToCart}
            onToggleWishlist={onToggleWishlist}
            onQuickView={onQuickView}
            variant="compact"
          />
        ))}
      </div>
    </section>
  );
};
