import React, { useState } from 'react';
import { Sparkles, CheckCircle2, Heart, Send, MessageSquare, Info, ShieldCheck } from 'lucide-react';
import { HERO_IMAGES } from '../data/products';

export const CustomOrderPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    jewelryType: 'Bracelet Stack',
    wristSize: '6.5 inches (Medium)',
    metalFinish: '18K Gold Plated',
    budgetRange: 'Rs. 2,000 - Rs. 3,500',
    preferredStones: ['Ruby Quartz', 'Freshwater Pearls'],
    initialsOrWord: '',
    specialNotes: ''
  });

  const [submitted, setSubmitted] = useState(false);

  const gemstoneOptions = [
    'Ruby Quartz',
    'Green Aventurine',
    'Rose Quartz',
    'Amethyst',
    'Matte Black Onyx',
    'Freshwater Pearls',
    'Turquoise',
    'Golden Citrine',
    'Carnelian',
    'Mother of Pearl'
  ];

  const handleToggleStone = (stone: string) => {
    setFormData((prev) => {
      const exists = prev.preferredStones.includes(stone);
      if (exists) {
        return { ...prev, preferredStones: prev.preferredStones.filter((s) => s !== stone) };
      } else {
        return { ...prev, preferredStones: [...prev.preferredStones, stone] };
      }
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) return;
    setSubmitted(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const generateWhatsAppMessage = () => {
    const text = `Hello Maryam! I would like to order a bespoke custom piece:
- Name: ${formData.name}
- Type: ${formData.jewelryType}
- Size: ${formData.wristSize}
- Gemstones: ${formData.preferredStones.join(', ')}
- Metal: ${formData.metalFinish}
- Initials/Name: ${formData.initialsOrWord || 'None'}
- Budget: ${formData.budgetRange}
- Notes: ${formData.specialNotes || 'None'}`;

    return `https://wa.me/923001234567?text=${encodeURIComponent(text)}`;
  };

  return (
    <div className="min-h-screen bg-[#efe8dc] py-12 md:py-20">
      <div className="max-w-4xl mx-auto px-6 md:px-10">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 text-xs uppercase tracking-widest font-semibold text-[#2d5a61] mb-2 bg-[#fdfaf5] px-4 py-1.5 rounded-full border border-[#e0d8c8]">
            <Sparkles className="w-3.5 h-3.5 text-[#D4B982]" />
            <span>Bespoke Atelier Service</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-5xl text-[#333333] mb-4">
            Design Your Custom Jewelry
          </h1>
          <p className="text-sm md:text-base text-[#666666] max-w-xl mx-auto leading-relaxed">
            Have a dream gemstone palette, wedding favor idea, or personalized name charm in mind? Maryam handcrafts one-of-a-kind bespoke pieces tailored to your style.
          </p>
        </div>

        {submitted ? (
          <div className="bg-[#fdfaf5] rounded-3xl p-8 md:p-12 border border-[#e0d8c8] text-center shadow-sm animate-fade-in max-w-2xl mx-auto">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto mb-6 border border-emerald-200">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl text-[#333333] mb-3">
              Request Received, {formData.name}!
            </h2>
            <p className="text-xs md:text-sm text-[#666666] mb-8 leading-relaxed">
              Maryam will review your selected gemstones and reach out via WhatsApp / SMS within 12 hours with stone mockups and exact delivery timelines.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href={generateWhatsAppMessage()}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto bg-[#2d5a61] text-white px-8 py-3.5 rounded-full text-xs md:text-sm font-semibold hover:bg-[#1e3c41] transition-all flex items-center justify-center gap-2 shadow-sm"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Send via WhatsApp for Instant Priority</span>
              </a>

              <button
                onClick={() => setSubmitted(false)}
                className="w-full sm:w-auto text-[#2d5a61] border border-[#2d5a61]/40 px-6 py-3.5 rounded-full text-xs font-semibold hover:bg-[#2d5a61]/10 transition-colors"
              >
                Create Another Design
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            {/* Left Column: Form (8 cols) */}
            <div className="lg:col-span-8 bg-[#fdfaf5] rounded-3xl p-6 md:p-10 border border-[#e0d8c8] shadow-xs">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* 1. Jewelry Category */}
                <div>
                  <label className="block text-xs font-semibold text-[#333333] mb-2">
                    1. What piece are you creating?
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {['Bracelet Stack', 'Single Bracelet', 'Anklet', 'Choker Necklace', 'Ring Set', 'Bridal Favor Set'].map(
                      (type) => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => setFormData({ ...formData, jewelryType: type })}
                          className={`p-3 text-xs font-medium rounded-xl border transition-all text-center cursor-pointer ${
                            formData.jewelryType === type
                              ? 'border-[#2d5a61] bg-[#2d5a61] text-white shadow-xs'
                              : 'border-[#e0d8c8] bg-[#efe8dc]/40 text-[#444444] hover:border-[#2d5a61]/50'
                          }`}
                        >
                          {type}
                        </button>
                      )
                    )}
                  </div>
                </div>

                {/* 2. Gemstone Selection */}
                <div>
                  <label className="block text-xs font-semibold text-[#333333] mb-2">
                    2. Select your favorite Gemstones & Beads (Choose multiple):
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {gemstoneOptions.map((stone) => {
                      const isSelected = formData.preferredStones.includes(stone);
                      return (
                        <button
                          key={stone}
                          type="button"
                          onClick={() => handleToggleStone(stone)}
                          className={`px-3.5 py-2 text-xs font-medium rounded-full border transition-all cursor-pointer ${
                            isSelected
                              ? 'border-[#2d5a61] bg-[#2d5a61] text-white shadow-xs'
                              : 'border-[#e0d8c8] bg-[#efe8dc]/40 text-[#555555] hover:bg-[#efe8dc]'
                          }`}
                        >
                          {stone} {isSelected && '✓'}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 3. Wrist / Fit Sizing & Metal Finish */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#333333] mb-1.5">
                      3. Sizing / Measurements
                    </label>
                    <select
                      value={formData.wristSize}
                      onChange={(e) => setFormData({ ...formData, wristSize: e.target.value })}
                      className="w-full bg-[#efe8dc]/40 border border-[#e0d8c8] rounded-xl px-3.5 py-2.5 text-xs text-[#333333] focus:outline-none focus:border-[#2d5a61]"
                    >
                      <option>6.0 inches (Small / Petite)</option>
                      <option>6.5 inches (Medium / Standard)</option>
                      <option>7.0 inches (Large)</option>
                      <option>Custom / Specified in notes below</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#333333] mb-1.5">
                      4. Metal Charm Finish
                    </label>
                    <select
                      value={formData.metalFinish}
                      onChange={(e) => setFormData({ ...formData, metalFinish: e.target.value })}
                      className="w-full bg-[#efe8dc]/40 border border-[#e0d8c8] rounded-xl px-3.5 py-2.5 text-xs text-[#333333] focus:outline-none focus:border-[#2d5a61]"
                    >
                      <option>18K Gold Plated</option>
                      <option>Sterling Silver Hue</option>
                      <option>Antique Brass</option>
                      <option>No Metal / Pure Beads</option>
                    </select>
                  </div>
                </div>

                {/* 4. Initials & Name Charms */}
                <div>
                  <label className="block text-xs font-semibold text-[#333333] mb-1.5">
                    5. Personalized Letters, Name or Date (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.initialsOrWord}
                    onChange={(e) => setFormData({ ...formData, initialsOrWord: e.target.value })}
                    placeholder="e.g. Letter 'S' or 'AIMAN' or '04.03.26'"
                    className="w-full bg-[#efe8dc]/40 border border-[#e0d8c8] rounded-xl px-4 py-2.5 text-xs text-[#333333] focus:outline-none focus:border-[#2d5a61]"
                  />
                </div>

                {/* 5. Special Notes & Color theme */}
                <div>
                  <label className="block text-xs font-semibold text-[#333333] mb-1.5">
                    6. Vision, Outfit match, or Special Wishes
                  </label>
                  <textarea
                    rows={3}
                    value={formData.specialNotes}
                    onChange={(e) => setFormData({ ...formData, specialNotes: e.target.value })}
                    placeholder="e.g. Matching an emerald green silk Eid dress, or need 5 matching bridal party bracelets with rose quartz."
                    className="w-full bg-[#efe8dc]/40 border border-[#e0d8c8] rounded-xl px-4 py-2.5 text-xs text-[#333333] focus:outline-none focus:border-[#2d5a61]"
                  />
                </div>

                {/* 6. Contact Details */}
                <div className="pt-4 border-t border-[#e0d8c8] space-y-4">
                  <h3 className="font-serif text-base text-[#333333]">Your Contact Details</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#333333] mb-1">Your Name *</label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Sara Siddiqui"
                        className="w-full bg-[#efe8dc]/40 border border-[#e0d8c8] rounded-xl px-3.5 py-2 text-xs text-[#333333] focus:outline-none focus:border-[#2d5a61]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#333333] mb-1">WhatsApp / Phone *</label>
                      <input
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+92 300 1234567"
                        className="w-full bg-[#efe8dc]/40 border border-[#e0d8c8] rounded-xl px-3.5 py-2 text-xs text-[#333333] focus:outline-none focus:border-[#2d5a61]"
                      />
                    </div>
                  </div>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  className="w-full bg-[#2d5a61] text-white py-4 rounded-2xl font-medium text-sm flex items-center justify-center gap-2 hover:bg-[#1e3c41] transition-all duration-300 shadow-sm hover:shadow-md cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>Submit Custom Order Request</span>
                </button>
              </form>
            </div>

            {/* Right Column: Artisan Highlights (4 cols) */}
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-[#fdfaf5] rounded-3xl p-6 border border-[#e0d8c8] shadow-xs">
                <div className="aspect-square rounded-2xl overflow-hidden mb-4 bg-[#efe8dc]">
                  <img src={HERO_IMAGES.ourStory} alt="Maryam Sparkle Studio Handcrafting" className="w-full h-full object-cover" />
                </div>
                <h3 className="font-serif text-lg text-[#333333] mb-2 font-medium">Bespoke Studio Promise</h3>
                <p className="text-xs text-[#666666] leading-relaxed mb-4">
                  Every custom order is threaded and set personally by Maryam. We share photos of your stone layout before final stringing so you can tweak beads!
                </p>
                <div className="space-y-2 text-xs text-[#555555] border-t border-[#e0d8c8] pt-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#2d5a61]" />
                    <span>Crafted in 24–48 hours</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#2d5a61]" />
                    <span>Free gift boxing included</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#2d5a61]" />
                    <span>Nationwide COD delivery</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
