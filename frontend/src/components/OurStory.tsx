import React from 'react';
import { ArrowRight, Heart, Sparkles, ShieldCheck } from 'lucide-react';
import { HERO_IMAGES } from '../data/products';

interface OurStoryProps {
  onLearnMore: () => void;
}

export const OurStory: React.FC<OurStoryProps> = ({ onLearnMore }) => {
  return (
    <section className="max-w-7xl mx-auto px-6 md:px-8 py-16">
      <div className="bg-[#e8dfcf] rounded-[36px] md:rounded-[48px] overflow-hidden flex flex-col lg:flex-row shadow-sm border border-[#e0d8c8]">
        {/* Left: Artisan Hands in Workshop */}
        <div className="lg:w-1/2 relative min-h-[360px] lg:min-h-[520px]">
          <img
            src={HERO_IMAGES.ourStory}
            alt="Artisan hands crafting delicate handmade jewelry on workshop bench"
            className="w-full h-full object-cover"
            loading="lazy"
          />
          <div className="absolute top-6 left-6 bg-[#efe8dc]/85 backdrop-blur-xs py-1.5 px-4 rounded-full text-xs font-medium text-[#2d5a61] shadow-xs border border-[#e0d8c8]/60">
            Lahore Studio & Workshop
          </div>
        </div>

        {/* Right: Content & Craftsmanship values */}
        <div className="lg:w-1/2 p-8 sm:p-12 lg:p-16 flex flex-col justify-center">
          {/* Subheading */}
          <div className="flex items-center gap-2 text-[#2d5a61] italic font-serif text-lg md:text-xl mb-3">
            <span>Our Story</span>
            <Heart className="w-4 h-4 text-[#2d5a61]" strokeWidth={1.5} />
          </div>

          {/* Heading */}
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl leading-[1.15] text-[#333333] mb-6 font-normal">
            Crafted by hands,<br />
            <span className="italic">inspired by heart.</span>
          </h2>

          {/* Body */}
          <p className="text-[#666666] mb-8 max-w-md text-sm sm:text-base leading-relaxed font-light">
            Every piece is thoughtfully handmade using quality beads, pearls and charms.
            From selecting each bead to the final touch – we put love in every detail.
          </p>

          {/* Feature List */}
          <ul className="space-y-6 mb-8">
            <li className="flex items-start gap-4">
              <div className="text-[#2d5a61] mt-0.5 p-2 rounded-xl bg-[#fdfaf5] border border-[#e0d8c8]/60 shadow-2xs">
                <Sparkles className="w-5 h-5" strokeWidth={1.75} />
              </div>
              <div>
                <h4 className="font-semibold text-sm text-[#333333] tracking-wide">Quality Materials</h4>
                <p className="text-xs sm:text-sm text-[#666666] mt-0.5">
                  Carefully selected beads, pearls & charms imported and ethically sourced.
                </p>
              </div>
            </li>

            <li className="flex items-start gap-4">
              <div className="text-[#2d5a61] mt-0.5 p-2 rounded-xl bg-[#fdfaf5] border border-[#e0d8c8]/60 shadow-2xs">
                <ShieldCheck className="w-5 h-5" strokeWidth={1.75} />
              </div>
              <div>
                <h4 className="font-semibold text-sm text-[#333333] tracking-wide">Made to Order</h4>
                <p className="text-xs sm:text-sm text-[#666666] mt-0.5">
                  Customization available just for you — tailored wrist fits, stones & initials.
                </p>
              </div>
            </li>
          </ul>

          {/* CTA */}
          <div>
            <button
              onClick={onLearnMore}
              className="inline-flex items-center justify-center bg-[#2d5a61] text-white px-8 py-3.5 rounded-full font-medium hover:bg-[#1e3c41] transition-all duration-300 text-sm shadow-sm hover:shadow group cursor-pointer"
            >
              <span>Learn More</span>
              <ArrowRight className="w-4 h-4 ml-2 transition-transform duration-300 group-hover:translate-x-1" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
