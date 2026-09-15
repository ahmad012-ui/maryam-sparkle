import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, Eye, Heart, ShoppingBag, ArrowRight, History } from 'lucide-react';
import { Product } from '../types';
import { recentActivityService } from '../services/recentActivityService';
import { productService } from '../services/productService';

interface RecentlyViewedSectionProps {
  currentProductId?: string;
  currentProductSlug?: string;
  wishlistIds?: string[];
  onAddToCart?: (product: Product) => void;
  onToggleWishlist?: (product: Product) => void;
  onQuickView?: (product: Product) => void;
  title?: string;
  subtitle?: string;
  limit?: number;
}

export const RecentlyViewedSection: React.FC<RecentlyViewedSectionProps> = ({
  currentProductId,
  currentProductSlug,
  wishlistIds = [],
  onAddToCart,
  onToggleWishlist,
  onQuickView,
  title = 'Recently Viewed',
  subtitle = 'Pick up right where you left off with your recently explored artisan pieces.',
  limit = 5,
}) => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const loadItems = async () => {
    try {
      const rawIdentifiers = recentActivityService.getRecentlyViewedIds();
      if (!rawIdentifiers || rawIdentifiers.length === 0) {
        setProducts([]);
        setLoading(false);
        return;
      }

      // Filter out the currently viewed product by ID or slug
      const filteredIdentifiers = rawIdentifiers.filter((identifier) => {
        const idLower = identifier.toLowerCase();
        if (currentProductId && idLower === currentProductId.toLowerCase()) return false;
        if (currentProductSlug && idLower === currentProductSlug.toLowerCase()) return false;
        return true;
      });

      if (filteredIdentifiers.length === 0) {
        setProducts([]);
        setLoading(false);
        return;
      }

      // Resolve up to limit products in exact historical sequence
      const requestedIds = filteredIdentifiers.slice(0, limit);
      const resolved = await productService.getProductsByIds(requestedIds);

      // Clean up invalid or inactive products from localStorage
      if (resolved.length < requestedIds.length) {
        const validSet = new Set<string>();
        resolved.forEach((p) => {
          validSet.add(p.id.toLowerCase());
          if (p.slug) validSet.add(p.slug.toLowerCase());
        });
        const invalidIds = requestedIds.filter((id) => !validSet.has(id.toLowerCase()));
        if (invalidIds.length > 0) {
          recentActivityService.removeInvalidProducts(invalidIds);
        }
      }

      setProducts(resolved);
    } catch (err) {
      console.warn('Unable to load recently viewed products:', err);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadItems();

    const handleUpdate = () => {
      loadItems();
    };

    window.addEventListener('recently-viewed-updated', handleUpdate);
    return () => {
      window.removeEventListener('recently-viewed-updated', handleUpdate);
    };
  }, [currentProductId, currentProductSlug, limit]);

  if (loading || products.length === 0) {
    return null;
  }

  return (
    <section className="max-w-7xl mx-auto px-6 md:px-10 py-12 border-t border-[#e0d8c8]/70">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#2d5a61]/10 text-[#2d5a61] text-[11px] uppercase tracking-wider font-semibold">
              <History className="w-3 h-3" />
              <span>Browsing History</span>
            </span>
            <Sparkles className="w-3.5 h-3.5 text-[#D4B982]" />
          </div>
          <h2 className="font-serif text-2xl md:text-3xl text-[#333333] font-medium">{title}</h2>
          {subtitle && <p className="text-xs sm:text-sm text-[#666666] mt-1 max-w-xl">{subtitle}</p>}
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => recentActivityService.clearRecentlyViewed()}
            className="text-xs text-[#888888] hover:text-red-600 transition-colors cursor-pointer px-2.5 py-1 rounded-md hover:bg-[#efe8dc]/50"
          >
            Clear History
          </button>
          <Link
            to="/shop"
            className="text-xs md:text-sm font-semibold text-[#2d5a61] hover:text-[#1e3c41] flex items-center gap-1 group bg-white px-3.5 py-1.5 rounded-full border border-[#e0d8c8] shadow-2xs hover:border-[#2d5a61] transition-all"
          >
            <span>Explore All</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>

      {/* Grid of Product Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-5">
        {products.map((product) => {
          const isWishlisted = wishlistIds.includes(product.id);
          const hasDiscount =
            Boolean(product.compareAtPrice && product.compareAtPrice > product.price) ||
            Boolean(product.originalPrice && product.originalPrice > product.price);
          const comparePrice = product.compareAtPrice || product.originalPrice;

          return (
            <div
              key={product.id}
              className="bg-[#fdfaf5] rounded-2xl p-3.5 sm:p-4 border border-[#e0d8c8]/80 hover:border-[#2d5a61]/40 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between group"
            >
              <div>
                {/* Image & Badges */}
                <div className="aspect-square rounded-xl overflow-hidden mb-3 relative bg-[#efe8dc]">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 cursor-pointer"
                    onClick={() => navigate(`/product/${product.slug}`)}
                    loading="lazy"
                  />

                  {/* Badges */}
                  <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10 pointer-events-none">
                    {product.isNew && (
                      <span className="bg-[#2d5a61] text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-xs">
                        New
                      </span>
                    )}
                    {product.isBestSeller && !product.isNew && (
                      <span className="bg-[#D4B982] text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-xs">
                        Bestseller
                      </span>
                    )}
                    {hasDiscount && (
                      <span className="bg-red-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider shadow-xs">
                        Sale
                      </span>
                    )}
                  </div>

                  {/* Action overlay buttons */}
                  <div className="absolute top-2.5 right-2.5 flex flex-col gap-1.5 z-10">
                    {onToggleWishlist && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleWishlist(product);
                        }}
                        aria-label={isWishlisted ? 'Remove from wishlist' : 'Save to wishlist'}
                        className={`p-1.5 rounded-full shadow-xs transition-all cursor-pointer ${
                          isWishlisted
                            ? 'bg-red-50 text-red-500 scale-105'
                            : 'bg-white/85 text-[#666666] hover:text-red-500 hover:bg-white'
                        }`}
                      >
                        <Heart className="w-3.5 h-3.5" fill={isWishlisted ? 'currentColor' : 'none'} />
                      </button>
                    )}
                    {onQuickView && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onQuickView(product);
                        }}
                        aria-label="Quick preview"
                        className="p-1.5 rounded-full bg-white/85 text-[#666666] hover:text-[#2d5a61] hover:bg-white shadow-xs opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer hidden sm:flex items-center justify-center"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Category & Title */}
                <span className="text-[10px] uppercase tracking-wider font-semibold text-[#888888] block mb-1">
                  {product.category}
                </span>
                <h3
                  onClick={() => navigate(`/product/${product.slug}`)}
                  className="font-serif text-xs sm:text-sm text-[#333333] hover:text-[#2d5a61] cursor-pointer transition-colors line-clamp-1 mb-1.5 font-medium"
                  title={product.name}
                >
                  {product.name}
                </h3>

                {/* Price */}
                <div className="flex items-baseline gap-2 mb-3">
                  <span className="text-xs sm:text-sm font-semibold text-[#333333]">
                    Rs. {product.price.toLocaleString()}
                  </span>
                  {comparePrice && comparePrice > product.price && (
                    <span className="text-[11px] text-[#888888] line-through">
                      Rs. {comparePrice.toLocaleString()}
                    </span>
                  )}
                </div>
              </div>

              {/* Add to Bag button */}
              {onAddToCart && (
                <button
                  type="button"
                  onClick={() => onAddToCart(product)}
                  disabled={!product.inStock}
                  className="w-full border border-[#e0d8c8] hover:border-[#2d5a61] py-2 rounded-full text-xs font-medium text-[#333333] hover:bg-[#2d5a61] hover:text-white transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed group/btn shadow-2xs"
                >
                  <ShoppingBag className="w-3.5 h-3.5 transition-transform group-hover/btn:scale-110" />
                  <span>{product.inStock ? 'Add to Bag' : 'Out of Stock'}</span>
                </button>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};
