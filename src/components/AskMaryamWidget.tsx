import React, { useState } from 'react';
import { Sparkles, X, Send, ShoppingBag, Heart, ArrowRight } from 'lucide-react';
import { Product } from '../types';
import { aiService } from '../services/aiService';

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
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'maryam',
      text: 'Salam & Welcome to Maryam Sparkle! 🕊️✨ I am your personal studio stylist. Ask me about custom birthstones, styling for weddings, size measurements, or track an order!',
      recommendedProducts: [products[0], products[1]],
    },
  ]);

  const quickPrompts = [
    '🎁 Best gift under Rs. 2,000',
    '🌿 Green aventurine & jade',
    '📏 How to measure wrist size?',
    '🤍 Freshwater pearls for Eid',
  ];

  const handleSend = async (textToSend?: string) => {
    const userText = textToSend || input;
    if (!userText.trim()) return;

    const newMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: userText,
    };

    setMessages((prev) => [...prev, newMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const response = await aiService.askAssistant(userText);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'maryam',
          text: response.reply,
          recommendedProducts: response.suggestedProducts,
        },
      ]);
    } catch (err) {
      console.error('AI Stylist error:', err);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'maryam',
          text: 'Every handmade piece in our Karachi studio is crafted with vibrant beads, chains, and charms. Let me know if you would like custom sizes or special gift packaging!',
          recommendedProducts: products.slice(0, 2),
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div
      className="fixed z-40 right-4 sm:right-6 transition-all duration-300"
      style={{
        bottom: 'calc(98px + env(safe-area-inset-bottom, 0px))',
      }}
    >
      {/* Floating Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="w-[54px] h-[54px] sm:w-auto sm:h-auto bg-[#2d5a61] hover:bg-[#1e3c41] text-white p-3 sm:px-5 sm:py-3.5 rounded-full shadow-[0_8px_25px_rgba(45,90,97,0.3)] flex items-center justify-center sm:justify-start gap-2.5 transition-all duration-300 hover:scale-105 group border border-[#D4B982]/40 cursor-pointer"
          aria-label="Ask Maryam Jewelry Stylist"
        >
          <div className="relative flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-[#D4B982] animate-pulse shrink-0" />
          </div>
          <span className="text-xs font-semibold tracking-wide hidden sm:inline font-sans whitespace-nowrap">
            Ask Maryam Stylist
          </span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="bg-[#fdfaf5] w-[calc(100vw-32px)] sm:w-[380px] h-[500px] max-h-[calc(100vh-140px)] rounded-3xl shadow-2xl border border-[#e0d8c8] flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200">
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
                <p className="text-[10px] text-white/80">Atelier Jewelry Stylist • Online</p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-full hover:bg-white/20 text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Chat History */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs scrollbar-thin">
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
                          title="Add to bag"
                        >
                          <ShoppingBag className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="flex items-center gap-2 p-3 bg-white text-[#666666] rounded-2xl rounded-bl-none border-l-4 border-[#2d5a61] w-24">
                <Sparkles className="w-3.5 h-3.5 text-[#2d5a61] animate-spin" />
                <span className="text-[11px] font-medium">Styling...</span>
              </div>
            )}
          </div>

          {/* Quick Prompts */}
          <div className="p-2.5 bg-[#efe8dc]/70 border-t border-[#e0d8c8] flex gap-1.5 overflow-x-auto no-scrollbar">
            {quickPrompts.map((prompt, i) => (
              <button
                key={i}
                onClick={() => handleSend(prompt)}
                className="whitespace-nowrap bg-white/90 hover:bg-white text-[#2d5a61] border border-[#e0d8c8] text-[10px] px-2.5 py-1 rounded-full font-medium transition-colors shrink-0 shadow-2xs cursor-pointer"
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
              className="flex-1 text-xs px-3.5 py-2 bg-[#fdfaf5] border border-[#e0d8c8] rounded-full focus:outline-none focus:ring-1 focus:ring-[#2d5a61]"
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
