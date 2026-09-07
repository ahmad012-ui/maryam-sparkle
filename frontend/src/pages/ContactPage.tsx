import React, { useState } from 'react';
import { 
  Phone, 
  Mail, 
  Instagram, 
  Clock, 
  Send, 
  CheckCircle2, 
  PackageCheck, 
  Sparkles, 
  MessageCircle,
  HelpCircle,
  ChevronDown
} from 'lucide-react';
import { FAQS } from '../data/products';
import { Link } from 'react-router-dom';
import { sanitizePhoneNumber, isValidPhoneNumber } from '../utils/validation';
import { SEO } from '../components/SEO';

interface ContactPageProps {
  onOpenCustomOrder: () => void;
}

export const ContactPage: React.FC<ContactPageProps> = ({ onOpenCustomOrder }) => {
  // Contact Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'General Inquiry',
    message: ''
  });
  const [phoneError, setPhoneError] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Tracking Tool State
  const [trackingId, setTrackingId] = useState('');
  const [trackingResult, setTrackingResult] = useState<{
    id: string;
    status: string;
    step: number;
    destination: string;
    carrier: string;
    estimatedDelivery: string;
    items: string;
  } | null>(null);

  // FAQ Accordion State
  const [openFaq, setOpenFaq] = useState<string | null>(FAQS[0].id);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPhoneError('');
    if (formData.phone.trim() && !isValidPhoneNumber(formData.phone)) {
      setPhoneError('Please enter a valid phone number (e.g. 0300 1234567 or +92 300 1234567)');
      return;
    }
    if (formData.name && formData.email && formData.message) {
      setIsSubmitted(true);
      setTimeout(() => {
        setFormData({
          name: '',
          email: '',
          phone: '',
          subject: 'General Inquiry',
          message: ''
        });
      }, 4000);
    }
  };

  const handleTrackOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingId.trim()) return;

    // Simulate tracking lookup
    setTrackingResult({
      id: trackingId.toUpperCase(),
      status: 'In Transit with TCS Express',
      step: 3,
      destination: 'Lahore / Karachi, Pakistan',
      carrier: 'TCS Courier & Logistics',
      estimatedDelivery: 'Tomorrow by 4:00 PM',
      items: '2x Handcrafted Gemstone Bracelets (Ruby Star & Green Charm)'
    });
  };

  return (
    <div className="bg-[#efe8dc] min-h-screen py-10 md:py-16">
      <SEO
        title="Contact Us & Studio Assistance"
        description="Get in touch with Maryam Sparkle jewelry studio. Reach out via WhatsApp, phone, or email for order queries and custom requests in Pakistan."
        canonical="/contact"
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Page Header */}
        <div className="text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#2d5a61]/10 border border-[#2d5a61]/20 text-[#2d5a61] text-xs font-semibold tracking-widest uppercase mb-3">
            <MessageCircle className="w-3.5 h-3.5" />
            <span>We&apos;d Love to Hear from You</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl text-[#2d5a61] mb-3">
            Get in Touch
          </h1>
          <p className="text-sm sm:text-base text-[#666666] font-light leading-relaxed">
            Have a question about a gemstone, order status, or dreaming of a bespoke piece? Maryam and the atelier team are always here to assist.
          </p>
        </div>

        {/* 2-Column Main Contact Block */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Left: Contact Info Cards & WhatsApp */}
          <div className="lg:col-span-5 space-y-6">
            {/* Quick WhatsApp Action Card */}
            <div className="bg-emerald-900/90 text-white rounded-2xl p-6 sm:p-7 shadow-lg border border-emerald-700/50 relative overflow-hidden">
              <div className="relative z-10 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs uppercase tracking-wider font-semibold text-emerald-200">
                    Live Chat on WhatsApp
                  </span>
                </div>
                <h3 className="font-serif text-2xl text-white">Instant Artisan Support</h3>
                <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed font-light">
                  Chat directly with Maryam for instant sizing advice, gemstone recommendations, or custom photo previews before dispatch.
                </p>
                <a
                  href="https://wa.me/923001234567?text=Hi%20Maryam!%20I%20have%20an%20inquiry%20about%20Maryam%20Sparkle%20jewelry"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-white text-emerald-950 px-5 py-2.5 rounded-full text-xs sm:text-sm font-semibold hover:bg-emerald-50 transition-colors shadow-xs"
                >
                  <MessageCircle className="w-4 h-4 text-emerald-700" />
                  <span>Chat on WhatsApp (+92 300 1234567)</span>
                </a>
              </div>
            </div>

            {/* Atelier Details Card */}
            <div className="bg-white/80 border border-[#e0d8c8] rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xs">
              <h3 className="font-serif text-xl text-[#2d5a61] pb-3 border-b border-[#e0d8c8]">
                Studio & Contact Details
              </h3>

              <ul className="space-y-4 text-sm text-[#555555]">
                <li className="flex items-start gap-3">
                  <Phone className="w-4 h-4 text-[#2d5a61] shrink-0 mt-0.5" />
                  <div>
                    <span className="block text-xs font-semibold text-[#333333] uppercase">Call or SMS</span>
                    <a href="tel:+923001234567" className="hover:text-[#2d5a61] transition-colors">
                      +92 300 1234567
                    </a>
                  </div>
                </li>

                <li className="flex items-start gap-3">
                  <Mail className="w-4 h-4 text-[#2d5a61] shrink-0 mt-0.5" />
                  <div>
                    <span className="block text-xs font-semibold text-[#333333] uppercase">Direct Email</span>
                    <a href="mailto:maryamsparkle@gmail.com" className="hover:text-[#2d5a61] transition-colors">
                      maryamsparkle@gmail.com
                    </a>
                  </div>
                </li>

                <li className="flex items-start gap-3">
                  <Instagram className="w-4 h-4 text-[#2d5a61] shrink-0 mt-0.5" />
                  <div>
                    <span className="block text-xs font-semibold text-[#333333] uppercase">Instagram DMs</span>
                    <a
                      href="https://instagram.com/maryamsparkle456"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-[#2d5a61] transition-colors"
                    >
                      @maryamsparkle456
                    </a>
                  </div>
                </li>

                <li className="flex items-start gap-3">
                  <Clock className="w-4 h-4 text-[#2d5a61] shrink-0 mt-0.5" />
                  <div>
                    <span className="block text-xs font-semibold text-[#333333] uppercase">Operating Hours</span>
                    <p className="text-xs text-[#666666]">
                      Monday – Saturday: 10:00 AM – 8:00 PM (PKT)<br />
                      Sunday: Studio Closed (Family & Craft Day)
                    </p>
                  </div>
                </li>
              </ul>

              {/* Bespoke consultation highlight */}
              <div className="pt-4 border-t border-[#e0d8c8] text-center">
                <button
                  onClick={onOpenCustomOrder}
                  className="w-full bg-[#2d5a61]/10 hover:bg-[#2d5a61]/20 text-[#2d5a61] border border-[#2d5a61]/30 py-2.5 rounded-full text-xs font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#D4B982]" />
                  <span>Book Bespoke Jewelry Consultation</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right: Interactive Contact & Inquiry Form */}
          <div className="lg:col-span-7 bg-white/90 border border-[#e0d8c8] rounded-2xl p-6 sm:p-10 shadow-sm">
            <h3 className="font-serif text-2xl text-[#2d5a61] mb-2">Send Us a Message</h3>
            <p className="text-xs sm:text-sm text-[#666666] mb-6 font-light">
              Fill out the form below and Maryam will personally reply within 24 hours.
            </p>

            {isSubmitted ? (
              <div className="bg-[#efe8dc] border border-[#2d5a61]/40 rounded-2xl p-8 text-center space-y-3">
                <CheckCircle2 className="w-10 h-10 text-[#2d5a61] mx-auto" />
                <h4 className="font-serif text-xl text-[#2d5a61]">Message Received with Gratitude!</h4>
                <p className="text-sm text-[#555555] max-w-md mx-auto">
                  Thank you for reaching out. We have sent a confirmation email and will respond to your inquiry shortly.
                </p>
                <button
                  onClick={() => setIsSubmitted(false)}
                  className="mt-4 px-6 py-2 bg-[#2d5a61] text-white text-xs font-semibold rounded-full hover:bg-[#1e3c41] transition-colors"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#444444] uppercase mb-1.5">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Ayesha Khan"
                      className="w-full bg-[#efe8dc]/40 border border-[#e0d8c8] rounded-xl px-4 py-2.5 text-sm text-[#333333] focus:outline-none focus:ring-1 focus:ring-[#2d5a61] focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#444444] uppercase mb-1.5">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="e.g. ayesha@example.com"
                      className="w-full bg-[#efe8dc]/40 border border-[#e0d8c8] rounded-xl px-4 py-2.5 text-sm text-[#333333] focus:outline-none focus:ring-1 focus:ring-[#2d5a61] focus:bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#444444] uppercase mb-1.5">
                      Phone / WhatsApp Number
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => {
                        setPhoneError('');
                        setFormData({ ...formData, phone: sanitizePhoneNumber(e.target.value) });
                      }}
                      placeholder="e.g. +92 300 0000000"
                      className={`w-full bg-[#efe8dc]/40 border rounded-xl px-4 py-2.5 text-sm text-[#333333] focus:outline-none focus:ring-1 focus:ring-[#2d5a61] focus:bg-white ${
                        phoneError ? 'border-red-500' : 'border-[#e0d8c8]'
                      }`}
                    />
                    {phoneError && <p className="text-[11px] text-red-500 mt-1">{phoneError}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#444444] uppercase mb-1.5">
                      Subject / Topic
                    </label>
                    <select
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full bg-[#efe8dc]/40 border border-[#e0d8c8] rounded-xl px-4 py-2.5 text-sm text-[#333333] focus:outline-none focus:ring-1 focus:ring-[#2d5a61] focus:bg-white cursor-pointer"
                    >
                      <option value="General Inquiry">General Jewelry Inquiry</option>
                      <option value="Custom Bespoke Order">Custom Bespoke Design</option>
                      <option value="Order Status & Delivery">Order Status & Delivery</option>
                      <option value="Bridal & Event Favors">Bridal & Bulk Gift Sets</option>
                      <option value="Jewelry Repair / Resizing">Jewelry Repair or Resizing</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#444444] uppercase mb-1.5">
                    Your Message *
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Tell us what you have in mind (wrist size, preferred stones, occasion, deadline)..."
                    className="w-full bg-[#efe8dc]/40 border border-[#e0d8c8] rounded-xl p-4 text-sm text-[#333333] focus:outline-none focus:ring-1 focus:ring-[#2d5a61] focus:bg-white"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#2d5a61] hover:bg-[#1e3c41] text-white py-3.5 rounded-full text-sm font-semibold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>Send Message to Atelier</span>
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Live Order Tracking Lookup Widget */}
        <div className="bg-white/70 border border-[#e0d8c8] rounded-3xl p-6 sm:p-10 shadow-xs max-w-4xl mx-auto">
          <div className="text-center max-w-xl mx-auto mb-6">
            <div className="w-10 h-10 rounded-full bg-[#2d5a61]/10 text-[#2d5a61] flex items-center justify-center mx-auto mb-2">
              <PackageCheck className="w-5 h-5" />
            </div>
            <h3 className="font-serif text-2xl text-[#2d5a61]">Track Your Parcel</h3>
            <p className="text-xs sm:text-sm text-[#666666]">
              Enter your Maryam Sparkle Order ID (e.g., <span className="font-mono text-[#2d5a61]">MS-8291</span> or <span className="font-mono text-[#2d5a61]">MS-9402</span>) or view the full{' '}
              <Link to="/track" className="text-[#2d5a61] font-semibold underline hover:text-[#1e3c41]">
                Live Tracking Hub →
              </Link>
            </p>
          </div>

          <form onSubmit={handleTrackOrder} className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto mb-6">
            <input
              type="text"
              value={trackingId}
              onChange={(e) => setTrackingId(e.target.value)}
              placeholder="Enter Order ID (e.g. MS-8291)"
              className="flex-1 bg-[#efe8dc]/60 border border-[#e0d8c8] rounded-full px-4 py-2.5 text-sm text-[#333333] focus:outline-none focus:ring-1 focus:ring-[#2d5a61]"
            />
            <button
              type="submit"
              className="bg-[#2d5a61] text-white px-6 py-2.5 rounded-full text-xs sm:text-sm font-medium hover:bg-[#1e3c41] transition-colors cursor-pointer"
            >
              Track Order
            </button>
          </form>

          {trackingResult && (
            <div className="bg-[#efe8dc]/60 rounded-2xl p-6 border border-[#2d5a61]/20 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#e0d8c8] pb-3">
                <div>
                  <span className="text-xs text-[#888888]">Order ID</span>
                  <div className="font-serif font-bold text-lg text-[#2d5a61]">{trackingResult.id}</div>
                </div>
                <div className="sm:text-right">
                  <span className="text-xs text-[#888888]">Estimated Delivery</span>
                  <div className="text-sm font-semibold text-emerald-800">{trackingResult.estimatedDelivery}</div>
                </div>
              </div>

              {/* Progress Steps */}
              <div className="grid grid-cols-4 gap-2 text-center pt-2">
                <div className="space-y-1">
                  <div className="w-7 h-7 mx-auto rounded-full bg-[#2d5a61] text-white text-xs flex items-center justify-center font-bold">
                    ✓
                  </div>
                  <span className="text-[11px] font-medium text-[#333333] block">Order Placed</span>
                </div>
                <div className="space-y-1">
                  <div className="w-7 h-7 mx-auto rounded-full bg-[#2d5a61] text-white text-xs flex items-center justify-center font-bold">
                    ✓
                  </div>
                  <span className="text-[11px] font-medium text-[#333333] block">Handcrafted</span>
                </div>
                <div className="space-y-1">
                  <div className="w-7 h-7 mx-auto rounded-full bg-[#2d5a61] text-white text-xs flex items-center justify-center font-bold ring-4 ring-[#2d5a61]/20">
                    3
                  </div>
                  <span className="text-[11px] font-semibold text-[#2d5a61] block">In Transit</span>
                </div>
                <div className="space-y-1 opacity-50">
                  <div className="w-7 h-7 mx-auto rounded-full bg-gray-300 text-gray-600 text-xs flex items-center justify-center">
                    4
                  </div>
                  <span className="text-[11px] text-[#666666] block">Delivered</span>
                </div>
              </div>

              <div className="text-xs text-[#666666] pt-2 border-t border-[#e0d8c8] flex flex-col sm:flex-row justify-between gap-1">
                <span><strong>Carrier:</strong> {trackingResult.carrier}</span>
                <span><strong>Items:</strong> {trackingResult.items}</span>
              </div>
            </div>
          )}
        </div>

        {/* Interactive FAQ Accordion */}
        <div className="max-w-3xl mx-auto space-y-4">
          <div className="text-center mb-8">
            <HelpCircle className="w-8 h-8 text-[#2d5a61] mx-auto mb-2" />
            <h3 className="font-serif text-2xl text-[#2d5a61]">Frequently Asked Questions</h3>
            <p className="text-xs sm:text-sm text-[#666666]">Quick answers about orders, payments, and jewelry care.</p>
          </div>

          <div className="space-y-3">
            {FAQS.map((faq) => {
              const isOpen = openFaq === faq.id;
              return (
                <div
                  key={faq.id}
                  className="bg-white/80 border border-[#e0d8c8] rounded-2xl overflow-hidden transition-all"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : faq.id)}
                    className="w-full text-left p-5 flex items-center justify-between gap-4 font-serif text-base sm:text-lg text-[#333333] hover:text-[#2d5a61] transition-colors cursor-pointer"
                  >
                    <span>{faq.question}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-[#2d5a61] transition-transform duration-300 ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-[#666666] leading-relaxed border-t border-[#e0d8c8]/50">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
