import React from 'react';
import { ArrowRight, ChevronRight } from 'lucide-react';
import { Category } from '../types';

interface ShopByCollectionProps {
  categories: Category[];
  selectedCategory: string | null;
  onSelectCategory: (slug: string | null) => void;
}

export const ShopByCollection: React.FC<ShopByCollectionProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
}) => {
  return (
    <section className="max-w-7xl mx-auto px-6 md:px-8 py-16 bg-[#fdfaf5] mt-14 rounded-3xl border border-[#e0d8c8]/50 shadow-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-10">
        <div>
          <h2 className="font-serif text-3xl md:text-4xl text-[#333333] decorative-sparkle">
            Shop by Collection
          </h2>
          <p className="text-xs md:text-sm text-[#666666] mt-1">
            Curated handcrafted sets featuring colorful beads, delicate chains, and whimsical charms.
          </p>
        </div>

        <button
          onClick={() => onSelectCategory(null)}
          className="text-sm font-medium text-[#2d5a61] hover:text-[#1e3c41] flex items-center group cursor-pointer"
        >
          <span>View all collections</span>
          <ArrowRight className="w-4 h-4 ml-1.5 transition-transform duration-300 group-hover:translate-x-1" />
        </button>
      </div>

      {/* Grid of 5 categories */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-5 sm:gap-6">
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat.slug;
          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(isSelected ? null : cat.slug)}
              className={`group text-left focus:outline-none transition-all duration-300 ${
                isSelected ? 'scale-[1.03]' : ''
              }`}
            >
              <div
                className={`aspect-square bg-[#e0d8c8] rounded-2xl overflow-hidden mb-3.5 relative shadow-sm border-2 transition-all duration-500 ${
                  isSelected
                    ? 'border-[#2d5a61] ring-2 ring-[#2d5a61]/20 shadow-md'
                    : 'border-transparent group-hover:border-[#e0d8c8]'
                }`}
              >
                <img
                  src={cat.image}
                  alt={`${cat.name} Collection`}
                  className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700 ease-out"
                  loading="lazy"
                />

                {/* Subtle gradient vignette */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                {/* Arrow floating badge */}
                <div className="absolute bottom-3 right-3 bg-white/90 text-[#2d5a61] p-2 rounded-full opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all shadow-md">
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>

                {/* Item count chip */}
                <div className="absolute top-3 left-3 bg-[#efe8dc]/90 backdrop-blur-xs text-[#2d5a61] text-[10px] font-semibold px-2 py-0.5 rounded-full shadow-xs">
                  {cat.itemCount} items
                </div>
              </div>

              <h3
                className={`font-serif text-lg text-center transition-colors ${
                  isSelected ? 'text-[#2d5a61] font-semibold underline underline-offset-4' : 'text-[#333333] group-hover:text-[#2d5a61]'
                }`}
              >
                {cat.name}
              </h3>
            </button>
          );
        })}
      </div>
    </section>
  );
};
