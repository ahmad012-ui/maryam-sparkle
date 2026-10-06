import React, { useRef, useState, useEffect } from 'react';
import { ArrowRight, ChevronRight } from 'lucide-react';
import { Category } from '../types';

interface ShopByCollectionProps {
  categories: Category[];
  selectedCategory: string | null;
  onSelectCategory: (slug: string | null) => void;
}

const CategoryCardItem: React.FC<{
  cat: Category;
  isSelected: boolean;
  onSelect: () => void;
}> = ({ cat, isSelected, onSelect }) => {
  const cardRef = useRef<HTMLButtonElement>(null);
  const canTiltRef = useRef(false);
  const rafId = useRef<number | null>(null);

  useEffect(() => {
    const finePointer = window.matchMedia('(pointer: fine)').matches;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    canTiltRef.current = finePointer && !reducedMotion;

    return () => {
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!canTiltRef.current || !cardRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;

    // Notice: Category cards are kept much more subtle than product cards (±2.5° max)
    const rotX = -y * 2.5;
    const rotY = x * 2.5;
    const sX = -x * 8;
    const sY = -y * 8 + 12;

    if (rafId.current) cancelAnimationFrame(rafId.current);
    rafId.current = requestAnimationFrame(() => {
      if (cardRef.current) {
        cardRef.current.style.transform = `perspective(800px) rotateX(${rotX.toFixed(2)}deg) rotateY(${rotY.toFixed(2)}deg) translateZ(4px)`;
        cardRef.current.style.boxShadow = `${sX.toFixed(1)}px ${sY.toFixed(1)}px 24px rgba(45, 90, 97, 0.12)`;
      }
    });
  };

  const handleMouseEnter = () => {
    if (!canTiltRef.current || !cardRef.current) return;
    cardRef.current.style.transition = 'transform 0.08s ease-out, box-shadow 0.12s ease-out';
  };

  const handleMouseLeave = () => {
    if (!canTiltRef.current || !cardRef.current) return;
    if (rafId.current) cancelAnimationFrame(rafId.current);
    cardRef.current.style.transition = 'transform 0.5s cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 0.5s ease';
    cardRef.current.style.transform = 'perspective(800px) rotateX(0deg) rotateY(0deg) translateZ(0px)';
    cardRef.current.style.boxShadow = '';
  };

  return (
    <button
      ref={cardRef}
      onClick={onSelect}
      data-category-card
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        transformStyle: 'preserve-3d',
      }}
      className={`group text-left focus:outline-none transition-all duration-300 rounded-2xl will-change-transform cursor-pointer ${
        isSelected ? 'scale-[1.03]' : ''
      }`}
    >
      <div
        style={{ transformStyle: 'preserve-3d' }}
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

        {/* Subtle gradient vignette for depth */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Arrow floating badge with subtle Z-elevation */}
        <div
          style={{ transform: 'translateZ(18px)' }}
          className="absolute bottom-3 right-3 bg-white/92 text-[#2d5a61] p-2 rounded-full opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all shadow-md z-10"
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </div>

        {/* Item count chip */}
        <div
          style={{ transform: 'translateZ(15px)' }}
          className="absolute top-3 left-3 bg-[#efe8dc]/92 backdrop-blur-xs text-[#2d5a61] text-[10px] font-semibold px-2 py-0.5 rounded-full shadow-xs z-10"
        >
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
};

export const ShopByCollection: React.FC<ShopByCollectionProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
}) => {
  return (
    <section className="mx-2.5 xs:mx-3.5 sm:mx-6 lg:mx-auto max-w-7xl px-3 xs:px-4 sm:px-6 md:px-8 py-8 sm:py-14 bg-[#fdfaf5] mt-6 sm:mt-12 rounded-2xl sm:rounded-3xl border border-[#e0d8c8]/50 shadow-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3 sm:gap-4 mb-8 sm:mb-10">
        <div>
          <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl text-[#333333] decorative-sparkle">
            Shop by Collection
          </h2>
          <p className="text-xs md:text-sm text-[#666666] mt-1">
            Curated handcrafted sets featuring colorful beads, delicate chains, and whimsical charms.
          </p>
        </div>

        <button
          onClick={() => onSelectCategory(null)}
          className="text-xs sm:text-sm font-medium text-[#2d5a61] hover:text-[#1e3c41] flex items-center group cursor-pointer"
        >
          <span>View all collections</span>
          <ArrowRight className="w-4 h-4 ml-1.5 transition-transform duration-300 group-hover:translate-x-1" />
        </button>
      </div>

      {/* Grid of categories with subtle depth */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-5 md:gap-6">
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat.slug;
          return (
            <CategoryCardItem
              key={cat.id}
              cat={cat}
              isSelected={isSelected}
              onSelect={() => onSelectCategory(isSelected ? null : cat.slug)}
            />
          );
        })}
      </div>
    </section>
  );
};
