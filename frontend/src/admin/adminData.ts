import {
  AdminProduct,
  AdminOrder,
  AdminCustomOrder,
  AdminCustomer,
  AdminNotification,
  StoreSettings,
  AdminThemeConfig,
} from './types';
import { supabase } from '../lib/supabase';

const DEFAULT_SETTINGS: StoreSettings = {
  storeName: 'Maryam Sparkle',
  tagline: 'Handcrafted Artistry & Delicate Jewelry',
  currency: 'PKR',
  adminName: 'Maryam Rehman',
  adminEmail: 'artisan@maryamsparkle.com',
  adminPhone: '+92 300 1234567',
  whatsappNumber: '+92 300 1234567',
  standardShippingFee: 250,
  freeShippingThreshold: 3500,
  expressShippingFee: 450,
  city: 'Karachi',
  country: 'Pakistan',
  courierPartners: ['Trax Logistics', 'TCS Express', 'Leopards Courier', 'Call Courier'],
};

const DEFAULT_THEME: AdminThemeConfig = {
  sidebarColor: 'teal',
  sidenavType: 'white',
  darkMode: false,
  navbarFixed: true,
};

let settingsCache = DEFAULT_SETTINGS;
let themeCache = DEFAULT_THEME;
let notificationsCache: AdminNotification[] = [];

const categorySlug = (category: AdminProduct['category']) =>
  category === 'Custom Pieces' ? 'custom-pieces' : category.toLowerCase();

const categoryName = (slug?: string | null): AdminProduct['category'] => {
  const normalized = (slug || '').toLowerCase();
  if (normalized === 'anklets') return 'Anklets';
  if (normalized === 'necklaces') return 'Necklaces';
  if (normalized === 'earrings') return 'Earrings';
  if (normalized === 'rings') return 'Rings';
  if (normalized === 'custom-pieces' || normalized === 'custom') return 'Custom Pieces';
  return 'Bracelets';
};

const paymentMethod = (value?: string): AdminOrder['paymentMethod'] => {
  if (value === 'easypaisa') return 'Easypaisa';
  if (value === 'jazzcash') return 'JazzCash';
  if (value === 'bank_transfer') return 'Bank Transfer';
  return 'COD';
};

const dbPaymentMethod = (value: AdminOrder['paymentMethod']) => {
  if (value === 'Easypaisa') return 'easypaisa';
  if (value === 'JazzCash') return 'jazzcash';
  if (value === 'Bank Transfer') return 'bank_transfer';
  return 'cod';
};

const orderStatus = (value?: string): AdminOrder['orderStatus'] => {
  const normalized = (value || '').toLowerCase();
  if (normalized === 'confirmed') return 'Confirmed';
  if (normalized === 'processing') return 'Processing';
  if (normalized === 'shipped') return 'Shipped';
  if (normalized === 'delivered') return 'Delivered';
  if (normalized === 'cancelled') return 'Cancelled';
  return 'Placed';
};

const dbOrderStatus = (value: AdminOrder['orderStatus']) => value.toLowerCase();

const customStatus = (value?: string): AdminCustomOrder['status'] => {
  switch ((value || '').toLowerCase()) {
    case 'reviewing': return 'Quote Sent';
    case 'quoted': return 'Quote Sent';
    case 'approved': return 'In Production';
    case 'in_progress': return 'In Production';
    case 'completed': return 'Completed';
    case 'cancelled': return 'Declined';
    default: return 'New Request';
  }
};

const dbCustomStatus = (value: AdminCustomOrder['status']) => {
  switch (value) {
    case 'Quote Sent': return 'quoted';
    case 'In Production': return 'in_progress';
    case 'Completed': return 'completed';
    case 'Declined': return 'cancelled';
    default: return 'pending';
  }
};

const isUuid = (value: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);

async function getProducts(): Promise<AdminProduct[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*, product_images(*)')
    .order('created_at', { ascending: false });
  if (error) throw error;

  return (data || []).map((p: any) => {
    const images = (p.product_images || [])
      .sort((a: any, b: any) => (a.sort_order || 0) - (b.sort_order || 0))
      .map((img: any) => img.image_url)
      .filter(Boolean);
    return {
      id: p.id,
      sku: p.sku,
      name: p.name,
      category: categoryName(p.category_slug),
      price: Number(p.price) || 0,
      compareAtPrice: p.compare_at_price == null ? undefined : Number(p.compare_at_price),
      stock: Number(p.stock) || 0,
      image: images[0] || '',
      images,
      materials: p.materials || [],
      finish: p.finish || '',
      description: p.description || '',
      isFeatured: !!p.is_featured,
      isBestSeller: !!p.is_best_seller,
      inStock: !!p.in_stock,
      createdAt: p.created_at || new Date().toISOString(),
    };
  });
}

async function saveProducts(products: AdminProduct[]): Promise<void> {
  const { data: existing, error: existingError } = await supabase.from('products').select('id');
  if (existingError) throw existingError;
  const existingIds = (existing || []).map((p: any) => p.id);
  const keepIds = products.filter((p) => isUuid(p.id)).map((p) => p.id);
  const deletedIds = existingIds.filter((id) => !keepIds.includes(id));

  if (deletedIds.length) {
    const { error } = await supabase.from('products').delete().in('id', deletedIds);
    if (error) throw error;
  }

  for (const product of products) {
    const row: Record<string, any> = {
      name: product.name.trim(),
      slug: product.id && isUuid(product.id) ? product.id : `${product.sku.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now()}`,
      description: product.description || '',
      price: product.price,
      compare_at_price: product.compareAtPrice ?? null,
      sku: product.sku,
      stock: Math.max(0, product.stock),
      materials: product.materials || [],
      finish: product.finish || null,
      is_featured: !!product.isFeatured,
      is_best_seller: !!product.isBestSeller,
      in_stock: product.stock > 0,
      category_slug: categorySlug(product.category),
      status: 'active',
    };
    if (isUuid(product.id)) row.id = product.id;

    const { data: saved, error } = await supabase.from('products').upsert(row, { onConflict: 'sku' }).select('id').single();
    if (error) throw error;
    const productId = saved.id;

    await supabase.from('inventory').upsert(
      { product_id: productId, quantity: Math.max(0, product.stock), updated_at: new Date().toISOString() },
      { onConflict: 'product_id' }
    );

    const { error: imageDeleteError } = await supabase.from('product_images').delete().eq('product_id', productId);
    if (imageDeleteError) throw imageDeleteError;

    const images = (product.images?.length ? product.images : [product.image]).filter(Boolean);
    if (images.length) {
      const { error: imageError } = await supabase.from('product_images').insert(
        images.map((url, index) => ({ product_id: productId, image_url: url, sort_order: index, is_primary: index === 0 }))
      );
      if (imageError) throw imageError;
    }
  }
}

async function getOrders(): Promise<AdminOrder[]> {
  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(*), payments(*)')
    .order('created_at', { ascending: false });
  if (error) throw error;

  return (data || []).map((o: any) => {
    const address = o.shipping_address || {};
    return {
      id: o.id,
      orderNumber: o.order_number,
      date: o.created_at,
      customerName: o.customer_name,
      customerEmail: o.customer_email,
      customerPhone: o.customer_phone,
      city: address.city || '',
      address: address.address_line_1 || address.address || '',
      items: (o.order_items || []).map((item: any) => ({
        productId: item.product_id || '',
        productName: item.product_name,
        image: item.product_image || '',
        quantity: Number(item.quantity) || 1,
        price: Number(item.unit_price) || 0,
        size: item.size || undefined,
        finish: item.finish || undefined,
      })),
      totalAmount: Number(o.total) || 0,
      paymentMethod: paymentMethod(o.payment_method),
      paymentStatus: o.payment_status === 'paid' ? 'Paid' : 'Pending',
      orderStatus: orderStatus(o.status),
      courierName: o.courier_name || undefined,
      trackingNumber: o.tracking_number || undefined,
      notes: o.notes || undefined,
    };
  });
}

async function saveOrders(orders: AdminOrder[]): Promise<void> {
  for (const order of orders) {
    if (!isUuid(order.id)) continue;
    const { error } = await supabase.from('orders').update({
      status: dbOrderStatus(order.orderStatus),
      payment_status: order.paymentStatus === 'Paid' ? 'paid' : 'pending',
      payment_method: dbPaymentMethod(order.paymentMethod),
      courier_name: order.courierName || null,
      tracking_number: order.trackingNumber || null,
      notes: order.notes || null,
      updated_at: new Date().toISOString(),
    }).eq('id', order.id);
    if (error) throw error;

    const { error: paymentError } = await supabase.from('payments').update({
      status: order.paymentStatus === 'Paid' ? 'paid' : 'pending',
      method: dbPaymentMethod(order.paymentMethod),
      updated_at: new Date().toISOString(),
    }).eq('order_id', order.id);
    if (paymentError) console.warn('Payment sync skipped:', paymentError.message);
  }
}

async function getCustomOrders(): Promise<AdminCustomOrder[]> {
  const { data, error } = await supabase
    .from('custom_orders')
    .select('*, custom_order_images(*)')
    .order('created_at', { ascending: false });
  if (error) throw error;

  return (data || []).map((c: any) => ({
    id: c.id,
    requestNumber: `REQ-${String(c.id).slice(0, 8).toUpperCase()}`,
    customerName: c.customer_name,
    email: c.customer_email || '',
    phone: c.customer_phone,
    jewelryType: c.jewelry_type,
    preferredStones: c.preferred_stones || [],
    wristSize: c.wrist_size || '',
    metalFinish: c.metal_finish || '',
    notes: c.special_notes || '',
    budgetRange: c.budget_range || '',
    date: c.created_at,
    status: customStatus(c.status),
    quoteAmount: c.quote_amount == null ? undefined : Number(c.quote_amount),
    referenceImages: (c.custom_order_images || [])
      .sort((a: any, b: any) => (a.sort_order || 0) - (b.sort_order || 0))
      .map((i: any) => i.image_url)
      .filter(Boolean),
  }));
}

async function saveCustomOrders(customOrders: AdminCustomOrder[]): Promise<void> {
  for (const order of customOrders) {
    if (!isUuid(order.id)) continue;
    const { error } = await supabase.from('custom_orders').update({
      status: dbCustomStatus(order.status),
      quote_amount: order.quoteAmount ?? null,
      updated_at: new Date().toISOString(),
    }).eq('id', order.id);
    if (error) throw error;
  }
}

async function getCustomers(): Promise<AdminCustomer[]> {
  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;

  const { data: orders, error: ordersError } = await supabase.from('orders').select('user_id,total');
  if (ordersError) throw ordersError;

  const aggregates = new Map<string, { count: number; spent: number }>();
  (orders || []).forEach((o: any) => {
    if (!o.user_id) return;
    const current = aggregates.get(o.user_id) || { count: 0, spent: 0 };
    current.count += 1;
    current.spent += Number(o.total) || 0;
    aggregates.set(o.user_id, current);
  });

  return (profiles || []).filter((p: any) => p.role === 'customer').map((p: any) => {
    const aggregate = aggregates.get(p.id) || { count: 0, spent: 0 };
    return {
      id: p.id,
      name: p.full_name || [p.first_name, p.last_name].filter(Boolean).join(' ') || p.email,
      email: p.email,
      phone: p.phone || '',
      city: '',
      joinedDate: new Date(p.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      totalOrders: aggregate.count,
      totalSpent: aggregate.spent,
      status: aggregate.count === 0 ? 'New' : aggregate.spent >= 10000 ? 'VIP' : 'Active',
      avatar: p.avatar_url || undefined,
    };
  });
}

async function saveCustomers(customers: AdminCustomer[]): Promise<void> {
  for (const customer of customers) {
    if (!isUuid(customer.id)) continue;
    const { error } = await supabase.from('profiles').update({
      full_name: customer.name,
      phone: customer.phone || null,
      updated_at: new Date().toISOString(),
    }).eq('id', customer.id);
    if (error) throw error;
  }
}

async function getNotifications(products: AdminProduct[], orders: AdminOrder[], customOrders: AdminCustomOrder[]): Promise<AdminNotification[]> {
  const notifications: AdminNotification[] = [];
  orders.slice(0, 10).forEach((order) => {
    notifications.push({
      id: `order-${order.id}`,
      type: 'order',
      title: `Order #${order.orderNumber} ${order.orderStatus}`,
      message: `${order.customerName} — PKR ${order.totalAmount.toLocaleString()}.`,
      timestamp: order.date,
      read: false,
      isRead: false,
      linkTab: 'orders',
      badge: order.paymentStatus === 'Paid' ? 'Paid' : 'Order',
      targetId: order.id,
    });
  });
  customOrders.slice(0, 10).forEach((order) => {
    notifications.push({
      id: `custom-${order.id}`,
      type: 'custom',
      title: `Bespoke Request ${order.requestNumber}`,
      message: `${order.customerName} requested ${order.jewelryType}.`,
      timestamp: order.date,
      read: false,
      isRead: false,
      linkTab: 'custom-orders',
      badge: 'Bespoke',
      targetId: order.id,
    });
  });
  products.filter((p) => p.stock <= 5).slice(0, 10).forEach((product) => {
    notifications.push({
      id: `stock-${product.id}`,
      type: 'stock',
      title: `Low Stock: ${product.name}`,
      message: `${product.stock} unit${product.stock === 1 ? '' : 's'} remaining.`,
      timestamp: new Date().toISOString(),
      read: false,
      isRead: false,
      linkTab: 'products',
      badge: 'Inventory',
      targetId: product.id,
    });
  });
  return notifications.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

async function loadSettings(): Promise<void> {
  const { data, error } = await supabase.from('store_settings').select('settings').eq('id', 'default').maybeSingle();
  if (!error && data?.settings) {
    settingsCache = { ...DEFAULT_SETTINGS, ...(data.settings.storeSettings || data.settings) };
    if (data.settings.theme) themeCache = { ...DEFAULT_THEME, ...data.settings.theme };
  }
}

async function saveSettings(settings: StoreSettings): Promise<void> {
  settingsCache = settings;
  const { error } = await supabase.from('store_settings').upsert({
    id: 'default',
    settings: { storeSettings: settings, theme: themeCache },
    updated_at: new Date().toISOString(),
  });
  if (error) throw error;
}

async function saveTheme(theme: AdminThemeConfig): Promise<void> {
  themeCache = theme;
  const { error } = await supabase.from('store_settings').upsert({
    id: 'default',
    settings: { storeSettings: settingsCache, theme },
    updated_at: new Date().toISOString(),
  });
  if (error) throw error;
}

export const adminStorage = {
  async hydrate() {
    await loadSettings();
    const [products, orders, customOrders, customers] = await Promise.all([
      getProducts(),
      getOrders(),
      getCustomOrders(),
      getCustomers(),
    ]);
    notificationsCache = await getNotifications(products, orders, customOrders);
    return { products, orders, customOrders, customers, notifications: notificationsCache };
  },
  getThemeConfig: () => themeCache,
  getSettings: () => settingsCache,
  getProducts,
  getOrders,
  getCustomOrders,
  getCustomers,
  getNotifications: async () => notificationsCache,
  saveProducts,
  saveOrders,
  saveCustomOrders,
  saveCustomers,
  saveNotifications: async (notifs: AdminNotification[]) => {
    notificationsCache = notifs;
  },
  saveSettings,
  saveThemeConfig: saveTheme,
  resetToDefaults: async () => {
    settingsCache = DEFAULT_SETTINGS;
    themeCache = DEFAULT_THEME;
    await supabase.from('store_settings').upsert({
      id: 'default',
      settings: { storeSettings: settingsCache, theme: themeCache },
      updated_at: new Date().toISOString(),
    });
  },
};
