export interface Product {
  id: string;
  slug: string;
  name: string;
  category: 'Bracelets' | 'Anklets' | 'Necklaces' | 'Earrings' | 'Rings' | 'Custom Pieces';
  price: number;
  compareAtPrice?: number;
  originalPrice?: number;
  image: string;
  images: string[];
  thumbnail?: string;
  description: string;
  shortDescription?: string;
  materials: string[];
  dimensions?: string;
  colors?: string[];
  stock: number;
  sku?: string;
  rating?: number;
  reviewsCount?: number;
  tags?: string[];
  isFeatured?: boolean;
  isBestSeller?: boolean;
  isNew?: boolean;
  careInstructions?: string;
  inStock: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedSize?: string;
  selectedFinish?: string;
  customNote?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  image: string;
  itemCount: number;
  tagline?: string;
  description?: string;
}

export interface InstagramPost {
  id: string;
  image: string;
  likes: number;
  caption: string;
  handle: string;
  productTag?: string;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: 'Orders & Customization' | 'Shipping & Delivery' | 'Jewelry Care' | 'Payments & Returns';
}

export interface CustomOrderData {
  name: string;
  email: string;
  phone: string;
  type: string;
  preferredStones: string[];
  wristSize: string;
  metalFinish: string;
  notes: string;
  budgetRange: string;
}

export type OrderStatus = 'placed' | 'confirmed' | 'processing' | 'shipped' | 'out_for_delivery' | 'delivered';

export interface OrderTimelineStep {
  status: OrderStatus;
  title: string;
  description: string;
  date: string;
  completed: boolean;
  current: boolean;
}

export interface Order {
  id: string;
  orderNumber: string;
  createdAt: string;
  status: OrderStatus;
  customer: {
    fullName: string;
    email: string;
    phone: string;
  };
  shippingAddress: {
    address: string;
    city: string;
    postalCode: string;
    province?: string;
    country: string;
  };
  deliveryMethod: {
    id: 'standard' | 'express';
    title: string;
    cost: number;
    estimatedDays: string;
  };
  paymentMethod: {
    id: 'cod' | 'easypaisa' | 'bank_transfer';
    title: string;
    instructions?: string;
  };
  items: CartItem[];
  subtotal: number;
  shippingCost: number;
  discount: number;
  couponCode?: string;
  total: number;
  paymentStatus: 'pending' | 'paid';
  courierName?: string;
  trackingNumber?: string;
  estimatedDelivery: string;
  timeline: OrderTimelineStep[];
  notes?: string;
}

export interface UserAddress {
  id: string;
  label: string;
  fullName: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  isDefault: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  joinedDate: string;
  addresses: UserAddress[];
}

