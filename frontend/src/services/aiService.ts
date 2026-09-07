import { Product, Order } from '../types';
import { PRODUCTS, FAQS } from '../data/products';
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

export const aiService = {
  /**
   * Tool 1: Search products in catalog
   */
  async searchProducts(query: string, maxPrice?: number, category?: string): Promise<Product[]> {
    return productService.getProducts({
      searchQuery: query,
      maxPrice,
      category
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
        return 'Standard delivery takes 2–4 business days across Pakistan (Rs. 200, Free over Rs. 3,000). Express overnight delivery is Rs. 350. International delivery takes 7–12 business days.';
      case 'returns':
        return 'We offer a 7-day hassle-free exchange or repair guarantee. If a piece arrives damaged or requires resizing, we will adjust it for free.';
      case 'care':
        return 'To keep your handmade bead jewelry and hardware in beautiful condition: avoid direct contact with perfumes and harsh moisture, store in our soft microfiber pouch, and gently wipe with a clean dry cloth.';
      case 'sizing':
        return 'Standard sizes: Small (6.0"), Medium (6.5"), Large (7.0"). We also craft custom measurements on request at no extra charge!';
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
    history: { sender: 'user' | 'assistant'; text: string }[] = []
  ): Promise<AIResponse> {
    const q = userMessage.toLowerCase().trim();

    // 1. Order tracking query detection (e.g. "Where is MS-8291", "track my order 8291", "status")
    const orderMatch = q.match(/ms[- ]?(\d{4})/i) || q.match(/\b(\d{4})\b/);
    if (orderMatch || q.includes('track') || q.includes('order status')) {
      const orderNum = orderMatch ? `MS-${orderMatch[1]}` : 'MS-8291';
      const order = await this.getOrderStatus(orderNum);

      if (order) {
        const currentStep = order.timeline.find((t) => t.current) || order.timeline[order.timeline.length - 1];
        return {
          reply: `✨ I located your order **${order.orderNumber}**! Current status is **${order.status.toUpperCase()}** (${currentStep.title}). Handled by **${order.courierName}** (Tracking: \`${order.trackingNumber}\`). Estimated arrival: **${order.estimatedDelivery}**.`,
          orderFound: order,
          suggestedActions: [
            { label: 'View Full Tracking Journey', action: 'navigate', payload: `/track?order=${order.orderNumber}` },
            { label: 'Chat with Studio on WhatsApp', action: 'whatsapp', payload: `Inquiry about Order ${order.orderNumber}` }
          ]
        };
      }
    }

    // 2. Budget query (e.g. "under 2000", "cheap", "gift under 3000")
    const priceMatch = q.match(/under\s*(?:rs\.?|pkr)?\s*(\d+)/i) || q.match(/(\d+)\s*(?:rs|rupees|budget)/i);
    if (priceMatch) {
      const budget = parseInt(priceMatch[1], 10);
      const matched = PRODUCTS.filter((p) => p.price <= budget);
      if (matched.length > 0) {
        return {
          reply: `Here are our handcrafted pieces within your budget of **Rs. ${budget.toLocaleString()}**. Each piece comes beautifully boxed in our signature satin bag:`,
          suggestedProducts: matched.slice(0, 4),
          suggestedActions: [
            { label: 'Browse All under Budget', action: 'navigate', payload: `/shop?maxPrice=${budget}` }
          ]
        };
      }
    }

    // 3. Color or style query
    const colors = ['red', 'ruby', 'crimson', 'green', 'purple', 'lavender', 'white', 'black', 'midnight', 'gold', 'silver', 'blue', 'pink', 'rose'];
    const foundColor = colors.find((c) => q.includes(c));
    if (foundColor) {
      const matched = PRODUCTS.filter(
        (p) =>
          p.materials.some((m) => m.toLowerCase().includes(foundColor)) ||
          p.colors?.some((c) => c.toLowerCase().includes(foundColor)) ||
          p.name.toLowerCase().includes(foundColor) ||
          p.description.toLowerCase().includes(foundColor)
      );

      if (matched.length > 0) {
        return {
          reply: `I love that aesthetic! Here are our favorite handcrafted pieces featuring **${foundColor}** beads and accents:`,
          suggestedProducts: matched.slice(0, 4),
          suggestedActions: [
            { label: `View ${foundColor} collection in shop`, action: 'navigate', payload: `/shop?search=${foundColor}` }
          ]
        };
      }
    }

    // 4. Category query (anklet, necklace, ring, earrings, custom)
    if (q.includes('anklet') || q.includes('ankle')) {
      const anklets = PRODUCTS.filter((p) => p.category === 'Anklets');
      return {
        reply: `Our delicate anklets are strung with waterproof cord, colorful beads, and charming accents — perfect for sunny days and seaside walks.`,
        suggestedProducts: anklets,
        suggestedActions: [{ label: 'Shop All Anklets', action: 'navigate', payload: '/shop/anklets' }]
      };
    }

    if (q.includes('necklace') || q.includes('choker')) {
      const necklaces = PRODUCTS.filter((p) => p.category === 'Necklaces');
      return {
        reply: `Our necklaces feature vibrant glass beads, delicate charms, and linked chain accents designed for graceful layering.`,
        suggestedProducts: necklaces,
        suggestedActions: [{ label: 'Shop All Necklaces', action: 'navigate', payload: '/shop/necklaces' }]
      };
    }

    if (q.includes('ring')) {
      const rings = PRODUCTS.filter((p) => p.category === 'Rings');
      return {
        reply: `Our beaded stacking rings feature vibrant glass and acrylic seed beads on comfortable stretch bands.`,
        suggestedProducts: rings,
        suggestedActions: [{ label: 'Shop Stacking Rings', action: 'navigate', payload: '/shop/rings' }]
      };
    }

    if (q.includes('custom') || q.includes('bespoke') || q.includes('name') || q.includes('birthstone')) {
      const customPieces = PRODUCTS.filter((p) => p.category === 'Custom Pieces');
      return {
        reply: `We love creating one-of-a-kind bespoke jewelry! Maryam can customize initial charms, preferred bead colors, and exact sizing.`,
        suggestedProducts: customPieces,
        suggestedActions: [
          { label: 'Open Custom Jewelry Designer', action: 'navigate', payload: '/custom-orders' }
        ]
      };
    }

    // 5. Policy & care queries
    if (q.includes('care') || q.includes('clean') || q.includes('water') || q.includes('perfume')) {
      const careInfo = await this.getStorePolicy('care');
      return {
        reply: `✨ **Jewelry Care Guide:**\n\n${careInfo}\n\n*Pro-tip:* Roll elastic bead bracelets gently onto your wrist rather than stretching them widely!`,
        suggestedActions: [{ label: 'Read Full Care Guide', action: 'navigate', payload: '/jewelry-care' }]
      };
    }

    if (q.includes('shipping') || q.includes('delivery') || q.includes('days') || q.includes('tcs')) {
      const shipInfo = await this.getStorePolicy('shipping');
      return {
        reply: `🚚 **Shipping & Delivery:**\n\n${shipInfo}`,
        suggestedActions: [{ label: 'View Shipping Policy', action: 'navigate', payload: '/shipping' }]
      };
    }

    if (q.includes('return') || q.includes('exchange') || q.includes('refund') || q.includes('broken')) {
      const returnInfo = await this.getStorePolicy('returns');
      return {
        reply: `✨ **Returns & Exchanges:**\n\n${returnInfo}`,
        suggestedActions: [{ label: 'View Returns Policy', action: 'navigate', payload: '/returns' }]
      };
    }

    // Default intelligent greeting & popular picks
    const popular = PRODUCTS.filter((p) => p.isBestSeller).slice(0, 3);
    return {
      reply: `Hello! I'm your **Maryam Sparkle AI Stylist** ✨ I can help you find the perfect handcrafted beaded piece, recommend gifts by budget, check live order delivery status, or guide custom initial pieces. How can I help you today?`,
      suggestedProducts: popular,
      suggestedActions: [
        { label: 'Show Best Sellers', action: 'navigate', payload: '/shop' },
        { label: 'Design Custom Piece', action: 'navigate', payload: '/custom-orders' },
        { label: 'Track My Order', action: 'navigate', payload: '/track' }
      ]
    };
  },

  /**
   * Quick alias for stylist assistant response
   */
  async askAssistant(userMessage: string): Promise<AIResponse> {
    return this.generateStylistResponse(userMessage);
  }
};
