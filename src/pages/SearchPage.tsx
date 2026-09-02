import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Search, Heart, ShoppingBag, Eye, Sparkles, Filter, X } from 'lucide-react';
import { Product } from '../types';
import { productService } from '../services/productService';

interface SearchPageProps {
  wishlistIds: string[];
  onAddToCart: (product: Product) => void;
  onToggleWishlist: (product: Product) => void;
  onQuickView: (product: Product) => void;
}

export const SearchPage: React.FC<SearchPageProps> = ({
  wishlistIds,
  onAddToCart,
  onToggleWishlist,
  onQuickView
}) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const initialQuery = searchParams.get('q') || '';

  const [query, setQuery] = useState(initialQuery);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedSort, setSelectedSort] = useState<'featured' | 'newest' | 'price-low' | 'price-high' | 'rating'>('featured');

  useEffect(() => {
    async function executeSearch() {
      setLoading(true);
      const res = await productService.getProducts({
        searchQuery: query,
        category: selectedCategory === 'all' ? undefined : selectedCategory,
        sortBy: selectedSort
      });
      setProducts(res);
      setLoading(false);
    }
    executeSearch();
  }, [query, selectedCategory, selectedSort]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchParams(query ? { q: query } : {});
  };

  return (
    <div className="min-h-screen bg-[#efe8dc] py-10 md:py-16">
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        {/* Search Input Banner */}
        <div className="max-w-2xl mx-auto text-center mb-12">
          <span className="text-xs uppercase tracking-widest font-semibold text-[#2d5a61] block mb-2">
            Artisan Catalog Search
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl text-[#333333] mb-6">
            Find Your Next Sparkle
          </h1>

          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="w-5 h-5 text-[#888888] absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by crystal, color (ruby, turquoise), category or style..."
              className="w-full bg-[#fdfaf5] border border-[#e0d8c8] rounded-full pl-12 pr-12 py-3.5 text-sm text-[#333333] shadow-xs focus:outline-none focus:border-[#2d5a61] focus:ring-2 focus:ring-[#2d5a61]/20"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#888888] hover:text-[#333333]"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </form>

          {/* Quick Search Tags */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-4 text-xs">
            <span className="text-[#666666]">Popular:</span>
            {['Ruby', 'Pearl', 'Turquoise', 'Green Aventurine', 'Rose Quartz', 'Custom'].map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => setQuery(tag)}
                className="bg-[#fdfaf5] text-[#2d5a61] px-3 py-1 rounded-full border border-[#e0d8c8] hover:bg-[#2d5a61] hover:text-white transition-colors cursor-pointer"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-[#e0d8c8] mb-8">
          <div className="text-xs text-[#666666]">
            Found <strong className="text-[#333333] font-semibold">{products.length}</strong> handcrafted pieces {query ? `for "${query}"` : ''}
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            {/* Category Select */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-[#fdfaf5] border border-[#e0d8c8] rounded-xl px-3.5 py-2 text-xs text-[#333333] focus:outline-none focus:border-[#2d5a61]"
            >
              <option value="all">All Collections</option>
              <option value="Bracelets">Bracelets</option>
              <option value="Anklets">Anklets</option>
              <option value="Necklaces">Necklaces</option>
              <option value="Earrings">Earrings</option>
              <option value="Rings">Rings</option>
              <option value="Custom Pieces">Custom Pieces</option>
            </select>

            {/* Sort Select */}
            <select
              value={selectedSort}
              onChange={(e) => setSelectedSort(e.target.value as any)}
              className="bg-[#fdfaf5] border border-[#e0d8c8] rounded-xl px-3.5 py-2 text-xs text-[#333333] focus:outline-none focus:border-[#2d5a61]"
            >
              <option value="featured">Featured Picks</option>
              <option value="newest">New Arrivals</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
            </select>
          </div>
        </div>

        {/* Results Grid */}
        {loading ? (
          <div className="min-h-[40vh] flex flex-col items-center justify-center">
            <Sparkles className="w-8 h-8 text-[#2d5a61] animate-spin mb-3" />
            <p className="font-serif text-sm text-[#444444]">Filtering handcrafted gemstones...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="bg-[#fdfaf5] rounded-3xl p-12 text-center border border-[#e0d8c8] max-w-xl mx-auto my-8">
            <h3 className="font-serif text-2xl text-[#333333] mb-3">No matching pieces found</h3>
            <p className="text-xs text-[#666666] mb-6">
              Try searching with different gemstones (like "quartz" or "pearl") or explore our complete catalog.
            </p>
            <button
              onClick={() => {
                setQuery('');
                setSelectedCategory('all');
              }}
              className="bg-[#2d5a61] text-white px-6 py-2.5 rounded-full text-xs font-medium hover:bg-[#1e3c41] transition-colors"
            >
              Reset Search Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-6">
            {products.map((product) => {
              const isWishlisted = wishlistIds.includes(product.id);
              return (
                <div
                  key={product.id}
                  className="bg-[#fdfaf5] rounded-2xl p-4 border border-[#e0d8c8] shadow-xs flex flex-col justify-between hover:shadow-md transition-all group"
                >
                  <div>
                    <div className="aspect-square rounded-xl overflow-hidden mb-3.5 relative bg-[#efe8dc]">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 cursor-pointer"
                        onClick={() => navigate(`/product/${product.slug}`)}
                      />

                      <button
                        onClick={() => onToggleWishlist(product)}
                        className={`absolute top-2.5 right-2.5 p-1.5 rounded-full shadow-xs transition-all ${
                          isWishlisted ? 'bg-red-50 text-red-500' : 'bg-white/80 text-[#666666] hover:text-red-500'
                        }`}
                      >
                        <Heart className="w-4 h-4" fill={isWishlisted ? 'currentColor' : 'none'} />
                      </button>

                      <button
                        onClick={() => onQuickView(product)}
                        className="absolute inset-x-3 bottom-3 py-1.5 bg-white/95 text-[#2d5a61] text-xs font-semibold rounded-lg shadow-sm opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Quick View</span>
                      </button>
                    </div>

                    <span className="text-[10px] font-bold text-[#2d5a61] uppercase tracking-wider block mb-1">
                      {product.category}
                    </span>
                    <h3
                      onClick={() => navigate(`/product/${product.slug}`)}
                      className="font-serif text-sm text-[#333333] hover:text-[#2d5a61] cursor-pointer truncate mb-1"
                    >
                      {product.name}
                    </h3>
                    <p className="font-semibold text-sm text-[#333333] mb-3">
                      Rs. {product.price.toLocaleString()}
                    </p>
                  </div>

                  <button
                    onClick={() => onAddToCart(product)}
                    className="w-full border border-[#e0d8c8] py-2 rounded-full text-xs font-medium text-[#333333] hover:bg-[#2d5a61] hover:text-white hover:border-[#2d5a61] transition-colors flex items-center justify-center gap-1.5"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>Add to Bag</span>
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
