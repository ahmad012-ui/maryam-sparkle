import React from 'react';
import { ArrowRight, Heart } from 'lucide-react';
import { HERO_IMAGES } from '../data/products';

interface HeroProps {
  onShopNow: () => void;
  onExploreNew: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onShopNow, onExploreNew }) => {
  return (
    <section className="relative px-6 md:px-12 pt-10 md:pt-16 pb-20 md:pb-28 overflow-hidden bg-[#efe8dc]">
      {/* Delicate floating background wireframe motif */}
      <div className="absolute top-8 right-[28%] text-[#2d5a61]/25 hidden md:block pointer-events-none select-none">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
          <path d="M12 2v20M2 12h20M12 2a10 10 0 0110 10M12 22a10 10 0 01-10-10" />
        </svg>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
        {/* Left Column: Typography & Action */}
        <div className="z-10 lg:pr-6">
          <div className="inline-flex items-center gap-2 text-[#2d5a61] italic font-serif text-lg md:text-xl mb-4">
            <span>Handmade with love</span>
            <Heart className="w-4 h-4 text-[#2d5a61]" fill="none" strokeWidth={1.5} />
          </div>

          <h1 className="font-serif text-5xl sm:text-6xl lg:text-7xl leading-[1.08] text-[#333333] mb-6 tracking-tight">
            Colorful pieces,<br className="hidden sm:inline" />
            <span className="italic font-normal">made just for you.</span>
          </h1>

          <p className="text-[#666666] text-base md:text-lg mb-8 max-w-md leading-relaxed font-light">
            Handmade jewellery crafted with love, inspired by nature and little moments of life.
          </p>

          <div className="flex flex-wrap items-center gap-4">
            <button
              onClick={onShopNow}
              className="inline-flex items-center justify-center bg-[#2d5a61] text-white px-8 py-3.5 rounded-full font-medium text-sm md:text-base hover:bg-[#1e3c41] transition-all duration-300 shadow-sm hover:shadow-md group cursor-pointer"
            >
              <span>Shop Now</span>
              <ArrowRight className="w-4 h-4 ml-2 transition-transform duration-300 group-hover:translate-x-1" />
            </button>

            <button
              onClick={onExploreNew}
              className="inline-flex items-center justify-center text-[#2d5a61] border border-[#2d5a61]/40 px-6 py-3.5 rounded-full font-medium text-sm md:text-base hover:bg-[#2d5a61]/10 transition-colors cursor-pointer"
            >
              Explore New In
            </button>
          </div>
        </div>

        {/* Right Column: Hero Visual Artwork Composition */}
        <div className="relative h-[480px] sm:h-[540px] md:h-[580px] flex justify-center items-center">
          {/* Main Arch Frame */}
          <div className="absolute top-0 right-4 sm:right-12 md:right-16 w-[280px] sm:w-[330px] md:w-[360px] h-[420px] sm:h-[480px] md:h-[510px] bg-[#e0d8c8] rounded-t-full overflow-hidden border-[6px] md:border-[8px] border-[#efe8dc] z-10 shadow-xl transition-transform duration-700 hover:scale-[1.02]">
            <img
              src={HERO_IMAGES.arch}
              alt="Model wearing colorful handmade beaded bracelets"
              className="w-full h-full object-cover object-center"
              loading="eager"
            />
          </div>

          {/* Circular Offset Image */}
          <div className="absolute bottom-4 sm:bottom-6 right-0 sm:right-2 md:-right-4 translate-y-2 w-[210px] sm:w-[250px] md:w-[270px] h-[210px] sm:h-[250px] md:h-[270px] rounded-full overflow-hidden border-[6px] md:border-[8px] border-[#efe8dc] z-20 shadow-2xl transition-transform duration-500 hover:scale-105">
            <img
              src={HERO_IMAGES.circle}
              alt="Close up of beaded bracelet with leaf charm"
              className="w-full h-full object-cover"
              loading="eager"
            />
          </div>

          {/* Floating 'New Collection' Badge (desktop/tablet) */}
          <div className="absolute top-1/4 -right-2 lg:-right-10 z-30 max-w-[190px] bg-[#fdfaf5]/90 backdrop-blur-xs p-4 rounded-2xl border border-[#e0d8c8] shadow-lg hidden md:block">
            <div className="flex items-center gap-1.5 text-[#2d5a61] italic font-serif text-base mb-1">
              <span>New Collection</span>
              <Heart className="w-3.5 h-3.5 text-[#2d5a61]" strokeWidth={1.5} />
            </div>
            <p className="text-xs text-[#666666] mb-3 leading-relaxed">
              Vibrant. Elegant. Unique. Just like you.
            </p>
            <button
              onClick={onExploreNew}
              className="inline-flex items-center text-xs font-medium text-[#2d5a61] border border-[#e0d8c8] px-3.5 py-1.5 rounded-full hover:bg-[#2d5a61] hover:text-white transition-colors cursor-pointer"
            >
              <span>Explore Now</span>
              <ArrowRight className="w-3 h-3 ml-1" />
            </button>
          </div>

          {/* Decorative Leaves / Botanical Wireframe SVG */}
          <svg
            className="absolute -bottom-8 -left-6 sm:left-4 w-40 sm:w-48 h-40 sm:h-48 text-[#2d5a61]/25 z-0 pointer-events-none"
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M50 100 Q40 50 10 20 Q50 10 90 20 Q60 50 50 100 Z" stroke="currentColor" strokeWidth="1" />
            <path d="M50 100 Q30 70 20 40" stroke="currentColor" strokeWidth="1" />
          </svg>
        </div>
      </div>
    </section>
  );
};
