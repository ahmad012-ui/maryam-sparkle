import React, { useState } from 'react';
import { X, Sparkles, CheckCircle2, Heart, Send } from 'lucide-react';

interface CustomOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CustomOrderModal: React.FC<CustomOrderModalProps> = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    type: 'Bracelet',
    size: '6.5 inches (Medium)',
    finish: '18k Gold Plated',
    stones: ['Freshwater Pearls', 'Amethyst'],
    palette: 'Pastel Floral & Lilac',
    specialNotes: '',
  });

  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const stoneOptions = [
    'Freshwater Pearls',
    'Ruby Quartz',
    'Green Aventurine',
    'Natural Amethyst',
    'Deep Garnet',
    'Matte Black Onyx',
    'Raw Citrine',
    'Ocean Turquoise',
    'Rose Quartz',
  ];

  const handleStoneToggle = (stone: string) => {
    if (formData.stones.includes(stone)) {
      setFormData({ ...formData, stones: formData.stones.filter((s) => s !== stone) });
    } else {
      setFormData({ ...formData, stones: [...formData.stones, stone] });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative bg-[#fdfaf5] rounded-[32px] max-w-2xl w-full overflow-hidden shadow-2xl border border-[#e0d8c8] my-8 animate-in fade-in duration-200">
        {/* Header */}
        <div className="p-6 sm:p-8 bg-[#efe8dc] border-b border-[#e0d8c8] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#2d5a61] text-white">
              <Sparkles className="w-5 h-5 text-[#D4B982]" />
            </div>
            <div>
              <h3 className="font-serif text-2xl text-[#333333]">Custom Jewelry Request</h3>
              <p className="text-xs text-[#666666]">
                Design a bespoke piece handcrafted by Maryam with your exact gemstones & sizing.
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

        {/* Content */}
        {submitted ? (
          <div className="p-8 sm:p-12 text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-[#2d5a61] text-white rounded-full flex items-center justify-center mb-4 shadow-md">
              <CheckCircle2 className="w-8 h-8 text-[#D4B982]" />
            </div>
            <h3 className="font-serif text-2xl text-[#333333] mb-2">
              Custom Request Received!
            </h3>
            <p className="text-xs sm:text-sm text-[#666666] max-w-md mb-6 leading-relaxed">
              Maryam will review your selected stones ({formData.stones.join(', ')}) and contact you on WhatsApp (+92) within 12 hours with a design mockup & price estimate.
            </p>

            <button
              onClick={() => {
                setSubmitted(false);
                onClose();
              }}
              className="bg-[#2d5a61] text-white px-8 py-3 rounded-full font-medium text-sm hover:bg-[#1e3c41] transition-colors"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6 max-h-[75vh] overflow-y-auto text-xs">
            {/* Contact details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[#444444] font-semibold mb-1">Your Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Fatima Ali"
                  className="w-full bg-white border border-[#e0d8c8] rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#2d5a61]"
                />
              </div>

              <div>
                <label className="block text-[#444444] font-semibold mb-1">WhatsApp / Phone *</label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="0300 1234567"
                  className="w-full bg-white border border-[#e0d8c8] rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#2d5a61]"
                />
              </div>
            </div>

            {/* Jewelry Type */}
            <div>
              <label className="block text-[#444444] font-semibold mb-2">Jewelry Type</label>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {['Bracelet', 'Anklet', 'Necklace', 'Earrings', 'Rings Set'].map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setFormData({ ...formData, type: t })}
                    className={`py-2 px-2 text-center rounded-xl border font-medium transition-all ${
                      formData.type === t
                        ? 'border-[#2d5a61] bg-[#2d5a61] text-white shadow-xs'
                        : 'border-[#e0d8c8] bg-white text-[#555555] hover:border-[#2d5a61]'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Select Preferred Gemstones */}
            <div>
              <label className="block text-[#444444] font-semibold mb-1.5">
                Preferred Gemstones & Beads (Select 1 to 4)
              </label>
              <div className="flex flex-wrap gap-2">
                {stoneOptions.map((st) => {
                  const active = formData.stones.includes(st);
                  return (
                    <button
                      key={st}
                      type="button"
                      onClick={() => handleStoneToggle(st)}
                      className={`py-1.5 px-3 rounded-full border text-xs transition-all cursor-pointer ${
                        active
                          ? 'border-[#2d5a61] bg-[#efe8dc] text-[#2d5a61] font-semibold ring-1 ring-[#2d5a61]/30'
                          : 'border-[#e0d8c8] bg-white text-[#666666] hover:border-[#2d5a61]'
                      }`}
                    >
                      {active ? '✓ ' : '+ '}
                      {st}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Wrist Size & Metal Finish */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[#444444] font-semibold mb-1">Target Size</label>
                <select
                  value={formData.size}
                  onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                  className="w-full bg-white border border-[#e0d8c8] rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#2d5a61]"
                >
                  <option value="6.0 inches (Small)">Small (6.0 inches)</option>
                  <option value="6.5 inches (Medium)">Medium (6.5 inches - Standard)</option>
                  <option value="7.0 inches (Large)">Large (7.0 inches)</option>
                  <option value="Custom Size">Custom Measurement (note below)</option>
                </select>
              </div>

              <div>
                <label className="block text-[#444444] font-semibold mb-1">Hardware / Clasp Finish</label>
                <select
                  value={formData.finish}
                  onChange={(e) => setFormData({ ...formData, finish: e.target.value })}
                  className="w-full bg-white border border-[#e0d8c8] rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#2d5a61]"
                >
                  <option value="18k Gold Plated">18k Gold Plated (Warm Shimmer)</option>
                  <option value="Sterling Silver">Sterling Silver (Crisp Cool)</option>
                  <option value="Antique Brass">Antique Brass (Vintage Organic)</option>
                </select>
              </div>
            </div>

            {/* Special Instructions */}
            <div>
              <label className="block text-[#444444] font-semibold mb-1">
                Describe Your Vision or Special Charms (Initial, Star, Leaf, Evil Eye, etc.)
              </label>
              <textarea
                rows={3}
                value={formData.specialNotes}
                onChange={(e) => setFormData({ ...formData, specialNotes: e.target.value })}
                placeholder="e.g. I would love an initial charm 'M' with a star and a blend of sage aventurine and pearls for an anniversary gift..."
                className="w-full bg-white border border-[#e0d8c8] rounded-xl p-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#2d5a61]"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full bg-[#2d5a61] text-white py-3.5 rounded-full font-medium text-sm hover:bg-[#1e3c41] transition-colors shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>Submit Bespoke Request to Maryam</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
