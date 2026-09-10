import { Order, CartItem, OrderTimelineStep, OrderStatus, PaymentMethodId, PAYMENT_METHODS } from '../types';
import { PRODUCTS } from '../data/products';
import { adminStorage } from '../admin/adminData';
import { AdminOrder, AdminNotification } from '../admin/types';
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

/**
 * Normalizes backend/admin order status to frontend OrderStatus
 */
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

function mapSupabaseOrderToOrder(so: Record<string, any>): Order {
  const normStatus = normalizeStatus(so.status);
  const items: CartItem[] = Array.isArray(so.order_items) && so.order_items.length > 0
    ? so.order_items.map((it: any) => {
        const found = PRODUCTS.find((p) => p.slug === it.product_slug || p.id === it.product_id);
        return {
          product: found || {
            id: it.product_id || it.id,
            slug: it.product_slug || 'handmade-piece',
            name: it.product_name || 'Handmade Jewelry',
            category: 'Bracelets',
            price: parseFloat(it.unit_price) || 0,
            image: it.product_image || PRODUCTS[0]?.image || '',
            images: it.product_image ? [it.product_image] : [PRODUCTS[0]?.image || ''],
            description: 'Handmade artisanal jewelry crafted with love in our Karachi atelier.',
            materials: ['Glass Beads', 'Gold-Tone Accents'],
            stock: 10,
            inStock: true,
          },
          quantity: parseInt(it.quantity, 10) || 1,
          selectedSize: it.size || 'Medium (6.5")',
          selectedFinish: it.finish || '18K Gold Plated',
        };
      })
    : [];

  const rawAddr = so.shipping_address || {};
  const paymentRecord = Array.isArray(so.payments) && so.payments.length > 0 ? so.payments[0] : null;

  const paymentMethodKey: PaymentMethodId =
    so.payment_method === 'jazzcash'
      ? PAYMENT_METHODS.JAZZCASH
      : so.payment_method === 'easypaisa'
      ? PAYMENT_METHODS.EASYPAISA
      : so.payment_method === 'bank_transfer'
      ? PAYMENT_METHODS.BANK_TRANSFER
      : PAYMENT_METHODS.COD;

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
    status: normStatus,
    customer: {
      fullName: so.customer_name || rawAddr.full_name || 'Valued Patron',
      email: so.customer_email || '',
      phone: so.customer_phone || rawAddr.phone || '',
    },
    shippingAddress: {
      address: rawAddr.address_line_1 || rawAddr.address || '',
      city: rawAddr.city || 'Karachi',
      postalCode: rawAddr.postal_code || '75500',
      province: rawAddr.state || 'Sindh',
      country: rawAddr.country || 'Pakistan',
    },
    deliveryMethod: {
      id: so.delivery_method === 'express' ? 'express' : 'standard',
      title: so.delivery_method === 'express' ? 'Express Delivery (1–2 Days)' : 'Standard Tracked Delivery (2–4 Days)',
      cost: parseFloat(so.shipping_fee) || 200,
      estimatedDays: so.delivery_method === 'express' ? '1–2 business days' : '2–4 business days',
    },
    paymentMethod: {
      id: paymentMethodKey,
      title: paymentTitles[paymentMethodKey] || 'Cash on Delivery (COD)',
    },
    items,
    subtotal: parseFloat(so.subtotal) || 0,
    shippingCost: parseFloat(so.shipping_fee) || 0,
    discount: parseFloat(so.discount) || 0,
    couponCode: so.coupon_code || undefined,
    total: parseFloat(so.total) || 0,
    paymentStatus: (so.payment_status || 'pending').toLowerCase() === 'paid' ? 'paid' : 'pending',
    transactionReference: paymentRecord?.transaction_reference || undefined,
    proofOfPaymentUrl: paymentRecord?.proof_of_payment_url || paymentRecord?.proof_of_payment_path || undefined,
    courierName: so.courier_name || undefined,
    trackingNumber: so.tracking_number || undefined,
    estimatedDelivery: so.estimated_delivery || undefined,
    timeline: buildTimeline(normStatus, so.created_at || new Date().toISOString()),
    notes: so.notes || undefined,
  };
}

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
      selectedFinish: it.finish || '18K Gold Plated',
    };
  });

  const paymentMethodKey: PaymentMethodId =
    ao.paymentMethod === 'JazzCash'
      ? PAYMENT_METHODS.JAZZCASH
      : ao.paymentMethod === 'Easypaisa'
      ? PAYMENT_METHODS.EASYPAISA
      : ao.paymentMethod === 'Bank Transfer'
      ? PAYMENT_METHODS.BANK_TRANSFER
      : PAYMENT_METHODS.COD;

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
      postalCode: '75500',
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

export const orderService = {
  /**
   * Get all orders for the current customer or all orders if admin
   */
  async getAllOrders(): Promise<Order[]> {
    if (isSupabaseConfigured()) {
      try {
        const currentUser = authService.getCurrentUser();
        let query = supabase
          .from('orders')
          .select(`
            *,
            order_items (*),
            payments (*)
          `)
          .order('created_at', { ascending: false });

        if (currentUser?.id && !currentUser.id.startsWith('usr-') && currentUser.role !== 'admin') {
          query = query.eq('user_id', currentUser.id);
        }

        const { data, error } = await query;
        if (!error && data && data.length > 0) {
          return data.map(mapSupabaseOrderToOrder);
        }
      } catch (err) {
        console.warn('Supabase getAllOrders fallback to local storage:', err);
      }
    }

    const localOrders = adminStorage.getOrders();
    return localOrders.map(mapAdminOrderToOrder);
  },

  /**
   * Look up order by ID or orderNumber
   */
  async getOrder(lookupQuery: string, emailOrPhone?: string): Promise<Order | null> {
    return this.trackOrder(lookupQuery, emailOrPhone);
  },

  /**
   * Search order specifically for track page with orderNumber + optional phone/email
   */
  async trackOrder(orderNumber: string, phoneOrEmail?: string): Promise<Order | null> {
    const cleanNum = orderNumber.trim();
    if (!cleanNum) return null;

    if (isSupabaseConfigured()) {
      try {
        let query = supabase
          .from('orders')
          .select(`
            *,
            order_items (*),
            payments (*)
          `)
          .ilike('order_number', cleanNum);

        if (phoneOrEmail) {
          const cleanContact = phoneOrEmail.trim();
          if (cleanContact.includes('@')) {
            query = query.ilike('customer_email', cleanContact);
          } else {
            query = query.ilike('customer_phone', `%${cleanContact.replace(/\D/g, '')}%`);
          }
        }

        const { data, error } = await query.maybeSingle();
        if (!error && data) {
          return mapSupabaseOrderToOrder(data);
        }
      } catch (err) {
        console.warn('Supabase order tracking query fallback:', err);
      }
    }

    // Local fallback
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

    return null;
  },

  /**
   * Create a new order with order_items and payments records in Supabase
   */
  async createOrder(orderPayload: CreateOrderPayload): Promise<Order> {
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
      transactionReference: orderPayload.transactionReference,
      proofOfPaymentUrl: orderPayload.proofOfPaymentUrl,
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

    // 1. Always update local adminStorage for instant reactive admin view
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

    // 2. Persist to Supabase Database
    if (isSupabaseConfigured()) {
      try {
        const currentUser = authService.getCurrentUser();
        const validUserId = currentUser?.id && !currentUser.id.startsWith('usr-') ? currentUser.id : null;

        // Try atomic server-side RPC first
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
            state: orderPayload.shippingAddress.province || 'Sindh',
            postal_code: orderPayload.shippingAddress.postalCode,
            country: orderPayload.shippingAddress.country || 'Pakistan',
          },
          deliveryMethod: orderPayload.deliveryMethod.id,
          paymentMethod: orderPayload.paymentMethod.id,
          transactionReference: orderPayload.transactionReference || null,
          proofOfPaymentUrl: orderPayload.proofOfPaymentUrl || null,
          couponCode: orderPayload.couponCode || null,
          notes: orderPayload.notes || null,
          items: orderPayload.items.map((it) => ({
            productId: it.product.id,
            productSlug: it.product.slug,
            productName: it.product.name,
            price: it.product.price,
            quantity: it.quantity,
            selectedSize: it.selectedSize || 'Medium (6.5")',
            selectedFinish: it.selectedFinish || '18K Gold Plated',
            product: {
              id: it.product.id,
              name: it.product.name,
              slug: it.product.slug,
              price: it.product.price,
              sku: it.product.sku,
              image: it.product.image,
            },
          })),
        };

        const { data: rpcResult, error: rpcError } = await supabase.rpc('place_order', {
          payload: rpcPayload,
        });

        if (!rpcError && rpcResult?.order_id) {
          newOrder.id = rpcResult.order_id;
          newOrder.orderNumber = rpcResult.order_number || orderNumber;
          if (rpcResult.total !== undefined) {
            newOrder.total = Number(rpcResult.total);
            newOrder.subtotal = Number(rpcResult.subtotal);
            newOrder.shippingCost = Number(rpcResult.shipping_fee);
            newOrder.discount = Number(rpcResult.discount);
          }
        } else {
          // Fallback to direct table insertion
          const { data: insertedOrder, error: orderError } = await supabase
            .from('orders')
            .insert({
              order_number: orderNumber,
              user_id: validUserId,
              customer_name: orderPayload.customer.fullName,
              customer_email: orderPayload.customer.email,
              customer_phone: orderPayload.customer.phone,
              subtotal: orderPayload.subtotal,
              shipping_fee: orderPayload.shippingCost,
              discount: orderPayload.discount,
              coupon_code: orderPayload.couponCode || null,
              total: orderPayload.total,
              status: 'placed',
              payment_status: 'pending',
              payment_method: orderPayload.paymentMethod.id,
              shipping_address: {
                full_name: orderPayload.customer.fullName,
                phone: orderPayload.customer.phone,
                address_line_1: orderPayload.shippingAddress.address,
                city: orderPayload.shippingAddress.city,
                state: orderPayload.shippingAddress.province || 'Sindh',
                postal_code: orderPayload.shippingAddress.postalCode,
                country: orderPayload.shippingAddress.country || 'Pakistan',
              },
              delivery_method: orderPayload.deliveryMethod.id,
              notes: orderPayload.notes || null,
            })
            .select()
            .single();

          if (orderError) {
            console.error('Supabase order creation error:', orderError);
          } else if (insertedOrder?.id) {
            // Insert order items
            const itemRows = orderPayload.items.map((it) => ({
              order_id: insertedOrder.id,
              product_id: it.product.id.startsWith('prod-') ? null : it.product.id,
              product_name: it.product.name,
              product_slug: it.product.slug,
              product_image: it.product.image,
              sku: it.product.sku || `MS-${it.product.name.slice(0, 3).toUpperCase()}`,
              quantity: it.quantity,
              unit_price: it.product.price,
              subtotal: it.product.price * it.quantity,
              size: it.selectedSize || 'Medium (6.5")',
              finish: it.selectedFinish || '18K Gold Plated',
            }));

            await supabase.from('order_items').insert(itemRows);

            // Insert payment record
            await supabase.from('payments').insert({
              order_id: insertedOrder.id,
              transaction_reference: orderPayload.transactionReference || null,
              proof_of_payment_path: orderPayload.proofOfPaymentUrl || null,
              proof_of_payment_url: orderPayload.proofOfPaymentUrl || null,
              amount: orderPayload.total,
              method: orderPayload.paymentMethod.id,
              status: 'pending',
            });

            newOrder.id = insertedOrder.id;
          }
        }
      } catch (dbErr) {
        console.warn('Failed to insert into Supabase orders:', dbErr);
      }
    }

    return newOrder;
  },
};
