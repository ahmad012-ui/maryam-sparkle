import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, X, Send, ShoppingBag, ArrowRight, RotateCcw, Compass } from 'lucide-react';
import { Product } from '../types';
import { aiService, ChatHistoryItem } from '../services/aiService';

interface Message {
  id: string;
  sender: 'maryam' | 'user';
  text: string;
  recommendedProducts?: Product[];
  suggestedActions?: { label: string; action: string; payload?: string }[];
}

interface AskMaryamWidgetProps {
  products: Product[];
  onAddToCart: (product: Product) => void;
  onQuickView: (product: Product) => void;
  onOpenCustomOrder?: () => void;
  onOpenCustomerCare?: (tab?: string) => void;
}

export const AskMaryamWidget: React.FC<AskMaryamWidgetProps> = ({
  products,
  onAddToCart,
  onQuickView,
  onOpenCustomOrder,
  onOpenCustomerCare,
}) => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const initialMessage: Message = {
    id: 'initial',
    sender: 'maryam',
    text: 'Salam & Welcome to Maryam Sparkle! 🕊️✨ I am Maryam, your personal studio stylist. What can I help you discover today? Ask for gift suggestions, gemstone meanings, wrist sizing, custom initials, or live order tracking!',
    recommendedProducts: products.slice(0, 2),
    suggestedActions: [
      { label: '🎁 Gift under Rs. 2,500', action: 'prompt', payload: 'Recommend a beautiful gift under Rs. 2,500' },
      { label: '📏 Measure Wrist Size', action: 'prompt', payload: 'How do I measure my wrist for a bracelet?' },
      { label: '✨ Bespoke Custom Order', action: 'navigate', payload: '/custom-orders' },
      { label: '📦 Track My Parcel', action: 'navigate', payload: '/track' },
    ],
  };

  const [messages, setMessages] = useState<Message[]>([initialMessage]);

  const quickPrompts = [
    '🎁 Best gift under Rs. 2,500',
    '🌿 Green aventurine & jade',
    '📏 How to measure wrist size?',
    '🤍 Freshwater pearls for bridal/Eid',
    '✨ Design a custom initial bracelet',
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [messages, isTyping, isOpen]);

  const handleActionClick = (action: { label: string; action: string; payload?: string }) => {
    if (action.action === 'prompt' && action.payload) {
      handleSend(action.payload);
      return;
    }

    if (action.action === 'whatsapp' && action.payload) {
      window.open(action.payload, '_blank');
      return;
    }

    if (action.action === 'navigate' && action.payload) {
      if (action.payload === '/custom-orders' && onOpenCustomOrder) {
        onOpenCustomOrder();
      } else if (action.payload.startsWith('/customer-care') && onOpenCustomerCare) {
        onOpenCustomerCare();
      } else {
        navigate(action.payload);
      }
      return;
    }

    if (action.payload?.startsWith('/')) {
      navigate(action.payload);
    }
  };

  const handleSend = async (textToSend?: string) => {
    const userText = textToSend || input;
    if (!userText.trim() || isTyping) return;

    const newMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: userText,
    };

    setMessages((prev) => [...prev, newMsg]);
    setInput('');
    setIsTyping(true);

    // Build chat history for conversational reasoning
    const history: ChatHistoryItem[] = messages.map((m) => ({
      sender: m.sender === 'user' ? 'user' : 'assistant',
      text: m.text,
    }));

    try {
      const response = await aiService.askAssistant(userText, history);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'maryam',
          text: response.reply,
          recommendedProducts: response.suggestedProducts,
          suggestedActions: response.suggestedActions,
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'maryam',
          text: 'I would love to help you find the perfect piece! You can browse our full handcrafted collection or open our bespoke designer to craft something custom.',
          recommendedProducts: products.slice(0, 2),
          suggestedActions: [
            { label: 'Browse Shop', action: 'navigate', payload: '/shop' },
            { label: 'Custom Orders', action: 'navigate', payload: '/custom-orders' },
          ],
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleResetChat = () => {
    setMessages([initialMessage]);
    setInput('');
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
        <div className="bg-[#fdfaf5] w-[calc(100vw-32px)] sm:w-[410px] h-[540px] max-h-[calc(100vh-130px)] rounded-3xl shadow-2xl border border-[#e0d8c8] flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200">
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

            <div className="flex items-center gap-1">
              <button
                onClick={handleResetChat}
                className="p-1.5 rounded-full hover:bg-white/20 text-white/90 hover:text-white transition-colors cursor-pointer"
                title="Restart conversation"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-full hover:bg-white/20 text-white transition-colors cursor-pointer"
                title="Close chat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
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
                  className={`p-3.5 rounded-2xl max-w-[88%] leading-relaxed whitespace-pre-line ${
                    msg.sender === 'user'
                      ? 'bg-[#E8E0D5] text-[#333333] rounded-br-none shadow-2xs font-medium'
                      : 'bg-white text-[#333333] rounded-bl-none border-l-4 border-[#2d5a61] shadow-xs'
                  }`}
                >
                  {msg.text}
                </div>

                {/* Direct Action Chips */}
                {msg.suggestedActions && msg.suggestedActions.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5 max-w-[92%]">
                    {msg.suggestedActions.map((action, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleActionClick(action)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#2d5a61]/10 hover:bg-[#2d5a61] text-[#2d5a61] hover:text-white border border-[#2d5a61]/25 rounded-full text-[11px] font-semibold transition-all duration-150 shadow-2xs cursor-pointer group text-left"
                      >
                        <Compass className="w-3 h-3 shrink-0 opacity-70 group-hover:opacity-100" />
                        <span>{action.label}</span>
                        <ArrowRight className="w-3 h-3 shrink-0 group-hover:translate-x-0.5 transition-transform" />
                      </button>
                    ))}
                  </div>
                )}

                {/* In-chat Product Recommendation Cards */}
                {msg.recommendedProducts && msg.recommendedProducts.length > 0 && (
                  <div className="mt-2.5 space-y-2 w-full max-w-[92%]">
                    {msg.recommendedProducts.map((prod) => (
                      <div
                        key={prod.id}
                        className="bg-white p-2.5 rounded-xl border border-[#e0d8c8] flex items-center justify-between gap-3 shadow-2xs hover:border-[#2d5a61]/40 transition-colors"
                      >
                        <img
                          src={prod.image}
                          alt={prod.name}
                          className="w-12 h-12 rounded-lg object-cover cursor-pointer hover:opacity-90"
                          onClick={() => onQuickView(prod)}
                        />
                        <div className="flex-1 min-w-0">
                          <h5
                            onClick={() => onQuickView(prod)}
                            className="font-serif text-xs font-semibold truncate cursor-pointer hover:text-[#2d5a61] transition-colors"
                          >
                            {prod.name}
                          </h5>
                          <p className="text-[11px] font-bold text-[#2d5a61]">
                            Rs. {prod.price.toLocaleString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => navigate(`/product/${prod.slug}`)}
                            className="text-[#666666] hover:text-[#2d5a61] p-1.5 rounded-lg text-[10px] font-medium transition-colors"
                            title="View product"
                          >
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onAddToCart(prod)}
                            className="bg-[#2d5a61] hover:bg-[#1e3c41] text-white p-1.5 rounded-lg text-[10px] font-medium flex items-center gap-1 shadow-2xs cursor-pointer transition-colors"
                            title="Add to bag"
                          >
                            <ShoppingBag className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="flex items-center gap-2 p-3 bg-white text-[#666666] rounded-2xl rounded-bl-none border-l-4 border-[#2d5a61] w-28 shadow-xs">
                <Sparkles className="w-3.5 h-3.5 text-[#2d5a61] animate-spin" />
                <span className="text-[11px] font-medium">Maryam typing...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompt Carousel */}
          <div className="p-2.5 bg-[#efe8dc]/70 border-t border-[#e0d8c8] flex gap-1.5 overflow-x-auto no-scrollbar">
            {quickPrompts.map((prompt, i) => (
              <button
                key={i}
                onClick={() => handleSend(prompt)}
                disabled={isTyping}
                className="whitespace-nowrap bg-white/90 hover:bg-white text-[#2d5a61] border border-[#e0d8c8] text-[10px] px-2.5 py-1 rounded-full font-medium transition-colors shrink-0 shadow-2xs cursor-pointer disabled:opacity-50"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Input Box */}
          <div className="p-3 bg-white border-t border-[#e0d8c8] flex items-center gap-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask for recommendations, sizing, styling..."
              disabled={isTyping}
              className="flex-1 text-xs px-3.5 py-2.5 bg-[#fdfaf5] border border-[#e0d8c8] rounded-full focus:outline-none focus:ring-1 focus:ring-[#2d5a61] disabled:opacity-60"
            />
            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || isTyping}
              className="bg-[#2d5a61] hover:bg-[#1e3c41] disabled:opacity-40 text-white p-2.5 rounded-full transition-colors cursor-pointer"
              aria-label="Send message"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
