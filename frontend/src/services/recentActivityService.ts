/**
 * Recent activity tracking service (Recently Viewed Products & Recent Searches)
 * Uses client-side storage for instantaneous responsiveness and privacy
 */

import { recentlyViewedService } from './recentlyViewedService';

const RECENT_SEARCHES_KEY = 'maryam_sparkle_recent_searches_v1';
const MAX_RECENT_SEARCHES = 8;

export const recentActivityService = {
  /**
   * Get list of recently viewed product identifiers (most recent first)
   */
  getRecentlyViewedIds(): string[] {
    return recentlyViewedService.getRecentlyViewed();
  },

  /**
   * Record a product view
   */
  recordProductView(productIdOrSlug: string): void {
    recentlyViewedService.addRecentlyViewed(productIdOrSlug);
  },

  /**
   * Clear recently viewed history
   */
  clearRecentlyViewed(): void {
    recentlyViewedService.clearRecentlyViewed();
  },

  /**
   * Get list of recent searches
   */
  getRecentSearches(): string[] {
    try {
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
  }
};
