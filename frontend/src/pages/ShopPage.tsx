import React, { useState, useMemo } from 'react';
import { Product, Category } from '../types';
import { PriceRangeFilter } from '../components/PriceRangeFilter';
import { ProductCard3D } from '../components/ProductCard3D';
import { 
  Filter, 
  SlidersHorizontal, 
  Search, 
  Heart, 
  ShoppingBag, 
  Sparkles, 
  Check, 
  Grid3X3, 
  LayoutGrid, 
  ArrowUpDown,
  RotateCcw,
  Eye,
  Star
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { SEO } from '../components/SEO';
import { RecentlyViewedSection } from '../components/RecentlyViewedSection';

interface ShopPageProps {
  products: Product[];
  categories: Category[];
  wishlistIds: string[];
  onAddToCart: (product: Product) => void;
  onToggleWishlist: (product: Product) => void;
  onQuickView: (product: Product) => void;
  selectedCategory: string | null;
  onSelectCategory: (category: string | null) => void;
  onOpenCustomOrder: () => void;
}

export const ShopPage: React.FC<ShopPageProps> = ({
  products,
  categories,
  wishlistIds,
  onAddToCart,
  onToggleWishlist,
  onQuickView,
  selectedCategory,
  onSelectCategory,
  onOpenCustomOrder,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSort, setSelectedSort] = useState<'featured' | 'price-asc' | 'price-desc' | 'rating' | 'newest'>('featured');
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([]);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [gridCols, setGridCols] = useState<3 | 4>(3);

  const toggleMaterial = (mat: string) => {
    setSelectedMaterials((prev) =>
      prev.includes(mat) ? prev.filter((m) => m !== mat) : [...prev, mat]
    );
  };

  const clearMaterials = () => {
    setSelectedMaterials([]);
  };

  // Dynamic price bounds derived directly from the actual catalog
  const { catalogMin, catalogMax } = useMemo(() => {
    if (!products.length) return { catalogMin: 0, catalogMax: 0 };
    const prices = products
      .map((p) => p.price)
      .filter((price) => typeof price === 'number' && !isNaN(price));
    if (!prices.length) return { catalogMin: 0, catalogMax: 0 };
    return {
      catalogMin: Math.min(...prices),
      catalogMax: Math.max(...prices),
    };
  }, [products]);

  const [minPriceFilter, setMinPriceFilter] = useState<number | null>(null);
  const [maxPriceFilter, setMaxPriceFilter] = useState<number | null>(null);

  const activeMinPrice = minPriceFilter !== null ? minPriceFilter : catalogMin;
  const activeMaxPrice = maxPriceFilter !== null ? maxPriceFilter : catalogMax;

  // Extract all unique materials dynamically from the actual product catalog data
  const allMaterials = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => {
      p.materials?.forEach((m) => {
        const trimmed = m.trim();
        if (trimmed) set.add(trimmed);
      });
    });
    return Array.from(set).sort();
  }, [products]);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // Category filter
      if (selectedCategory && p.category.toLowerCase() !== selectedCategory.toLowerCase()) {
        return false;
      }
      // Price filter (dynamic catalog range)
      if (p.price < activeMinPrice || p.price > activeMaxPrice) {
        return false;
      }
      // In stock filter
      if (inStockOnly && !p.inStock) {
        return false;
      }
      // Material & Finish filter (multi-select, data-driven matching)
      if (selectedMaterials.length > 0) {
        const matches = selectedMaterials.some((selectedMat) => {
          const selLower = selectedMat.toLowerCase();
          return (
            p.materials?.some((m) => m.toLowerCase() === selLower || m.toLowerCase().includes(selLower)) ||
            (p.finish?.toLowerCase() === selLower || p.finish?.toLowerCase().includes(selLower)) ||
            (p.availableFinishes?.some((f) => f.toLowerCase() === selLower || f.toLowerCase().includes(selLower)))
          );
        });
        if (!matches) return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchName = p.name.toLowerCase().includes(query);
        const matchDesc = p.description.toLowerCase().includes(query);
        const matchShortDesc = p.shortDescription?.toLowerCase().includes(query) ?? false;
        const matchMaterials = p.materials.some((m) => m.toLowerCase().includes(query));
        const matchColors = p.colors?.some((c) => c.toLowerCase().includes(query)) ?? false;
        const matchTags = p.tags?.some((t) => t.toLowerCase().includes(query)) ?? false;
        const matchCat = p.category.toLowerCase().includes(query);
        if (!matchName && !matchDesc && !matchShortDesc && !matchMaterials && !matchColors && !matchTags && !matchCat) {
          return false;
        }
      }
      return true;
    }).sort((a, b) => {
      if (selectedSort === 'price-asc') return a.price - b.price;
      if (selectedSort === 'price-desc') return b.price - a.price;
      if (selectedSort === 'rating') return (b.rating || 0) - (a.rating || 0);
      if (selectedSort === 'newest') return (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0);
      return (b.isBestSeller ? 1 : 0) - (a.isBestSeller ? 1 : 0);
    });
  }, [products, selectedCategory, activeMinPrice, activeMaxPrice, inStockOnly, selectedMaterials, searchQuery, selectedSort]);

  const isPriceFiltered =
    (minPriceFilter !== null && minPriceFilter > catalogMin) ||
    (maxPriceFilter !== null && maxPriceFilter < catalogMax);

  const activeFilterCount = (selectedCategory ? 1 : 0) + 
    (selectedMaterials.length > 0 ? 1 : 0) + 
    (isPriceFiltered ? 1 : 0) + 
    (inStockOnly ? 1 : 0) + 
    (searchQuery.trim() ? 1 : 0);

  const handleResetFilters = () => {
    onSelectCategory(null);
    setSelectedMaterials([]);
    setMinPriceFilter(null);
    setMaxPriceFilter(null);
    setInStockOnly(false);
    setSearchQuery('');
    setSelectedSort('featured');
  };

  return (
    <div className="bg-[#efe8dc] min-h-screen py-8 md:py-12">
      <SEO
        title={selectedCategory ? `${selectedCategory} Collection` : 'Handmade Jewelry Catalog'}
        description={`Explore handcrafted ${selectedCategory ? selectedCategory.toLowerCase() : 'beaded bracelets, anklets, necklaces, and delicate chains'} featuring vibrant beads, charming pendants, and tarnish-resistant gold- and silver-tone hardware.`}
        canonical={selectedCategory ? `/shop?category=${selectedCategory}` : '/shop'}
        keywords={`handmade jewelry, ${selectedCategory || 'bracelets, necklaces, anklets'}, bead jewelry shop, Maryam Sparkle`}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Breadcrumbs & Header */}
        <div className="mb-8 md:mb-12 text-center max-w-2xl mx-auto">
          <div className="flex items-center justify-center gap-2 text-xs font-medium uppercase tracking-[0.2em] text-[#2d5a61] mb-2">
            <Link to="/" className="hover:underline">Home</Link>
            <span>/</span>
            <span>E-Shop Catalog</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl text-[#2d5a61] mb-3">
            Artisanal Collections
          </h1>
          <p className="text-sm sm:text-base text-[#666666] leading-relaxed font-light">
            Every piece is lovingly hand-crafted in our studio using vibrant beads, delicate linked chains, charming pendants, and tarnish-resistant hardware.
          </p>
        </div>

        {/* Category Horizontal Filter Pills */}
        <div className="flex items-center justify-start sm:justify-center gap-2 md:gap-3 overflow-x-auto pb-4 mb-8 no-scrollbar px-1">
          <button
            id="cat-all-btn"
            onClick={() => onSelectCategory(null)}
            className={`px-4 sm:px-5 py-2 rounded-full text-xs sm:text-sm font-medium tracking-wide whitespace-nowrap transition-all cursor-pointer shrink-0 ${
              selectedCategory === null
                ? 'bg-[#2d5a61] text-white shadow-sm ring-2 ring-[#2d5a61]/30'
                : 'bg-white/80 text-[#555555] hover:bg-[#e0d8c8] border border-[#e0d8c8]'
            }`}
          >
            All Pieces ({products.length})
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              id={`cat-${cat.slug}-btn`}
              onClick={() => onSelectCategory(cat.slug)}
              className={`px-4 sm:px-5 py-2 rounded-full text-xs sm:text-sm font-medium tracking-wide whitespace-nowrap transition-all cursor-pointer shrink-0 ${
                selectedCategory?.toLowerCase() === cat.slug.toLowerCase()
                  ? 'bg-[#2d5a61] text-white shadow-sm ring-2 ring-[#2d5a61]/30'
                  : 'bg-white/80 text-[#555555] hover:bg-[#e0d8c8] border border-[#e0d8c8]'
              }`}
            >
              {cat.name} ({cat.itemCount})
            </button>
          ))}
        </div>

        {/* Search, Sort & Filter Control Bar */}
        <div className="bg-white/70 backdrop-blur-xs border border-[#e0d8c8] rounded-2xl p-4 md:p-5 mb-8 flex flex-col md:flex-row items-center justify-between gap-4 shadow-2xs">
          {/* Search box within shop */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-[#888888] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              id="shop-search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by bead color, charm, or style..."
              className="w-full bg-[#efe8dc]/50 border border-[#e0d8c8] rounded-full pl-9 pr-4 py-2 text-xs sm:text-sm text-[#333333] placeholder-[#888888] focus:outline-none focus:ring-1 focus:ring-[#2d5a61] focus:bg-white transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#888888] hover:text-[#333333]"
              >
                Clear
              </button>
            )}
          </div>

          {/* Center Info / Mobile Filter Trigger */}
          <div className="flex items-center justify-between w-full md:w-auto gap-4">
            <button
              id="mobile-filter-toggle-btn"
              onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
              className="md:hidden flex items-center gap-2 px-4 py-2 bg-[#2d5a61] text-white rounded-full text-xs font-medium shadow-xs"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Filters {activeFilterCount > 0 && `(${activeFilterCount})`}</span>
            </button>

            <span className="text-xs sm:text-sm text-[#666666] font-medium">
              Showing <strong className="text-[#2d5a61]">{filteredProducts.length}</strong> creations
            </span>
          </div>

          {/* Right: Sort and Grid layout */}
          <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <ArrowUpDown className="w-4 h-4 text-[#666666] hidden sm:block shrink-0" />
              <select
                id="shop-sort-select"
                value={selectedSort}
                onChange={(e) => setSelectedSort(e.target.value as any)}
                className="w-full sm:w-auto bg-[#efe8dc]/60 border border-[#e0d8c8] rounded-full px-3 py-2 text-xs sm:text-sm text-[#333333] focus:outline-none focus:ring-1 focus:ring-[#2d5a61] cursor-pointer"
              >
                <option value="featured">Featured & Bestsellers</option>
                <option value="newest">New Arrivals</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="rating">Highest Customer Rating</option>
              </select>
            </div>

            {/* Grid Column Switcher (Desktop) */}
            <div className="hidden lg:flex items-center bg-[#efe8dc]/70 p-1 rounded-full border border-[#e0d8c8]">
              <button
                onClick={() => setGridCols(3)}
                className={`p-1.5 rounded-full transition-colors ${gridCols === 3 ? 'bg-[#2d5a61] text-white' : 'text-[#666666] hover:text-[#333333]'}`}
                aria-label="3 Column Grid"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setGridCols(4)}
                className={`p-1.5 rounded-full transition-colors ${gridCols === 4 ? 'bg-[#2d5a61] text-white' : 'text-[#666666] hover:text-[#333333]'}`}
                aria-label="4 Column Grid"
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Main Content Layout: Sidebar Filters + Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* Desktop Filter Sidebar */}
          <aside className="hidden md:block md:col-span-3 bg-white/60 border border-[#e0d8c8] rounded-2xl p-6 sticky top-28 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-[#e0d8c8]">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-[#2d5a61]" />
                <h2 className="font-serif text-lg text-[#2d5a61]">Filter Jewels</h2>
              </div>
              {activeFilterCount > 0 && (
                <button
                  onClick={handleResetFilters}
                  className="flex items-center gap-1 text-[11px] text-[#2d5a61] hover:underline font-medium cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  Reset
                </button>
              )}
            </div>

            {/* Price Filter Slider & Inputs */}
            <div>
              <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-[#333333] mb-2.5">
                <span>Price Range</span>
                {isPriceFiltered && (
                  <button
                    type="button"
                    onClick={() => {
                      setMinPriceFilter(null);
                      setMaxPriceFilter(null);
                    }}
                    className="text-[11px] text-[#2d5a61] lowercase font-normal hover:underline cursor-pointer"
                  >
                    reset
                  </button>
                )}
              </div>
              <PriceRangeFilter
                catalogMin={catalogMin}
                catalogMax={catalogMax}
                minPrice={activeMinPrice}
                maxPrice={activeMaxPrice}
                onChange={(min, max) => {
                  setMinPriceFilter(min);
                  setMaxPriceFilter(max);
                }}
                idPrefix="desktop-price"
              />
            </div>

            {/* Materials & Finishes */}
            <div>
              <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-[#333333] mb-3">
                <span>Material & Finish</span>
                {selectedMaterials.length > 0 && (
                  <button
                    type="button"
                    onClick={clearMaterials}
                    className="text-[11px] text-[#2d5a61] lowercase font-normal hover:underline cursor-pointer"
                  >
                    reset
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {allMaterials.map((mat) => {
                  const isSelected = selectedMaterials.includes(mat);
                  return (
                    <button
                      key={mat}
                      type="button"
                      onClick={() => toggleMaterial(mat)}
                      className={`text-xs px-2.5 py-1 rounded-full border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#2d5a61] text-white border-[#2d5a61] font-medium shadow-2xs'
                          : 'bg-white/80 text-[#555555] border-[#e0d8c8] hover:bg-[#efe8dc]'
                      }`}
                    >
                      {mat}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* In Stock toggle */}
            <div className="pt-2 border-t border-[#e0d8c8]">
              <label className="flex items-center gap-2.5 cursor-pointer text-xs text-[#333333]">
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(e) => setInStockOnly(e.target.checked)}
                  className="rounded text-[#2d5a61] focus:ring-[#2d5a61] w-4 h-4"
                />
                <span>In Stock & Ready to Ship</span>
              </label>
            </div>

            {/* Custom Bespoke Callout */}
            <div className="p-4 bg-[#2d5a61]/5 border border-[#2d5a61]/20 rounded-xl text-center space-y-2">
              <Sparkles className="w-5 h-5 text-[#D4B982] mx-auto" />
              <h4 className="font-serif text-sm text-[#2d5a61] font-semibold">Want a Custom Bead Stack?</h4>
              <p className="text-xs text-[#666666] leading-relaxed">
                Choose your birthstone crystals, charms, and custom wrist measurements.
              </p>
              <button
                onClick={onOpenCustomOrder}
                className="w-full mt-2 bg-[#2d5a61] text-white text-xs py-2 rounded-full font-medium hover:bg-[#1e3c41] transition-colors shadow-2xs"
              >
                Request Custom Order
              </button>
            </div>
          </aside>

          {/* Mobile Filter Drawer / Modal */}
          {isMobileFilterOpen && (
            <div className="fixed inset-0 z-50 flex md:hidden">
              <div 
                className="fixed inset-0 bg-black/40 backdrop-blur-xs"
                onClick={() => setIsMobileFilterOpen(false)}
              />
              <div className="relative ml-auto w-4/5 max-w-sm bg-[#efe8dc] h-full p-6 overflow-y-auto shadow-2xl flex flex-col justify-between">
                <div className="space-y-6">
                  <div className="flex items-center justify-between pb-4 border-b border-[#e0d8c8]">
                    <h3 className="font-serif text-xl text-[#2d5a61]">Filter Jewelry</h3>
                    <button
                      onClick={() => setIsMobileFilterOpen(false)}
                      className="p-1 rounded-full hover:bg-black/5"
                    >
                      &times;
                    </button>
                  </div>

                  {/* Price range */}
                  <div>
                    <h4 className="text-xs font-semibold uppercase text-[#333333] mb-2.5">Price Range</h4>
                    <PriceRangeFilter
                      catalogMin={catalogMin}
                      catalogMax={catalogMax}
                      minPrice={activeMinPrice}
                      maxPrice={activeMaxPrice}
                      onChange={(min, max) => {
                        setMinPriceFilter(min);
                        setMaxPriceFilter(max);
                      }}
                      idPrefix="mobile-price"
                    />
                  </div>

                  {/* Materials & Finishes */}
                  <div>
                    <div className="flex items-center justify-between text-xs font-semibold uppercase text-[#333333] mb-2">
                      <span>Material & Finish</span>
                      {selectedMaterials.length > 0 && (
                        <button
                          type="button"
                          onClick={clearMaterials}
                          className="text-[11px] text-[#2d5a61] lowercase font-normal hover:underline cursor-pointer"
                        >
                          reset
                        </button>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {allMaterials.map((mat) => {
                        const isSelected = selectedMaterials.includes(mat);
                        return (
                          <button
                            key={mat}
                            type="button"
                            onClick={() => toggleMaterial(mat)}
                            className={`text-xs px-2.5 py-1 rounded-full border cursor-pointer ${
                              isSelected ? 'bg-[#2d5a61] text-white font-medium border-[#2d5a61]' : 'bg-white text-[#555555] border-[#e0d8c8]'
                            }`}
                          >
                            {mat}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* In Stock */}
                  <label className="flex items-center gap-2 text-xs">
                    <input
                      type="checkbox"
                      checked={inStockOnly}
                      onChange={(e) => setInStockOnly(e.target.checked)}
                      className="rounded text-[#2d5a61]"
                    />
                    <span>Ready to Ship Only</span>
                  </label>
                </div>

                <div className="pt-6 border-t border-[#e0d8c8] flex gap-2">
                  <button
                    onClick={handleResetFilters}
                    className="flex-1 py-2.5 border border-[#2d5a61] text-[#2d5a61] rounded-full text-xs font-medium"
                  >
                    Reset All
                  </button>
                  <button
                    onClick={() => setIsMobileFilterOpen(false)}
                    className="flex-1 py-2.5 bg-[#2d5a61] text-white rounded-full text-xs font-medium"
                  >
                    Apply ({filteredProducts.length})
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Products Grid */}
          <div className="md:col-span-9">
            {filteredProducts.length === 0 ? (
              <div className="bg-white/60 border border-[#e0d8c8] rounded-2xl p-12 text-center space-y-4 my-8">
                <Sparkles className="w-8 h-8 text-[#D4B982] mx-auto" />
                <h3 className="font-serif text-2xl text-[#2d5a61]">No jewelry matched your filters</h3>
                <p className="text-sm text-[#666666] max-w-md mx-auto">
                  Try clearing your search query or adjusting your price & material filters to view all handcrafted items.
                </p>
                <button
                  onClick={handleResetFilters}
                  className="px-6 py-2.5 bg-[#2d5a61] text-white rounded-full text-xs font-semibold hover:bg-[#1e3c41] transition-colors"
                >
                  View All Pieces
                </button>
              </div>
            ) : (
              <div
                className={`grid grid-cols-2 sm:grid-cols-2 ${
                  gridCols === 4 ? 'lg:grid-cols-4' : 'lg:grid-cols-3'
                } gap-3 sm:gap-6 md:gap-8`}
              >
                {filteredProducts.map((product) => (
                  <ProductCard3D
                    key={product.id}
                    product={product}
                    isWishlisted={wishlistIds.includes(product.id)}
                    onAddToCart={onAddToCart}
                    onToggleWishlist={onToggleWishlist}
                    onQuickView={onQuickView}
                    variant="standard"
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recently Viewed Drawer / Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-10 pb-16">
        <RecentlyViewedSection
          wishlistIds={wishlistIds}
          onAddToCart={(p) => onAddToCart(p)}
          onToggleWishlist={onToggleWishlist}
          onQuickView={onQuickView}
        />
      </div>
    </div>
  );
};
