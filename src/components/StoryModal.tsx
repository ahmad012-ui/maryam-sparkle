import React from 'react';
import { X, Heart, Sparkles, Gem, ShieldCheck, Check } from 'lucide-react';
import { HERO_IMAGES } from '../data/products';

interface StoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExplore: () => void;
}

export const StoryModal: React.FC<StoryModalProps> = ({ isOpen, onClose, onExplore }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative bg-[#fdfaf5] rounded-[36px] max-w-3xl w-full overflow-hidden shadow-2xl border border-[#e0d8c8] my-8 animate-in fade-in duration-200">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 bg-white/80 hover:bg-white text-[#333333] rounded-full transition-colors shadow-sm"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Hero Banner */}
        <div className="relative h-64 bg-[#efe8dc]">
          <img
            src={HERO_IMAGES.ourStory}
            alt="Artisan workbench"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#fdfaf5] via-[#fdfaf5]/40 to-transparent" />
          <div className="absolute bottom-4 left-8">
            <div className="flex items-center gap-2 text-[#2d5a61] italic font-serif text-base mb-1">
              <span>Maryam Sparkle Atelier</span>
              <Heart className="w-4 h-4 text-[#2d5a61]" strokeWidth={1.5} />
            </div>
            <h2 className="font-serif text-3xl md:text-4xl text-[#333333]">
              Crafted by hands, inspired by heart.
            </h2>
          </div>
        </div>

        {/* Story Body */}
        <div className="p-8 sm:p-10 max-h-[60vh] overflow-y-auto space-y-6 text-xs sm:text-sm text-[#555555] leading-relaxed">
          <p>
            Maryam Sparkle started with a simple belief: jewelry shouldn&apos;t just be an accessory—it should be a tactile talisman of joyful memories, peaceful energy, and intentional handcrafted craftsmanship.
          </p>

          <p>
            Every single bead, crystal, and freshwater pearl is hand-selected in our studio. From testing high-tensile stretch cords that never lose elasticity to hand-wrapping wire loops with 18k gold-plated findings, no two pieces are identical.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="bg-[#efe8dc]/70 p-4 rounded-2xl border border-[#e0d8c8]">
              <Gem className="w-6 h-6 text-[#2d5a61] mb-2" />
              <h4 className="font-serif text-sm font-semibold text-[#333333] mb-1">Ethical Gemstones</h4>
              <p className="text-xs text-[#666666]">
                Natural amethyst, raw citrine, quartz and baroque pearls chosen for natural luster.
              </p>
            </div>

            <div className="bg-[#efe8dc]/70 p-4 rounded-2xl border border-[#e0d8c8]">
              <Sparkles className="w-6 h-6 text-[#2d5a61] mb-2" />
              <h4 className="font-serif text-sm font-semibold text-[#333333] mb-1">Bespoke Sizing</h4>
              <p className="text-xs text-[#666666]">
                Every wrist is unique. We customize circumference and closure finishes free of charge.
              </p>
            </div>

            <div className="bg-[#efe8dc]/70 p-4 rounded-2xl border border-[#e0d8c8]">
              <ShieldCheck className="w-6 h-6 text-[#2d5a61] mb-2" />
              <h4 className="font-serif text-sm font-semibold text-[#333333] mb-1">Durability Assured</h4>
              <p className="text-xs text-[#666666]">
                Crafted with quadruple-knotted Japanese elastic or aircraft-grade coated wire.
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-[#e0d8c8] flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="text-xs italic text-[#2d5a61]">
              &ldquo;May every piece bring a little sparkle to your everyday life.&rdquo; — Maryam
            </span>
            <button
              onClick={() => {
                onClose();
                onExplore();
              }}
              className="bg-[#2d5a61] text-white px-6 py-2.5 rounded-full text-xs font-medium hover:bg-[#1e3c41] transition-colors"
            >
              Explore the Collection
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
