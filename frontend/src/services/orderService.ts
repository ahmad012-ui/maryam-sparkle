import { Order, CartItem, OrderTimelineStep, OrderStatus } from '../types';
import { PRODUCTS } from '../data/products';
import { adminStorage } from '../admin/adminData';
import { AdminOrder, AdminNotification } from '../admin/types';

export interface CreateOrderPayload {
  customer: { fullName: string; email: string; phone: string };
  shippingAddress: { address: string; city: string; postalCode: string; province?: string; country: string };
  deliveryMethod: { id: 'standard' | 'express'; title: string; cost: number; estimatedDays: string };
  paymentMethod: { id: 'cod' | 'easypaisa' | 'jazzcash' | 'bank_transfer'; title: string; instructions?: string };
  items: CartItem[];
  subtotal: number;
  shippingCost: number;
  discount: number;
  couponCode?: string;
  total: number;
  notes?: string;
}

/**
 * Helper to safely parse JSON from a fetch Response without throwing SyntaxError on empty/non-JSON responses
 */
async function parseJsonSafely<T>(res: Response): Promise<T | null> {
  try {
    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      return null;
    }
    const text = await res.text();
    if (!text || !text.trim()) {
      return null;
    }
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}

/**
 * Normalizes backend/admin order status to frontend OrderStatus
 */
function normalizeStatus(backendStatus: string): OrderStatus {
  const s = (backendStatus || '').toLowerCase();
  if (s === 'placed') return 'placed';
  if (s === 'confirmed') return 'confirmed';
  if (s === 'processing') return 'processing';
  if (s === 'shipped') return 'shipped';
  if (s === 'out_for_delivery' || s === 'out for delivery') return 'out_for_delivery';
  if (s === 'delivered') return 'delivered';
  return 'placed';
}

/**
 * Builds standard timeline steps based on live status
 */
function buildTimeline(status: OrderStatus, createdAt: string): OrderTimelineStep[] {
  const steps: { key: OrderStatus; title: string; desc: string }[] = [
    { key: 'placed', title: 'Order Placed', desc: 'Your order was received and queued on the artisan workbench.' },
    { key: 'confirmed', title: 'Artisan Confirmed', desc: 'Gemstones and hardware verified in studio.' },
    { key: 'processing', title: 'Handcrafted & Packed', desc: 'Hand-beaded, jeweler-polished, and sealed with custom gift packaging.' },
    { key: 'shipped', title: 'Dispatched with Courier', desc: 'Handed over to courier express logistics.' },
    { key: 'out_for_delivery', title: 'Out for Delivery', desc: 'Courier rider is currently on delivery route.' },
    { key: 'delivered', title: 'Delivered', desc: 'Package safely delivered with confirmation signature.' },
  ];

  const orderIndexMap: Record<OrderStatus, number> = {
    placed: 0,
    confirmed: 1,
    processing: 2,
    shipped: 3,
    out_for_delivery: 4,
    delivered: 5,
  };

  const currentIdx = orderIndexMap[status] ?? 0;
  const createdDate = new Date(createdAt);
  const dateStr = !isNaN(createdDate.getTime())
    ? createdDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : 'Recently';

  return steps.map((step, idx) => ({
    status: step.key,
    title: step.title,
    description: step.desc,
    date: idx === 0 ? dateStr : idx <= currentIdx ? 'In Progress' : 'Pending',
    completed: idx < currentIdx || (idx === currentIdx && status === 'delivered'),
    current: idx === currentIdx && status !== 'delivered',
  }));
}

/**
 * Maps an AdminOrder record to the frontend Order interface
 */
function mapAdminOrderToOrder(ao: AdminOrder): Order {
  const normStatus = normalizeStatus(ao.orderStatus);
  const items: CartItem[] = (ao.items || []).map((it) => {
    const found = PRODUCTS.find((p) => p.id === it.productId);
    return {
      product: found || {
        id: it.productId,
        slug: `product-${it.productId}`,
        name: it.productName,
        category: 'Bracelets',
        price: it.price,
        image: it.image || PRODUCTS[0]?.image || '',
        images: [it.image || PRODUCTS[0]?.image || ''],
        description: 'Handmade artisanal jewelry crafted with love in our Karachi atelier.',
        materials: ['Glass Beads', 'Gold-Tone Accents'],
        stock: 10,
        inStock: true,
      },
      quantity: it.quantity,
      selectedSize: it.size || 'Medium (6.5")',
      selectedFinish: it.finish || 'Gold-Tone',
    };
  });

  const paymentMethodKey =
    ao.paymentMethod === 'JazzCash'
      ? 'jazzcash'
      : ao.paymentMethod === 'Easypaisa'
      ? 'easypaisa'
      : ao.paymentMethod === 'Bank Transfer'
      ? 'bank_transfer'
      : 'cod';

  return {
    id: ao.id || ao.orderNumber,
    orderNumber: ao.orderNumber,
    createdAt: ao.date ? `${ao.date}T12:00:00Z` : new Date().toISOString(),
    status: normStatus,
    customer: {
      fullName: ao.customerName,
      email: ao.customerEmail,
      phone: ao.customerPhone,
    },
    shippingAddress: {
      address: ao.address,
      city: ao.city,
      postalCode: '54000',
      province: 'Sindh',
      country: 'Pakistan',
    },
    deliveryMethod: {
      id: 'standard',
      title: 'Standard Tracked Delivery (2–4 Days)',
      cost: 200,
      estimatedDays: '2–4 business days',
    },
    paymentMethod: {
      id: paymentMethodKey,
      title: ao.paymentMethod,
    },
    items,
    subtotal: ao.totalAmount > 200 ? ao.totalAmount - 200 : ao.totalAmount,
    shippingCost: 200,
    discount: 0,
    total: ao.totalAmount,
    paymentStatus: ao.paymentStatus.toLowerCase() === 'paid' ? 'paid' : 'pending',
    courierName: ao.courierName,
    trackingNumber: ao.trackingNumber,
    estimatedDelivery: undefined,
    timeline: buildTimeline(normStatus, ao.date || new Date().toISOString()),
    notes: ao.notes,
  };
}

/**
 * Maps a raw backend order record to the frontend Order interface
 */
function mapBackendOrderToOrder(raw: any, fallbackPayload?: CreateOrderPayload): Order {
  const normStatus = normalizeStatus(raw.status);
  const items: CartItem[] = Array.isArray(raw.items) && raw.items.length > 0
    ? raw.items.map((it: any) => {
        const found = PRODUCTS.find((p) => p.slug === it.current_product_slug || p.id === String(it.product_id));
        return {
          product: found || {
            id: String(it.product_id || it.id),
            slug: it.current_product_slug || 'handmade-piece',
            name: it.product_name || 'Handmade Jewelry',
            category: 'Bracelets',
            price: parseFloat(it.unit_price) || 0,
            image: it.primary_image || PRODUCTS[0]?.image || '',
            images: it.primary_image ? [it.primary_image] : [PRODUCTS[0]?.image || ''],
            description: 'Handmade artisanal jewelry crafted with love in our Karachi atelier.',
            materials: ['Glass Beads', 'Gold-Tone Accents'],
            stock: 10,
            inStock: true,
          },
          quantity: parseInt(it.quantity, 10) || 1,
          selectedSize: 'Medium (6.5")',
          selectedFinish: 'Gold-Tone',
        };
      })
    : fallbackPayload?.items || [];

  const rawAddr = raw.shipping_address || {};

  const paymentMethodId = (raw.payment_method || fallbackPayload?.paymentMethod?.id || 'cod').toLowerCase() as
    | 'cod'
    | 'easypaisa'
    | 'jazzcash'
    | 'bank_transfer';

  const paymentTitles: Record<string, string> = {
    cod: 'Cash on Delivery (COD)',
    easypaisa: 'EasyPaisa Mobile Account',
    jazzcash: 'JazzCash Mobile Account',
    bank_transfer: 'Direct Bank Transfer',
  };

  return {
    id: String(raw.id || raw.order_number),
    orderNumber: raw.order_number,
    createdAt: raw.created_at || new Date().toISOString(),
    status: normStatus,
    customer: {
      fullName: raw.customer_name || rawAddr.full_name || fallbackPayload?.customer?.fullName || 'Customer',
      email: raw.customer_email || fallbackPayload?.customer?.email || '',
      phone: raw.customer_phone || rawAddr.phone || fallbackPayload?.customer?.phone || '',
    },
    shippingAddress: {
      address: rawAddr.address_line_1 || rawAddr.address || fallbackPayload?.shippingAddress?.address || '',
      city: rawAddr.city || fallbackPayload?.shippingAddress?.city || 'Karachi',
      postalCode: rawAddr.postal_code || fallbackPayload?.shippingAddress?.postalCode || '',
      province: rawAddr.state || fallbackPayload?.shippingAddress?.province || 'Sindh',
      country: rawAddr.country || fallbackPayload?.shippingAddress?.country || 'Pakistan',
    },
    deliveryMethod: fallbackPayload?.deliveryMethod || {
      id: 'standard',
      title: 'Standard Tracked Delivery (2–4 Days)',
      cost: parseFloat(raw.shipping_fee) || 200,
      estimatedDays: '2–4 business days',
    },
    paymentMethod: {
      id: paymentMethodId,
      title: paymentTitles[paymentMethodId] || 'Cash on Delivery (COD)',
    },
    items,
    subtotal: parseFloat(raw.subtotal) || fallbackPayload?.subtotal || 0,
    shippingCost: parseFloat(raw.shipping_fee) || fallbackPayload?.shippingCost || 0,
    discount: parseFloat(raw.discount) || fallbackPayload?.discount || 0,
    couponCode: fallbackPayload?.couponCode,
    total: parseFloat(raw.total) || fallbackPayload?.total || 0,
    paymentStatus: (raw.payment_status || 'Pending').toLowerCase() === 'paid' ? 'paid' : 'pending',
    courierName: raw.courier_name || undefined,
    trackingNumber: raw.tracking_number || undefined,
    estimatedDelivery: raw.estimated_delivery || undefined,
    timeline: buildTimeline(normStatus, raw.created_at || new Date().toISOString()),
    notes: fallbackPayload?.notes,
  };
}

export const orderService = {
  /**
   * Get all orders for the user from backend API or local admin storage
   */
  async getAllOrders(): Promise<Order[]> {
    try {
      const res = await fetch('/api/v1/orders', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        credentials: 'include',
      });

      const json = await parseJsonSafely<any>(res);
      if (res.ok && json?.success && Array.isArray(json?.data?.orders) && json.data.orders.length > 0) {
        return json.data.orders.map((ord: any) => mapBackendOrderToOrder(ord));
      }
    } catch (err) {
      console.warn('orderService.getAllOrders API fallback:', err);
    }

    // Fall back to local admin storage
    const localOrders = adminStorage.getOrders();
    return localOrders.map(mapAdminOrderToOrder);
  },

  /**
   * Get order by orderNumber or ID
   */
  async getOrder(lookupQuery: string, emailOrPhone?: string): Promise<Order | null> {
    const cleanQuery = lookupQuery.trim();
    if (!cleanQuery) return null;

    // 1. Check local storage first for fastest retrieval
    const localOrders = adminStorage.getOrders();
    const cleanNum = cleanQuery.toUpperCase();
    const localMatch = localOrders.find(
      (o) =>
        o.orderNumber.toUpperCase() === cleanNum ||
        o.id.toUpperCase() === cleanNum ||
        (cleanQuery.length >= 7 && o.customerPhone.replace(/\D/g, '').includes(cleanQuery.replace(/\D/g, '')))
    );
    if (localMatch) {
      return mapAdminOrderToOrder(localMatch);
    }

    // 2. Try fetching by numeric ID or order ID if authenticated
    if (/^\d+$/.test(cleanQuery)) {
      try {
        const res = await fetch(`/api/v1/orders/${cleanQuery}`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          },
          credentials: 'include',
        });

        const json = await parseJsonSafely<any>(res);
        if (res.ok && json?.success && json.data?.order) {
          return mapBackendOrderToOrder(json.data.order);
        }
      } catch (e) {
        // Ignore
      }
    }

    // 3. Try guest tracking with order_number
    try {
      const trackParams = new URLSearchParams({
        order_number: cleanQuery,
      });

      if (emailOrPhone && emailOrPhone.includes('@')) {
        trackParams.set('email', emailOrPhone.trim());
      } else if (emailOrPhone) {
        trackParams.set('phone', emailOrPhone.trim());
      }

      const trackRes = await fetch(`/api/v1/orders/track?${trackParams.toString()}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        credentials: 'include',
      });

      const json = await parseJsonSafely<any>(trackRes);
      if (trackRes.ok && json?.success && json.data?.order) {
        return mapBackendOrderToOrder(json.data.order);
      }
    } catch (err) {
      console.warn('orderService.getOrder tracking fallback error:', err);
    }

    return null;
  },

  /**
   * Search order specifically for track page with orderNumber + optional phone/email
   */
  async trackOrder(orderNumber: string, phoneOrEmail?: string): Promise<Order | null> {
    const cleanNum = orderNumber.trim();
    if (!cleanNum) return null;

    // 1. Check local storage
    const localOrders = adminStorage.getOrders();
    const cleanQuery = cleanNum.toUpperCase();
    const cleanPhone = (phoneOrEmail || '').replace(/\D/g, '');

    const localMatch = localOrders.find((o) => {
      const numMatch = o.orderNumber.toUpperCase() === cleanQuery || o.id.toUpperCase() === cleanQuery;
      if (numMatch) return true;
      if (cleanPhone && cleanPhone.length >= 7 && o.customerPhone.replace(/\D/g, '').includes(cleanPhone)) {
        return true;
      }
      return false;
    });

    if (localMatch) {
      return mapAdminOrderToOrder(localMatch);
    }

    // 2. Try remote API with safe JSON parsing
    try {
      const params = new URLSearchParams({
        order_number: cleanNum,
      });

      if (phoneOrEmail && phoneOrEmail.includes('@')) {
        params.set('email', phoneOrEmail.trim());
      } else if (phoneOrEmail) {
        params.set('phone', phoneOrEmail.trim());
      }

      const res = await fetch(`/api/v1/orders/track?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        credentials: 'include',
      });

      const json = await parseJsonSafely<any>(res);
      if (res.ok && json?.success && json.data?.order) {
        return mapBackendOrderToOrder(json.data.order);
      }
      return null;
    } catch (err) {
      console.warn('orderService.trackOrder error:', err);
      return null;
    }
  },

  /**
   * Create a new order via drawer or checkout.
   * Guarantees that order creation is resilient, saving to local adminStorage
   * and optionally synchronizing with any available backend endpoint without crashing.
   */
  async createOrder(orderPayload: CreateOrderPayload): Promise<Order> {
    // Generate unique order code (e.g. MS-5821)
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `MS-${randomSuffix}`;

    const newOrder: Order = {
      id: orderNumber,
      orderNumber,
      createdAt: new Date().toISOString(),
      status: 'placed',
      customer: orderPayload.customer,
      shippingAddress: orderPayload.shippingAddress,
      deliveryMethod: orderPayload.deliveryMethod,
      paymentMethod: orderPayload.paymentMethod,
      items: [...orderPayload.items],
      subtotal: orderPayload.subtotal,
      shippingCost: orderPayload.shippingCost,
      discount: orderPayload.discount,
      couponCode: orderPayload.couponCode,
      total: orderPayload.total,
      paymentStatus: 'pending',
      courierName: undefined,
      trackingNumber: undefined,
      estimatedDelivery: undefined,
      timeline: buildTimeline('placed', new Date().toISOString()),
      notes: orderPayload.notes,
    };

    // 1. Persist directly to local admin storage
    try {
      const pmMap: Record<string, 'COD' | 'JazzCash' | 'Easypaisa' | 'Bank Transfer'> = {
        cod: 'COD',
        jazzcash: 'JazzCash',
        easypaisa: 'Easypaisa',
        bank_transfer: 'Bank Transfer',
      };

      const adminOrder: AdminOrder = {
        id: newOrder.id,
        orderNumber: newOrder.orderNumber,
        date: new Date().toISOString().split('T')[0],
        customerName: newOrder.customer.fullName,
        customerEmail: newOrder.customer.email,
        customerPhone: newOrder.customer.phone,
        city: newOrder.shippingAddress.city,
        address: newOrder.shippingAddress.address,
        items: newOrder.items.map((it) => ({
          productId: it.product.id,
          productName: it.product.name,
          image: it.product.image,
          quantity: it.quantity,
          price: it.product.price,
          size: it.selectedSize,
          finish: it.selectedFinish,
        })),
        totalAmount: newOrder.total,
        paymentMethod: pmMap[orderPayload.paymentMethod.id] || 'COD',
        paymentStatus: 'Pending',
        orderStatus: 'Placed',
        notes: newOrder.notes,
      };

      const existingOrders = adminStorage.getOrders();
      adminStorage.saveOrders([
        adminOrder,
        ...existingOrders.filter((o) => o.orderNumber !== adminOrder.orderNumber),
      ]);

      // Add Admin Notification
      const existingNotifs = adminStorage.getNotifications();
      const newNotif: AdminNotification = {
        id: `notif-${Date.now()}`,
        type: 'order',
        title: `New Order ${newOrder.orderNumber}`,
        message: `${newOrder.customer.fullName} placed an order for Rs. ${newOrder.total.toLocaleString()} via ${orderPayload.paymentMethod.title}.`,
        timestamp: 'Just now',
        read: false,
        linkTab: 'orders',
      };
      adminStorage.saveNotifications([newNotif, ...existingNotifs]);
    } catch (storageErr) {
      console.warn('Failed to save order to local adminStorage:', storageErr);
    }

    // 2. Opportunistically sync with backend if available
    try {
      const body = {
        order_number: orderNumber,
        payment_method: orderPayload.paymentMethod.id,
        customer: {
          name: orderPayload.customer.fullName,
          email: orderPayload.customer.email,
          phone: orderPayload.customer.phone,
        },
        shipping_address: {
          full_name: orderPayload.customer.fullName,
          phone: orderPayload.customer.phone,
          address_line_1: orderPayload.shippingAddress.address,
          address_line_2: '',
          city: orderPayload.shippingAddress.city,
          state: orderPayload.shippingAddress.province || 'Sindh',
          postal_code: orderPayload.shippingAddress.postalCode,
          country: orderPayload.shippingAddress.country || 'Pakistan',
        },
        delivery_method: orderPayload.deliveryMethod.id,
        notes: orderPayload.notes || '',
      };

      const res = await fetch('/api/v1/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(body),
      });

      const json = await parseJsonSafely<any>(res);
      if (res.ok && json?.success && json.data?.order) {
        return mapBackendOrderToOrder(json.data.order, orderPayload);
      }
    } catch (apiErr) {
      console.warn('Backend API sync unavailable, order preserved locally:', apiErr);
    }

    return newOrder;
  },
};

