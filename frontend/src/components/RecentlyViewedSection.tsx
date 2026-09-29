import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, Eye, Heart, ShoppingBag, ArrowRight, History } from 'lucide-react';
import { Product } from '../types';
import { ProductCard3D } from './ProductCard3D';
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
        {products.map((product) => (
          <ProductCard3D
            key={product.id}
            product={product}
            isWishlisted={wishlistIds.includes(product.id)}
            onAddToCart={onAddToCart || (() => {})}
            onToggleWishlist={onToggleWishlist || (() => {})}
            onQuickView={onQuickView || ((p) => navigate(`/product/${p.slug}`))}
            variant="compact"
          />
        ))}
      </div>
    </section>
  );
};
