/**
 * Authoritative Recent Activity Service (Recently Viewed Products & Recent Searches)
 *
 * Tracks the user's last 5 unique viewed products in localStorage.
 * Stores only lightweight identifiers (slug or ID) — no product payload.
 * Pure isolated storage logic with safe corrupted/missing storage handling.
 */

const RECENT_VIEWED_KEY = 'maryam_sparkle_recently_viewed';
const RECENT_SEARCHES_KEY = 'maryam_sparkle_recent_searches_v1';
const MAX_RECENT_PRODUCTS = 5;
const MAX_RECENT_SEARCHES = 8;

export const recentActivityService = {
  /**
   * Get list of recently viewed product identifiers (most recent first)
   */
  getRecentlyViewedIds(): string[] {
    try {
      if (typeof window === 'undefined' || !window.localStorage) {
        return [];
      }
      const raw = localStorage.getItem(RECENT_VIEWED_KEY);
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
   * Record a product view.
   * If already present, moves it to index 0 (front).
   * Keeps at most 5 items.
   */
  recordProductView(productIdOrSlug: string): void {
    if (!productIdOrSlug || typeof productIdOrSlug !== 'string') return;
    const cleanId = productIdOrSlug.trim();
    if (!cleanId) return;

    try {
      const current = this.getRecentlyViewedIds();
      // Remove any existing instance of this identifier to avoid duplicates
      const filtered = current.filter((id) => id.toLowerCase() !== cleanId.toLowerCase());
      // Prepend most recent product and cap at MAX_RECENT_PRODUCTS (5)
      const updated = [cleanId, ...filtered].slice(0, MAX_RECENT_PRODUCTS);

      localStorage.setItem(RECENT_VIEWED_KEY, JSON.stringify(updated));
      window.dispatchEvent(
        new CustomEvent('recently-viewed-updated', { detail: { identifier: cleanId, list: updated } })
      );
    } catch (err) {
      console.warn('Failed to record recently viewed product:', err);
    }
  },

  /**
   * Remove invalid, deleted, or inactive product identifiers from storage
   */
  removeInvalidProducts(invalidIdentifiers: string[]): void {
    if (!invalidIdentifiers || invalidIdentifiers.length === 0) return;
    try {
      const invalidSet = new Set(invalidIdentifiers.map((id) => id.toLowerCase()));
      const current = this.getRecentlyViewedIds();
      const updated = current.filter((id) => !invalidSet.has(id.toLowerCase()));
      if (updated.length !== current.length) {
        localStorage.setItem(RECENT_VIEWED_KEY, JSON.stringify(updated));
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
      localStorage.removeItem(RECENT_VIEWED_KEY);
      window.dispatchEvent(new CustomEvent('recently-viewed-updated', { detail: { list: [] } }));
    } catch (err) {
      console.warn('Failed to clear recently viewed items:', err);
    }
  },

  /**
   * Get list of recent searches
   */
  getRecentSearches(): string[] {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return [];
      const raw = localStorage.getItem(RECENT_SEARCHES_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  },

  /**
   * Add a search query to recent searches
   */
  addRecentSearch(query: string): void {
    const clean = query?.trim();
    if (!clean || clean.length < 2) return;
    try {
      const current = this.getRecentSearches().filter((q) => q.toLowerCase() !== clean.toLowerCase());
      const updated = [clean, ...current].slice(0, MAX_RECENT_SEARCHES);
      localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent('recent-searches-updated', { detail: { query: clean } }));
    } catch (e) {
      console.warn('Failed to save recent search query:', e);
    }
  },

  /**
   * Remove a single search query
   */
  removeRecentSearch(query: string): void {
    try {
      const updated = this.getRecentSearches().filter((q) => q.toLowerCase() !== query.toLowerCase());
      localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
      window.dispatchEvent(new Event('recent-searches-updated'));
    } catch (e) {
      console.warn('Failed to remove recent search query:', e);
    }
  },

  /**
   * Clear all recent searches
   */
  clearRecentSearches(): void {
    try {
      localStorage.removeItem(RECENT_SEARCHES_KEY);
      window.dispatchEvent(new Event('recent-searches-updated'));
    } catch (e) {
      console.warn('Failed to clear recent searches:', e);
    }
  },
};
