import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Instagram, MessageCircle, Heart, CheckCircle2, ArrowRight } from 'lucide-react';

interface FooterProps {
  onSelectCategory?: (category: string | null) => void;
  onOpenCustomOrder?: () => void;
  onOpenCustomerCare?: (tab?: string) => void;
}

export const Footer: React.FC<FooterProps> = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setTimeout(() => {
        setEmail('');
      }, 4000);
    }
  };

  return (
    <footer className="bg-[#fdfaf5] border-t border-[#e0d8c8]/80 text-[#333333] mt-12">
      {/* Top Editorial Newsletter / Brand Accent Bar */}
      <div className="border-b border-[#e0d8c8]/60 py-10 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="max-w-md">
              <span className="text-xs uppercase tracking-[0.2em] font-semibold text-[#2d5a61] block mb-1.5">
                The Sparkle Circle
              </span>
              <p className="font-serif text-xl sm:text-2xl text-[#333333] leading-snug">
                Receive secret drop alerts & handmade styling notes.
              </p>
            </div>

            <div className="w-full md:w-auto md:min-w-[360px]">
              {subscribed ? (
                <div className="flex items-center gap-2 text-xs font-medium text-[#2d5a61] bg-[#efe8dc] px-4 py-3 rounded-full border border-[#2d5a61]/30">
                  <CheckCircle2 className="w-4 h-4 text-[#2d5a61] shrink-0" />
                  <span>Welcome to the circle! Use code <strong className="font-bold">SPARKLE10</strong> for 10% off.</span>
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="flex gap-2">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                    className="flex-1 bg-[#efe8dc]/40 border border-[#e0d8c8] rounded-full px-4 py-2.5 text-xs sm:text-sm text-[#333333] placeholder-[#888888] focus:outline-none focus:border-[#2d5a61]"
                  />
                  <button
                    type="submit"
                    className="bg-[#2d5a61] hover:bg-[#1e3c41] text-white px-5 py-2.5 rounded-full text-xs font-semibold transition-colors shrink-0 shadow-xs cursor-pointer flex items-center gap-1.5"
                  >
                    <span>Join</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main 5-Column Editorial Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8">
          {/* 1. Brand Column (span 4) */}
          <div className="lg:col-span-4 space-y-4">
            <Link to="/" className="inline-block group">
              <span className="font-serif text-2xl tracking-[0.2em] text-[#2d5a61] font-normal block leading-tight">
                MARYAM SPARKLE
              </span>
              <span className="text-[10px] tracking-[0.3em] uppercase text-[#888888] font-medium block mt-0.5">
                Artisanal Studio • Pakistan
              </span>
            </Link>

            <p className="text-xs sm:text-sm text-[#666666] leading-relaxed max-w-sm font-light">
              Handmade jewelry, made with intention. Vibrant beads, delicate chains, and sparkling charms crafted piece-by-piece in our atelier.
            </p>

            <div className="pt-2 text-xs text-[#888888]">
              <span>Karachi Studio • Nationwide Express Shipping</span>
            </div>
          </div>

          {/* 2. Shop Column (span 2) */}
          <div className="lg:col-span-2">
            <h3 className="font-serif text-sm uppercase tracking-[0.15em] text-[#333333] font-semibold mb-4">
              Shop
            </h3>
            <ul className="space-y-2.5 text-xs sm:text-sm text-[#666666]">
              <li>
                <Link to="/shop" className="hover:text-[#2d5a61] transition-colors">
                  All Jewelry
                </Link>
              </li>
              <li>
                <Link to="/shop?category=bracelets" className="hover:text-[#2d5a61] transition-colors">
                  Bracelets
                </Link>
              </li>
              <li>
                <Link to="/shop?category=anklets" className="hover:text-[#2d5a61] transition-colors">
                  Anklets
                </Link>
              </li>
              <li>
                <Link to="/shop?category=necklaces" className="hover:text-[#2d5a61] transition-colors">
                  Necklaces
                </Link>
              </li>
              <li>
                <Link to="/shop?category=earrings" className="hover:text-[#2d5a61] transition-colors">
                  Earrings
                </Link>
              </li>
              <li>
                <Link to="/shop?category=rings" className="hover:text-[#2d5a61] transition-colors">
                  Rings
                </Link>
              </li>
              <li>
                <Link to="/custom-orders" className="hover:text-[#2d5a61] transition-colors text-[#2d5a61] font-medium">
                  Custom Orders
                </Link>
              </li>
            </ul>
          </div>

          {/* 3. Customer Care Column (span 3) */}
          <div className="lg:col-span-3">
            <h3 className="font-serif text-sm uppercase tracking-[0.15em] text-[#333333] font-semibold mb-4">
              Customer Care
            </h3>
            <ul className="space-y-2.5 text-xs sm:text-sm text-[#666666]">
              <li>
                <Link to="/customer-care?tab=faqs" className="hover:text-[#2d5a61] transition-colors">
                  FAQs & Sizing
                </Link>
              </li>
              <li>
                <Link to="/customer-care?tab=shipping" className="hover:text-[#2d5a61] transition-colors">
                  Shipping & Returns
                </Link>
              </li>
              <li>
                <Link to="/customer-care?tab=jewelry-care" className="hover:text-[#2d5a61] transition-colors">
                  Jewelry Care Rituals
                </Link>
              </li>
              <li>
                <Link to="/track" className="hover:text-[#2d5a61] transition-colors inline-flex items-center gap-1.5">
                  <span>Track Order</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                </Link>
              </li>
              <li>
                <Link to="/account" className="hover:text-[#2d5a61] transition-colors">
                  My Account
                </Link>
              </li>
            </ul>
          </div>

          {/* 4. About Column (span 1.5) */}
          <div className="lg:col-span-1.5">
            <h3 className="font-serif text-sm uppercase tracking-[0.15em] text-[#333333] font-semibold mb-4">
              About
            </h3>
            <ul className="space-y-2.5 text-xs sm:text-sm text-[#666666]">
              <li>
                <Link to="/about" className="hover:text-[#2d5a61] transition-colors">
                  Our Story
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-[#2d5a61] transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link to="/wishlist" className="hover:text-[#2d5a61] transition-colors">
                  Saved Wishlist
                </Link>
              </li>
            </ul>
          </div>

          {/* 5. Follow Column (span 1.5) */}
          <div className="lg:col-span-1.5">
            <h3 className="font-serif text-sm uppercase tracking-[0.15em] text-[#333333] font-semibold mb-4">
              Follow
            </h3>
            <ul className="space-y-3 text-xs sm:text-sm text-[#666666]">
              <li>
                <a
                  href="https://instagram.com/maryamsparkle456"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#2d5a61] transition-colors flex items-center gap-2 group"
                >
                  <Instagram className="w-4 h-4 text-[#2d5a61] group-hover:scale-110 transition-transform" />
                  <span>Instagram</span>
                </a>
              </li>
              <li>
                <a
                  href="https://wa.me/923001234567"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#2d5a61] transition-colors flex items-center gap-2 group"
                >
                  <MessageCircle className="w-4 h-4 text-emerald-600 group-hover:scale-110 transition-transform" />
                  <span>WhatsApp</span>
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="border-t border-[#e0d8c8]/70 py-6 text-xs text-[#888888]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <p>
            &copy; {new Date().getFullYear()} Maryam Sparkle. All rights reserved.
          </p>
          <p className="flex items-center gap-1.5 justify-center">
            <span>Handmade with care in Karachi, Pakistan</span>
            <Heart className="w-3.5 h-3.5 text-[#2d5a61] fill-[#2d5a61]" />
          </p>
        </div>
      </div>
    </footer>
  );
};
