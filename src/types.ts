export interface Product {
  id: string;
  name: string;
  category: 'Bracelets' | 'Anklets' | 'Necklaces' | 'Earrings' | 'Rings';
  price: number;
  originalPrice?: number;
  image: string;
  gallery?: string[];
  description: string;
  materials: string[];
  isBestSeller?: boolean;
  isNew?: boolean;
  colors?: string[];
  rating?: number;
  reviewsCount?: number;
  tags?: string[];
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
  category: 'Orders & Customization' | 'Shipping & Delivery' | 'Jewelry Care' | 'Payments';
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
