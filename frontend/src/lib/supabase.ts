import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Supabase project configuration. Environment variables can override these values,
// while the public project URL/key keep the frontend functional when Vercel/local
// environment variables have not been added yet.
const DEFAULT_SUPABASE_URL = 'https://tfcuyfjyqqvononlvvdo.supabase.co';
const DEFAULT_SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_fKT_b9Vt9d9ssk1Nkq2KdA_jNycWPjo';

const supabaseUrl = (
  import.meta.env.VITE_SUPABASE_URL ||
  import.meta.env.SUPABASE_URL ||
  DEFAULT_SUPABASE_URL
) as string;

const supabaseAnonKey = (
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  import.meta.env.SUPABASE_ANON_KEY ||
  DEFAULT_SUPABASE_PUBLISHABLE_KEY
) as string;

/**
 * Validates that the frontend has a usable Supabase URL and public key.
 */
export function isSupabaseConfigured(): boolean {
  return (
    typeof supabaseUrl === 'string' &&
    supabaseUrl.trim().length > 0 &&
    supabaseUrl.startsWith('http') &&
    typeof supabaseAnonKey === 'string' &&
    supabaseAnonKey.trim().length > 0
  );
}

export const supabase: SupabaseClient = createClient(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
);

// Storage bucket names used in Maryam Sparkle
export const SUPABASE_BUCKETS = {
  PRODUCTS: 'products',
  PAYMENT_PROOFS: 'payment-proofs',
  CUSTOM_ORDERS: 'custom-orders',
} as const;

/**
 * Type definitions matching the Supabase PostgreSQL Schema
 */
export interface SupabaseProfile {
  id: string;
  email: string;
  first_name?: string | null;
  last_name?: string | null;
  full_name?: string | null;
  phone?: string | null;
  role: 'customer' | 'admin';
  avatar_url?: string | null;
  created_at: string;
  updated_at: string;
}

export interface SupabaseCategory {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  image?: string | null;
  status: 'active' | 'inactive';
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface SupabaseProduct {
  id: string;
  category_id?: string | null;
  category_slug?: string | null;
  name: string;
  slug: string;
  description: string;
  short_description?: string | null;
  price: number;
  compare_at_price?: number | null;
  sku?: string | null;
  stock: number;
  materials?: string[] | null;
  colors?: string[] | null;
  finish?: string | null;
  available_finishes?: string[] | null;
  is_featured: boolean;
  is_best_seller: boolean;
  is_new: boolean;
  in_stock: boolean;
  care_instructions?: string | null;
  tags?: string[] | null;
  rating?: number | null;
  reviews_count: number;
  status: 'active' | 'draft' | 'archived';
  created_at: string;
  updated_at: string;
}

export interface SupabaseProductImage {
  id: string;
  product_id: string;
  image_url: string;
  storage_path?: string | null;
  sort_order: number;
  is_primary: boolean;
  created_at: string;
}

export interface SupabaseOrder {
  id: string;
  order_number: string;
  user_id?: string | null;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  subtotal: number;
  shipping_fee: number;
  discount: number;
  coupon_code?: string | null;
  total: number;
  status: 'placed' | 'confirmed' | 'processing' | 'shipped' | 'out_for_delivery' | 'delivered' | 'cancelled';
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  payment_method: 'cod' | 'easypaisa' | 'jazzcash' | 'bank_transfer';
  shipping_address: Record<string, unknown>;
  delivery_method: 'standard' | 'express' | 'overnight' | 'international';
  courier_name?: string | null;
  tracking_number?: string | null;
  estimated_delivery?: string | null;
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

export interface SupabaseOrderItem {
  id: string;
  order_id: string;
  product_id?: string | null;
  product_name: string;
  product_slug?: string | null;
  product_image?: string | null;
  sku?: string | null;
  quantity: number;
  unit_price: number;
  subtotal: number;
  size?: string | null;
  finish?: string | null;
  created_at: string;
}

export interface SupabasePayment {
  id: string;
  order_id: string;
  transaction_reference?: string | null;
  proof_of_payment_path?: string | null;
  proof_of_payment_url?: string | null;
  amount: number;
  method: 'cod' | 'easypaisa' | 'jazzcash' | 'bank_transfer';
  status: 'pending' | 'paid' | 'failed' | 'refunded';
  paid_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface SupabaseAddress {
  id: string;
  user_id: string;
  label?: string | null;
  full_name: string;
  phone: string;
  address_line_1: string;
  address_line_2?: string | null;
  city: string;
  state?: string | null;
  postal_code?: string | null;
  country: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface SupabaseCustomOrder {
  id: string;
  user_id?: string | null;
  customer_name: string;
  customer_email?: string | null;
  customer_phone: string;
  jewelry_type: string;
  wrist_size?: string | null;
  metal_finish?: string | null;
  preferred_stones?: string[] | null;
  initials_or_word?: string | null;
  budget_range?: string | null;
  special_notes?: string | null;
  status: 'pending' | 'reviewed' | 'in_progress' | 'completed' | 'cancelled';
  admin_notes?: string | null;
  created_at: string;
  updated_at: string;
}

export interface SupabaseCustomOrderImage {
  id: string;
  custom_order_id: string;
  image_url: string;
  storage_path?: string | null;
  created_at: string;
}
