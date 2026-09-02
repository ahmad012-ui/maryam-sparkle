import React from 'react';
import { Link } from 'react-router-dom';
import { RotateCcw, ShieldCheck, HeartHandshake, CheckCircle2, MessageSquare, ArrowRight } from 'lucide-react';

export const ReturnsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#efe8dc] py-12 md:py-20">
      <div className="max-w-4xl mx-auto px-6 md:px-10">
        {/* Header */}
        <div className="text-center mb-12">
          <span className="text-xs font-semibold uppercase tracking-widest text-[#2d5a61] block mb-2">
            Studio Guarantee
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl text-[#333333] mb-4">
            7-Day Exchange & Repair Policy
          </h1>
          <p className="text-sm md:text-base text-[#666666] max-w-lg mx-auto">
            We want you to fall completely in love with your handcrafted pieces. If the fit isn't right or a charm needs adjusting, we are here for you.
          </p>
        </div>

        {/* Core Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
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

        {/* Step-by-Step Exchange Guide */}
        <div className="bg-[#fdfaf5] rounded-3xl p-6 md:p-8 border border-[#e0d8c8] shadow-xs mb-10">
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

        {/* Contact CTA */}
        <div className="text-center">
          <a
            href="https://wa.me/923001234567"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-[#2d5a61] text-white px-8 py-3.5 rounded-full text-xs md:text-sm font-semibold hover:bg-[#1e3c41] transition-all shadow-sm"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Chat with Maryam on WhatsApp (+92 300 1234567)</span>
          </a>
        </div>
      </div>
    </div>
  );
};
