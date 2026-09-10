import { Order, CartItem, OrderTimelineStep, OrderStatus, PaymentMethodId, PAYMENT_METHODS } from '../types';
import { PRODUCTS } from '../data/products';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { authService } from './authService';

export interface CreateOrderPayload {
  customer: { fullName: string; email: string; phone: string };
  shippingAddress: { address: string; city: string; postalCode: string; province?: string; country: string };
  deliveryMethod: { id: 'standard' | 'express'; title: string; cost: number; estimatedDays: string };
  paymentMethod: { id: PaymentMethodId; title: string; instructions?: string };
  transactionReference?: string;
  proofOfPaymentUrl?: string;
  items: CartItem[];
  subtotal: number;
  shippingCost: number;
  discount: number;
  couponCode?: string;
  total: number;
  notes?: string;
}

function normalizeStatus(statusStr: string): OrderStatus {
  const s = (statusStr || '').toLowerCase();
  if (s === 'placed') return 'placed';
  if (s === 'confirmed') return 'confirmed';
  if (s === 'processing') return 'processing';
  if (s === 'shipped') return 'shipped';
  if (s === 'out_for_delivery' || s === 'out for delivery') return 'out_for_delivery';
  if (s === 'delivered') return 'delivered';
  return 'placed';
}

function buildTimeline(status: OrderStatus, createdAt: string): OrderTimelineStep[] {
  const steps: { key: OrderStatus; title: string; desc: string }[] = [
    { key: 'placed', title: 'Order Placed', desc: 'Your order was received and queued on the artisan workbench.' },
    { key: 'confirmed', title: 'Artisan Confirmed', desc: 'Gemstones and hardware verified in studio.' },
    { key: 'processing', title: 'Handcrafted & Packed', desc: 'Hand-beaded, jeweler-polished, and sealed with custom gift packaging.' },
    { key: 'shipped', title: 'Dispatched with Courier', desc: 'Handed over to courier express logistics.' },
    { key: 'out_for_delivery', title: 'Out for Delivery', desc: 'Courier rider is currently on delivery route.' },
    { key: 'delivered', title: 'Delivered', desc: 'Package safely delivered with confirmation signature.' },
  ];
  const index: Record<OrderStatus, number> = {
    placed: 0, confirmed: 1, processing: 2, shipped: 3, out_for_delivery: 4, delivered: 5,
  };
  const current = index[status] ?? 0;
  const date = new Date(createdAt);
  const dateStr = !Number.isNaN(date.getTime())
    ? date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : 'Recently';
  return steps.map((step, idx) => ({
    status: step.key,
    title: step.title,
    description: step.desc,
    date: idx === 0 ? dateStr : idx <= current ? 'In Progress' : 'Pending',
    completed: idx < current || (idx === current && status === 'delivered'),
    current: idx === current && status !== 'delivered',
  }));
}

function mapSupabaseOrderToOrder(so: Record<string, any>): Order {
  const status = normalizeStatus(so.status);
  const items: CartItem[] = Array.isArray(so.order_items)
    ? so.order_items.map((it: any) => {
        const found = PRODUCTS.find((p) => p.slug === it.product_slug || p.id === it.product_id);
        return {
          product: found || {
            id: it.product_id || it.id,
            slug: it.product_slug || 'handmade-piece',
            name: it.product_name || 'Handmade Jewelry',
            category: 'Bracelets',
            price: Number(it.unit_price) || 0,
            image: it.product_image || '',
            images: it.product_image ? [it.product_image] : [],
            description: 'Handmade artisanal jewelry crafted with love.',
            materials: [],
            stock: 0,
            inStock: true,
          },
          quantity: Number(it.quantity) || 1,
          selectedSize: it.size || 'Medium (6.5")',
          selectedFinish: it.finish || '18K Gold Plated',
        };
      })
    : [];

  const address = so.shipping_address || {};
  const payment = Array.isArray(so.payments) && so.payments.length ? so.payments[0] : null;
  const paymentMethodKey: PaymentMethodId =
    so.payment_method === 'jazzcash' ? PAYMENT_METHODS.JAZZCASH :
    so.payment_method === 'easypaisa' ? PAYMENT_METHODS.EASYPAISA :
    so.payment_method === 'bank_transfer' ? PAYMENT_METHODS.BANK_TRANSFER : PAYMENT_METHODS.COD;
  const paymentTitles: Record<PaymentMethodId, string> = {
    [PAYMENT_METHODS.COD]: 'Cash on Delivery (COD)',
    [PAYMENT_METHODS.EASYPAISA]: 'EasyPaisa Mobile Account',
    [PAYMENT_METHODS.JAZZCASH]: 'JazzCash Mobile Account',
    [PAYMENT_METHODS.BANK_TRANSFER]: 'Direct Bank Transfer',
  };

  return {
    id: so.id,
    orderNumber: so.order_number,
    createdAt: so.created_at || new Date().toISOString(),
    status,
    customer: {
      fullName: so.customer_name || address.full_name || 'Valued Patron',
      email: so.customer_email || '',
      phone: so.customer_phone || address.phone || '',
    },
    shippingAddress: {
      address: address.address_line_1 || address.address || '',
      city: address.city || '',
      postalCode: address.postal_code || '',
      province: address.state || '',
      country: address.country || 'Pakistan',
    },
    deliveryMethod: {
      id: so.delivery_method === 'express' ? 'express' : 'standard',
      title: so.delivery_method === 'express' ? 'Express Delivery (1–2 Days)' : 'Standard Tracked Delivery (2–4 Days)',
      cost: Number(so.shipping_fee) || 0,
      estimatedDays: so.delivery_method === 'express' ? '1–2 business days' : '2–4 business days',
    },
    paymentMethod: { id: paymentMethodKey, title: paymentTitles[paymentMethodKey] },
    items,
    subtotal: Number(so.subtotal) || 0,
    shippingCost: Number(so.shipping_fee) || 0,
    discount: Number(so.discount) || 0,
    couponCode: so.coupon_code || undefined,
    total: Number(so.total) || 0,
    paymentStatus: so.payment_status === 'paid' ? 'paid' : 'pending',
    transactionReference: payment?.transaction_reference || undefined,
    proofOfPaymentUrl: payment?.proof_of_payment_url || payment?.proof_of_payment_path || undefined,
    courierName: so.courier_name || undefined,
    trackingNumber: so.tracking_number || undefined,
    estimatedDelivery: so.estimated_delivery || undefined,
    timeline: buildTimeline(status, so.created_at || new Date().toISOString()),
    notes: so.notes || undefined,
  };
}

function requireSupabase() {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase is not configured. Orders require the Supabase backend.');
  }
}

export const orderService = {
  async getAllOrders(): Promise<Order[]> {
    requireSupabase();
    const currentUser = authService.getCurrentUser();
    let query = supabase
      .from('orders')
      .select('*, order_items(*), payments(*)')
      .order('created_at', { ascending: false });

    if (currentUser?.id && !currentUser.id.startsWith('usr-') && currentUser.role !== 'admin') {
      query = query.eq('user_id', currentUser.id);
    }

    const { data, error } = await query;
    if (error) throw error;
    return (data || []).map(mapSupabaseOrderToOrder);
  },

  async getOrder(lookupQuery: string, emailOrPhone?: string): Promise<Order | null> {
    return this.trackOrder(lookupQuery, emailOrPhone);
  },

  async trackOrder(orderNumber: string, phoneOrEmail?: string): Promise<Order | null> {
    requireSupabase();
    const cleanNumber = orderNumber.trim();
    if (!cleanNumber) return null;

    let query = supabase
      .from('orders')
      .select('*, order_items(*), payments(*)')
      .ilike('order_number', cleanNumber);

    if (phoneOrEmail?.trim()) {
      const contact = phoneOrEmail.trim();
      query = contact.includes('@')
        ? query.ilike('customer_email', contact)
        : query.ilike('customer_phone', `%${contact.replace(/\D/g, '')}%`);
    }

    const { data, error } = await query.maybeSingle();
    if (error) throw error;
    return data ? mapSupabaseOrderToOrder(data) : null;
  },

  async createOrder(orderPayload: CreateOrderPayload): Promise<Order> {
    requireSupabase();
    const currentUser = authService.getCurrentUser();
    const rpcPayload = {
      customer: {
        fullName: orderPayload.customer.fullName,
        name: orderPayload.customer.fullName,
        email: orderPayload.customer.email,
        phone: orderPayload.customer.phone,
      },
      shippingAddress: {
        full_name: orderPayload.customer.fullName,
        phone: orderPayload.customer.phone,
        address_line_1: orderPayload.shippingAddress.address,
        city: orderPayload.shippingAddress.city,
        state: orderPayload.shippingAddress.province || '',
        postal_code: orderPayload.shippingAddress.postalCode,
        country: orderPayload.shippingAddress.country || 'Pakistan',
      },
      deliveryMethod: orderPayload.deliveryMethod.id,
      paymentMethod: orderPayload.paymentMethod.id,
      transactionReference: orderPayload.transactionReference || null,
      proofOfPaymentUrl: orderPayload.proofOfPaymentUrl || null,
      couponCode: orderPayload.couponCode || null,
      notes: orderPayload.notes || null,
      userId: currentUser?.id && !currentUser.id.startsWith('usr-') ? currentUser.id : null,
      items: orderPayload.items.map((item) => ({
        productId: item.product.id,
        productSlug: item.product.slug,
        productName: item.product.name,
        price: item.product.price,
        quantity: item.quantity,
        selectedSize: item.selectedSize || 'Medium (6.5")',
        selectedFinish: item.selectedFinish || '18K Gold Plated',
        product: {
          id: item.product.id,
          name: item.product.name,
          slug: item.product.slug,
          price: item.product.price,
          sku: item.product.sku,
          image: item.product.image,
        },
      })),
    };

    const { data, error } = await supabase.rpc('place_order', { payload: rpcPayload });
    if (error) throw error;
    if (!data?.success || !data.order_id) {
      throw new Error(data?.message || 'The order could not be created.');
    }

    const { data: savedOrder, error: fetchError } = await supabase
      .from('orders')
      .select('*, order_items(*), payments(*)')
      .eq('id', data.order_id)
      .single();
    if (fetchError) throw fetchError;
    return mapSupabaseOrderToOrder(savedOrder);
  },
};
