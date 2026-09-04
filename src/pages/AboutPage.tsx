import React from 'react';
import { HERO_IMAGES, INSTAGRAM_POSTS } from '../data/products';
import { Sparkles, Heart, Gem, ShieldCheck, Leaf, Award, ArrowRight, Compass } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SEO } from '../components/SEO';

interface AboutPageProps {
  onOpenCustomOrder: () => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ onOpenCustomOrder }) => {
  return (
    <div className="bg-[#efe8dc] min-h-screen">
      <SEO
        title="Our Story & Studio Craft"
        description="Learn about Maryam Sparkle, our handmade artisanal jewelry studio in Pakistan, crafting mindful beaded bracelets, necklaces, and bespoke pieces."
        canonical="/about"
      />
      {/* Hero Banner with Arch Layout */}
      <section className="relative py-16 md:py-24 border-b border-[#e0d8c8] overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Narrative */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#2d5a61]/10 border border-[#2d5a61]/20 text-[#2d5a61] text-xs font-semibold tracking-widest uppercase">
                <Sparkles className="w-3.5 h-3.5 text-[#D4B982]" />
                <span>Our Artisan Heritage</span>
              </div>
              <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-[#2d5a61] leading-[1.15]">
                Jewelry Crafted with Soul, Care & Radiant Color
              </h1>
              <p className="text-[#555555] text-base sm:text-lg font-light leading-relaxed">
                Maryam Sparkle began as an intimate pursuit of tranquility—hand-threading colorful glass and acrylic beads, playful charms, and delicate linked chains.
              </p>
              <p className="text-[#666666] text-sm sm:text-base font-light leading-relaxed">
                Today, our studio in Pakistan creates charming, everyday treasures designed to accompany you through every milestone, celebration, and quiet cup of morning tea.
              </p>
              <div className="pt-4 flex flex-wrap gap-4">
                <Link
                  to="/shop"
                  className="bg-[#2d5a61] text-white px-7 py-3.5 rounded-full text-sm font-medium hover:bg-[#1e3c41] transition-all shadow-md hover:shadow-lg flex items-center gap-2"
                >
                  <span>Explore Collections</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <button
                  onClick={onOpenCustomOrder}
                  className="border border-[#2d5a61] text-[#2d5a61] px-7 py-3.5 rounded-full text-sm font-medium hover:bg-[#2d5a61]/10 transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-[#D4B982]" />
                  <span>Request Bespoke Piece</span>
                </button>
              </div>
            </div>

            {/* Right Visual Arch */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative w-full max-w-sm">
                <div className="w-full aspect-4/5 rounded-t-[140px] rounded-b-2xl overflow-hidden border-8 border-white/80 shadow-2xl bg-white">
                  <img
                    src={HERO_IMAGES.ourStory}
                    alt="Maryam in the jewelry studio"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                {/* Floating Artisan Badge */}
                <div className="absolute -bottom-6 -left-6 bg-white/95 backdrop-blur-md p-4 rounded-2xl border border-[#e0d8c8] shadow-xl max-w-xs space-y-1">
                  <div className="flex items-center gap-1.5 text-[#2d5a61] font-semibold text-xs">
                    <Heart className="w-3.5 h-3.5 fill-current text-rose-500" />
                    <span>100% Handcrafted</span>
                  </div>
                  <p className="text-[11px] text-[#666666] leading-tight">
                    Every bead is individually inspected, strung, and finished by hand.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values Section */}
      <section className="py-16 md:py-20 bg-white/40 border-b border-[#e0d8c8]">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="font-serif text-3xl md:text-4xl text-[#2d5a61] mb-3">Our Guiding Values</h2>
            <p className="text-[#666666] text-sm md:text-base font-light">
              We reject mass-produced fast fashion in favor of slow, meaningful craftsmanship with hand-selected beads and durable finishes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white/80 border border-[#e0d8c8] p-6 rounded-2xl space-y-3 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-[#2d5a61]/10 flex items-center justify-center text-[#2d5a61]">
                <Gem className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-lg text-[#2d5a61] font-semibold">Artisan Beads & Charms</h3>
              <p className="text-xs sm:text-sm text-[#666666] leading-relaxed">
                We hand-select vibrant, smooth glass and acrylic beads paired with whimsical charms and delicate chains.
              </p>
            </div>

            <div className="bg-white/80 border border-[#e0d8c8] p-6 rounded-2xl space-y-3 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-[#2d5a61]/10 flex items-center justify-center text-[#2d5a61]">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-lg text-[#2d5a61] font-semibold">Quality Hardware</h3>
              <p className="text-xs sm:text-sm text-[#666666] leading-relaxed">
                Crafted with durable gold-tone and silver-tone findings, clasps, and jump rings designed for comfortable everyday wear.
              </p>
            </div>

            <div className="bg-white/80 border border-[#e0d8c8] p-6 rounded-2xl space-y-3 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-[#2d5a61]/10 flex items-center justify-center text-[#2d5a61]">
                <Leaf className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-lg text-[#2d5a61] font-semibold">Eco-Luxe Packaging</h3>
              <p className="text-xs sm:text-sm text-[#666666] leading-relaxed">
                Zero single-use plastics. Each order arrives in a reusable velvet jewelry pouch and recyclable kraft gift packaging.
              </p>
            </div>

            <div className="bg-white/80 border border-[#e0d8c8] p-6 rounded-2xl space-y-3 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-[#2d5a61]/10 flex items-center justify-center text-[#2d5a61]">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-lg text-[#2d5a61] font-semibold">Bespoke Customization</h3>
              <p className="text-xs sm:text-sm text-[#666666] leading-relaxed">
                Whether you need a custom wrist measurement, custom initials, or specific bead color pairings, Maryam handcrafts custom orders with care.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* The 4-Step Crafting Journey */}
      <section className="py-16 md:py-24 max-w-7xl mx-auto px-6 md:px-12">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#2d5a61]">Behind the Workbench</span>
          <h2 className="font-serif text-3xl md:text-4xl text-[#2d5a61] mt-2 mb-3">Our Crafting Journey</h2>
          <p className="text-[#666666] text-sm md:text-base font-light">
            How colorful beads and charms transform into your favorite everyday stack.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
          <div className="bg-white/70 border border-[#e0d8c8] rounded-2xl p-6 relative">
            <span className="font-serif text-4xl text-[#2d5a61]/20 font-bold absolute top-4 right-4">01</span>
            <div className="w-10 h-10 rounded-full bg-[#2d5a61] text-white flex items-center justify-center font-serif text-sm mb-4">
              1
            </div>
            <h3 className="font-serif text-lg text-[#2d5a61] mb-2 font-semibold">Bead Selection</h3>
            <p className="text-xs text-[#666666] leading-relaxed">
              We sort through colorful glass and acrylic beads to choose the smoothest shapes, brightest tones, and rich vibrant shades.
            </p>
          </div>

          <div className="bg-white/70 border border-[#e0d8c8] rounded-2xl p-6 relative">
            <span className="font-serif text-4xl text-[#2d5a61]/20 font-bold absolute top-4 right-4">02</span>
            <div className="w-10 h-10 rounded-full bg-[#2d5a61] text-white flex items-center justify-center font-serif text-sm mb-4">
              2
            </div>
            <h3 className="font-serif text-lg text-[#2d5a61] mb-2 font-semibold">Design & Patterning</h3>
            <p className="text-xs text-[#666666] leading-relaxed">
              Balancing color harmonies, delightful charms, and bead spacers on our jewelry design boards.
            </p>
          </div>

          <div className="bg-white/70 border border-[#e0d8c8] rounded-2xl p-6 relative">
            <span className="font-serif text-4xl text-[#2d5a61]/20 font-bold absolute top-4 right-4">03</span>
            <div className="w-10 h-10 rounded-full bg-[#2d5a61] text-white flex items-center justify-center font-serif text-sm mb-4">
              3
            </div>
            <h3 className="font-serif text-lg text-[#2d5a61] mb-2 font-semibold">Precision Hand-Threading</h3>
            <p className="text-xs text-[#666666] leading-relaxed">
              Using reinforced high-tensile stretch cords or durable linked chains for exceptional longevity and comfort.
            </p>
          </div>

          <div className="bg-white/70 border border-[#e0d8c8] rounded-2xl p-6 relative">
            <span className="font-serif text-4xl text-[#2d5a61]/20 font-bold absolute top-4 right-4">04</span>
            <div className="w-10 h-10 rounded-full bg-[#2d5a61] text-white flex items-center justify-center font-serif text-sm mb-4">
              4
            </div>
            <h3 className="font-serif text-lg text-[#2d5a61] mb-2 font-semibold">Quality & Gift Wrapping</h3>
            <p className="text-xs text-[#666666] leading-relaxed">
              Inspected for clasp and cord strength, packed into our signature pouch, and inscribed with a personalized handwritten thank you.
            </p>
          </div>
        </div>
      </section>

      {/* Bead Styles & Finishes Guide */}
      <section className="py-16 bg-[#2d5a61] text-white">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <Compass className="w-8 h-8 text-[#D4B982] mx-auto mb-3" />
            <h2 className="font-serif text-3xl md:text-4xl text-[#fdfaf5]">Materials in Our Atelier</h2>
            <p className="text-white/80 text-sm md:text-base font-light mt-2">
              Every curated element brings vibrant color, playful charm, and handcrafted character to your stack.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white/10 backdrop-blur-xs p-6 rounded-2xl border border-white/15 space-y-2">
              <div className="text-[#D4B982] font-serif text-xl font-medium">Colored Glass Beads</div>
              <p className="text-xs text-white/80 leading-relaxed">
                Smooth, glossy beads in radiant shades that catch the light effortlessly and bring uplifting energy to everyday outfits.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-xs p-6 rounded-2xl border border-white/15 space-y-2">
              <div className="text-[#D4B982] font-serif text-xl font-medium">Delightful Charms</div>
              <p className="text-xs text-white/80 leading-relaxed">
                Whimsical stars, hearts, floral motifs, and custom initial pendants that add personal storytelling to each piece.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-xs p-6 rounded-2xl border border-white/15 space-y-2">
              <div className="text-[#D4B982] font-serif text-xl font-medium">Lustrous Acrylic Accents</div>
              <p className="text-xs text-white/80 leading-relaxed">
                Lightweight, durable beads offering vibrant pastel tones, pearlescent sheens, and comfortable all-day layering.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-xs p-6 rounded-2xl border border-white/15 space-y-2">
              <div className="text-[#D4B982] font-serif text-xl font-medium">Gold-Tone Hardware</div>
              <p className="text-xs text-white/80 leading-relaxed">
                Warm, sunny clasps, jump rings, and linked chain accents that bring a polished shine to warm-toned bead stacks.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-xs p-6 rounded-2xl border border-white/15 space-y-2">
              <div className="text-[#D4B982] font-serif text-xl font-medium">Silver-Tone Hardware</div>
              <p className="text-xs text-white/80 leading-relaxed">
                Cool, sleek metallic clasps and chain components that offer a clean, modern contrast against vibrant color palettes.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-xs p-6 rounded-2xl border border-white/15 space-y-2">
              <div className="text-[#D4B982] font-serif text-xl font-medium">Linked Chain Accents</div>
              <p className="text-xs text-white/80 leading-relaxed">
                Delicate, lightweight cable links and extenders allowing comfortable fit adjustment and layered styling.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Studio Moments Instagram Preview */}
      <section className="py-16 md:py-20 max-w-7xl mx-auto px-6 md:px-12">
        <div className="text-center max-w-xl mx-auto mb-10">
          <h2 className="font-serif text-2xl md:text-3xl text-[#2d5a61]">Moments from the Workshop</h2>
          <p className="text-xs sm:text-sm text-[#666666] mt-1">
            Follow our behind-the-scenes journey on Instagram <strong className="text-[#2d5a61]">@maryamsparkle456</strong>
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {INSTAGRAM_POSTS.slice(0, 4).map((post) => (
            <div
              key={post.id}
              className="relative aspect-square rounded-2xl overflow-hidden group shadow-sm hover:shadow-md border border-[#e0d8c8]"
            >
              <img
                src={post.image}
                alt={post.caption}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity p-4 flex flex-col justify-end text-white text-xs">
                <p className="line-clamp-2 text-[11px]">{post.caption}</p>
                <span className="text-[10px] text-[#D4B982] mt-1 font-semibold">❤️ {post.likes} likes</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
