export type AdminTab =
  | 'dashboard'
  | 'products'
  | 'orders'
  | 'custom-orders'
  | 'customers'
  | 'notifications'
  | 'profile';

export type SidebarColor = 'teal' | 'gold' | 'dark' | 'emerald' | 'rose' | 'navy';
export type SidenavType = 'white' | 'dark' | 'transparent';

export interface AdminThemeConfig {
  sidebarColor: SidebarColor;
  sidenavType: SidenavType;
  darkMode: boolean;
  navbarFixed: boolean;
}

export interface AdminProduct {
  id: string;
  sku: string;
  name: string;
  category: 'Bracelets' | 'Anklets' | 'Necklaces' | 'Earrings' | 'Rings' | 'Custom Pieces';
  price: number;
  compareAtPrice?: number;
  stock: number;
  image: string;
  images?: string[];
  materials: string[];
  finish?: string;
  description: string;
  isFeatured?: boolean;
  isBestSeller?: boolean;
  inStock: boolean;
  createdAt: string;
}

export interface AdminOrder {
  id: string;
  orderNumber: string;
  date: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  city: string;
  address: string;
  items: {
    productId: string;
    productName: string;
    image: string;
    quantity: number;
    price: number;
    size?: string;
    finish?: string;
  }[];
  totalAmount: number;
  paymentMethod: 'COD' | 'JazzCash' | 'Easypaisa' | 'Bank Transfer';
  paymentStatus: 'Pending' | 'Paid';
  orderStatus: 'Placed' | 'Confirmed' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  courierName?: string;
  trackingNumber?: string;
  notes?: string;
}

export interface AdminCustomOrder {
  id: string;
  requestNumber: string;
  customerName: string;
  email: string;
  phone: string;
  jewelryType: string;
  preferredStones: string[];
  wristSize: string;
  metalFinish: string;
  notes: string;
  budgetRange: string;
  date: string;
  status: 'New Request' | 'Quote Sent' | 'In Production' | 'Completed' | 'Declined';
  quoteAmount?: number;
  referenceImages: string[];
  productionImages?: string[];
}

export interface AdminCustomer {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  joinedDate: string;
  totalOrders: number;
  totalSpent: number;
  status: 'Active' | 'VIP' | 'New';
  avatar?: string;
}

export interface AdminNotification {
  id: string;
  type: 'order' | 'custom' | 'stock' | 'system';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  linkTab?: AdminTab;
  badge?: string;
}

export interface StoreSettings {
  storeName: string;
  tagline: string;
  currency: string;
  adminName: string;
  adminEmail: string;
  adminPhone: string;
  whatsappNumber: string;
  standardShippingFee: number;
  freeShippingThreshold: number;
  expressShippingFee: number;
  city: string;
  country: string;
  courierPartners: string[];
  bannerImages?: string[];
  logoImage?: string;
}
