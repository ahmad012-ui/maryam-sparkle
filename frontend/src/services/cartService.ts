import { CartItem, Product } from '../types';
import { PRODUCTS } from '../data/products';
import { supabase } from '../lib/supabase';
import { authService } from './authService';

const GUEST_CART_KEY = 'maryam_sparkle_guest_cart_v1';

function getGuestCart(): CartItem[] {
  try {
    const raw = localStorage.getItem(GUEST_CART_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}
function saveGuestCart(items: CartItem[]) {
  localStorage.setItem(GUEST_CART_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event('cart-updated'));
}
function totals(items: CartItem[]) {
  return {
    items,
    itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
    total: items.reduce((sum, item) => sum + item.product.price * item.quantity, 0),
  };
}
function guestOrUser() {
  return authService.getCurrentUser();
}

async function getUserCartId(userId: string, create = true): Promise<string | null> {
  const { data, error } = await supabase.from('carts').select('id').eq('user_id', userId).maybeSingle();
  if (error) throw error;
  if (data?.id || !create) return data?.id || null;
  const { data: created, error: createError } = await supabase.from('carts').insert({ user_id: userId }).select('id').single();
  if (createError) throw createError;
  return created.id;
}

async function fetchRemoteCart(userId: string): Promise<CartItem[]> {
  const cartId = await getUserCartId(userId, false);
  if (!cartId) return [];
  const { data, error } = await supabase
    .from('cart_items')
    .select('id, quantity, size, finish, custom_note, products(id,name,slug,price,stock,in_stock,finish,materials,product_images(image_url,is_primary))')
    .eq('cart_id', cartId);
  if (error) throw error;
  return (data || []).filter((row: any) => row.products).map((row: any) => {
    const product = row.products;
    const image = product.product_images?.find((i: any) => i.is_primary)?.image_url || product.product_images?.[0]?.image_url || '';
    const catalogProduct: Product = {
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: Number(product.price) || 0,
      category: 'Bracelets',
      image,
      images: image ? [image] : [],
      description: 'Handmade artisanal jewelry',
      materials: product.materials || [],
      stock: Number(product.stock) || 0,
      inStock: product.in_stock !== false,
      finish: product.finish || undefined,
    };
    return { product: catalogProduct, quantity: Number(row.quantity) || 1, selectedSize: row.size || undefined, selectedFinish: row.finish || undefined, customNote: row.custom_note || undefined };
  });
}

async function remoteAdd(
  userId: string,
  product: Product,
  quantity: number,
  size = 'Medium (6.5")',
  finish = 'Gold-Tone',
  customNote?: string
): Promise<CartItem[]> {
  const cartId = await getUserCartId(userId, true);
  if (!cartId) throw new Error('Unable to create the customer cart.');

  const { data: existing, error: findError } = await supabase
    .from('cart_items')
    .select('id,quantity')
    .eq('cart_id', cartId)
    .eq('product_id', product.id)
    .eq('size', size)
    .eq('finish', finish)
    .maybeSingle();

  if (findError) throw findError;

  const maxStock = product.stock > 0 ? product.stock : 99;
  if (existing) {
    const targetQty = Math.min(maxStock, existing.quantity + quantity);
    const { error } = await supabase
      .from('cart_items')
      .update({ quantity: targetQty, updated_at: new Date().toISOString() })
      .eq('id', existing.id);
    if (error) throw error;
  } else {
    const targetQty = Math.min(maxStock, Math.max(1, quantity));
    const { error } = await supabase
      .from('cart_items')
      .insert({
        cart_id: cartId,
        product_id: product.id,
        quantity: targetQty,
        size,
        finish,
        custom_note: customNote || null,
      });
    if (error) throw error;
  }
  return fetchRemoteCart(userId);
}

export const cartService = {
  async getCart(): Promise<{ items: CartItem[]; itemCount: number; total: number }> {
    const user = guestOrUser();
    if (user?.id && !user.id.startsWith('usr-')) {
      try {
        const remoteItems = await fetchRemoteCart(user.id);
        return totals(remoteItems);
      } catch (err) {
        console.warn('Failed to load remote cart, falling back to guest cart:', err);
      }
    }
    return totals(getGuestCart());
  },

  async addItem(
    product: Product | string,
    quantity = 1,
    size?: string,
    finish?: string,
    customNote?: string
  ): Promise<CartItem[]> {
    const resolved =
      typeof product === 'object'
        ? product
        : PRODUCTS.find((p) => p.id === String(product) || p.slug === String(product));
    if (!resolved) throw new Error('Product not found.');

    const chosenSize = size || 'Medium (6.5")';
    const chosenFinish = finish || resolved.finish || resolved.availableFinishes?.[0] || '18K Gold Plated';
    const addQty = Math.max(1, quantity);

    const user = guestOrUser();
    if (user?.id && !user.id.startsWith('usr-')) {
      return remoteAdd(user.id, resolved, addQty, chosenSize, chosenFinish, customNote);
    }

    const current = getGuestCart();
    const index = current.findIndex(
      (item) =>
        item.product.id === resolved.id &&
        item.selectedSize === chosenSize &&
        item.selectedFinish === chosenFinish
    );
    const updated = [...current];
    const maxStock = resolved.stock > 0 ? resolved.stock : 99;

    if (index >= 0) {
      const newQty = Math.min(maxStock, updated[index].quantity + addQty);
      updated[index] = { ...updated[index], quantity: newQty };
    } else {
      updated.push({
        product: resolved,
        quantity: Math.min(maxStock, addQty),
        selectedSize: chosenSize,
        selectedFinish: chosenFinish,
        customNote,
      });
    }
    saveGuestCart(updated);
    return updated;
  },

  async updateQuantity(
    product: Product | string,
    quantity: number,
    size?: string,
    finish?: string
  ): Promise<CartItem[]> {
    const id = typeof product === 'object' ? product.id : String(product);
    const user = guestOrUser();
    if (user?.id && !user.id.startsWith('usr-')) {
      const cartId = await getUserCartId(user.id, false);
      if (!cartId) return [];
      let query = supabase.from('cart_items').delete().eq('cart_id', cartId).eq('product_id', id);
      if (size) query = query.eq('size', size);
      if (finish) query = query.eq('finish', finish);

      if (quantity <= 0) {
        const { error } = await query;
        if (error) throw error;
      } else {
        let updateQuery = supabase
          .from('cart_items')
          .update({ quantity, updated_at: new Date().toISOString() })
          .eq('cart_id', cartId)
          .eq('product_id', id);
        if (size) updateQuery = updateQuery.eq('size', size);
        if (finish) updateQuery = updateQuery.eq('finish', finish);
        const { error } = await updateQuery;
        if (error) throw error;
      }
      return fetchRemoteCart(user.id);
    }

    let updated: CartItem[];
    if (quantity <= 0) {
      updated = getGuestCart().filter((item) => {
        if (item.product.id !== id) return true;
        if (size && item.selectedSize !== size) return true;
        if (finish && item.selectedFinish !== finish) return true;
        return false;
      });
    } else {
      updated = getGuestCart().map((item) => {
        const match =
          item.product.id === id &&
          (!size || item.selectedSize === size) &&
          (!finish || item.selectedFinish === finish);
        if (!match) return item;
        const maxStock = item.product.stock > 0 ? item.product.stock : 99;
        return { ...item, quantity: Math.min(maxStock, quantity) };
      });
    }
    saveGuestCart(updated);
    return updated;
  },

  async removeItem(product: Product | string, size?: string, finish?: string): Promise<CartItem[]> {
    return this.updateQuantity(product, 0, size, finish);
  },

  async clearCart(): Promise<void> {
    const user = guestOrUser();
    if (user?.id && !user.id.startsWith('usr-')) {
      const cartId = await getUserCartId(user.id, false);
      if (cartId) {
        const { error } = await supabase.from('cart_items').delete().eq('cart_id', cartId);
        if (error) throw error;
      }
      return;
    }
    saveGuestCart([]);
  },
};
