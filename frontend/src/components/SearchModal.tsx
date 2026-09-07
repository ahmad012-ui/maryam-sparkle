import React, { useState, useMemo } from 'react';
import { X, Search, Heart, ShoppingBag, Sparkles, Filter } from 'lucide-react';
import { Product } from '../types';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onSelectProduct: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  wishlistIds: string[];
  onToggleWishlist: (product: Product) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  products,
  onSelectProduct,
  onAddToCart,
  wishlistIds,
  onToggleWishlist,
}) => {
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedPriceRange, setSelectedPriceRange] = useState<string>('All');

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesQuery =
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.description.toLowerCase().includes(query.toLowerCase()) ||
        p.category.toLowerCase().includes(query.toLowerCase()) ||
        p.materials.some((m) => m.toLowerCase().includes(query.toLowerCase()));

      const matchesCat =
        selectedCategory === 'All' || p.category.toLowerCase() === selectedCategory.toLowerCase();

      let matchesPrice = true;
      if (selectedPriceRange === 'under1700') {
        matchesPrice = p.price < 1700;
      } else if (selectedPriceRange === '1700-2000') {
        matchesPrice = p.price >= 1700 && p.price <= 2000;
      } else if (selectedPriceRange === 'above2000') {
        matchesPrice = p.price > 2000;
      }

      return matchesQuery && matchesCat && matchesPrice;
    });
  }, [products, query, selectedCategory, selectedPriceRange]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 sm:p-6 bg-black/50 backdrop-blur-xs overflow-y-auto">
      <div className="relative bg-[#efe8dc] rounded-3xl max-w-4xl w-full shadow-2xl border border-[#e0d8c8] overflow-hidden my-6">
        {/* Search Header */}
        <div className="p-6 bg-[#fdfaf5] border-b border-[#e0d8c8]">
          <div className="flex items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#2d5a61]" />
              <h3 className="font-serif text-xl text-[#333333]">Search Jewelry Collection</h3>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-[#efe8dc] text-[#666666] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Search Input */}
          <div className="relative">
            <Search className="w-5 h-5 absolute left-4 top-3.5 text-[#2d5a61]" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search ruby, amethyst, pearl, gold, bracelets..."
              autoFocus
              className="w-full bg-white border border-[#e0d8c8] rounded-full pl-12 pr-4 py-3 text-sm text-[#333333] placeholder-[#888888] focus:outline-none focus:ring-2 focus:ring-[#2d5a61]/30 focus:border-[#2d5a61] shadow-2xs"
            />
          </div>

          {/* Category & Filter Pills */}
          <div className="flex flex-wrap items-center gap-2 mt-4 text-xs">
            <span className="text-[#666666] font-medium mr-1 flex items-center gap-1">
              <Filter className="w-3 h-3 text-[#2d5a61]" /> Filter:
            </span>
            {['All', 'Bracelets', 'Anklets', 'Necklaces', 'Earrings', 'Rings'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-full border transition-colors cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-[#2d5a61] text-white border-[#2d5a61] font-semibold'
                    : 'bg-white/80 border-[#e0d8c8] text-[#555555] hover:border-[#2d5a61]'
                }`}
              >
                {cat}
              </button>
            ))}

            <div className="h-4 w-px bg-[#e0d8c8] mx-1 hidden sm:block" />

            {/* Price Pills */}
            {[
              { label: 'All Prices', value: 'All' },
              { label: '< Rs. 1,700', value: 'under1700' },
              { label: 'Rs. 1,700 - 2,000', value: '1700-2000' },
              { label: '> Rs. 2,000', value: 'above2000' },
            ].map((p) => (
              <button
                key={p.value}
                onClick={() => setSelectedPriceRange(p.value)}
                className={`px-3 py-1 rounded-full border transition-colors text-[11px] cursor-pointer ${
                  selectedPriceRange === p.value
                    ? 'bg-[#D4B982] text-[#1e3c41] border-[#D4B982] font-semibold'
                    : 'bg-white/60 border-[#e0d8c8] text-[#666666] hover:border-[#D4B982]'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Results Grid */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          <div className="flex justify-between items-center text-xs text-[#666666] mb-4">
            <span>
              Showing <strong>{filteredProducts.length}</strong> handcrafted pieces
            </span>
            {query && (
              <button
                onClick={() => setQuery('')}
                className="text-[#2d5a61] hover:underline cursor-pointer"
              >
                Clear query
              </button>
            )}
          </div>

          {filteredProducts.length === 0 ? (
            <div className="py-12 text-center">
              <p className="font-serif text-lg text-[#333333] mb-1">No pieces matched your search</p>
              <p className="text-xs text-[#666666] mb-4">
                Looking for a special combination? Request a custom handcrafted design!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {filteredProducts.map((product) => {
                const isWishlisted = wishlistIds.includes(product.id);
                return (
                  <div
                    key={product.id}
                    className="bg-[#fdfaf5] p-3 rounded-2xl border border-[#e0d8c8] hover:shadow-md transition-all group flex flex-col justify-between"
                  >
                    <div>
                      <div className="aspect-square rounded-xl overflow-hidden mb-2 relative bg-[#efe8dc]">
                        <img
                          src={product.image}
                          alt={product.name}
                          onClick={() => {
                            onSelectProduct(product);
                            onClose();
                          }}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 cursor-pointer"
                        />
                        <button
                          onClick={() => onToggleWishlist(product)}
                          className={`absolute top-2 right-2 p-1 rounded-full transition-colors ${
                            isWishlisted
                              ? 'bg-red-50 text-red-500'
                              : 'bg-white/80 text-[#666666] hover:text-red-500'
                          }`}
                        >
                          <Heart
                            className="w-3.5 h-3.5"
                            fill={isWishlisted ? 'currentColor' : 'none'}
                          />
                        </button>
                      </div>

                      <h4
                        onClick={() => {
                          onSelectProduct(product);
                          onClose();
                        }}
                        className="font-serif text-xs font-semibold text-[#333333] truncate cursor-pointer hover:text-[#2d5a61]"
                      >
                        {product.name}
                      </h4>
                      <p className="text-xs text-[#2d5a61] font-bold mt-0.5">
                        Rs. {product.price.toLocaleString()}
                      </p>
                    </div>

                    <button
                      onClick={() => onAddToCart(product)}
                      className="mt-3 w-full bg-[#efe8dc] hover:bg-[#2d5a61] hover:text-white text-[#333333] py-1.5 rounded-full text-[11px] font-medium transition-colors flex items-center justify-center gap-1.5"
                    >
                      <ShoppingBag className="w-3 h-3" />
                      <span>Add to Bag</span>
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
