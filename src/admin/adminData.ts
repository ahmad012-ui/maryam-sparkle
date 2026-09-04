import { PRODUCTS } from '../data/products';
import {
  AdminProduct,
  AdminOrder,
  AdminCustomOrder,
  AdminCustomer,
  AdminNotification,
  StoreSettings,
  AdminThemeConfig,
} from './types';

const STORAGE_KEYS = {
  PRODUCTS: 'maryam_sparkle_admin_products_v1',
  ORDERS: 'maryam_sparkle_admin_orders_v1',
  CUSTOM_ORDERS: 'maryam_sparkle_admin_custom_orders_v1',
  CUSTOMERS: 'maryam_sparkle_admin_customers_v1',
  NOTIFICATIONS: 'maryam_sparkle_admin_notifications_v1',
  SETTINGS: 'maryam_sparkle_admin_settings_v1',
  THEME: 'maryam_sparkle_admin_theme_v1',
};

// Initial Products derived from PRODUCTS catalog
const INITIAL_PRODUCTS: AdminProduct[] = PRODUCTS.map((p, idx) => ({
  id: p.id,
  sku: p.sku || `MS-${p.category.substring(0, 3).toUpperCase()}-${String(idx + 1).padStart(3, '0')}`,
  name: p.name,
  category: p.category,
  price: p.price,
  compareAtPrice: p.compareAtPrice || p.originalPrice || undefined,
  stock: p.stock ?? (idx % 3 === 0 ? 4 : idx % 5 === 0 ? 0 : 18),
  image: p.image,
  images: [
    p.image,
    'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=500&auto=format&fit=crop&q=60',
    'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=500&auto=format&fit=crop&q=60',
  ],
  materials: p.materials || ['Glass beads', 'Gold-plated wire'],
  finish: p.finish || '18K Gold Plated',
  description: p.description,
  isFeatured: p.isFeatured,
  isBestSeller: p.isBestSeller,
  inStock: p.inStock,
  createdAt: '2026-08-15',
}));

// Initial realistic Pakistani jewelry store orders
const INITIAL_ORDERS: AdminOrder[] = [
  {
    id: 'ord-101',
    orderNumber: 'MS-9821',
    date: '2026-09-03',
    customerName: 'Areeba Tariq',
    customerEmail: 'areeba.tariq@gmail.com',
    customerPhone: '+92 321 4455890',
    city: 'Lahore',
    address: 'House 42, Block C, Phase 5, DHA',
    items: [
      {
        productId: '1',
        productName: 'Pearl & Aventurine Stacking Bracelet',
        image: 'https://images.unsplash.com/photo-1611591475819-797de2338ec8?w=500&auto=format&fit=crop&q=60',
        quantity: 2,
        price: 2450,
        size: 'Medium (6.5")',
        finish: '18K Gold Plated',
      },
    ],
    totalAmount: 4900,
    paymentMethod: 'COD',
    paymentStatus: 'Pending',
    orderStatus: 'Confirmed',
    courierName: 'Trax Logistics',
    trackingNumber: 'TRX-994821',
    notes: 'Please double-box for delicate beads. Call before delivery.',
  },
  {
    id: 'ord-102',
    orderNumber: 'MS-9820',
    date: '2026-09-02',
    customerName: 'Zainab Fatima',
    customerEmail: 'zainab.fatima@yahoo.com',
    customerPhone: '+92 300 8765432',
    city: 'Karachi',
    address: 'Apartment 4B, Creek Vistas, Phase 8, DHA',
    items: [
      {
        productId: '2',
        productName: 'Rose Quartz & Seed Bead Choker',
        image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=500&auto=format&fit=crop&q=60',
        quantity: 1,
        price: 3200,
        finish: 'Rose Gold Plated',
      },
      {
        productId: '3',
        productName: 'Delicate Golden Bell Anklet',
        image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=500&auto=format&fit=crop&q=60',
        quantity: 1,
        price: 1850,
        size: 'Standard (9")',
      },
    ],
    totalAmount: 5050,
    paymentMethod: 'Easypaisa',
    paymentStatus: 'Paid',
    orderStatus: 'Processing',
    courierName: 'TCS Express',
    trackingNumber: 'TCS-8812903',
  },
  {
    id: 'ord-103',
    orderNumber: 'MS-9819',
    date: '2026-09-01',
    customerName: 'Hira Shah',
    customerEmail: 'hira.shah@hotmail.com',
    customerPhone: '+92 333 1239876',
    city: 'Islamabad',
    address: 'Sector F-7/2, Street 18, House 9',
    items: [
      {
        productId: '4',
        productName: 'Lapis Lazuli Bohemian Statement Drop',
        image: 'https://images.unsplash.com/photo-1630019852942-f89202989a59?w=500&auto=format&fit=crop&q=60',
        quantity: 1,
        price: 2750,
      },
    ],
    totalAmount: 2750,
    paymentMethod: 'JazzCash',
    paymentStatus: 'Paid',
    orderStatus: 'Shipped',
    courierName: 'Leopards Courier',
    trackingNumber: 'LCS-549102',
  },
  {
    id: 'ord-104',
    orderNumber: 'MS-9818',
    date: '2026-08-31',
    customerName: 'Maham Qureshi',
    customerEmail: 'maham.q@gmail.com',
    customerPhone: '+92 345 6789012',
    city: 'Rawalpindi',
    address: 'House 112, Bahria Town Phase 4',
    items: [
      {
        productId: '5',
        productName: 'Hand-Woven Micro-Beaded Ring Set (Trio)',
        image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=500&auto=format&fit=crop&q=60',
        quantity: 1,
        price: 1650,
      },
    ],
    totalAmount: 1650,
    paymentMethod: 'COD',
    paymentStatus: 'Paid',
    orderStatus: 'Delivered',
    courierName: 'Trax Logistics',
    trackingNumber: 'TRX-882104',
  },
  {
    id: 'ord-105',
    orderNumber: 'MS-9817',
    date: '2026-08-30',
    customerName: 'Bismah Khan',
    customerEmail: 'bismah.k@gmail.com',
    customerPhone: '+92 312 9988776',
    city: 'Faisalabad',
    address: 'Canal Road, People’s Colony No. 1',
    items: [
      {
        productId: '1',
        productName: 'Pearl & Aventurine Stacking Bracelet',
        image: 'https://images.unsplash.com/photo-1611591475819-797de2338ec8?w=500&auto=format&fit=crop&q=60',
        quantity: 1,
        price: 2450,
      },
    ],
    totalAmount: 2450,
    paymentMethod: 'Bank Transfer',
    paymentStatus: 'Paid',
    orderStatus: 'Delivered',
  },
];

// Initial Custom Bespoke Requests (Custom Orders from clients)
const INITIAL_CUSTOM_ORDERS: AdminCustomOrder[] = [
  {
    id: 'cst-01',
    requestNumber: 'REQ-2041',
    customerName: 'Natasha Rizvi',
    email: 'natasha.rizvi@gmail.com',
    phone: '+92 322 9900112',
    jewelryType: 'Bridal Party Stacking Bracelets (Set of 5)',
    preferredStones: ['Freshwater Pearl', 'Rose Quartz', 'Gold Hematite'],
    wristSize: 'Custom fitted (6.25")',
    metalFinish: '18K Gold Plated',
    notes: 'Need pastel tones to match peach raw silk bridesmaids lenghas for my sister’s mehendi. Urgent delivery required by Sept 18th.',
    budgetRange: 'PKR 12,000 - PKR 16,000',
    date: '2026-09-03',
    status: 'New Request',
    quoteAmount: 14500,
    referenceImages: [
      'https://images.unsplash.com/photo-1611591475819-797de2338ec8?w=500&auto=format&fit=crop&q=60',
      'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=500&auto=format&fit=crop&q=60',
    ],
  },
  {
    id: 'cst-02',
    requestNumber: 'REQ-2040',
    customerName: 'Sana Farooq',
    email: 'sana.f@outlook.com',
    phone: '+92 301 4455221',
    jewelryType: 'Emerald & Seed Bead Layered Choker',
    preferredStones: ['Green Aventurine', 'Micro Seed Beads', 'Mother of Pearl'],
    wristSize: '14" with 2" extender chain',
    metalFinish: 'Antique Gold',
    notes: 'Looking for rich deep forest green accent beads with gold spacers.',
    budgetRange: 'PKR 4,000 - PKR 6,000',
    date: '2026-09-02',
    status: 'Quote Sent',
    quoteAmount: 4800,
    referenceImages: [
      'https://images.unsplash.com/photo-1630019852942-f89202989a59?w=500&auto=format&fit=crop&q=60',
    ],
  },
  {
    id: 'cst-03',
    requestNumber: 'REQ-2039',
    customerName: 'Mehwish Ali',
    email: 'mehwish.ali@gmail.com',
    phone: '+92 334 5566778',
    jewelryType: 'Evil Eye Charm Anklet with Bells',
    preferredStones: ['Glass Evil Eye', 'Turquoise', 'Golden Chime Bells'],
    wristSize: '9.5" loose fit',
    metalFinish: '18K Gold Plated',
    notes: 'Tarnish-resistant wire please, for everyday beachwear and daily wear.',
    budgetRange: 'PKR 2,500 - PKR 3,500',
    date: '2026-08-29',
    status: 'In Production',
    quoteAmount: 2900,
    referenceImages: [
      'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=500&auto=format&fit=crop&q=60',
    ],
  },
  {
    id: 'cst-04',
    requestNumber: 'REQ-2038',
    customerName: 'Dr. Sarah Bilal',
    email: 'sarah.bilal@hospital.pk',
    phone: '+92 300 1122334',
    jewelryType: 'Custom Birthstone Charm Necklace',
    preferredStones: ['Amethyst', 'Aquamarine', 'Gold Beads'],
    wristSize: '16" Princess Length',
    metalFinish: 'Sterling Silver 925 Finish',
    notes: 'Incorporating two birthstones of my newborn twins.',
    budgetRange: 'PKR 5,000 - PKR 7,000',
    date: '2026-08-25',
    status: 'Completed',
    quoteAmount: 5500,
    referenceImages: [],
  },
];

// Initial Customers
const INITIAL_CUSTOMERS: AdminCustomer[] = [
  {
    id: 'c-01',
    name: 'Areeba Tariq',
    email: 'areeba.tariq@gmail.com',
    phone: '+92 321 4455890',
    city: 'Lahore',
    joinedDate: 'Jan 2026',
    totalOrders: 4,
    totalSpent: 18200,
    status: 'VIP',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
  },
  {
    id: 'c-02',
    name: 'Zainab Fatima',
    email: 'zainab.fatima@yahoo.com',
    phone: '+92 300 8765432',
    city: 'Karachi',
    joinedDate: 'Feb 2026',
    totalOrders: 3,
    totalSpent: 12400,
    status: 'VIP',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=120&auto=format&fit=crop&q=80',
  },
  {
    id: 'c-03',
    name: 'Hira Shah',
    email: 'hira.shah@hotmail.com',
    phone: '+92 333 1239876',
    city: 'Islamabad',
    joinedDate: 'Mar 2026',
    totalOrders: 2,
    totalSpent: 6200,
    status: 'Active',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80',
  },
  {
    id: 'c-04',
    name: 'Maham Qureshi',
    email: 'maham.q@gmail.com',
    phone: '+92 345 6789012',
    city: 'Rawalpindi',
    joinedDate: 'Jun 2026',
    totalOrders: 1,
    totalSpent: 1650,
    status: 'New',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
  },
  {
    id: 'c-05',
    name: 'Natasha Rizvi',
    email: 'natasha.rizvi@gmail.com',
    phone: '+92 322 9900112',
    city: 'Karachi',
    joinedDate: 'Aug 2026',
    totalOrders: 2,
    totalSpent: 16950,
    status: 'VIP',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80',
  },
];

// Initial Store Notifications
const INITIAL_NOTIFICATIONS: AdminNotification[] = [
  {
    id: 'notif-1',
    type: 'custom',
    title: 'New Bespoke Request Received',
    message: 'Natasha Rizvi requested 5 bridal stacking bracelets (PKR 14,500 estimate).',
    timestamp: '15 mins ago',
    read: false,
    linkTab: 'custom-orders',
    badge: 'Bespoke',
  },
  {
    id: 'notif-2',
    type: 'order',
    title: 'New Order #MS-9821 Placed',
    message: 'Areeba Tariq ordered 2x Pearl & Aventurine Stacking Bracelets (PKR 4,900 COD).',
    timestamp: '42 mins ago',
    read: false,
    linkTab: 'orders',
    badge: 'New Order',
  },
  {
    id: 'notif-3',
    type: 'stock',
    title: 'Low Stock Alert: Rose Quartz Beads',
    message: 'Only 3 units remaining for "Rose Quartz & Seed Bead Choker".',
    timestamp: '2 hours ago',
    read: false,
    linkTab: 'products',
    badge: 'Inventory',
  },
  {
    id: 'notif-4',
    type: 'order',
    title: 'Payment Received for #MS-9820',
    message: 'Easypaisa transaction confirmed by Zainab Fatima for PKR 5,050.',
    timestamp: 'Yesterday',
    read: true,
    linkTab: 'orders',
    badge: 'Paid',
  },
  {
    id: 'notif-5',
    type: 'system',
    title: 'Daily Studio Backup Complete',
    message: 'All inventory listings and customer records safely cached.',
    timestamp: '1 day ago',
    read: true,
    linkTab: 'dashboard',
    badge: 'System',
  },
];

// Initial Store Settings
const INITIAL_SETTINGS: StoreSettings = {
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

// Initial Theme Config
const INITIAL_THEME: AdminThemeConfig = {
  sidebarColor: 'teal',
  sidenavType: 'white',
  darkMode: false,
  navbarFixed: true,
};

// LocalStorage helpers
export const adminStorage = {
  getProducts(): AdminProduct[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
      return data ? JSON.parse(data) : INITIAL_PRODUCTS;
    } catch {
      return INITIAL_PRODUCTS;
    }
  },
  saveProducts(products: AdminProduct[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
      window.dispatchEvent(new Event('admin-products-updated'));
    } catch (err) {
      console.error('Failed to save products:', err);
    }
  },

  getOrders(): AdminOrder[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ORDERS);
      return data ? JSON.parse(data) : INITIAL_ORDERS;
    } catch {
      return INITIAL_ORDERS;
    }
  },
  saveOrders(orders: AdminOrder[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
      window.dispatchEvent(new Event('admin-orders-updated'));
    } catch (err) {
      console.error('Failed to save orders:', err);
    }
  },

  getCustomOrders(): AdminCustomOrder[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CUSTOM_ORDERS);
      return data ? JSON.parse(data) : INITIAL_CUSTOM_ORDERS;
    } catch {
      return INITIAL_CUSTOM_ORDERS;
    }
  },
  saveCustomOrders(customOrders: AdminCustomOrder[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.CUSTOM_ORDERS, JSON.stringify(customOrders));
      window.dispatchEvent(new Event('admin-custom-orders-updated'));
    } catch (err) {
      console.error('Failed to save custom orders:', err);
    }
  },

  getCustomers(): AdminCustomer[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CUSTOMERS);
      return data ? JSON.parse(data) : INITIAL_CUSTOMERS;
    } catch {
      return INITIAL_CUSTOMERS;
    }
  },
  saveCustomers(customers: AdminCustomer[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(customers));
      window.dispatchEvent(new Event('admin-customers-updated'));
    } catch (err) {
      console.error('Failed to save customers:', err);
    }
  },

  getNotifications(): AdminNotification[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
      return data ? JSON.parse(data) : INITIAL_NOTIFICATIONS;
    } catch {
      return INITIAL_NOTIFICATIONS;
    }
  },
  saveNotifications(notifs: AdminNotification[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifs));
      window.dispatchEvent(new Event('admin-notifs-updated'));
    } catch (err) {
      console.error('Failed to save notifications:', err);
    }
  },

  getSettings(): StoreSettings {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return data ? JSON.parse(data) : INITIAL_SETTINGS;
    } catch {
      return INITIAL_SETTINGS;
    }
  },
  saveSettings(settings: StoreSettings): void {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (err) {
      console.error('Failed to save settings:', err);
    }
  },

  getTheme(): AdminThemeConfig {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.THEME);
      return data ? JSON.parse(data) : INITIAL_THEME;
    } catch {
      return INITIAL_THEME;
    }
  },
  getThemeConfig(): AdminThemeConfig {
    return this.getTheme();
  },
  saveTheme(theme: AdminThemeConfig): void {
    try {
      localStorage.setItem(STORAGE_KEYS.THEME, JSON.stringify(theme));
    } catch (err) {
      console.error('Failed to save theme:', err);
    }
  },
  saveThemeConfig(theme: AdminThemeConfig): void {
    this.saveTheme(theme);
  },

  resetToDefaults(): void {
    try {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(INITIAL_PRODUCTS));
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(INITIAL_ORDERS));
      localStorage.setItem(STORAGE_KEYS.CUSTOM_ORDERS, JSON.stringify(INITIAL_CUSTOM_ORDERS));
      localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(INITIAL_CUSTOMERS));
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(INITIAL_NOTIFICATIONS));
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(INITIAL_SETTINGS));
      localStorage.setItem(STORAGE_KEYS.THEME, JSON.stringify(INITIAL_THEME));
    } catch (err) {
      console.error('Failed to reset data:', err);
    }
  },
};
