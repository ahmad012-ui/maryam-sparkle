import express from 'express';
import http from 'http';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit';
import { PRODUCTS } from './frontend/src/data/products';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;
const IS_PRODUCTION = process.env.NODE_ENV === 'production';

app.set('trust proxy', 1);
app.disable('x-powered-by');

// Keep request bodies bounded so the public AI endpoint cannot be used for
// oversized JSON/history payloads.
app.use(express.json({ limit: '64kb' }));

// Production HTTP hardening. The CSP explicitly allows the external image/font
// hosts used by the storefront and the Supabase project used by the frontend.
if (IS_PRODUCTION) {
  app.use(
    helmet({
      crossOriginOpenerPolicy: { policy: 'same-origin-allow-popups' },
      crossOriginResourcePolicy: { policy: 'cross-origin' },
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          baseUri: ["'self'"],
          objectSrc: ["'none'"],
          frameAncestors: ["'self'"],
          formAction: ["'self'"],
          scriptSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
          fontSrc: ["'self'", 'https://fonts.gstatic.com', 'data:'],
          imgSrc: ["'self'", 'data:', 'blob:', 'https:'],
          connectSrc: [
            "'self'",
            'https://tfcuyfjyqqvononlvvdo.supabase.co',
            'wss://tfcuyfjyqqvononlvvdo.supabase.co',
          ],
          workerSrc: ["'self'", 'blob:'],
          upgradeInsecureRequests: [],
        },
      },
    })
  );
}

const chatRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { error: 'Too many chat requests. Please try again later.' },
});

// API health endpoint
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'Maryam Sparkle Server' });
});

// Product catalog summary for AI reasoning
const catalogSummary = PRODUCTS.map(
  (p) =>
    `- ID: ${p.id} | Name: ${p.name} | Category: ${p.category} | Price: Rs. ${p.price.toLocaleString()} | Materials: ${p.materials.join(', ')} | Slug: ${p.slug} | InStock: ${p.inStock} | Description: ${p.description}`
).join('\n');

const SYSTEM_INSTRUCTION = `You are Maryam, the founder, designer, and master artisan of "Maryam Sparkle" — a luxury artisanal handcrafted beaded and gemstone jewelry brand based in Pakistan (with ateliers in Karachi & Lahore).

BRAND AESTHETIC & PHILOSOPHY:
- Delicate, heartfelt, mindful, inspired by nature and gentle moments.
- Every piece is hand-strung using premium natural gemstones (rose quartz, jade, green aventurine, lapis lazuli, freshwater pearls), vibrant Czech seed beads, 18K gold-plated / 14K gold-filled hardware, and durable Japanese stretch cord.

STORE POLICIES & HELPFUL DETAILS:
- Shipping: Flat Rs. 200 standard across Pakistan; FREE shipping on all orders over Rs. 3,000. Delivery arrives in 2–4 business days via TCS/Trax. Worldwide delivery takes 7–12 business days.
- Payments: Cash on Delivery (COD) across Pakistan and secure online payments through Safepay when enabled.
- Sizing: Standard bracelet sizes are Small (6.0 in / 15.2 cm), Medium (6.5 in / 16.5 cm), Large (7.0 in / 17.8 cm). Custom wrist measurements are handcrafted at NO extra charge! Customers can measure their wrist snugly with a strip of paper or tape.
- Jewelry Care: Gently roll elastic bracelets over the wrist rather than stretching sharply. Keep away from direct perfumes, chlorine, and lotions. Store in our signature satin/velvet pouch.
- Exchanges & Resizing: 7-day hassle-free exchange or resize policy.
- Bespoke & Custom Orders: Maryam custom-creates pieces with personalized initials, custom charms, favorite stones, and bridal favor sets via /custom-orders.
- Order Tracking: Customers can track parcels anytime at /track by entering their Order Reference (e.g. MS-8291).

PRODUCT CATALOG:
${catalogSummary}

CRITICAL BEHAVIORAL DIRECTIVES:
1. DIRECTNESS & RELEVANCE: Always answer the customer's exact question directly and helpfully.
2. NO REPETITION / NO LOOPS: DO NOT repeat a canned greeting (e.g. "Hello! I am your Maryam Sparkle AI Stylist") if the user is already asking questions or continuing a conversation. Answer with fresh, relevant insight.
3. CONVERSATIONAL TONE: Speak with warmth, elegance, and artisanal care. Be concise and graceful.
4. DIRECTING THE CUSTOMER: Provide 1 to 3 relevant catalog products in "recommendedProductIds" when appropriate.
5. ACTIONABLE GUIDANCE: Provide 1 to 3 "suggestedActions" with labels and internal navigation routes to guide the user (e.g. payload: "/shop?category=Necklaces", "/shop?category=Bracelets", "/custom-orders", "/track", "/shop", "/product/{slug}").

RESPONSE FORMAT:
You MUST respond with a JSON object with this exact structure:
{
  "reply": "Markdown formatted conversational response addressing the user directly...",
  "recommendedProductIds": ["ms-001", "ms-002"],
  "suggestedActions": [
    { "label": "Explore Necklaces", "action": "navigate", "payload": "/shop?category=Necklaces" },
    { "label": "Custom Bespoke Order", "action": "navigate", "payload": "/custom-orders" }
  ]
}`;

function generateSmartFallback(message: string, history: Array<{ sender: string; text: string }> = []) {
  const q = message.toLowerCase().trim();
  const isFirstTurn = !history || history.length === 0;

  if (q.includes('size') || q.includes('measure') || q.includes('wrist') || q.includes('inch') || q.includes('7 inch') || q.includes('6 inch') || q.includes('fit') || q.includes('tight')) {
    return {
      reply: `Yes, absolutely! 🕊️ Every Maryam Sparkle bracelet can be custom-crafted to your exact wrist measurement (including 6.0\", 6.5\", 7.0\", or any bespoke dimension) at **no extra charge**!\n\nTo ensure a perfect fit, simply measure your wrist snugly with a strip of paper against a ruler, and include your preferred size in the order notes during checkout or via our Custom Studio.`,
      recommendedProductIds: ['green-charm-bracelet', 'rose-quartz-serenity-bracelet'],
      suggestedActions: [
        { label: 'Open Custom Sizing Studio', action: 'navigate', payload: '/custom-orders' },
        { label: 'Browse All Bracelets', action: 'navigate', payload: '/shop?category=Bracelets' },
      ],
    };
  }

  const priceMatch = q.match(/under\s*(?:rs\.?|pkr)?\s*(\d+)/i) || q.match(/(\d+)\s*(?:rs|rupees|budget)/i);
  if (priceMatch || q.includes('gift') || q.includes('present') || q.includes('sister') || q.includes('friend') || q.includes('eid')) {
    const budget = priceMatch ? parseInt(priceMatch[1], 10) : 2500;
    const affordable = PRODUCTS.filter((p) => p.price <= budget);
    const chosen = affordable.length > 0 ? affordable.slice(0, 2) : PRODUCTS.slice(0, 2);
    return {
      reply: `How wonderful! Here are our favorite handcrafted artisan pieces within your budget of **Rs. ${budget.toLocaleString()}**, perfect for gifting:\n\n${chosen
        .map((p) => `• **${p.name}** (Rs. ${p.price.toLocaleString()}) — ${p.description}`)
        .join('\n\n')}\n\n*Every piece arrives sealed in our signature satin jewelry pouch with a complimentary gift note!*`,
      recommendedProductIds: chosen.map((p) => p.id),
      suggestedActions: [
        { label: `View Gifts Under Rs. ${budget}`, action: 'navigate', payload: `/shop?maxPrice=${budget}` },
        { label: 'Design Bespoke Initial Piece', action: 'navigate', payload: '/custom-orders' },
      ],
    };
  }

  if (q.includes('pearl') || q.includes('freshwater')) {
    const pearls = PRODUCTS.filter((p) => p.materials.some((m) => m.toLowerCase().includes('pearl')));
    return {
      reply: `Our **Freshwater Pearl** pieces feature genuine, hand-selected pearls chosen for their natural luster, organic silhouette, and delicate elegance. Perfect for weddings, Eid celebrations, or timeless daily wear:`,
      recommendedProductIds: pearls.map((p) => p.id),
      suggestedActions: [
        { label: 'Explore Pearl Collection', action: 'navigate', payload: '/shop?search=pearl' },
        { label: 'Bespoke Pearl Order', action: 'navigate', payload: '/custom-orders' },
      ],
    };
  }

  if (q.includes('green') || q.includes('jade') || q.includes('aventurine')) {
    const greenPieces = PRODUCTS.filter((p) =>
      p.materials.some((m) => m.toLowerCase().includes('aventurine') || m.toLowerCase().includes('jade')) ||
      p.name.toLowerCase().includes('green')
    );
    return {
      reply: `🌿 **Green Aventurine & Jade** embody prosperity, emotional balance, and natural serenity. Here are our favorite handcrafted green pieces:`,
      recommendedProductIds: greenPieces.map((p) => p.id),
      suggestedActions: [
        { label: 'Shop Green Gemstones', action: 'navigate', payload: '/shop?search=green' },
        { label: 'View Stacking Rings', action: 'navigate', payload: '/shop?category=Rings' },
      ],
    };
  }

  const orderMatch = q.match(/ms[- ]?([a-z0-9]{4,6})/i) || q.match(/\b(\d{4,6})\b/);
  if (orderMatch || q.includes('track') || q.includes('order status') || q.includes('parcel')) {
    const orderRef = orderMatch ? `MS-${orderMatch[1].toUpperCase()}` : '';
    return {
      reply: `✨ You can track the real-time progress of your artisan jewelry parcel — from studio assembly and QA inspection to courier dispatch — on our dedicated tracking hub:`,
      suggestedActions: [
        { label: 'Open Live Tracking Hub', action: 'navigate', payload: `/track${orderRef ? `?id=${orderRef}` : ''}` },
        { label: 'Customer Care Support', action: 'navigate', payload: '/customer-care' },
      ],
    };
  }

  if (q.includes('custom') || q.includes('bespoke') || q.includes('initial') || q.includes('name')) {
    return {
      reply: `✨ **Maryam loves crafting custom bespoke pieces!**\n\nYou can select your personalized initial charm, choose custom bead shades, pick natural gemstone accents, and specify your exact wrist measurement in our studio designer:`,
      recommendedProductIds: ['bespoke-initial-charm-bracelet'],
      suggestedActions: [
        { label: 'Open Bespoke Studio', action: 'navigate', payload: '/custom-orders' },
        { label: 'Browse Ready Collection', action: 'navigate', payload: '/shop' },
      ],
    };
  }

  if (isFirstTurn) {
    return {
      reply: `Salam & Welcome to Maryam Sparkle! 🕊️✨ I am Maryam, your studio jeweler and stylist. How can I guide you today? Ask about personalized gifts, gemstone meanings, wrist sizing, or tracking an order!`,
      recommendedProductIds: [PRODUCTS[0].id, PRODUCTS[1].id],
      suggestedActions: [
        { label: 'Explore Best Sellers', action: 'navigate', payload: '/shop' },
        { label: 'Design Custom Jewelry', action: 'navigate', payload: '/custom-orders' },
        { label: 'Track Order', action: 'navigate', payload: '/track' },
      ],
    };
  }

  return {
    reply: `I would love to help! Tell me more about your style preference — are you looking for everyday delicate beads, a statement piece for an upcoming event, or would you like to customize a bespoke initial bracelet?`,
    recommendedProductIds: [PRODUCTS[0].id, PRODUCTS[2].id],
    suggestedActions: [
      { label: 'Explore All Jewelry', action: 'navigate', payload: '/shop' },
      { label: 'Custom Initial Order', action: 'navigate', payload: '/custom-orders' },
      { label: 'Customer Care & FAQs', action: 'navigate', payload: '/customer-care' },
    ],
  };
}

// AI Chatbot Endpoint
app.post('/api/chat', chatRateLimiter, async (req, res) => {
  const message = typeof req.body?.message === 'string' ? req.body.message.trim() : '';
  const rawHistory = req.body?.history;

  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }
  if (message.length > 4000) {
    return res.status(413).json({ error: 'Message is too long.' });
  }

  const history: Array<{ sender: 'user' | 'model'; text: string }> = Array.isArray(rawHistory)
    ? rawHistory
        .filter((h): h is { sender: 'user' | 'model'; text: string } =>
          !!h && (h.sender === 'user' || h.sender === 'model') && typeof h.text === 'string'
        )
        .slice(-6)
        .map((h) => ({ sender: h.sender, text: h.text.slice(0, 2000) }))
    : [];

  const apiKey = process.env.GEMINI_API_KEY;

  if (apiKey) {
    const contents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];

    let startIndex = history.findIndex((h) => h.sender === 'user');
    if (startIndex !== -1) {
      const validSlice = history.slice(startIndex, startIndex + 6);
      for (const h of validSlice) {
        const role = h.sender;
        if (contents.length > 0 && contents[contents.length - 1].role === role) {
          contents[contents.length - 1].parts[0].text += '\n' + h.text;
        } else {
          contents.push({ role, parts: [{ text: h.text }] });
        }
      }
    }

    if (contents.length > 0 && contents[contents.length - 1].role === 'user') {
      contents[contents.length - 1].parts[0].text += '\n' + message;
    } else {
      contents.push({ role: 'user', parts: [{ text: message }] });
    }

    const ai = new GoogleGenAI({ apiKey });
    const candidateModels = ['gemini-3.1-flash-lite', 'gemini-3.8-flash', 'gemini-3.6-flash', 'gemini-flash-latest'];

    for (const model of candidateModels) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents,
          config: {
            systemInstruction: SYSTEM_INSTRUCTION,
            responseMimeType: 'application/json',
          },
        });

        const rawText = response.text || '';
        try {
          return res.json(JSON.parse(rawText));
        } catch {
          const clean = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
          return res.json(JSON.parse(clean));
        }
      } catch {
        // Advance to the next candidate model or the local fallback.
      }
    }
  }

  return res.json(generateSmartFallback(message, history));
});

async function startServer() {
  const server = http.createServer(app);

  if (!IS_PRODUCTION) {
    const isHmrDisabled = process.env.DISABLE_HMR === 'true';
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: isHmrDisabled
          ? false
          : {
              server,
              clientPort: 443,
            },
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
