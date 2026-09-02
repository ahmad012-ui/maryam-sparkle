import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, Sparkles, Search, MessageSquare, ArrowRight } from 'lucide-react';
import { FAQS } from '../data/products';

export const FAQPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [openFaqIds, setOpenFaqIds] = useState<string[]>(['faq-1', 'faq-3']);

  const categories = ['all', 'Orders & Customization', 'Shipping & Delivery', 'Jewelry Care', 'Payments & Returns'];

  const filteredFaqs = FAQS.filter((faq) => {
    const matchesCat = selectedCategory === 'all' || faq.category === selectedCategory;
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
      <div className="max-w-4xl mx-auto px-6 md:px-10">
        {/* Header */}
        <div className="text-center mb-12">
          <span className="text-xs font-semibold uppercase tracking-widest text-[#2d5a61] block mb-2">
            Artisan Help Center
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl text-[#333333] mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-sm md:text-base text-[#666666] max-w-lg mx-auto">
            Everything you need to know about our handmade gemstone jewelry, custom bespoke pieces, and nationwide delivery.
          </p>

          {/* Search Box */}
          <div className="mt-8 max-w-md mx-auto relative">
            <Search className="w-4 h-4 text-[#888888] absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search sizing, delivery times, materials..."
              className="w-full bg-[#fdfaf5] border border-[#e0d8c8] rounded-full pl-11 pr-4 py-3 text-xs md:text-sm text-[#333333] focus:outline-none focus:border-[#2d5a61] shadow-xs"
            />
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full text-xs font-medium transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-[#2d5a61] text-white shadow-xs'
                  : 'bg-[#fdfaf5] text-[#555555] border border-[#e0d8c8] hover:bg-[#efe8dc]'
              }`}
            >
              {cat === 'all' ? 'All Topics' : cat}
            </button>
          ))}
        </div>

        {/* FAQ Accordion List */}
        <div className="space-y-4 mb-16">
          {filteredFaqs.map((faq) => {
            const isOpen = openFaqIds.includes(faq.id);
            return (
              <div
                key={faq.id}
                className="bg-[#fdfaf5] rounded-2xl border border-[#e0d8c8] overflow-hidden transition-all shadow-2xs"
              >
                <button
                  onClick={() => toggleFaq(faq.id)}
                  className="w-full px-6 py-4.5 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-[#efe8dc]/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Sparkles className="w-4 h-4 text-[#D4B982] shrink-0" />
                    <span className="font-serif text-base text-[#333333] font-medium">
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
                  <div className="px-6 pb-5 pt-1 text-xs md:text-sm text-[#555555] leading-relaxed border-t border-[#e0d8c8]/50 bg-white/40">
                    <p>{faq.answer}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Still Have Questions Box */}
        <div className="bg-[#fdfaf5] rounded-3xl p-8 border border-[#e0d8c8] shadow-xs text-center">
          <MessageSquare className="w-8 h-8 text-[#2d5a61] mx-auto mb-3" />
          <h3 className="font-serif text-xl text-[#333333] mb-2">Still have questions?</h3>
          <p className="text-xs md:text-sm text-[#666666] mb-6 max-w-md mx-auto">
            Maryam and our studio team are available 7 days a week to help with sizing, bespoke gifts, or order inquiries.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/contact"
              className="bg-[#2d5a61] text-white px-6 py-2.5 rounded-full text-xs font-semibold hover:bg-[#1e3c41] transition-colors"
            >
              Contact Studio
            </Link>
            <a
              href="https://wa.me/923001234567"
              target="_blank"
              rel="noopener noreferrer"
              className="border border-[#2d5a61]/40 text-[#2d5a61] px-6 py-2.5 rounded-full text-xs font-semibold hover:bg-[#2d5a61]/10 transition-colors"
            >
              WhatsApp Us (+92 300 1234567)
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
