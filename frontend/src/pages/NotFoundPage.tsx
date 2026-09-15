import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Sparkles, Compass, Package, HeartHandshake } from 'lucide-react';
import { SEO } from '../components/SEO';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[75vh] flex items-center justify-center bg-[#efe8dc] px-4 py-16">
      <SEO
        title="Page Not Found (404)"
        description="The jewellery page or collection you are seeking could not be found. Explore Maryam Sparkle handcrafted creations."
        noindex={true}
      />
      <div className="max-w-xl w-full text-center bg-[#fdfaf5] rounded-3xl p-8 md:p-12 border border-[#e0d8c8] shadow-sm">
        <div className="w-16 h-16 bg-[#2d5a61]/10 rounded-2xl flex items-center justify-center mx-auto mb-6 text-[#2d5a61]">
          <Compass className="w-8 h-8" />
        </div>

        <span className="text-xs font-bold tracking-widest text-[#2d5a61] uppercase mb-2 block">
          404 Error — Page Not Found
        </span>

        <h1 className="font-serif text-3xl md:text-4xl text-[#333333] mb-4">
          Lost in the Sparkle
        </h1>

        <p className="text-sm text-[#666666] leading-relaxed mb-8">
          The page or handcrafted piece you are looking for may have been renamed, removed, or crafted as a limited edition. Let us guide you back to our studio collections.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
          <Link
            to="/shop"
            className="flex flex-col items-center p-4 rounded-2xl bg-[#efe8dc]/50 hover:bg-[#efe8dc] border border-[#e0d8c8] transition-colors group"
          >
            <Sparkles className="w-5 h-5 text-[#2d5a61] mb-2 group-hover:scale-110 transition-transform" />
            <span className="font-serif text-xs font-bold text-[#333333]">All Jewelry</span>
            <span className="text-[10px] text-[#777777]">Explore Catalog</span>
          </Link>

          <Link
            to="/track"
            className="flex flex-col items-center p-4 rounded-2xl bg-[#efe8dc]/50 hover:bg-[#efe8dc] border border-[#e0d8c8] transition-colors group"
          >
            <Package className="w-5 h-5 text-[#2d5a61] mb-2 group-hover:scale-110 transition-transform" />
            <span className="font-serif text-xs font-bold text-[#333333]">Track Order</span>
            <span className="text-[10px] text-[#777777]">Check Delivery</span>
          </Link>

          <Link
            to="/custom-orders"
            className="flex flex-col items-center p-4 rounded-2xl bg-[#efe8dc]/50 hover:bg-[#efe8dc] border border-[#e0d8c8] transition-colors group"
          >
            <HeartHandshake className="w-5 h-5 text-[#2d5a61] mb-2 group-hover:scale-110 transition-transform" />
            <span className="font-serif text-xs font-bold text-[#333333]">Custom Order</span>
            <span className="text-[10px] text-[#777777]">Bespoke Craft</span>
          </Link>
        </div>

        <Link
          to="/"
          className="inline-flex items-center gap-2 bg-[#2d5a61] text-white px-8 py-3 rounded-full text-xs font-semibold hover:bg-[#1e3c41] transition-all shadow-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Homepage</span>
        </Link>
      </div>
    </div>
  );
};
