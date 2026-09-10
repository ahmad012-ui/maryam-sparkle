import { CartItem, Product } from '../types';
import { PRODUCTS } from '../data/products';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { authService } from './authService';

const CART_STORAGE_KEY = 'maryam_sparkle_cart_v1';
const GUEST_TOKEN_KEY = 'maryam_sparkle_guest_token_v1';

function getOrCreateGuestToken(): string {
  if (typeof window === 'undefined') return 'guest_default';
  let token = localStorage.getItem(GUEST_TOKEN_KEY);
  if (!token) {
    token = `gst_${Date.now()}_${Math.random().toString(36).substring(2, 12)}`;
    localStorage.setItem(GUEST_TOKEN_KEY, token);
  }
  return token;
}

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

export const cartService = {
  /**
   * Fetch current cart with resilient local storage and Supabase sync
   */
  async getCart(): Promise<{ items: CartItem[]; itemCount: number; total: number }> {
    const localItems = getLocalCart();

    if (isSupabaseConfigured()) {
      try {
        const currentUser = authService.getCurrentUser();
        const guestToken = getOrCreateGuestToken();

        let cartQuery = supabase.from('carts').select('id');
        if (currentUser?.id && !currentUser.id.startsWith('usr-')) {
          cartQuery = cartQuery.eq('user_id', currentUser.id);
        } else {
          cartQuery = cartQuery.eq('guest_token', guestToken);
        }

        const { data: cartData } = await cartQuery.maybeSingle();

        if (cartData?.id) {
          const { data: itemRows } = await supabase
            .from('cart_items')
            .select(`
              id,
              quantity,
              size,
              finish,
              custom_note,
              products (
                id,
                name,
                slug,
                price,
                stock,
                in_stock,
                finish,
                product_images ( image_url, is_primary )
              )
            `)
            .eq('cart_id', cartData.id);

          if (itemRows && itemRows.length > 0) {
            const syncedItems: CartItem[] = itemRows
              .filter((r: any) => r.products)
              .map((r: any) => {
                const prod = r.products;
                const img =
                  prod.product_images?.find((i: any) => i.is_primary)?.image_url ||
                  prod.product_images?.[0]?.image_url ||
                  PRODUCTS[0].image;

                const catalogProduct: Product = {
                  id: prod.id,
                  name: prod.name,
                  slug: prod.slug,
                  price: Number(prod.price),
                  category: 'Bracelets',
                  image: img,
                  images: [img],
                  description: 'Handmade artisanal jewelry',
                  materials: ['Glass Beads', 'Gold-Tone Accents'],
                  stock: prod.stock ?? 10,
                  inStock: prod.in_stock ?? true,
                };

                return {
                  product: catalogProduct,
                  quantity: r.quantity,
                  selectedSize: r.size || 'Medium (6.5")',
                  selectedFinish: r.finish || prod.finish || '18K Gold Plated',
                };
              });

            if (syncedItems.length > 0) {
              saveLocalCart(syncedItems);
              const count = syncedItems.reduce((acc, it) => acc + it.quantity, 0);
              const total = syncedItems.reduce((acc, it) => acc + it.product.price * it.quantity, 0);
              return { items: syncedItems, itemCount: count, total };
            }
          }
        }
      } catch (err) {
        console.warn('Supabase cart sync notice:', err);
      }
    }

    const count = localItems.reduce((acc, it) => acc + it.quantity, 0);
    const total = localItems.reduce((acc, it) => acc + it.product.price * it.quantity, 0);
    return {
      items: localItems,
      itemCount: count,
      total,
    };
  },

  /**
   * Add item to cart
   */
  async addItem(product: Product | string, quantity: number = 1): Promise<CartItem[]> {
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
          selectedFinish: resolvedProduct.finish || '18K Gold Plated',
        },
      ];
    }
    saveLocalCart(updated);
    return updated;
  },

  /**
   * Update quantity
   */
  async updateQuantity(product: Product | string, quantity: number): Promise<CartItem[]> {
    const prodIdStr = typeof product === 'object' ? product.id : String(product);
    const currentItems = getLocalCart();

    let updated: CartItem[];
    if (quantity <= 0) {
      updated = currentItems.filter((it) => it.product.id !== prodIdStr);
    } else {
      updated = currentItems.map((it) => (it.product.id === prodIdStr ? { ...it, quantity } : it));
    }
    saveLocalCart(updated);
    return updated;
  },

  /**
   * Remove item
   */
  async removeItem(product: Product | string): Promise<CartItem[]> {
    const prodIdStr = typeof product === 'object' ? product.id : String(product);
    const currentItems = getLocalCart();
    const updated = currentItems.filter((it) => it.product.id !== prodIdStr);
    saveLocalCart(updated);
    return updated;
  },

  /**
   * Clear entire cart
   */
  async clearCart(): Promise<void> {
    saveLocalCart([]);
  },
};
