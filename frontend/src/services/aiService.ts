import { Product, Order } from '../types';
import { PRODUCTS } from '../data/products';
import { orderService } from './orderService';
import { productService } from './productService';

export interface AIProductSuggestion {
  product: Product;
  matchReason?: string;
}

export interface AIResponse {
  reply: string;
  suggestedProducts?: Product[];
  orderFound?: Order | null;
  suggestedActions?: { label: string; action: string; payload?: string }[];
}

export interface ChatHistoryItem {
  sender: 'user' | 'assistant';
  text: string;
}

export const aiService = {
  /**
   * Tool 1: Search products in catalog
   */
  async searchProducts(query: string, maxPrice?: number, category?: string): Promise<Product[]> {
    return productService.getProducts({
      searchQuery: query,
      maxPrice,
      category,
    });
  },

  /**
   * Tool 2: Get single product
   */
  async getProduct(slugOrId: string): Promise<Product | null> {
    return productService.getProductBySlug(slugOrId);
  },

  /**
   * Tool 3: Check stock
   */
  async checkStock(productId: string): Promise<{ inStock: boolean; quantity: number }> {
    const p = await productService.getProductById(productId);
    if (!p) return { inStock: false, quantity: 0 };
    return { inStock: p.inStock, quantity: p.stock };
  },

  /**
   * Tool 4: Look up order status
   */
  async getOrderStatus(orderId: string): Promise<Order | null> {
    return orderService.getOrder(orderId);
  },

  /**
   * Tool 5: Get store policy
   */
  async getStorePolicy(topic: 'shipping' | 'returns' | 'care' | 'sizing' | 'payment'): Promise<string> {
    switch (topic) {
      case 'shipping':
        return 'Standard delivery takes 2–4 business days across Pakistan (Rs. 200, Free over Rs. 3,000). Express tracked delivery is supported via TCS/Trax. Worldwide delivery takes 7–12 business days.';
      case 'returns':
        return 'We offer a 7-day hassle-free exchange or repair guarantee. If a piece arrives damaged or requires resizing, we will adjust it for free.';
      case 'care':
        return 'To keep your handmade bead jewelry in pristine condition: avoid direct contact with perfumes and harsh moisture, store in our soft microfiber pouch, and gently roll elastic bracelets onto your wrist rather than stretching.';
      case 'sizing':
        return 'Standard sizes: Small (6.0" / 15.2cm), Medium (6.5" / 16.5cm), Large (7.0" / 17.8cm). We also craft custom measurements on request at no extra charge! You can measure your wrist with a string against a ruler.';
      case 'payment':
        return 'We accept Cash on Delivery (COD) across Pakistan, EasyPaisa, JazzCash, and direct Bank Transfer.';
      default:
        return 'Feel free to ask about our handmade jewelry collections, sizing, orders, or care!';
    }
  },

  /**
   * Main stylist conversational reasoning engine
   */
  async generateStylistResponse(
    userMessage: string,
    history: ChatHistoryItem[] = []
  ): Promise<AIResponse> {
    // 1. First attempt: Call backend Gemini AI service
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12000);

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage, history }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        if (data && typeof data.reply === 'string' && data.reply.trim()) {
          // Resolve recommended product IDs to actual catalog Product objects
          let suggestedProducts: Product[] = [];
          if (Array.isArray(data.recommendedProductIds) && data.recommendedProductIds.length > 0) {
            suggestedProducts = PRODUCTS.filter((p) =>
              data.recommendedProductIds.includes(p.id)
            );
          }

          // If no products matched by ID but product names were referenced in the reply
          if (suggestedProducts.length === 0) {
            const lowerReply = data.reply.toLowerCase();
            suggestedProducts = PRODUCTS.filter((p) =>
              lowerReply.includes(p.name.toLowerCase())
            ).slice(0, 3);
          }

          return {
            reply: data.reply,
            suggestedProducts: suggestedProducts.length > 0 ? suggestedProducts : undefined,
            suggestedActions: Array.isArray(data.suggestedActions) ? data.suggestedActions : undefined,
          };
        }
      }
    } catch {
      // Gracefully advance to contextual stylist fallback
    }

    // 2. Intelligent, Non-Looping Contextual Fallback
    return this.generateContextualFallback(userMessage, history);
  },

  /**
   * Intelligent Contextual Fallback Engine (prevents looping text)
   */
  generateContextualFallback(
    userMessage: string,
    history: ChatHistoryItem[] = []
  ): AIResponse {
    const q = userMessage.toLowerCase().trim();
    const isFirstTurn = history.length === 0;

    // 1. Order tracking detection (e.g. "MS-8291", "track my order", "where is my order")
    const orderMatch = q.match(/ms[- ]?([a-z0-9]{4,6})/i) || q.match(/\b(\d{4,6})\b/);
    if (orderMatch || q.includes('track') || q.includes('order status') || q.includes('parcel')) {
      if (orderMatch) {
        const orderRef = `MS-${orderMatch[1].toUpperCase()}`;
        return {
          reply: `✨ Let's look up your dispatch for order reference **${orderRef}**! You can view the live progress of artisan crafting, packaging, and courier delivery on our dedicated tracking hub:`,
          suggestedActions: [
            { label: `Track Order ${orderRef}`, action: 'navigate', payload: `/track` },
            { label: 'Chat With Atelier Concierge', action: 'navigate', payload: '/contact' },
          ],
        };
      }
      return {
        reply: `✨ You can track any parcel in real time! Simply have your **Order ID** (from your order confirmation receipt or email) ready, and enter it in our Tracking Hub:`,
        suggestedActions: [
          { label: 'Open Order Tracking Hub', action: 'navigate', payload: '/track' },
          { label: 'View Customer Support', action: 'navigate', payload: '/customer-care' },
        ],
      };
    }

    // 2. Sizing and wrist measurement inquiry
    if (q.includes('size') || q.includes('measure') || q.includes('wrist') || q.includes('fit') || q.includes('tight') || q.includes('loose')) {
      return {
        reply: `📏 **How to Measure Your Wrist for the Perfect Fit:**\n\n1. Wrap a flexible tailor's tape or a strip of paper comfortably around your wrist bone.\n2. Mark the point where the ends meet and measure against a flat ruler in inches or centimeters.\n\n• **Small:** 6.0" (15.2 cm)\n• **Medium:** 6.5" (16.5 cm)\n• **Large:** 7.0" (17.8 cm)\n\n*Maryam custom-sizes any bracelet to your exact wrist measurement at no additional charge!* Simply leave your size note during checkout or request a bespoke size.`,
        suggestedActions: [
          { label: 'Design Custom Sized Piece', action: 'navigate', payload: '/custom-orders' },
          { label: 'Browse Best Sellers', action: 'navigate', payload: '/shop' },
        ],
      };
    }

    // 3. Gemstones, materials, or pearls inquiry
    if (q.includes('pearl') || q.includes('freshwater')) {
      const pearls = PRODUCTS.filter(
        (p) =>
          p.materials.some((m) => m.toLowerCase().includes('pearl')) ||
          p.name.toLowerCase().includes('pearl')
      );
      return {
        reply: `🦪 Our **Freshwater Pearl** pieces feature genuine, hand-selected pearls chosen for their natural luster, organic silhouette, and delicate elegance. Perfect for weddings, Eid celebrations, or timeless daily wear:`,
        suggestedProducts: pearls.length > 0 ? pearls : PRODUCTS.slice(0, 2),
        suggestedActions: [
          { label: 'Explore Pearl Collection', action: 'navigate', payload: '/shop?search=pearl' },
          { label: 'Custom Pearl Design', action: 'navigate', payload: '/custom-orders' },
        ],
      };
    }

    if (q.includes('quartz') || q.includes('rose') || q.includes('pink')) {
      const rosePieces = PRODUCTS.filter((p) =>
        p.name.toLowerCase().includes('rose') ||
        p.materials.some((m) => m.toLowerCase().includes('quartz'))
      );
      return {
        reply: `🌸 **Rose Quartz** is cherished as the stone of gentle love and compassion. Hand-strung with warm 18K gold-plated spacer beads, our Rose Quartz Serenity collection brings a soft, calming radiance to your wrist:`,
        suggestedProducts: rosePieces.length > 0 ? rosePieces : [PRODUCTS[0]],
        suggestedActions: [
          { label: 'View Rose Quartz Bracelet', action: 'navigate', payload: `/product/${PRODUCTS[0].slug}` },
          { label: 'Shop All Bracelets', action: 'navigate', payload: '/shop?category=Bracelets' },
        ],
      };
    }

    if (q.includes('green') || q.includes('jade') || q.includes('aventurine') || q.includes('emerald')) {
      const greenPieces = PRODUCTS.filter((p) =>
        p.materials.some((m) => m.toLowerCase().includes('aventurine') || m.toLowerCase().includes('jade')) ||
        p.name.toLowerCase().includes('emerald') ||
        p.name.toLowerCase().includes('aventurine')
      );
      return {
        reply: `🌿 **Green Aventurine & Jade** embody prosperity, emotional balance, and natural harmony. Here are our favorite deep-green gemstone creations:`,
        suggestedProducts: greenPieces.length > 0 ? greenPieces : PRODUCTS.slice(2, 4),
        suggestedActions: [
          { label: 'Shop Green Gemstones', action: 'navigate', payload: '/shop?search=green' },
          { label: 'View Stacking Rings', action: 'navigate', payload: '/shop?category=Rings' },
        ],
      };
    }

    if (q.includes('evil eye') || q.includes('blue') || q.includes('protection') || q.includes('nazar')) {
      const eyePieces = PRODUCTS.filter((p) =>
        p.name.toLowerCase().includes('evil eye') ||
        p.materials.some((m) => m.toLowerCase().includes('evil eye'))
      );
      return {
        reply: `🧿 Our **Evil Eye** protective pieces feature vibrant Mediterranean blue glass charms and gold-accented beads, crafted to safeguard your energy with timeless charm:`,
        suggestedProducts: eyePieces.length > 0 ? eyePieces : PRODUCTS.slice(3, 5),
        suggestedActions: [
          { label: 'Shop Evil Eye Pieces', action: 'navigate', payload: '/shop?search=evil%20eye' },
          { label: 'Shop Anklets', action: 'navigate', payload: '/shop?category=Anklets' },
        ],
      };
    }

    // 4. Budget & Price queries
    const priceMatch = q.match(/under\s*(?:rs\.?|pkr)?\s*(\d+)/i) || q.match(/(\d+)\s*(?:rs|rupees|budget)/i);
    if (priceMatch || q.includes('budget') || q.includes('cheap') || q.includes('affordable') || q.includes('price')) {
      const budget = priceMatch ? parseInt(priceMatch[1], 10) : 2500;
      const matched = PRODUCTS.filter((p) => p.price <= budget);
      const items = matched.length > 0 ? matched.slice(0, 3) : PRODUCTS.slice(0, 3);
      return {
        reply: `✨ Here are our handcrafted artisan pieces within your budget of **Rs. ${budget.toLocaleString()}**. Each order arrives sealed in our signature velvet jewelry pouch:`,
        suggestedProducts: items,
        suggestedActions: [
          { label: `View Pieces Under Rs. ${budget}`, action: 'navigate', payload: `/shop?maxPrice=${budget}` },
          { label: 'View All Handcrafted Jewelry', action: 'navigate', payload: '/shop' },
        ],
      };
    }

    // 5. Gift recommendations
    if (q.includes('gift') || q.includes('present') || q.includes('sister') || q.includes('friend') || q.includes('birthday') || q.includes('wedding')) {
      const giftPicks = PRODUCTS.filter((p) => p.isBestSeller || p.category === 'Bracelets').slice(0, 3);
      return {
        reply: `🎁 **Artisan Gift Recommendations:**\n\nFor gifts, delicate bracelets with natural gemstones (like Rose Quartz for harmony, or Freshwater Pearls for elegance) are customer favorites because they effortlessly pair with both eastern and western wardrobe staples. We include a handwritten gift card and velvet gift pouch with every piece!`,
        suggestedProducts: giftPicks,
        suggestedActions: [
          { label: 'Explore Gift Favorites', action: 'navigate', payload: '/shop' },
          { label: 'Create Bespoke Initial Piece', action: 'navigate', payload: '/custom-orders' },
        ],
      };
    }

    // 6. Category filters (necklaces, rings, anklets, bracelets)
    if (q.includes('necklace') || q.includes('choker')) {
      const necklaces = PRODUCTS.filter((p) => p.category === 'Necklaces');
      return {
        reply: `✨ Our handcrafted **Necklaces & Chokers** feature delicate glass seed beads, freshwater pearls, and adjustable 14K gold-filled extenders designed for graceful layering:`,
        suggestedProducts: necklaces,
        suggestedActions: [{ label: 'Shop Necklaces Collection', action: 'navigate', payload: '/shop?category=Necklaces' }],
      };
    }

    if (q.includes('ring')) {
      const rings = PRODUCTS.filter((p) => p.category === 'Rings');
      return {
        reply: `💍 Our **Beaded Stacking Rings** are hand-threaded with vibrant glass beads and genuine gemstone chips on ultra-durable comfort-fit stretch cord:`,
        suggestedProducts: rings,
        suggestedActions: [{ label: 'Shop Stacking Rings', action: 'navigate', payload: '/shop?category=Rings' }],
      };
    }

    if (q.includes('anklet') || q.includes('ankle')) {
      const anklets = PRODUCTS.filter((p) => p.category === 'Anklets');
      return {
        reply: `🌊 Our **Artisan Anklets** feature waterproof cord, colorful seed beads, and sea-inspired charms — designed to endure warm seaside walks and daily sunshine:`,
        suggestedProducts: anklets,
        suggestedActions: [{ label: 'Shop Anklets Collection', action: 'navigate', payload: '/shop?category=Anklets' }],
      };
    }

    if (q.includes('bracelet')) {
      const bracelets = PRODUCTS.filter((p) => p.category === 'Bracelets');
      return {
        reply: `✨ Our signature **Gemstone & Beaded Bracelets** are crafted on premium Japanese stretch cord with genuine natural stones and gold accents:`,
        suggestedProducts: bracelets.slice(0, 3),
        suggestedActions: [{ label: 'Shop All Bracelets', action: 'navigate', payload: '/shop?category=Bracelets' }],
      };
    }

    // 7. Custom / Bespoke inquiries
    if (q.includes('custom') || q.includes('bespoke') || q.includes('initial') || q.includes('name') || q.includes('personal')) {
      return {
        reply: `✨ **Maryam loves creating one-of-a-kind bespoke creations!**\n\nYou can select your exact bead color scheme, add personalized alphabet initial charms, pick natural gemstone accents, and specify custom wrist sizing in our Custom Atelier Studio:`,
        suggestedActions: [
          { label: 'Open Custom Studio', action: 'navigate', payload: '/custom-orders' },
          { label: 'Direct Atelier Contact', action: 'navigate', payload: '/contact' },
        ],
      };
    }

    // 8. Shipping & Payment
    if (q.includes('shipping') || q.includes('delivery') || q.includes('cod') || q.includes('cash on delivery') || q.includes('karachi') || q.includes('lahore') || q.includes('islamabad')) {
      return {
        reply: `🚚 **Shipping & Delivery Policies:**\n\n• **Standard Delivery:** Rs. 200 flat across Pakistan\n• **FREE Delivery:** On all orders above Rs. 3,000\n• **Delivery Time:** 2–4 business days via TCS / Trax couriers\n• **Payment Methods:** Cash on Delivery (COD), EasyPaisa, JazzCash, and direct Bank Transfer.`,
        suggestedActions: [
          { label: 'Browse Collection', action: 'navigate', payload: '/shop' },
          { label: 'Track An Existing Order', action: 'navigate', payload: '/track' },
        ],
      };
    }

    // 9. Care instructions
    if (q.includes('care') || q.includes('clean') || q.includes('tarnish') || q.includes('water') || q.includes('perfume')) {
      return {
        reply: `✨ **Jewelry Care Best Practices:**\n\n1. **Roll, don't pull:** Gently roll elastic bead bracelets over your hand instead of stretching.\n2. **Avoid moisture:** Keep gold-plated and seed bead pieces away from direct perfumes, chlorine, and lotions.\n3. **Store safely:** Keep in your Maryam Sparkle satin pouch when not wearing.`,
        suggestedActions: [
          { label: 'View Customer Care FAQs', action: 'navigate', payload: '/customer-care' },
          { label: 'Explore New Arrivals', action: 'navigate', payload: '/shop' },
        ],
      };
    }

    // 10. General conversational responses (context-aware, NOT repeating introductory greeting)
    if (isFirstTurn) {
      return {
        reply: `Assalam-o-Alaikum & Welcome! 🕊️✨ I am Maryam, your studio stylist. How can I help you today? Would you like help choosing a piece, measuring your wrist, or checking on an order?`,
        suggestedProducts: PRODUCTS.slice(0, 2),
        suggestedActions: [
          { label: 'Explore Best Sellers', action: 'navigate', payload: '/shop' },
          { label: 'Design Custom Jewelry', action: 'navigate', payload: '/custom-orders' },
          { label: 'Track Order', action: 'navigate', payload: '/track' },
        ],
      };
    }

    // In an ongoing conversation where no specific category was caught:
    return {
      reply: `I would be delighted to assist! Tell me more about what you have in mind — are you looking for a gift for someone special, a piece to match a specific outfit, or would you like to design a custom bespoke bracelet?`,
      suggestedProducts: PRODUCTS.slice(0, 3),
      suggestedActions: [
        { label: 'View All Jewelry', action: 'navigate', payload: '/shop' },
        { label: 'Custom Initial Order', action: 'navigate', payload: '/custom-orders' },
        { label: 'Customer Care & FAQs', action: 'navigate', payload: '/customer-care' },
      ],
    };
  },

  /**
   * Quick alias for stylist assistant response
   */
  async askAssistant(
    userMessage: string,
    history: ChatHistoryItem[] = []
  ): Promise<AIResponse> {
    return this.generateStylistResponse(userMessage, history);
  },
};
