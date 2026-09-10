import { CartItem, Product } from '../types';
import { PRODUCTS } from '../data/products';

export interface BackendCartItem {
  id: number;
  product_id: number;
  name: string;
  slug: string;
  price: number;
  image: string | null;
  quantity: number;
  stock: number;
  subtotal: number;
  status: string;
}

export interface BackendCartData {
  id: number | null;
  user_id: number | null;
  guest_token: string | null;
  items: BackendCartItem[];
  item_count: number;
  total: number;
}

export interface CartApiResponse {
  success: boolean;
  message: string;
  data: BackendCartData;
  errors?: Record<string, string>;
}

/**
 * Helper to convert backend product_id or slug to a catalog Product object
 */
export function mapBackendItemToCartItem(item: BackendCartItem): CartItem {
  const found = PRODUCTS.find((p) => p.slug === item.slug || p.id === String(item.product_id));
  const product: Product = found || {
    id: String(item.product_id),
    slug: item.slug,
    name: item.name,
    category: 'Bracelets',
    price: item.price,
    image: item.image || PRODUCTS[0]?.image || '',
    images: item.image ? [item.image] : [PRODUCTS[0]?.image || ''],
    description: 'Handmade artisanal jewelry crafted with love in our Karachi atelier.',
    materials: ['Glass Beads', 'Gold-Tone Accents'],
    stock: item.stock,
    inStock: item.stock > 0,
  };

  return {
    product,
    quantity: item.quantity,
    selectedSize: 'Medium (6.5")',
    selectedFinish: product.finish || 'Gold-Tone',
  };
}

/**
 * Resolve an integer product_id from a Product or product_id string/number
 */
export function resolveNumericProductId(productOrId: Product | string | number): number {
  if (typeof productOrId === 'number') {
    return productOrId;
  }
  if (typeof productOrId === 'string') {
    const parsed = parseInt(productOrId, 10);
    if (!isNaN(parsed) && parsed > 0) {
      return parsed;
    }
    const idx = PRODUCTS.findIndex((p) => p.id === productOrId || p.slug === productOrId);
    return idx >= 0 ? idx + 1 : 1;
  }
  // Product object
  const parsed = parseInt(productOrId.id, 10);
  if (!isNaN(parsed) && parsed > 0) {
    return parsed;
  }
  const idx = PRODUCTS.findIndex((p) => p.id === productOrId.id || p.slug === productOrId.slug);
  return idx >= 0 ? idx + 1 : 1;
}

const CART_STORAGE_KEY = 'maryam_sparkle_cart_v1';

function getLocalCart(): CartItem[] {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalCart(items: CartItem[]): void {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    window.dispatchEvent(new Event('cart-updated'));
  } catch (e) {
    console.warn('Failed to save cart to localStorage:', e);
  }
}

async function safeJsonFetch<T>(url: string, options?: RequestInit): Promise<T | null> {
  try {
    const res = await fetch(url, options);
    const contentType = res.headers.get('content-type') || '';
    if (!res.ok || !contentType.includes('application/json')) {
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

export const cartService = {
  /**
   * Fetch current cart with resilient local storage and background API sync
   */
  async getCart(): Promise<{ items: CartItem[]; itemCount: number; total: number; raw: BackendCartData }> {
    const localItems = getLocalCart();

    try {
      const json = await safeJsonFetch<CartApiResponse>('/api/v1/cart', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        credentials: 'include',
      });

      if (json?.success && json.data && Array.isArray(json.data.items)) {
        const items = json.data.items.map(mapBackendItemToCartItem);
        saveLocalCart(items);
        return {
          items,
          itemCount: json.data.item_count || items.reduce((s, it) => s + it.quantity, 0),
          total: json.data.total || items.reduce((s, it) => s + it.product.price * it.quantity, 0),
          raw: json.data,
        };
      }
    } catch (err) {
      console.warn('cartService.getCart network check:', err);
    }

    const count = localItems.reduce((acc, it) => acc + it.quantity, 0);
    const total = localItems.reduce((acc, it) => acc + it.product.price * it.quantity, 0);
    return {
      items: localItems,
      itemCount: count,
      total,
      raw: { id: null, user_id: null, guest_token: null, items: [], item_count: count, total },
    };
  },

  /**
   * Add item to cart with local state persistence and opportunistic backend sync
   */
  async addItem(product: Product | string | number, quantity: number = 1): Promise<CartItem[]> {
    const resolvedProduct =
      typeof product === 'object'
        ? product
        : PRODUCTS.find((p) => p.id === String(product) || p.slug === String(product)) || PRODUCTS[0];

    const currentItems = getLocalCart();
    const existingIdx = currentItems.findIndex((it) => it.product.id === resolvedProduct.id);
    let updated: CartItem[];

    if (existingIdx > -1) {
      updated = [...currentItems];
      updated[existingIdx].quantity += quantity;
    } else {
      updated = [
        ...currentItems,
        {
          product: resolvedProduct,
          quantity,
          selectedSize: 'Medium (6.5")',
          selectedFinish: resolvedProduct.finish || 'Gold-Tone',
        },
      ];
    }
    saveLocalCart(updated);

    const productId = resolveNumericProductId(product);
    try {
      const json = await safeJsonFetch<CartApiResponse>('/api/v1/cart/items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          product_id: productId,
          quantity,
        }),
      });

      if (json?.success && Array.isArray(json.data?.items) && json.data.items.length > 0) {
        const backendItems = json.data.items.map(mapBackendItemToCartItem);
        saveLocalCart(backendItems);
        return backendItems;
      }
    } catch {
      // Backend not running; local cart already saved
    }

    return updated;
  },

  /**
   * Update quantity with local state persistence and opportunistic backend sync
   */
  async updateQuantity(product: Product | string | number, quantity: number): Promise<CartItem[]> {
    const prodIdStr = typeof product === 'object' ? product.id : String(product);
    const currentItems = getLocalCart();

    let updated: CartItem[];
    if (quantity <= 0) {
      updated = currentItems.filter((it) => it.product.id !== prodIdStr);
    } else {
      updated = currentItems.map((it) => (it.product.id === prodIdStr ? { ...it, quantity } : it));
    }
    saveLocalCart(updated);

    const productId = resolveNumericProductId(product);
    try {
      const json = await safeJsonFetch<CartApiResponse>(`/api/v1/cart/items/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          quantity,
        }),
      });

      if (json?.success && Array.isArray(json.data?.items)) {
        const backendItems = json.data.items.map(mapBackendItemToCartItem);
        saveLocalCart(backendItems);
        return backendItems;
      }
    } catch {
      // Backend not running
    }

    return updated;
  },

  /**
   * Remove item with local state persistence and opportunistic backend sync
   */
  async removeItem(product: Product | string | number): Promise<CartItem[]> {
    const prodIdStr = typeof product === 'object' ? product.id : String(product);
    const currentItems = getLocalCart();
    const updated = currentItems.filter((it) => it.product.id !== prodIdStr);
    saveLocalCart(updated);

    const productId = resolveNumericProductId(product);
    try {
      const json = await safeJsonFetch<CartApiResponse>(`/api/v1/cart/items/${productId}`, {
        method: 'DELETE',
        headers: {
          'Accept': 'application/json',
        },
        credentials: 'include',
      });

      if (json?.success && Array.isArray(json.data?.items)) {
        const backendItems = json.data.items.map(mapBackendItemToCartItem);
        saveLocalCart(backendItems);
        return backendItems;
      }
    } catch {
      // Backend not running
    }

    return updated;
  },

  /**
   * Clear entire cart
   */
  async clearCart(): Promise<void> {
    saveLocalCart([]);
    try {
      await fetch('/api/v1/cart', {
        method: 'DELETE',
        headers: {
          'Accept': 'application/json',
        },
        credentials: 'include',
      });
    } catch {
      // Ignore
    }
  },
};

