import React, { useState } from 'react';
import { Sparkles, X, Send, ShoppingBag, Heart, ArrowRight } from 'lucide-react';
import { Product } from '../types';

interface Message {
  id: string;
  sender: 'maryam' | 'user';
  text: string;
  recommendedProducts?: Product[];
}

interface AskMaryamWidgetProps {
  products: Product[];
  onAddToCart: (product: Product) => void;
  onQuickView: (product: Product) => void;
}

export const AskMaryamWidget: React.FC<AskMaryamWidgetProps> = ({
  products,
  onAddToCart,
  onQuickView,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'maryam',
      text: 'Salam & Welcome to Maryam Sparkle! 🕊️✨ I am your personal jewelry stylist. Tell me what you are looking for, your favorite color, or an upcoming event!',
      recommendedProducts: [products[0], products[1]],
    },
  ]);

  const quickPrompts = [
    '🎁 Best gift under Rs. 2,000',
    '🌿 Green & botanical pieces',
    '📏 How to measure my wrist size?',
    '🤍 Classic pearl designs',
  ];

  const handleSend = (textToSend?: string) => {
    const userText = textToSend || input;
    if (!userText.trim()) return;

    const newMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: userText,
    };

    setMessages((prev) => [...prev, newMsg]);
    setInput('');

    // Generate intelligent response based on keywords
    setTimeout(() => {
      let reply = "I'd love to help you style that! Here are some of our most beloved pieces that match your mood:";
      let recs: Product[] = [];

      const lower = userText.toLowerCase();

      if (lower.includes('gift') || lower.includes('under') || lower.includes('budget')) {
        reply = 'For thoughtful gifting, these handcrafted gemstone pieces come in our signature gold-embossed boxes ready to surprise someone special:';
        recs = products.filter((p) => p.price <= 1850).slice(0, 3);
      } else if (lower.includes('green') || lower.includes('aventurine') || lower.includes('botanical') || lower.includes('nature')) {
        reply = 'Green Aventurine and botanical hues bring so much fresh energy. Look at these favorites crafted with sage beads and leaf charms:';
        recs = products.filter((p) => p.name.toLowerCase().includes('green') || p.category === 'Bracelets').slice(0, 2);
      } else if (lower.includes('pearl') || lower.includes('classic') || lower.includes('white') || lower.includes('wedding')) {
        reply = 'Freshwater pearls are timeless and radiant. Here is our signature Pearl Drop piece handcrafted with 14k gold-filled details:';
        recs = products.filter((p) => p.name.toLowerCase().includes('pearl') || p.materials.some(m => m.toLowerCase().includes('pearl')));
      } else if (lower.includes('size') || lower.includes('measure') || lower.includes('fit')) {
        reply = 'To find your size: Wrap a flexible ribbon around your wrist bone. Add 0.5 inches for a comfort fit. Our standard sizes are Small (6.0"), Medium (6.5"), and Large (7.0"). We also provide free custom resizing on every piece!';
        recs = [products[0]];
      } else if (lower.includes('ruby') || lower.includes('red') || lower.includes('garnet')) {
        reply = 'Ruby and garnet gemstones have an incredible rich shimmer. Check out the Ruby Star and Crimson Bead pieces:';
        recs = products.filter((p) => p.name.toLowerCase().includes('ruby') || p.name.toLowerCase().includes('crimson'));
      } else {
        reply = 'Each piece in our atelier is handmade with love. Here are a couple of our top trending favorites:';
        recs = products.slice(0, 2);
      }

      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'maryam',
          text: reply,
          recommendedProducts: recs.length > 0 ? recs : undefined,
        },
      ]);
    }, 600);
  };

  return (
    <div className="fixed bottom-6 right-6 z-40">
      {/* Floating Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-[#2d5a61] hover:bg-[#1e3c41] text-white p-3.5 sm:px-5 sm:py-3.5 rounded-full shadow-xl flex items-center gap-2.5 transition-all duration-300 hover:scale-105 group border border-[#D4B982]/40"
          aria-label="Ask Maryam Jewelry Stylist"
        >
          <div className="relative">
            <Sparkles className="w-5 h-5 text-[#D4B982] animate-pulse" />
          </div>
          <span className="text-xs font-semibold tracking-wide hidden sm:inline font-sans">
            Ask Maryam Stylist
          </span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="bg-[#fdfaf5] w-[90vw] sm:w-[380px] h-[520px] rounded-3xl shadow-2xl border border-[#e0d8c8] flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200">
          {/* Chat Header */}
          <div className="bg-[#2d5a61] text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#fdfaf5] text-[#2d5a61] flex items-center justify-center font-serif font-bold text-sm shadow-xs">
                M
              </div>
              <div>
                <h4 className="font-serif text-sm font-semibold flex items-center gap-1">
                  <span>Ask Maryam</span>
                  <Sparkles className="w-3.5 h-3.5 text-[#D4B982]" />
                </h4>
                <p className="text-[10px] text-white/80">Atelier Jewelry Stylist • Active</p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-full hover:bg-white/20 text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Chat History */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${
                  msg.sender === 'user' ? 'items-end' : 'items-start'
                }`}
              >
                <div
                  className={`p-3.5 rounded-2xl max-w-[85%] leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-[#E8E0D5] text-[#333333] rounded-br-none shadow-2xs font-medium'
                      : 'bg-white text-[#333333] rounded-bl-none border-l-4 border-[#2d5a61] shadow-xs'
                  }`}
                >
                  {msg.text}
                </div>

                {/* In-chat Product Recommendation Cards */}
                {msg.recommendedProducts && msg.recommendedProducts.length > 0 && (
                  <div className="mt-2.5 space-y-2 w-full max-w-[90%]">
                    {msg.recommendedProducts.map((prod) => (
                      <div
                        key={prod.id}
                        className="bg-white p-2.5 rounded-xl border border-[#e0d8c8] flex items-center justify-between gap-3 shadow-2xs"
                      >
                        <img
                          src={prod.image}
                          alt={prod.name}
                          className="w-12 h-12 rounded-lg object-cover cursor-pointer"
                          onClick={() => onQuickView(prod)}
                        />
                        <div className="flex-1 min-w-0">
                          <h5
                            onClick={() => onQuickView(prod)}
                            className="font-serif text-xs font-semibold truncate cursor-pointer hover:text-[#2d5a61]"
                          >
                            {prod.name}
                          </h5>
                          <p className="text-[11px] font-bold text-[#2d5a61]">
                            Rs. {prod.price.toLocaleString()}
                          </p>
                        </div>
                        <button
                          onClick={() => onAddToCart(prod)}
                          className="bg-[#2d5a61] hover:bg-[#1e3c41] text-white p-1.5 rounded-lg text-[10px] font-medium flex items-center gap-1 shadow-2xs cursor-pointer"
                        >
                          <ShoppingBag className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Quick Prompts */}
          <div className="p-2.5 bg-[#efe8dc]/70 border-t border-[#e0d8c8] flex gap-1.5 overflow-x-auto no-scrollbar">
            {quickPrompts.map((prompt, i) => (
              <button
                key={i}
                onClick={() => handleSend(prompt)}
                className="whitespace-nowrap bg-white/90 hover:bg-white text-[#2d5a61] border border-[#e0d8c8] text-[10px] px-2.5 py-1 rounded-full font-medium transition-colors shrink-0 shadow-2xs"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Input Box */}
          <div className="p-3 bg-white border-t border-[#e0d8c8] flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask for recommendations, sizing..."
              className="flex-1 text-xs px-3 py-2 bg-[#fdfaf5] border border-[#e0d8c8] rounded-full focus:outline-none focus:ring-1 focus:ring-[#2d5a61]"
            />
            <button
              onClick={() => handleSend()}
              className="bg-[#2d5a61] hover:bg-[#1e3c41] text-white p-2 rounded-full transition-colors cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
