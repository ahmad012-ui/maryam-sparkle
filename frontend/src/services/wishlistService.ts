import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { authService } from './authService';

const LOCAL_STORAGE_KEY = 'maryam_wishlist_ids';

const isUuid = (val: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(val);

function getLocalWishlist(): string[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function setLocalWishlist(ids: string[]): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(ids));
  } catch {
    // ignore
  }
}

export const wishlistService = {
  getLocalWishlist,

  /**
   * Fetch wishlist IDs for the active user (from Supabase if authenticated, else local).
   * If authenticated and local guest items exist, merges them into Supabase.
   */
  async getWishlist(): Promise<string[]> {
    const user = authService.getCurrentUser();
    const localIds = getLocalWishlist();

    if (!isSupabaseConfigured() || !user || !isUuid(user.id)) {
      return localIds;
    }

    try {
      const { data, error } = await supabase
        .from('wishlists')
        .select('product_id')
        .eq('user_id', user.id);

      if (error) throw error;

      const remoteIds = (data || []).map((row: any) => row.product_id);

      // Merge any pending local items into Supabase
      const unmerged = localIds.filter((id) => !remoteIds.includes(id) && isUuid(id));
      if (unmerged.length > 0) {
        const inserts = unmerged.map((productId) => ({
          user_id: user.id,
          product_id: productId,
        }));
        await supabase.from('wishlists').upsert(inserts, { onConflict: 'user_id,product_id' });
        remoteIds.push(...unmerged);
      }

      // Update local storage cache to match
      setLocalWishlist(remoteIds);
      return remoteIds;
    } catch (err) {
      console.warn('Failed to load wishlist from Supabase, falling back to local cache:', err);
      return localIds;
    }
  },

  /**
   * Toggle product in wishlist, persisting to Supabase if authenticated and updating local storage.
   */
  async toggleWishlist(productId: string): Promise<string[]> {
    const user = authService.getCurrentUser();
    let current = getLocalWishlist();
    const exists = current.includes(productId);
    const updated = exists ? current.filter((id) => id !== productId) : [...current, productId];

    setLocalWishlist(updated);

    if (isSupabaseConfigured() && user && isUuid(user.id) && isUuid(productId)) {
      try {
        if (exists) {
          await supabase
            .from('wishlists')
            .delete()
            .eq('user_id', user.id)
            .eq('product_id', productId);
        } else {
          await supabase
            .from('wishlists')
            .upsert({ user_id: user.id, product_id: productId }, { onConflict: 'user_id,product_id' });
        }
      } catch (err) {
        console.warn('Failed to persist wishlist change to Supabase:', err);
      }
    }

    return updated;
  },

  /**
   * Remove a specific product from wishlist.
   */
  async removeFromWishlist(productId: string): Promise<string[]> {
    const user = authService.getCurrentUser();
    let current = getLocalWishlist();
    const updated = current.filter((id) => id !== productId);

    setLocalWishlist(updated);

    if (isSupabaseConfigured() && user && isUuid(user.id) && isUuid(productId)) {
      try {
        await supabase
          .from('wishlists')
          .delete()
          .eq('user_id', user.id)
          .eq('product_id', productId);
      } catch (err) {
        console.warn('Failed to delete item from wishlist in Supabase:', err);
      }
    }

    return updated;
  },

  async clearWishlist(): Promise<void> {
    const user = authService.getCurrentUser();
    setLocalWishlist([]);

    if (isSupabaseConfigured() && user && isUuid(user.id)) {
      try {
        await supabase.from('wishlists').delete().eq('user_id', user.id);
      } catch (err) {
        console.warn('Failed to clear wishlist on Supabase:', err);
      }
    }
  },
};
