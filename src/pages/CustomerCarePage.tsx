import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import {
  HelpCircle,
  Truck,
  RotateCcw,
  Sparkles,
  Search,
  ChevronDown,
  Clock,
  CheckCircle2,
  Globe,
  Droplets,
  Sun,
  ShieldAlert,
  Heart,
  MessageCircle,
  Package,
  ShieldCheck,
  HeartHandshake,
  ArrowRight
} from 'lucide-react';
import { FAQS } from '../data/products';

export const CustomerCarePage: React.FC = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<'faqs' | 'shipping' | 'returns' | 'jewelry-care'>('faqs');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFaqCategory, setSelectedFaqCategory] = useState<string>('all');
  const [openFaqIds, setOpenFaqIds] = useState<string[]>(['faq-1', 'faq-3']);

  // Sync tab from URL query params (e.g. /customer-care?tab=shipping)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tabParam = params.get('tab');
    if (tabParam) {
      if (tabParam === 'shipping' || tabParam === 'delivery') {
        setActiveTab('shipping');
      } else if (tabParam === 'returns' || tabParam === 'exchanges' || tabParam === 'shipping-returns') {
        setActiveTab('returns');
      } else if (tabParam === 'jewelry-care' || tabParam === 'care') {
        setActiveTab('jewelry-care');
      } else if (tabParam === 'faqs') {
        setActiveTab('faqs');
      }
    }
  }, [location.search]);

  const faqCategories = ['all', 'Orders & Customization', 'Shipping & Delivery', 'Jewelry Care', 'Payments & Returns'];

  const filteredFaqs = FAQS.filter((faq) => {
    const matchesCat = selectedFaqCategory === 'all' || faq.category === selectedFaqCategory;
    const matchesSearch =
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const toggleFaq = (id: string) => {
    setOpenFaqIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  return (
    <div className="min-h-screen bg-[#efe8dc] py-12 md:py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="text-center mb-10">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#2d5a61] block mb-2">
            Maryam Sparkle Studio Care
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl text-[#333333] mb-3">
            Customer Care & Help
          </h1>
          <p className="text-xs sm:text-sm text-[#666666] max-w-lg mx-auto leading-relaxed">
            Everything you need to know about our handcrafted jewelry, nationwide delivery, 7-day exchanges, and crystal care rituals.
          </p>
        </div>

        {/* Tab Navigation Pill Bar */}
        <div className="bg-[#fdfaf5] p-1.5 rounded-2xl border border-[#e0d8c8] shadow-xs mb-10">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1">
            {[
              { id: 'faqs', label: 'FAQs', icon: HelpCircle },
              { id: 'shipping', label: 'Shipping & Delivery', icon: Truck },
              { id: 'returns', label: 'Returns & Exchanges', icon: RotateCcw },
              { id: 'jewelry-care', label: 'Jewelry Care', icon: Sparkles },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-3 px-3 rounded-xl text-xs font-medium transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    isActive
                      ? 'bg-[#2d5a61] text-white shadow-xs font-semibold'
                      : 'text-[#555555] hover:text-[#2d5a61] hover:bg-[#efe8dc]/50'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#D4B982]' : 'text-[#888888]'}`} />
                  <span className="truncate">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab 1: FAQs */}
        {activeTab === 'faqs' && (
          <div className="space-y-8 animate-in fade-in duration-200">
            {/* Search Box & Category Filters */}
            <div className="bg-[#fdfaf5] rounded-3xl p-6 md:p-8 border border-[#e0d8c8] shadow-xs">
              <div className="relative mb-6">
                <Search className="w-4 h-4 text-[#888888] absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search sizing, materials, delivery, custom orders..."
                  className="w-full bg-[#efe8dc]/40 border border-[#e0d8c8] rounded-full pl-11 pr-4 py-3 text-xs md:text-sm text-[#333333] focus:outline-none focus:border-[#2d5a61]"
                />
              </div>

              {/* Categories */}
              <div className="flex flex-wrap gap-2">
                {faqCategories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedFaqCategory(cat)}
                    className={`px-3 py-1.5 rounded-full text-xs transition-all cursor-pointer ${
                      selectedFaqCategory === cat
                        ? 'bg-[#2d5a61] text-white font-medium'
                        : 'bg-[#efe8dc]/50 text-[#555555] hover:bg-[#efe8dc]'
                    }`}
                  >
                    {cat === 'all' ? 'All Questions' : cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Accordions */}
            <div className="space-y-3">
              {filteredFaqs.length === 0 ? (
                <div className="text-center py-12 bg-[#fdfaf5] rounded-3xl border border-[#e0d8c8]">
                  <p className="text-sm text-[#666666]">No questions found matching &ldquo;{searchQuery}&rdquo;</p>
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedFaqCategory('all');
                    }}
                    className="mt-3 text-xs text-[#2d5a61] font-semibold underline cursor-pointer"
                  >
                    Reset Filters
                  </button>
                </div>
              ) : (
                filteredFaqs.map((faq) => {
                  const isOpen = openFaqIds.includes(faq.id);
                  return (
                    <div
                      key={faq.id}
                      className="bg-[#fdfaf5] rounded-2xl border border-[#e0d8c8] overflow-hidden transition-all shadow-2xs"
                    >
                      <button
                        onClick={() => toggleFaq(faq.id)}
                        className="w-full px-5 py-4 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-[#efe8dc]/30 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <Sparkles className="w-3.5 h-3.5 text-[#D4B982] shrink-0" />
                          <span className="font-serif text-sm md:text-base text-[#333333] font-medium">
                            {faq.question}
                          </span>
                        </div>
                        <ChevronDown
                          className={`w-4 h-4 text-[#2d5a61] transition-transform duration-300 shrink-0 ${
                            isOpen ? 'rotate-180' : ''
                          }`}
                        />
                      </button>

                      {isOpen && (
                        <div className="px-5 pb-5 pt-1 text-xs md:text-sm text-[#555555] leading-relaxed border-t border-[#e0d8c8]/40 bg-white/40">
                          <p>{faq.answer}</p>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Shipping & Delivery */}
        {activeTab === 'shipping' && (
          <div className="space-y-8 animate-in fade-in duration-200">
            {/* Rates Table Card */}
            <div className="bg-[#fdfaf5] rounded-3xl p-6 md:p-8 border border-[#e0d8c8] shadow-xs">
              <h2 className="font-serif text-xl text-[#333333] mb-6 pb-3 border-b border-[#e0d8c8] flex items-center gap-2">
                <Truck className="w-5 h-5 text-[#2d5a61]" />
                Domestic Delivery (Pakistan)
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div className="p-5 rounded-2xl bg-[#efe8dc]/50 border border-[#e0d8c8]">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#2d5a61] block mb-1">
                    Standard Tracked Delivery
                  </span>
                  <p className="font-serif text-xl text-[#333333] font-bold mb-2">
                    Rs. 200 <span className="text-xs font-normal text-[#666666]">(FREE over Rs. 3,000)</span>
                  </p>
                  <ul className="space-y-1.5 text-xs text-[#555555]">
                    <li className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-[#2d5a61]" />
                      <span>2 to 4 Business Days nationwide</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Dispatched via TCS / Trax Express</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Cash on Delivery (COD) supported</span>
                    </li>
                  </ul>
                </div>

                <div className="p-5 rounded-2xl bg-[#efe8dc]/50 border border-[#e0d8c8]">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#A96745] block mb-1">
                    Express Overnight Courier
                  </span>
                  <p className="font-serif text-xl text-[#333333] font-bold mb-2">
                    Rs. 350 Flat Rate
                  </p>
                  <ul className="space-y-1.5 text-xs text-[#555555]">
                    <li className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-[#A96745]" />
                      <span>1 to 2 Business Days priority</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Immediate artisan crafting queue</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                      <span>SMS & WhatsApp tracking alerts</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="text-xs text-[#666666] space-y-2">
                <p>
                  <strong>Major Cities Covered:</strong> Karachi (Same-day / Next-day), Lahore, Islamabad, Rawalpindi, Faisalabad, Multan, Peshawar, Quetta, Sialkot, Hyderabad, Gujranwala, Abbottabad, and 200+ towns nationwide.
                </p>
              </div>
            </div>

            {/* International Shipping Card */}
            <div className="bg-[#fdfaf5] rounded-3xl p-6 md:p-8 border border-[#e0d8c8] shadow-xs">
              <h2 className="font-serif text-xl text-[#333333] mb-4 pb-3 border-b border-[#e0d8c8] flex items-center gap-2">
                <Globe className="w-5 h-5 text-[#2d5a61]" />
                Worldwide International Shipping
              </h2>

              <p className="text-xs md:text-sm text-[#555555] leading-relaxed mb-4">
                We proudly ship our handcrafted jewelry pieces to overseas Pakistanis and jewelry lovers worldwide (USA, UK, Canada, UAE, Saudi Arabia, Australia, Europe).
              </p>

              <div className="p-4 bg-[#efe8dc]/60 rounded-2xl border border-[#e0d8c8] space-y-2 text-xs text-[#444444]">
                <p><strong>Timeline:</strong> 7 to 12 Business Days via DHL Express / EMS Tracked.</p>
                <p><strong>Payment:</strong> International Visa / Mastercard or Western Union.</p>
                <p><strong>Inquiries:</strong> WhatsApp us at <strong>+92 300 1234567</strong> for bespoke worldwide shipping quotes.</p>
              </div>
            </div>

            {/* Quick Track Order CTA */}
            <div className="bg-[#2d5a61] text-white rounded-3xl p-6 md:p-8 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="font-serif text-lg font-semibold">Looking for an existing package?</h3>
                <p className="text-xs text-white/80">Enter your order number or phone number to see live courier status.</p>
              </div>
              <Link
                to="/track"
                className="bg-white text-[#2d5a61] hover:bg-[#efe8dc] px-6 py-2.5 rounded-full text-xs font-semibold transition-colors shrink-0 shadow-xs flex items-center gap-1.5"
              >
                <Package className="w-4 h-4 text-[#D4B982]" />
                <span>Track Order</span>
              </Link>
            </div>
          </div>
        )}

        {/* Tab 3: Returns & Exchanges */}
        {activeTab === 'returns' && (
          <div className="space-y-8 animate-in fade-in duration-200">
            {/* Core Pillars */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
              <div className="bg-[#fdfaf5] rounded-3xl p-6 border border-[#e0d8c8] shadow-xs text-center">
                <div className="w-12 h-12 rounded-2xl bg-[#efe8dc] text-[#2d5a61] flex items-center justify-center mx-auto mb-4">
                  <RotateCcw className="w-6 h-6" />
                </div>
                <h3 className="font-serif text-lg text-[#333333] mb-2 font-medium">7-Day Window</h3>
                <p className="text-xs text-[#666666] leading-relaxed">
                  Notify us within 7 days of delivery to arrange an exchange or size adjustment.
                </p>
              </div>

              <div className="bg-[#fdfaf5] rounded-3xl p-6 border border-[#e0d8c8] shadow-xs text-center">
                <div className="w-12 h-12 rounded-2xl bg-[#efe8dc] text-[#2d5a61] flex items-center justify-center mx-auto mb-4">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="font-serif text-lg text-[#333333] mb-2 font-medium">Free Resizing</h3>
                <p className="text-xs text-[#666666] leading-relaxed">
                  Bracelet or anklet slightly loose or snug? We re-thread your piece to your exact fit at zero labor cost.
                </p>
              </div>

              <div className="bg-[#fdfaf5] rounded-3xl p-6 border border-[#e0d8c8] shadow-xs text-center">
                <div className="w-12 h-12 rounded-2xl bg-[#efe8dc] text-[#2d5a61] flex items-center justify-center mx-auto mb-4">
                  <HeartHandshake className="w-6 h-6" />
                </div>
                <h3 className="font-serif text-lg text-[#333333] mb-2 font-medium">Artisan Care Guarantee</h3>
                <p className="text-xs text-[#666666] leading-relaxed">
                  Lifetime complimentary re-stringing if an elastic strand ever snaps under normal wear.
                </p>
              </div>
            </div>

            {/* Step-by-Step Guide */}
            <div className="bg-[#fdfaf5] rounded-3xl p-6 md:p-8 border border-[#e0d8c8] shadow-xs">
              <h2 className="font-serif text-xl text-[#333333] mb-6 pb-3 border-b border-[#e0d8c8]">
                How to Request an Exchange or Repair
              </h2>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <span className="w-7 h-7 rounded-full bg-[#2d5a61] text-white text-xs font-bold flex items-center justify-center shrink-0">
                    1
                  </span>
                  <div>
                    <h4 className="font-semibold text-xs md:text-sm text-[#333333]">Send a message on WhatsApp</h4>
                    <p className="text-xs text-[#666666] mt-0.5">
                      Message <strong>+92 300 1234567</strong> with your Order Number (e.g. MS-8291) and a quick photo of the piece.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <span className="w-7 h-7 rounded-full bg-[#2d5a61] text-white text-xs font-bold flex items-center justify-center shrink-0">
                    2
                  </span>
                  <div>
                    <h4 className="font-semibold text-xs md:text-sm text-[#333333]">Studio Verification & Pickup</h4>
                    <p className="text-xs text-[#666666] mt-0.5">
                      Our team will review your request and arrange a courier reverse pickup or direct return address in Karachi.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <span className="w-7 h-7 rounded-full bg-[#2d5a61] text-white text-xs font-bold flex items-center justify-center shrink-0">
                    3
                  </span>
                  <div>
                    <h4 className="font-semibold text-xs md:text-sm text-[#333333]">Replacement or Adjustment Dispatched</h4>
                    <p className="text-xs text-[#666666] mt-0.5">
                      Within 48 hours of receiving the piece, Maryam personally adjusts or exchanges your item and ships it back.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Jewelry Care */}
        {activeTab === 'jewelry-care' && (
          <div className="space-y-8 animate-in fade-in duration-200">
            {/* 4 Golden Rules */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
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
                <h3 className="font-serif text-lg text-[#333333] mb-2 font-medium">The &ldquo;Roll-On&rdquo; Technique</h3>
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

            {/* Cleaning Rituals */}
            <div className="bg-[#fdfaf5] rounded-3xl p-6 md:p-8 border border-[#e0d8c8] shadow-xs">
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

                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                  <p>
                    <strong>For Sterling Silver & Silver Finish Pieces:</strong> Store in a sealed dry pouch away from excess humidity. If natural oxidation or slight tarnishing occurs, gently wipe with a silver polishing cloth to immediately restore its brilliant cool luster.
                  </p>
                </div>
              </div>
            </div>

            {/* Lifetime Restringing Commitment */}
            <div className="bg-[#2d5a61]/10 rounded-3xl p-6 md:p-8 border border-[#2d5a61]/20 text-center">
              <Heart className="w-8 h-8 text-[#2d5a61] mx-auto mb-3" />
              <h3 className="font-serif text-xl text-[#333333] mb-2">Our Lifetime Restringing Promise</h3>
              <p className="text-xs md:text-sm text-[#555555] max-w-lg mx-auto mb-4">
                Even with high-tensile elastic cords, years of daily enjoyment can happen. If a strand ever needs re-stringing, send it back to our Karachi studio for free lifetime restringing.
              </p>
              <a
                href="https://wa.me/923001234567"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-[#2d5a61] text-white px-6 py-2.5 rounded-full text-xs font-semibold hover:bg-[#1e3c41] transition-colors shadow-xs"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Contact Studio on WhatsApp</span>
              </a>
            </div>
          </div>
        )}

        {/* Bottom Direct Support Bar */}
        <div className="mt-12 pt-8 border-t border-[#e0d8c8] flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div>
            <h4 className="font-serif text-base text-[#333333]">Still have questions?</h4>
            <p className="text-xs text-[#666666]">Our Karachi studio artisans are happy to help with custom sizes or questions.</p>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="https://wa.me/923001234567"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#2d5a61] hover:bg-[#1e3c41] text-white px-5 py-2.5 rounded-full text-xs font-medium transition-colors flex items-center gap-2 shadow-xs"
            >
              <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span>WhatsApp Us</span>
            </a>
            <Link
              to="/contact"
              className="bg-[#fdfaf5] hover:bg-white text-[#333333] border border-[#e0d8c8] px-5 py-2.5 rounded-full text-xs font-medium transition-colors"
            >
              Contact Form
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
