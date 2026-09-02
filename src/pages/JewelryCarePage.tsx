import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Droplets, Sun, ShieldAlert, Heart, CheckCircle2, ArrowRight } from 'lucide-react';

export const JewelryCarePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#efe8dc] py-12 md:py-20">
      <div className="max-w-4xl mx-auto px-6 md:px-10">
        {/* Header */}
        <div className="text-center mb-12">
          <span className="text-xs font-semibold uppercase tracking-widest text-[#2d5a61] block mb-2">
            Longevity & Care Rituals
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl text-[#333333] mb-4">
            Jewelry Care Guide
          </h1>
          <p className="text-sm md:text-base text-[#666666] max-w-lg mx-auto">
            Our handmade pieces are crafted with genuine quartz crystals, natural baroque pearls, and gold-plated findings. Follow these gentle rituals to keep them glowing for years.
          </p>
        </div>

        {/* 4 Essential Golden Rules Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-12">
          <div className="bg-[#fdfaf5] rounded-3xl p-6 border border-[#e0d8c8] shadow-xs">
            <div className="w-12 h-12 rounded-2xl bg-[#efe8dc] text-[#2d5a61] flex items-center justify-center mb-4">
              <Droplets className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-lg text-[#333333] mb-2 font-medium">Keep Dry from Lotions & Perfumes</h3>
            <p className="text-xs text-[#666666] leading-relaxed">
              Apply your favorite perfumes, oils, and body mists <em>before</em> putting on your beaded bracelets. Direct alcohol sprays can cloud natural crystal facets and diminish gold plating luster.
            </p>
          </div>

          <div className="bg-[#fdfaf5] rounded-3xl p-6 border border-[#e0d8c8] shadow-xs">
            <div className="w-12 h-12 rounded-2xl bg-[#efe8dc] text-[#2d5a61] flex items-center justify-center mb-4">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-lg text-[#333333] mb-2 font-medium">The "Roll-On" Technique</h3>
            <p className="text-xs text-[#666666] leading-relaxed">
              For elastic bead bracelets, gently roll the piece over your hand onto your wrist rather than stretching the elastic outwards. This prevents tension fatigue and preserves strand memory.
            </p>
          </div>

          <div className="bg-[#fdfaf5] rounded-3xl p-6 border border-[#e0d8c8] shadow-xs">
            <div className="w-12 h-12 rounded-2xl bg-[#efe8dc] text-[#2d5a61] flex items-center justify-center mb-4">
              <Sun className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-lg text-[#333333] mb-2 font-medium">Safe Pouch Storage</h3>
            <p className="text-xs text-[#666666] leading-relaxed">
              Store your jewelry in the signature Maryam Sparkle velvet pouch or airtight compartment. Storing separately prevents gemstones from scratching softer baroque pearls and chains from knotting.
            </p>
          </div>

          <div className="bg-[#fdfaf5] rounded-3xl p-6 border border-[#e0d8c8] shadow-xs">
            <div className="w-12 h-12 rounded-2xl bg-[#efe8dc] text-[#2d5a61] flex items-center justify-center mb-4">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-lg text-[#333333] mb-2 font-medium">Remove Before Pools & Gym</h3>
            <p className="text-xs text-[#666666] leading-relaxed">
              Chlorine in swimming pools and sweat acidity can cause accelerated tarnishing on metallic spacer beads and findings. Remove pieces before intensive workouts and swimming.
            </p>
          </div>
        </div>

        {/* Cleaning Gemstones & Pearls Section */}
        <div className="bg-[#fdfaf5] rounded-3xl p-6 md:p-8 border border-[#e0d8c8] shadow-xs mb-10">
          <h2 className="font-serif text-xl text-[#333333] mb-4 pb-3 border-b border-[#e0d8c8]">
            How to Clean Your Handcrafted Jewelry
          </h2>

          <div className="space-y-4 text-xs md:text-sm text-[#555555] leading-relaxed">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
              <p>
                <strong>For Natural Crystals & Beads:</strong> Wipe gently with a dry or slightly damp 100% microfiber cloth. Do not soak in boiling water or use ultrasonic jewelry cleaning machines.
              </p>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
              <p>
                <strong>For Cultured Freshwater Pearls:</strong> Pearls require natural hydration from occasional skin contact! Simply buff them with a soft lint-free cotton cloth after wear to remove surface oils.
              </p>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
              <p>
                <strong>For 18K Gold Plated Findings:</strong> Use a specialized gold polishing cloth with light circular motions. Never use abrasive scrubbing sponges or harsh bleach solutions.
              </p>
            </div>
          </div>
        </div>

        {/* Lifetime Restringing Commitment */}
        <div className="bg-[#2d5a61]/10 rounded-3xl p-6 md:p-8 border border-[#2d5a61]/20 text-center mb-10">
          <Heart className="w-8 h-8 text-[#2d5a61] mx-auto mb-3" />
          <h3 className="font-serif text-xl text-[#333333] mb-2">Our Lifetime Restringing Promise</h3>
          <p className="text-xs md:text-sm text-[#555555] max-w-lg mx-auto mb-6">
            Even with high-tensile elastic cords, years of daily enjoyment can happen. If a strand ever needs re-stringing, send it back to our Karachi studio for free lifetime restringing.
          </p>
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 bg-[#2d5a61] text-white px-8 py-3 rounded-full text-xs font-semibold hover:bg-[#1e3c41] transition-all"
          >
            <span>Inquire About Restringing</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
};
