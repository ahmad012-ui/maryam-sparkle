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
  storeName: 'Maryam Sparkle', tagline: 'Handcrafted Artistry & Delicate Jewelry', currency: 'PKR',
  adminName: 'Maryam Rehman', adminEmail: 'artisan@maryamsparkle.com', adminPhone: '+92 300 1234567',
  whatsappNumber: '+92 300 1234567', standardShippingFee: 250, freeShippingThreshold: 3500,
  expressShippingFee: 450, city: 'Karachi', country: 'Pakistan',
  courierPartners: ['Trax Logistics', 'TCS Express', 'Leopards Courier', 'Call Courier'],
};
const DEFAULT_THEME: AdminThemeConfig = { sidebarColor: 'teal', sidenavType: 'white', darkMode: false, navbarFixed: true };

let productsCache: AdminProduct[] = [];
let ordersCache: AdminOrder[] = [];
let customOrdersCache: AdminCustomOrder[] = [];
let customersCache: AdminCustomer[] = [];
let notificationsCache: AdminNotification[] = [];
let settingsCache = DEFAULT_SETTINGS;
let themeCache = DEFAULT_THEME;

const categorySlug = (category: AdminProduct['category']) => category === 'Custom Pieces' ? 'custom-pieces' : category.toLowerCase();
const categoryName = (slug?: string | null): AdminProduct['category'] => {
  const s = (slug || '').toLowerCase();
  if (s === 'anklets') return 'Anklets';
  if (s === 'necklaces') return 'Necklaces';
  if (s === 'earrings') return 'Earrings';
  if (s === 'rings') return 'Rings';
  if (s === 'custom-pieces' || s === 'custom') return 'Custom Pieces';
  return 'Bracelets';
};
const isUuid = (value: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
const paymentMethod = (v?: string): AdminOrder['paymentMethod'] => v === 'easypaisa' ? 'Easypaisa' : v === 'jazzcash' ? 'JazzCash' : v === 'bank_transfer' ? 'Bank Transfer' : 'COD';
const dbPaymentMethod = (v: AdminOrder['paymentMethod']) => v === 'Easypaisa' ? 'easypaisa' : v === 'JazzCash' ? 'jazzcash' : v === 'Bank Transfer' ? 'bank_transfer' : 'cod';
const orderStatus = (v?: string): AdminOrder['orderStatus'] => {
  switch ((v || '').toLowerCase()) {
    case 'confirmed': return 'Confirmed'; case 'processing': return 'Processing'; case 'shipped': return 'Shipped';
    case 'delivered': return 'Delivered'; case 'cancelled': return 'Cancelled'; default: return 'Placed';
  }
};
const dbOrderStatus = (v: AdminOrder['orderStatus']) => v.toLowerCase();
const customStatus = (v?: string): AdminCustomOrder['status'] => {
  switch ((v || '').toLowerCase()) {
    case 'reviewing': case 'quoted': return 'Quote Sent'; case 'approved': case 'in_progress': return 'In Production';
    case 'completed': return 'Completed'; case 'cancelled': return 'Declined'; default: return 'New Request';
  }
};
const dbCustomStatus = (v: AdminCustomOrder['status']) => v === 'Quote Sent' ? 'quoted' : v === 'In Production' ? 'in_progress' : v === 'Completed' ? 'completed' : v === 'Declined' ? 'cancelled' : 'pending';

async function fetchProducts(): Promise<AdminProduct[]> {
  const { data, error } = await supabase.from('products').select('*, product_images(*)').order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []).map((p: any) => {
    const images = (p.product_images || []).sort((a: any, b: any) => (a.sort_order || 0) - (b.sort_order || 0)).map((i: any) => i.image_url).filter(Boolean);
    return { id: p.id, sku: p.sku, name: p.name, category: categoryName(p.category_slug), price: Number(p.price) || 0,
      compareAtPrice: p.compare_at_price == null ? undefined : Number(p.compare_at_price), stock: Number(p.stock) || 0,
      image: images[0] || '', images, materials: p.materials || [], finish: p.finish || '', description: p.description || '',
      isFeatured: !!p.is_featured, isBestSeller: !!p.is_best_seller, inStock: !!p.in_stock, createdAt: p.created_at || '' };
  });
}

async function saveProducts(next: AdminProduct[]): Promise<void> {
  const { data: existing, error: existingError } = await supabase.from('products').select('id,slug');
  if (existingError) throw existingError;
  const existingIds = (existing || []).map((p: any) => p.id);
  const keepIds = next.filter((p) => isUuid(p.id)).map((p) => p.id);
  const deleted = existingIds.filter((id) => !keepIds.includes(id));
  if (deleted.length) { const { error } = await supabase.from('products').delete().in('id', deleted); if (error) throw error; }

  for (const p of next) {
    const existingRow = (existing || []).find((row: any) => row.id === p.id);
    const slug = existingRow?.slug || `${p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}-${p.sku.toLowerCase()}`;
    const row: Record<string, any> = { name: p.name.trim(), slug, description: p.description || '', price: p.price,
      compare_at_price: p.compareAtPrice ?? null, sku: p.sku, stock: Math.max(0, p.stock), materials: p.materials || [],
      finish: p.finish || null, is_featured: !!p.isFeatured, is_best_seller: !!p.isBestSeller, in_stock: p.stock > 0,
      category_slug: categorySlug(p.category), status: 'active' };
    if (isUuid(p.id)) row.id = p.id;
    const { data: saved, error } = await supabase.from('products').upsert(row, { onConflict: 'sku' }).select('id').single();
    if (error) throw error;
    const productId = saved.id;
    const { error: invError } = await supabase.from('inventory').upsert({ product_id: productId, quantity: Math.max(0, p.stock), updated_at: new Date().toISOString() }, { onConflict: 'product_id' });
    if (invError) throw invError;
    const { error: imageDeleteError } = await supabase.from('product_images').delete().eq('product_id', productId);
    if (imageDeleteError) throw imageDeleteError;
    const images = (p.images?.length ? p.images : [p.image]).filter(Boolean);
    if (images.length) {
      const { error: imageError } = await supabase.from('product_images').insert(images.map((url, i) => ({ product_id: productId, image_url: url, sort_order: i, is_primary: i === 0 })));
      if (imageError) throw imageError;
    }
  }
  productsCache = await fetchProducts();
}

async function fetchOrders(): Promise<AdminOrder[]> {
  const { data, error } = await supabase.from('orders').select('*, order_items(*), payments(*)').order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []).map((o: any) => {
    const a = o.shipping_address || {};
    return { id: o.id, orderNumber: o.order_number, date: o.created_at, customerName: o.customer_name, customerEmail: o.customer_email,
      customerPhone: o.customer_phone, city: a.city || '', address: a.address_line_1 || a.address || '',
      items: (o.order_items || []).map((i: any) => ({ productId: i.product_id || '', productName: i.product_name, image: i.product_image || '', quantity: Number(i.quantity) || 1, price: Number(i.unit_price) || 0, size: i.size || undefined, finish: i.finish || undefined })),
      totalAmount: Number(o.total) || 0, paymentMethod: paymentMethod(o.payment_method), paymentStatus: o.payment_status === 'paid' ? 'Paid' : 'Pending',
      orderStatus: orderStatus(o.status), courierName: o.courier_name || undefined, trackingNumber: o.tracking_number || undefined, notes: o.notes || undefined };
  });
}
async function saveOrders(next: AdminOrder[]): Promise<void> {
  for (const o of next) {
    if (!isUuid(o.id)) continue;
    const { error } = await supabase.from('orders').update({ status: dbOrderStatus(o.orderStatus), payment_status: o.paymentStatus === 'Paid' ? 'paid' : 'pending', payment_method: dbPaymentMethod(o.paymentMethod), courier_name: o.courierName || null, tracking_number: o.trackingNumber || null, notes: o.notes || null, updated_at: new Date().toISOString() }).eq('id', o.id);
    if (error) throw error;
    await supabase.from('payments').update({ status: o.paymentStatus === 'Paid' ? 'paid' : 'pending', method: dbPaymentMethod(o.paymentMethod), updated_at: new Date().toISOString() }).eq('order_id', o.id);
  }
  ordersCache = await fetchOrders();
}

async function fetchCustomOrders(): Promise<AdminCustomOrder[]> {
  const { data, error } = await supabase.from('custom_orders').select('*, custom_order_images(*)').order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []).map((c: any) => ({ id: c.id, requestNumber: `REQ-${String(c.id).slice(0, 8).toUpperCase()}`, customerName: c.customer_name,
    email: c.customer_email || '', phone: c.customer_phone, jewelryType: c.jewelry_type, preferredStones: c.preferred_stones || [],
    wristSize: c.wrist_size || '', metalFinish: c.metal_finish || '', notes: c.special_notes || '', budgetRange: c.budget_range || '', date: c.created_at,
    status: customStatus(c.status), quoteAmount: c.quote_amount == null ? undefined : Number(c.quote_amount),
    referenceImages: (c.custom_order_images || []).sort((a: any, b: any) => (a.sort_order || 0) - (b.sort_order || 0)).map((i: any) => i.image_url).filter(Boolean) }));
}
async function saveCustomOrders(next: AdminCustomOrder[]): Promise<void> {
  for (const o of next) {
    if (!isUuid(o.id)) continue;
    const { error } = await supabase.from('custom_orders').update({ status: dbCustomStatus(o.status), quote_amount: o.quoteAmount ?? null, updated_at: new Date().toISOString() }).eq('id', o.id);
    if (error) throw error;
  }
  customOrdersCache = await fetchCustomOrders();
}

async function fetchCustomers(): Promise<AdminCustomer[]> {
  const { data: profiles, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  const { data: orders, error: ordersError } = await supabase.from('orders').select('user_id,total');
  if (ordersError) throw ordersError;
  const aggregate = new Map<string, { count: number; spent: number }>();
  (orders || []).forEach((o: any) => { if (!o.user_id) return; const a = aggregate.get(o.user_id) || { count: 0, spent: 0 }; a.count++; a.spent += Number(o.total) || 0; aggregate.set(o.user_id, a); });
  return (profiles || []).filter((p: any) => p.role === 'customer').map((p: any) => { const a = aggregate.get(p.id) || { count: 0, spent: 0 }; return {
    id: p.id, name: p.full_name || [p.first_name, p.last_name].filter(Boolean).join(' ') || p.email, email: p.email, phone: p.phone || '', city: '',
    joinedDate: new Date(p.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }), totalOrders: a.count, totalSpent: a.spent,
    status: a.count === 0 ? 'New' : a.spent >= 10000 ? 'VIP' : 'Active', avatar: p.avatar_url || undefined }; });
}
async function saveCustomers(next: AdminCustomer[]): Promise<void> {
  for (const c of next) { if (!isUuid(c.id)) continue; const { error } = await supabase.from('profiles').update({ full_name: c.name, phone: c.phone || null, updated_at: new Date().toISOString() }).eq('id', c.id); if (error) throw error; }
  customersCache = await fetchCustomers();
}

function buildNotifications(): AdminNotification[] {
  const list: AdminNotification[] = [];
  ordersCache.slice(0, 10).forEach((o) => list.push({ id: `order-${o.id}`, type: 'order', title: `Order #${o.orderNumber} ${o.orderStatus}`, message: `${o.customerName} — PKR ${o.totalAmount.toLocaleString()}.`, timestamp: o.date, read: false, isRead: false, linkTab: 'orders', badge: o.paymentStatus === 'Paid' ? 'Paid' : 'Order', targetId: o.id }));
  customOrdersCache.slice(0, 10).forEach((o) => list.push({ id: `custom-${o.id}`, type: 'custom', title: `Bespoke Request ${o.requestNumber}`, message: `${o.customerName} requested ${o.jewelryType}.`, timestamp: o.date, read: false, isRead: false, linkTab: 'custom-orders', badge: 'Bespoke', targetId: o.id }));
  productsCache.filter((p) => p.stock <= 5).slice(0, 10).forEach((p) => list.push({ id: `stock-${p.id}`, type: 'stock', title: `Low Stock: ${p.name}`, message: `${p.stock} unit${p.stock === 1 ? '' : 's'} remaining.`, timestamp: new Date().toISOString(), read: false, isRead: false, linkTab: 'products', badge: 'Inventory', targetId: p.id }));
  return list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

async function loadSettings() {
  const { data, error } = await supabase.from('store_settings').select('settings').eq('id', 'default').maybeSingle();
  if (!error && data?.settings) { settingsCache = { ...DEFAULT_SETTINGS, ...(data.settings.storeSettings || data.settings) }; if (data.settings.theme) themeCache = { ...DEFAULT_THEME, ...data.settings.theme }; }
}
async function saveSettings(next: StoreSettings) {
  settingsCache = next;
  const { error } = await supabase.from('store_settings').upsert({ id: 'default', settings: { storeSettings: settingsCache, theme: themeCache }, updated_at: new Date().toISOString() });
  if (error) throw error;
}
async function saveTheme(next: AdminThemeConfig) {
  themeCache = next;
  const { error } = await supabase.from('store_settings').upsert({ id: 'default', settings: { storeSettings: settingsCache, theme: themeCache }, updated_at: new Date().toISOString() });
  if (error) throw error;
}

export const adminStorage = {
  async hydrate() {
    await loadSettings();
    [productsCache, ordersCache, customOrdersCache, customersCache] = await Promise.all([fetchProducts(), fetchOrders(), fetchCustomOrders(), fetchCustomers()]);
    notificationsCache = buildNotifications();
    return { products: productsCache, orders: ordersCache, customOrders: customOrdersCache, customers: customersCache, notifications: notificationsCache };
  },
  getThemeConfig: () => themeCache,
  getSettings: () => settingsCache,
  getProducts: () => productsCache,
  getOrders: () => ordersCache,
  getCustomOrders: () => customOrdersCache,
  getCustomers: () => customersCache,
  getNotifications: () => notificationsCache,
  saveProducts,
  saveOrders,
  saveCustomOrders,
  saveCustomers,
  saveNotifications: async (next: AdminNotification[]) => { notificationsCache = next; },
  saveSettings,
  saveThemeConfig: saveTheme,
  resetToDefaults: async () => {
    settingsCache = DEFAULT_SETTINGS; themeCache = DEFAULT_THEME;
    const { error } = await supabase.from('store_settings').upsert({ id: 'default', settings: { storeSettings: settingsCache, theme: themeCache }, updated_at: new Date().toISOString() });
    if (error) throw error;
  },
};
