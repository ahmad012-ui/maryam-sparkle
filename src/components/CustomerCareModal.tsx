import React, { useState } from 'react';
import { X, ChevronDown, ChevronRight, Truck, RotateCcw, Search, Phone, Mail, HelpCircle, Sparkles } from 'lucide-react';
import { FAQS } from '../data/products';

interface CustomerCareModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: string;
}

export const CustomerCareModal: React.FC<CustomerCareModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'faqs',
}) => {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [openFaq, setOpenFaq] = useState<string | null>(FAQS[0].id);
  const [trackingNumber, setTrackingNumber] = useState('');
  const [trackingResult, setTrackingResult] = useState<any>(null);

  if (!isOpen) return null;

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    if (trackingNumber.trim()) {
      setTrackingResult({
        number: trackingNumber,
        status: 'In Atelier Crafting & Quality Inspection',
        courier: 'Trax / TCS Express Logistics',
        estimatedDelivery: 'In 2-3 Business Days',
        location: 'Lahore Fulfillment Atelier',
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative bg-[#fdfaf5] rounded-[32px] max-w-3xl w-full overflow-hidden shadow-2xl border border-[#e0d8c8] my-8 animate-in fade-in duration-200">
        {/* Header */}
        <div className="p-6 sm:p-8 bg-[#efe8dc] border-b border-[#e0d8c8] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#2d5a61] text-white">
              <HelpCircle className="w-5 h-5 text-[#D4B982]" />
            </div>
            <div>
              <h3 className="font-serif text-2xl text-[#333333]">Customer Care & Support</h3>
              <p className="text-xs text-[#666666]">
                Answers, shipping details, live parcel tracking, and atelier direct contact.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/80 text-[#666666] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-[#e0d8c8] bg-[#f4ebd8]/50 overflow-x-auto no-scrollbar text-xs font-semibold">
          {[
            { id: 'faqs', label: 'FAQs & Sizing', icon: HelpCircle },
            { id: 'shipping', label: 'Shipping & Delivery', icon: Truck },
            { id: 'returns', label: 'Returns & Care', icon: RotateCcw },
            { id: 'track', label: 'Track Order', icon: Search },
            { id: 'contact', label: 'Contact Atelier', icon: Phone },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-3.5 px-4 flex items-center gap-1.5 shrink-0 transition-all border-b-2 cursor-pointer ${
                  isActive
                    ? 'border-[#2d5a61] text-[#2d5a61] bg-[#fdfaf5] font-bold'
                    : 'border-transparent text-[#666666] hover:text-[#2d5a61]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Contents */}
        <div className="p-6 sm:p-8 max-h-[60vh] overflow-y-auto text-xs sm:text-sm text-[#444444]">
          {activeTab === 'faqs' && (
            <div className="space-y-3">
              {FAQS.map((faq) => {
                const isOpen = openFaq === faq.id;
                return (
                  <div
                    key={faq.id}
                    className="border border-[#e0d8c8] rounded-2xl overflow-hidden bg-[#efe8dc]/40"
                  >
                    <button
                      onClick={() => setOpenFaq(isOpen ? null : faq.id)}
                      className="w-full text-left p-4 font-semibold text-[#333333] flex justify-between items-center hover:text-[#2d5a61] transition-colors"
                    >
                      <span className="font-serif text-sm">{faq.question}</span>
                      <ChevronDown
                        className={`w-4 h-4 text-[#888888] transition-transform duration-200 ${
                          isOpen ? 'rotate-180 text-[#2d5a61]' : ''
                        }`}
                      />
                    </button>
                    {isOpen && (
                      <div className="px-4 pb-4 text-xs sm:text-sm text-[#666666] leading-relaxed border-t border-[#e0d8c8]/50 pt-2 bg-white/40">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === 'shipping' && (
            <div className="space-y-4 leading-relaxed">
              <h4 className="font-serif text-lg text-[#333333]">Shipping Policy & Timelines</h4>
              <p>
                We carefully package each piece in our signature anti-tarnish jewelry pouches, wrapped in protective tissue paper and sealed in secure hard gift boxes.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                <div className="bg-[#efe8dc]/50 p-4 rounded-2xl border border-[#e0d8c8]">
                  <h5 className="font-bold text-sm text-[#2d5a61] mb-1">🇵🇰 Domestic (Pakistan)</h5>
                  <ul className="text-xs space-y-1 text-[#666666]">
                    <li>• Standard Rate: Rs. 200</li>
                    <li>• <strong>FREE Delivery on orders over Rs. 3,000</strong></li>
                    <li>• Delivery Time: 2–4 business days</li>
                    <li>• Cash on Delivery (COD) supported</li>
                  </ul>
                </div>

                <div className="bg-[#efe8dc]/50 p-4 rounded-2xl border border-[#e0d8c8]">
                  <h5 className="font-bold text-sm text-[#2d5a61] mb-1">🌍 Worldwide Shipping</h5>
                  <ul className="text-xs space-y-1 text-[#666666]">
                    <li>• Tracked DHL / FedEx Express</li>
                    <li>• Delivery Time: 7–12 business days</li>
                    <li>• Customs & duty paid support</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'returns' && (
            <div className="space-y-4 leading-relaxed">
              <h4 className="font-serif text-lg text-[#333333]">Returns, Exchanges & Free Resizing</h4>
              <p>
                Your happiness is our greatest craft. If your bracelet or ring doesn&apos;t fit perfectly, send it back within 7 days and we will gladly resize or exchange it for you free of charge!
              </p>
              <div className="bg-[#efe8dc]/60 p-4 rounded-2xl border border-[#e0d8c8] text-xs space-y-2">
                <h5 className="font-bold text-[#333333]">Jewelry Care Instructions:</h5>
                <p>1. Avoid exposing elastic gemstone pieces to harsh chlorine, perfumes, or acetone.</p>
                <p>2. Gently polish gold-plated and sterling silver accents with a soft microfiber polishing cloth.</p>
                <p>3. Store in the complimentary velvet Maryam Sparkle pouch when not in use.</p>
              </div>
            </div>
          )}

          {activeTab === 'track' && (
            <div className="space-y-5">
              <div>
                <h4 className="font-serif text-lg text-[#333333] mb-1">Track Your Parcel</h4>
                <p className="text-xs text-[#666666]">
                  Enter your Maryam Sparkle order code (e.g. MS-8291, MS-9402) or phone number.
                </p>
              </div>

              <form onSubmit={handleTrack} className="flex gap-2">
                <input
                  type="text"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder="Enter MS-XXXX or 0300XXXXXXX"
                  className="flex-1 bg-white border border-[#e0d8c8] rounded-full px-4 py-2.5 text-xs text-[#333333] focus:outline-none focus:ring-1 focus:ring-[#2d5a61]"
                />
                <button
                  type="submit"
                  className="bg-[#2d5a61] text-white px-6 py-2.5 rounded-full text-xs font-semibold hover:bg-[#1e3c41] transition-colors"
                >
                  Track
                </button>
              </form>

              <div className="pt-2 text-center">
                <a
                  href={`/track${trackingNumber ? `?id=${encodeURIComponent(trackingNumber)}` : ''}`}
                  onClick={onClose}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#2d5a61] hover:underline"
                >
                  <span>Open Full Order Tracking Hub</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </a>
              </div>

              {trackingResult && (
                <div className="bg-[#efe8dc] p-5 rounded-2xl border border-[#e0d8c8] space-y-2 text-xs">
                  <div className="flex justify-between items-center pb-2 border-b border-[#e0d8c8]">
                    <span className="font-bold text-sm text-[#2d5a61]">{trackingResult.number}</span>
                    <span className="bg-green-100 text-green-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                      Active
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#888888]">Current Status:</span>
                    <span className="font-semibold text-[#333333]">{trackingResult.status}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#888888]">Carrier:</span>
                    <span>{trackingResult.courier}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#888888]">Expected Delivery:</span>
                    <span className="text-[#2d5a61] font-bold">{trackingResult.estimatedDelivery}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'contact' && (
            <div className="space-y-4">
              <h4 className="font-serif text-lg text-[#333333]">We would love to hear from you!</h4>
              <p className="text-xs text-[#666666]">
                Have a question about bridal favors, bulk orders, or custom stones? Contact us directly:
              </p>

              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-3 p-3 bg-white rounded-2xl border border-[#e0d8c8]">
                  <Phone className="w-5 h-5 text-[#2d5a61]" />
                  <div>
                    <h5 className="font-semibold text-xs text-[#333333]">WhatsApp & Calls</h5>
                    <p className="text-xs text-[#666666]">+92 300 1234567 (10:00 AM – 8:00 PM PKT)</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-white rounded-2xl border border-[#e0d8c8]">
                  <Mail className="w-5 h-5 text-[#2d5a61]" />
                  <div>
                    <h5 className="font-semibold text-xs text-[#333333]">Email Support</h5>
                    <p className="text-xs text-[#666666]">maryamsparkle@gmail.com</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
