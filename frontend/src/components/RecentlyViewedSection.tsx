import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, Eye, Heart, ShoppingBag, ArrowRight, ChevronLeft, ChevronRight, History } from 'lucide-react';
import { Product } from '../types';
import { recentActivityService } from '../services/recentActivityService';
import { productService } from '../services/productService';

interface RecentlyViewedSectionProps {
  currentProductId?: string;
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
  wishlistIds = [],
  onAddToCart,
  onToggleWishlist,
  onQuickView,
  title = 'Recently Viewed',
  subtitle = 'Pick up right where you left off with your recently explored artisan pieces.',
  limit = 5,
}) => {
  const navigate = useNavigate();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 5);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 5);
    }
  };

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const { clientWidth } = scrollContainerRef.current;
      const scrollAmount = direction === 'left' ? -clientWidth * 0.75 : clientWidth * 0.75;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const loadItems = async () => {
    try {
      const ids = recentActivityService.getRecentlyViewedIds();
      // Filter out the current product if passed, then cap at limit (default 5)
      const filteredIds = currentProductId ? ids.filter((id) => id !== currentProductId) : ids;
      if (filteredIds.length === 0) {
        setProducts([]);
        setLoading(false);
        return;
      }
      const items = await productService.getProductsByIds(filteredIds.slice(0, limit));
      setProducts(items);
    } catch {
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
  }, [currentProductId, limit]);

  useEffect(() => {
    checkScroll();
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', checkScroll);
      window.addEventListener('resize', checkScroll);
      return () => {
        container.removeEventListener('scroll', checkScroll);
        window.removeEventListener('resize', checkScroll);
      };
    }
  }, [products]);

  if (loading || products.length === 0) {
    return null;
  }

  return (
    <section className="py-10 border-t border-[#e0d8c8]/80 bg-[#efe8dc]/20 rounded-3xl mt-8 mb-4 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#2d5a61]/10 text-[#2d5a61] text-[11px] uppercase tracking-wider font-semibold">
                <History className="w-3 h-3" />
                <span>Browsing History</span>
              </span>
              <Sparkles className="w-3.5 h-3.5 text-[#D4B982]" />
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl text-[#333333] font-medium">{title}</h2>
            {subtitle && <p className="text-xs sm:text-sm text-[#666666] mt-1 max-w-xl">{subtitle}</p>}
          </div>

          <div className="flex items-center gap-3 self-end sm:self-auto">
            {/* Scroll Navigation Controls */}
            <div className="flex items-center gap-1.5 bg-white p-1 rounded-full border border-[#e0d8c8] shadow-2xs">
              <button
                type="button"
                onClick={() => scroll('left')}
                disabled={!canScrollLeft}
                aria-label="Scroll left"
                className="p-1.5 rounded-full hover:bg-[#efe8dc] text-[#333333] disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => scroll('right')}
                disabled={!canScrollRight}
                aria-label="Scroll right"
                className="p-1.5 rounded-full hover:bg-[#efe8dc] text-[#333333] disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <button
              type="button"
              onClick={() => recentActivityService.clearRecentlyViewed()}
              className="text-xs text-[#888888] hover:text-red-600 transition-colors cursor-pointer px-2 py-1 rounded-md hover:bg-white/60"
            >
              Clear
            </button>
            <Link
              to="/shop"
              className="text-xs font-semibold text-[#2d5a61] hover:text-[#1e3c41] flex items-center gap-1 group bg-white px-3 py-1.5 rounded-full border border-[#e0d8c8] shadow-2xs hover:border-[#2d5a61] transition-all"
            >
              <span>Explore All</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </div>

        {/* Scrollable Horizontal Product List */}
        <div
          ref={scrollContainerRef}
          className="flex items-stretch gap-4 sm:gap-5 overflow-x-auto pb-4 pt-1 snap-x snap-mandatory scroll-smooth no-scrollbar"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {products.map((product) => {
            const isWishlisted = wishlistIds.includes(product.id);
            return (
              <div
                key={product.id}
                className="min-w-[210px] sm:min-w-[240px] md:min-w-[260px] max-w-[280px] shrink-0 snap-start bg-[#fdfaf5] rounded-2xl p-3 sm:p-4 border border-[#e0d8c8] shadow-xs flex flex-col justify-between hover:shadow-md hover:border-[#2d5a61]/40 transition-all group"
              >
                <div>
                  <div className="aspect-square rounded-xl overflow-hidden mb-3 relative bg-[#efe8dc]">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 cursor-pointer"
                      onClick={() => navigate(`/product/${product.slug}`)}
                    />

                    {/* Action buttons */}
                    <div className="absolute top-2.5 right-2.5 flex flex-col gap-1.5">
                      {onToggleWishlist && (
                        <button
                          type="button"
                          onClick={() => onToggleWishlist(product)}
                          aria-label={isWishlisted ? 'Remove from wishlist' : 'Save to wishlist'}
                          className={`p-1.5 rounded-full shadow-xs transition-all cursor-pointer ${
                            isWishlisted
                              ? 'bg-red-50 text-red-500'
                              : 'bg-white/85 text-[#666666] hover:text-red-500 hover:bg-white'
                          }`}
                        >
                          <Heart className="w-3.5 h-3.5" fill={isWishlisted ? 'currentColor' : 'none'} />
                        </button>
                      )}
                      {onQuickView && (
                        <button
                          type="button"
                          onClick={() => onQuickView(product)}
                          aria-label="Quick preview"
                          className="p-1.5 rounded-full bg-white/85 text-[#666666] hover:text-[#2d5a61] hover:bg-white shadow-xs opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  <span className="text-[10px] uppercase tracking-wider font-semibold text-[#888888] block mb-0.5">
                    {product.category}
                  </span>
                  <h3
                    onClick={() => navigate(`/product/${product.slug}`)}
                    className="font-serif text-sm text-[#333333] hover:text-[#2d5a61] cursor-pointer transition-colors line-clamp-1 mb-1 font-medium"
                  >
                    {product.name}
                  </h3>
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-xs sm:text-sm font-semibold text-[#2d5a61]">
                      Rs. {product.price.toLocaleString()}
                    </span>
                    {product.originalPrice && product.originalPrice > product.price && (
                      <span className="text-[11px] text-[#888888] line-through">
                        Rs. {product.originalPrice.toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>

                {onAddToCart && (
                  <button
                    type="button"
                    onClick={() => onAddToCart(product)}
                    disabled={!product.inStock}
                    className="w-full mt-2 bg-[#2d5a61] hover:bg-[#1e3c41] text-white py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>{product.inStock ? 'Add to Bag' : 'Out of Stock'}</span>
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
