import React, { useState } from 'react';
import { Heart, Phone, Mail, Instagram, CheckCircle2 } from 'lucide-react';
import { InstagramGrid } from './InstagramGrid';
import { Link } from 'react-router-dom';

interface FooterProps {
  onSelectCategory: (category: string | null) => void;
  onOpenCustomOrder: () => void;
  onOpenCustomerCare: (tab?: string) => void;
}

export const Footer: React.FC<FooterProps> = ({
  onSelectCategory,
  onOpenCustomOrder,
  onOpenCustomerCare,
}) => {
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
    <footer className="bg-[#fdfaf5] pt-14 pb-20 sm:pb-0 mt-8 border-t border-[#e0d8c8]/70">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Instagram Gallery embedded before footer columns */}
        <InstagramGrid />

        {/* 4-column Footer grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-12 pb-16 pt-8 border-t border-[#e0d8c8]/50">
          {/* Newsletter Column */}
          <div className="md:col-span-4">
            <div className="flex items-center gap-2 text-[#2d5a61] italic font-serif text-xl mb-3">
              <span>Let&apos;s stay connected</span>
              <Heart className="w-4 h-4 text-[#2d5a61]" strokeWidth={1.5} />
            </div>
            <p className="text-xs sm:text-sm text-[#666666] mb-5 leading-relaxed font-light">
              Join our sparkle circle for early access to limited bead drops, secret flash sales, and artisanal styling guides.
            </p>

            {subscribed ? (
              <div className="flex items-center gap-2 text-xs font-semibold text-[#2d5a61] bg-[#efe8dc] p-3 rounded-full border border-[#2d5a61]/30">
                <CheckCircle2 className="w-4 h-4 text-[#2d5a61] shrink-0" />
                <span>Thank you! Check your inbox for your 10% welcome code (SPARKLE10).</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  required
                  className="flex-1 rounded-full border border-[#e0d8c8] bg-transparent px-4 py-2.5 text-xs sm:text-sm text-[#333333] placeholder-[#888888] focus:outline-none focus:ring-1 focus:ring-[#2d5a61] focus:border-[#2d5a61] bg-white/50"
                />
                <button
                  type="submit"
                  className="bg-[#2d5a61] text-white px-6 py-2.5 rounded-full text-xs sm:text-sm font-medium hover:bg-[#1e3c41] transition-colors shadow-xs cursor-pointer"
                >
                  Subscribe
                </button>
              </form>
            )}
          </div>

          {/* Quick Links */}
          <div className="md:col-span-2 sm:col-span-4">
            <h4 className="font-semibold mb-4 text-xs text-[#333333] tracking-wider uppercase">Quick Links</h4>
            <ul className="space-y-2.5 text-xs sm:text-sm text-[#666666]">
              <li>
                <Link to="/" className="hover:text-[#2d5a61] transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/shop" className="hover:text-[#2d5a61] transition-colors">
                  E-Shop Catalog
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-[#2d5a61] transition-colors">
                  Our Story & Atelier
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-[#2d5a61] transition-colors">
                  Contact & Studio
                </Link>
              </li>
              <li>
                <button 
                  onClick={onOpenCustomOrder} 
                  className="hover:text-[#2d5a61] transition-colors cursor-pointer text-left text-[#2d5a61] font-medium"
                >
                  Custom Bespoke Request
                </button>
              </li>
            </ul>
          </div>

          {/* Customer Care */}
          <div className="md:col-span-3 sm:col-span-4">
            <h4 className="font-semibold mb-4 text-xs text-[#333333] tracking-wider uppercase">Customer Care</h4>
            <ul className="space-y-2.5 text-xs sm:text-sm text-[#666666]">
              <li>
                <button 
                  onClick={() => onOpenCustomerCare('faqs')} 
                  className="hover:text-[#2d5a61] transition-colors cursor-pointer text-left"
                >
                  FAQs & Sizing Guide
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onOpenCustomerCare('shipping')} 
                  className="hover:text-[#2d5a61] transition-colors cursor-pointer text-left"
                >
                  Shipping & Delivery
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onOpenCustomerCare('returns')} 
                  className="hover:text-[#2d5a61] transition-colors cursor-pointer text-left"
                >
                  Returns & Exchanges
                </button>
              </li>
              <li>
                <Link 
                  to="/track" 
                  className="hover:text-[#2d5a61] transition-colors inline-flex items-center gap-1.5"
                >
                  <span>Track Your Order</span>
                  <span className="text-[9px] bg-[#2d5a61]/10 text-[#2d5a61] font-bold px-1.5 py-0.2 rounded-full">
                    Live
                  </span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact & Payment Column */}
          <div className="md:col-span-3 sm:col-span-4">
            <h4 className="font-semibold mb-4 text-xs text-[#333333] tracking-wider uppercase">Contact</h4>
            <ul className="space-y-3 text-xs sm:text-sm text-[#666666] mb-6">
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#2d5a61] shrink-0" strokeWidth={1.5} />
                <a href="tel:+923001234567" className="hover:text-[#2d5a61] transition-colors">
                  +92 300 1234567
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#2d5a61] shrink-0" strokeWidth={1.5} />
                <a href="mailto:maryamsparkle@gmail.com" className="hover:text-[#2d5a61] transition-colors">
                  maryamsparkle@gmail.com
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Instagram className="w-4 h-4 text-[#2d5a61] shrink-0" strokeWidth={1.5} />
                <a
                  href="https://instagram.com/maryamsparkle456"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#2d5a61] transition-colors"
                >
                  @maryamsparkle456
                </a>
              </li>
            </ul>

            <div>
              <h4 className="font-semibold mb-2.5 text-[11px] text-[#333333] tracking-wider uppercase">We Accept</h4>
              <div className="flex flex-wrap gap-2">
                <div className="w-10 h-6 bg-white border border-gray-200 rounded flex items-center justify-center text-[9px] font-bold text-blue-800 shadow-2xs">
                  VISA
                </div>
                <div className="w-10 h-6 bg-white border border-gray-200 rounded flex items-center justify-center text-[9px] font-bold text-red-500 shadow-2xs">
                  MC
                </div>
                <div className="w-10 h-6 bg-white border border-gray-200 rounded flex items-center justify-center text-[9px] font-bold text-[#2d5a61] shadow-2xs">
                  BANK
                </div>
                <div className="w-10 h-6 bg-white border border-gray-200 rounded flex items-center justify-center text-[9px] font-bold text-green-600 shadow-2xs">
                  EASY
                </div>
                <div className="w-10 h-6 bg-white border border-gray-200 rounded flex items-center justify-center text-[9px] font-bold text-amber-700 shadow-2xs">
                  COD
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright Bar */}
      <div className="bg-[#2d5a61] text-white/80 py-4 text-center text-xs tracking-wide">
        <div className="max-w-7xl mx-auto px-4 flex justify-center items-center gap-1.5">
          <span>&copy; {new Date().getFullYear()} Maryam Sparkle. Handcrafted Artisanal Jewellery.</span>
          <Heart className="w-3.5 h-3.5 text-white/80 inline" fill="currentColor" />
        </div>
      </div>
    </footer>
  );
};
