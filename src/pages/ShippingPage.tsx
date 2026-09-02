import React from 'react';
import { Link } from 'react-router-dom';
import { Truck, Clock, ShieldCheck, Globe, Package, ArrowRight, CheckCircle2 } from 'lucide-react';

export const ShippingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#efe8dc] py-12 md:py-20">
      <div className="max-w-4xl mx-auto px-6 md:px-10">
        {/* Header */}
        <div className="text-center mb-12">
          <span className="text-xs font-semibold uppercase tracking-widest text-[#2d5a61] block mb-2">
            Delivery & Dispatches
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl text-[#333333] mb-4">
            Shipping & Delivery Policy
          </h1>
          <p className="text-sm md:text-base text-[#666666] max-w-lg mx-auto">
            Every piece is safely packed in our signature velvet pouch and embossed box, dispatched nationwide with live courier tracking.
          </p>
        </div>

        {/* Rates Table Card */}
        <div className="bg-[#fdfaf5] rounded-3xl p-6 md:p-8 border border-[#e0d8c8] shadow-xs mb-8">
          <h2 className="font-serif text-xl text-[#333333] mb-6 pb-3 border-b border-[#e0d8c8] flex items-center gap-2">
            <Truck className="w-5 h-5 text-[#2d5a61]" />
            Domestic Delivery Options (Pakistan)
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
                  <span>Dispatched via TCS / Leopards Courier</span>
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
                  <span>Immediate artisan priority queue</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                  <span>SMS updates on out-for-delivery rider</span>
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
        <div className="bg-[#fdfaf5] rounded-3xl p-6 md:p-8 border border-[#e0d8c8] shadow-xs mb-8">
          <h2 className="font-serif text-xl text-[#333333] mb-4 pb-3 border-b border-[#e0d8c8] flex items-center gap-2">
            <Globe className="w-5 h-5 text-[#2d5a61]" />
            International Worldwide Shipping
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

        {/* Packaging Assurance Card */}
        <div className="bg-[#fdfaf5] rounded-3xl p-6 md:p-8 border border-[#e0d8c8] shadow-xs mb-10">
          <h2 className="font-serif text-xl text-[#333333] mb-4 pb-3 border-b border-[#e0d8c8] flex items-center gap-2">
            <Package className="w-5 h-5 text-[#2d5a61]" />
            Artisan Gift Box Packaging
          </h2>
          <p className="text-xs md:text-sm text-[#555555] leading-relaxed">
            Every single Maryam Sparkle order is wrapped as a gift! Pieces are carefully nestled inside an anti-tarnish microfiber keepsake pouch, cushioned inside our rigid gold-foil stamped box, and bubble-wrapped for safe transit.
          </p>
        </div>

        <div className="text-center">
          <Link
            to="/track"
            className="inline-flex items-center gap-2 bg-[#2d5a61] text-white px-8 py-3.5 rounded-full text-xs md:text-sm font-semibold hover:bg-[#1e3c41] transition-all shadow-sm"
          >
            <span>Track an Existing Shipment</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};
