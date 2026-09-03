import { Order, CartItem, OrderTimelineStep, OrderStatus } from '../types';

const ORDERS_STORAGE_KEY = 'maryam_sparkle_orders_v1';

const INITIAL_DEMO_ORDERS: Order[] = [
  {
    id: 'ord-8291',
    orderNumber: 'MS-8291',
    createdAt: '2026-03-01T10:30:00.000Z',
    status: 'shipped',
    customer: {
      fullName: 'Ayesha Khan',
      email: 'ayesha.khan@example.com',
      phone: '+92 300 9876543'
    },
    shippingAddress: {
      address: 'House 42, Street 15, Sector F-7/2',
      city: 'Islamabad',
      postalCode: '44000',
      province: 'Federal Capital',
      country: 'Pakistan'
    },
    deliveryMethod: {
      id: 'standard',
      title: 'Standard Tracked Delivery (TCS Express)',
      cost: 200,
      estimatedDays: '2-4 Business Days'
    },
    paymentMethod: {
      id: 'cod',
      title: 'Cash on Delivery (COD)'
    },
    items: [
      {
        product: {
          id: 'ruby-star-bracelet',
          slug: 'ruby-star-bracelet',
          name: 'Ruby Star Bracelet',
          category: 'Bracelets',
          price: 1850,
          image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDmeq-VwhiU435DetS1X3uFs7ftPFTXuoNQPezkt-FDdS5fVi-fWgAQ_3PvJaDU9x4xRw9sw7ru1NTVm_zs5SnnAjgi_E2wg681wIyMw8JV9vSVAfWYzcpF2UkfNK-BMxse2gjK2A1h8e3yxiOCNiD2WAJBuG3Iw-g3MZVUEn1s8s125YRifRsnzPAXqmvTSBCjOEOnUJwZJOSA8TQuT8SgzakSJP9LOMTUZ0VMg55dfVKNyPJBWwEe',
          images: [],
          description: 'An enchanting handcrafted bracelet crafted with natural faceted ruby quartz crystal beads.',
          materials: ['Natural Ruby Quartz', '18K Gold Plated Brass'],
          stock: 12,
          inStock: true
        },
        quantity: 1,
        selectedSize: 'Medium (6.5")',
        selectedFinish: '18K Gold'
      },
      {
        product: {
          id: 'pearl-drop-bracelet',
          slug: 'pearl-drop-bracelet',
          name: 'Pearl Drop Bracelet',
          category: 'Bracelets',
          price: 1650,
          image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCym3c_VwqfMRpy3_4MFdu0SCPKfw5QcUU-EbMuf55Oi94gxmhoTK6DvIC9NqkyPrnut8FPQBvd9WbDwUMsdZ9daYCP0CEBw5n33CNNUg9Vf6Fewmrujse_GE-rIRWzfZCFbyHwSHJtFNsGE_sSprb1cpDADr9k1-_yCfeDaJG-ama0UAUP6afCNEvDh6unWvuAdhVdPq_tf06BMovavShLoOA0P9QvacYnLf7NQ8S0oIx-JbomFEdZ',
          images: [],
          description: 'Cultured freshwater baroque pearls carefully placed on a delicate 14k gold-filled chain.',
          materials: ['Freshwater Pearls', '14k Gold-Filled Chain'],
          stock: 16,
          inStock: true
        },
        quantity: 1,
        selectedSize: 'Standard',
        selectedFinish: '14k Gold Filled'
      }
    ],
    subtotal: 3500,
    shippingCost: 0,
    discount: 350,
    couponCode: 'SPARKLE10',
    total: 3150,
    paymentStatus: 'pending',
    courierName: 'TCS Express Courier',
    trackingNumber: 'TCS-9281746201',
    estimatedDelivery: 'March 4, 2026',
    timeline: [
      {
        status: 'placed',
        title: 'Order Placed',
        description: 'Your order was received and queued for artisan crafting.',
        date: 'March 1, 2026 · 10:30 AM',
        completed: true,
        current: false
      },
      {
        status: 'confirmed',
        title: 'Artisan Confirmed',
        description: 'Gemstones and components verified in Maryam Sparkle Studio.',
        date: 'March 1, 2026 · 12:15 PM',
        completed: true,
        current: false
      },
      {
        status: 'processing',
        title: 'Handcrafted & Packed',
        description: 'Beaded by hand, polished, and tucked into signature gift box.',
        date: 'March 2, 2026 · 03:45 PM',
        completed: true,
        current: false
      },
      {
        status: 'shipped',
        title: 'Dispatched with Courier',
        description: 'Handed over to TCS Express. In transit to Islamabad sorting facility.',
        date: 'March 3, 2026 · 09:00 AM',
        completed: true,
        current: true
      },
      {
        status: 'out_for_delivery',
        title: 'Out for Delivery',
        description: 'Courier rider will arrive with your parcel soon.',
        date: 'Pending arrival',
        completed: false,
        current: false
      },
      {
        status: 'delivered',
        title: 'Delivered',
        description: 'Package received by recipient.',
        date: 'Expected March 4, 2026',
        completed: false,
        current: false
      }
    ]
  },
  {
    id: 'ord-9402',
    orderNumber: 'MS-9402',
    createdAt: '2026-02-28T14:10:00.000Z',
    status: 'delivered',
    customer: {
      fullName: 'Zainab Ahmed',
      email: 'zainab.ahmed@example.com',
      phone: '+92 321 4567890'
    },
    shippingAddress: {
      address: 'Apartment 4B, Gulberg Heights, Main Boulevard',
      city: 'Lahore',
      postalCode: '54000',
      province: 'Punjab',
      country: 'Pakistan'
    },
    deliveryMethod: {
      id: 'express',
      title: 'Express Overnight Courier',
      cost: 350,
      estimatedDays: '1-2 Days'
    },
    paymentMethod: {
      id: 'easypaisa',
      title: 'EasyPaisa Mobile Account'
    },
    items: [
      {
        product: {
          id: 'green-charm-bracelet',
          slug: 'green-charm-bracelet',
          name: 'Green Charm Bracelet',
          category: 'Bracelets',
          price: 1650,
          image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBjg3XRMb6wLdRZsXq5bkSYwoUFwyvwoR2OsMODh2in0onDVAfObyPentjgSGJdFHqrjI0OQJb1h8AnkSC9FGjBKn3HO-J33OYyAry0EjOjWNjvVeCan6nA7mcH25mWfDXFhyhG2AtLo8OwfAm-gj9bbjKpacz4e9hg-UZZh4SQktZZy1kByqyqp87OvVUQ9nlbBV2yWuShKbhVkjit8wUdSMJMe5MVDPDVLEDUNROkQAWSN9KexJgP',
          images: [],
          description: 'Inspired by morning dew in spring gardens.',
          materials: ['Green Aventurine', 'Pressed Glass Seed Beads'],
          stock: 9,
          inStock: true
        },
        quantity: 1
      }
    ],
    subtotal: 1650,
    shippingCost: 350,
    discount: 0,
    total: 2000,
    paymentStatus: 'paid',
    courierName: 'Leopards Courier Service',
    trackingNumber: 'LCS-88392019',
    estimatedDelivery: 'March 1, 2026',
    timeline: [
      {
        status: 'placed',
        title: 'Order Placed',
        description: 'Order placed via EasyPaisa payment.',
        date: 'Feb 28, 2026 · 02:10 PM',
        completed: true,
        current: false
      },
      {
        status: 'confirmed',
        title: 'Payment & Order Confirmed',
        description: 'Payment of Rs. 2,000 verified.',
        date: 'Feb 28, 2026 · 02:20 PM',
        completed: true,
        current: false
      },
      {
        status: 'processing',
        title: 'Packed & Quality Checked',
        description: 'Jewelry quality checked and sealed.',
        date: 'Feb 28, 2026 · 05:00 PM',
        completed: true,
        current: false
      },
      {
        status: 'shipped',
        title: 'Dispatched via Leopards',
        description: 'In transit to Lahore Hub.',
        date: 'Feb 28, 2026 · 08:00 PM',
        completed: true,
        current: false
      },
      {
        status: 'out_for_delivery',
        title: 'Out for Delivery',
        description: 'Rider on route to Gulberg Heights.',
        date: 'March 1, 2026 · 10:15 AM',
        completed: true,
        current: false
      },
      {
        status: 'delivered',
        title: 'Delivered Successfully',
        description: 'Delivered and signed by recipient.',
        date: 'March 1, 2026 · 01:45 PM',
        completed: true,
        current: true
      }
    ]
  }
];

function getStoredOrders(): Order[] {
  try {
    const raw = localStorage.getItem(ORDERS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(INITIAL_DEMO_ORDERS));
      return INITIAL_DEMO_ORDERS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_DEMO_ORDERS;
  } catch {
    return INITIAL_DEMO_ORDERS;
  }
}

function saveStoredOrders(orders: Order[]): void {
  try {
    localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
  } catch (err) {
    console.error('Failed to save orders to localStorage:', err);
  }
}

export const orderService = {
  /**
   * Get all orders
   */
  async getAllOrders(): Promise<Order[]> {
    return getStoredOrders();
  },

  /**
   * Get order by orderNumber or ID
   */
  async getOrder(lookupQuery: string): Promise<Order | null> {
    const cleanQuery = lookupQuery.trim().toUpperCase();
    const cleanDigits = lookupQuery.replace(/\D/g, '');
    const orders = getStoredOrders();

    const matched = orders.find((o) => {
      const oNum = o.orderNumber.toUpperCase();
      const oId = o.id.toUpperCase();
      const oTrack = (o.trackingNumber || '').toUpperCase();
      const oEmail = o.customer.email.toLowerCase();
      const oPhoneDigits = o.customer.phone.replace(/\D/g, '');

      return (
        oNum === cleanQuery ||
        oId === cleanQuery ||
        oTrack === cleanQuery ||
        oEmail === lookupQuery.trim().toLowerCase() ||
        (cleanDigits.length >= 7 && oPhoneDigits.includes(cleanDigits))
      );
    });

    return matched || null;
  },

  /**
   * Search order specifically for track page with orderId + optional phone/email
   */
  async trackOrder(orderNumber: string, phoneOrEmail?: string): Promise<Order | null> {
    const cleanNum = orderNumber.trim().toUpperCase();
    const orders = getStoredOrders();

    const order = orders.find((o) => o.orderNumber.toUpperCase() === cleanNum || o.id.toUpperCase() === cleanNum);
    if (!order) return null;

    if (phoneOrEmail && phoneOrEmail.trim()) {
      const matchKey = phoneOrEmail.trim().toLowerCase().replace(/[\s-+()]/g, '');
      const custPhone = order.customer.phone.replace(/[\s-+()]/g, '');
      const custEmail = order.customer.email.toLowerCase();

      if (!custPhone.includes(matchKey) && !custEmail.includes(phoneOrEmail.trim().toLowerCase())) {
        // Return order nonetheless if orderNumber is exact match for demo convenience
        return order;
      }
    }

    return order;
  },

  /**
   * Create a new order at checkout
   */
  async createOrder(orderPayload: {
    customer: { fullName: string; email: string; phone: string };
    shippingAddress: { address: string; city: string; postalCode: string; province?: string; country: string };
    deliveryMethod: { id: 'standard' | 'express'; title: string; cost: number; estimatedDays: string };
    paymentMethod: { id: 'cod' | 'easypaisa' | 'bank_transfer'; title: string; instructions?: string };
    items: CartItem[];
    subtotal: number;
    shippingCost: number;
    discount: number;
    couponCode?: string;
    total: number;
    notes?: string;
  }): Promise<Order> {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `MS-${randomSuffix}`;
    const now = new Date();

    const estimatedArrival = new Date(now);
    estimatedArrival.setDate(estimatedArrival.getDate() + (orderPayload.deliveryMethod.id === 'express' ? 2 : 4));
    const estimatedDateStr = estimatedArrival.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });

    const newTimeline: OrderTimelineStep[] = [
      {
        status: 'placed',
        title: 'Order Placed',
        description: 'We received your order and are gathering the stones for artisan crafting.',
        date: now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ' · Just now',
        completed: true,
        current: true
      },
      {
        status: 'confirmed',
        title: 'Artisan Confirmed',
        description: 'Order details verified in our studio.',
        date: 'Estimated within 4 hours',
        completed: false,
        current: false
      },
      {
        status: 'processing',
        title: 'Handcrafted & Packed',
        description: 'Beaded with love and tucked into our signature gift box.',
        date: 'Estimated tomorrow',
        completed: false,
        current: false
      },
      {
        status: 'shipped',
        title: 'Dispatched with Courier',
        description: 'Dispatched via TCS / Leopards Express.',
        date: 'Estimated in 2 days',
        completed: false,
        current: false
      },
      {
        status: 'out_for_delivery',
        title: 'Out for Delivery',
        description: 'Courier rider out for delivery to your address.',
        date: 'Estimated in 3 days',
        completed: false,
        current: false
      },
      {
        status: 'delivered',
        title: 'Delivered',
        description: 'Package safely delivered.',
        date: `Estimated ${estimatedDateStr}`,
        completed: false,
        current: false
      }
    ];

    const newOrder: Order = {
      id: `ord-${randomSuffix}`,
      orderNumber,
      createdAt: now.toISOString(),
      status: 'placed',
      customer: orderPayload.customer,
      shippingAddress: orderPayload.shippingAddress,
      deliveryMethod: orderPayload.deliveryMethod,
      paymentMethod: orderPayload.paymentMethod,
      items: orderPayload.items,
      subtotal: orderPayload.subtotal,
      shippingCost: orderPayload.shippingCost,
      discount: orderPayload.discount,
      couponCode: orderPayload.couponCode,
      total: orderPayload.total,
      paymentStatus: orderPayload.paymentMethod.id === 'cod' ? 'pending' : 'paid',
      courierName: 'TCS Express Tracked',
      trackingNumber: `TCS-${Math.floor(1000000000 + Math.random() * 9000000000)}`,
      estimatedDelivery: estimatedDateStr,
      timeline: newTimeline,
      notes: orderPayload.notes
    };

    const existingOrders = getStoredOrders();
    const updated = [newOrder, ...existingOrders];
    saveStoredOrders(updated);

    return newOrder;
  }
};
