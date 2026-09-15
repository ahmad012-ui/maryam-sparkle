/**
 * Recently Viewed Products Service
 *
 * Tracks the user's last 5 unique viewed products in localStorage.
 * Stores only lightweight identifiers (slug or ID) — no product payload.
 * Pure isolated storage logic with safe corrupted/missing storage handling.
 */

const STORAGE_KEY = 'maryam_sparkle_recently_viewed';
const MAX_ITEMS = 5;

export const recentlyViewedService = {
  /**
   * Retrieve ordered list of recently viewed product identifiers (most recent first)
   */
  getRecentlyViewed(): string[] {
    try {
      if (typeof window === 'undefined' || !window.localStorage) {
        return [];
      }
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      return parsed
        .filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
        .map((item) => item.trim());
    } catch (err) {
      console.warn('Unable to read recently viewed from localStorage:', err);
      return [];
    }
  },

  /**
   * Add a product identifier (slug or ID) to recently viewed history.
   * If already present, moves it to index 0 (front).
   * Keeps at most 5 items.
   */
  addRecentlyViewed(identifier: string): void {
    if (!identifier || typeof identifier !== 'string') return;
    const cleanId = identifier.trim();
    if (!cleanId) return;

    try {
      const current = this.getRecentlyViewed();
      // Remove any existing instance of this identifier to avoid duplicates
      const filtered = current.filter((id) => id.toLowerCase() !== cleanId.toLowerCase());
      // Prepend most recent product and cap at MAX_ITEMS
      const updated = [cleanId, ...filtered].slice(0, MAX_ITEMS);

      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      window.dispatchEvent(
        new CustomEvent('recently-viewed-updated', { detail: { identifier: cleanId, list: updated } })
      );
    } catch (err) {
      console.warn('Unable to save recently viewed product to localStorage:', err);
    }
  },

  /**
   * Remove invalid, deleted, or inactive product identifiers from storage
   */
  removeInvalidProducts(invalidIdentifiers: string[]): void {
    if (!invalidIdentifiers || invalidIdentifiers.length === 0) return;
    try {
      const invalidSet = new Set(invalidIdentifiers.map((id) => id.toLowerCase()));
      const current = this.getRecentlyViewed();
      const updated = current.filter((id) => !invalidSet.has(id.toLowerCase()));
      if (updated.length !== current.length) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        window.dispatchEvent(new CustomEvent('recently-viewed-updated', { detail: { list: updated } }));
      }
    } catch (err) {
      console.warn('Unable to prune invalid recently viewed products:', err);
    }
  },

  /**
   * Remove a single product from recently viewed list
   */
  removeRecentlyViewed(identifier: string): void {
    if (!identifier) return;
    this.removeInvalidProducts([identifier]);
  },

  /**
   * Clear all recently viewed history
   */
  clearRecentlyViewed(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
      window.dispatchEvent(new CustomEvent('recently-viewed-updated', { detail: { list: [] } }));
    } catch (err) {
      console.warn('Unable to clear recently viewed items:', err);
    }
  },
};
