/**
 * Privacy-centric Analytics Event Bus for Maryam Sparkle
 * Emits clean, non-PII events ready for integration with Google Analytics 4, Meta Pixel, Plausible, or server webhooks
 */

export interface AnalyticsEvent {
  eventName: string;
  properties: Record<string, any>;
  timestamp: string;
}

export type AnalyticsListener = (event: AnalyticsEvent) => void;

const listeners: Set<AnalyticsListener> = new Set();

export const analyticsService = {
  /**
   * Register an event listener (for GA4, Pixel, custom telemetry)
   */
  subscribe(listener: AnalyticsListener): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  /**
   * Dispatch an analytics event
   */
  track(eventName: string, properties: Record<string, any> = {}): void {
    const event: AnalyticsEvent = {
      eventName,
      properties: {
        ...properties,
        platform: 'maryam_sparkle_web',
      },
      timestamp: new Date().toISOString(),
    };

    // Notify registered listeners
    listeners.forEach((listener) => {
      try {
        listener(event);
      } catch (err) {
        console.warn('Analytics listener error:', err);
      }
    });

    // Dispatch DOM custom event for tag managers or head scripts
    if (typeof window !== 'undefined') {
      try {
        window.dispatchEvent(new CustomEvent('maryam:analytics', { detail: event }));
      } catch {
        // Safe no-op
      }
    }
  },

  // Specialized Helper Methods
  trackProductView(product: { id: string; name: string; category?: string; price: number; sku?: string }): void {
    this.track('product_viewed', {
      productId: product.id,
      productName: product.name,
      category: product.category || 'General',
      price: product.price,
      sku: product.sku || '',
    });
  },

  trackSearch(query: string, resultsCount: number): void {
    this.track('search_performed', {
      query: query.trim(),
      resultsCount,
    });
  },

  trackAddToCart(item: {
    productId: string;
    productName: string;
    price: number;
    quantity: number;
    selectedSize?: string;
    selectedFinish?: string;
  }): void {
    this.track('product_added_to_cart', {
      productId: item.productId,
      productName: item.productName,
      price: item.price,
      quantity: item.quantity,
      size: item.selectedSize || 'Standard',
      finish: item.selectedFinish || 'Standard',
      totalValue: item.price * item.quantity,
    });
  },

  trackWishlistToggle(product: { id: string; name: string; price?: number }, action: 'added' | 'removed'): void {
    this.track('wishlist_toggled', {
      productId: product.id,
      productName: product.name,
      price: product.price || 0,
      action,
    });
  },

  trackCheckoutStarted(itemCount: number, subtotal: number): void {
    this.track('checkout_started', {
      itemCount,
      subtotal,
    });
  },

  trackOrderCompleted(order: {
    orderNumber: string;
    total: number;
    subtotal: number;
    itemCount?: number;
    paymentMethod?: any;
    discount?: number;
    items?: any[];
  }): void {
    this.track('order_completed', {
      orderNumber: order.orderNumber,
      total: order.total,
      subtotal: order.subtotal,
      itemCount: order.itemCount || (order.items ? order.items.length : 1),
      paymentMethod: typeof order.paymentMethod === 'object' ? order.paymentMethod?.title : order.paymentMethod,
      discount: order.discount || 0,
    });
  },

  trackPurchase(order: any): void {
    this.trackOrderCompleted(order);
  },

  trackCouponApplied(code: string, discountAmount: number, subtotal: number): void {
    this.track('coupon_applied', {
      couponCode: code.toUpperCase(),
      discountAmount,
      subtotal,
    });
  },

  trackApplyCoupon(code: string, success: boolean, discountAmount: number = 0): void {
    this.track('coupon_attempted', {
      couponCode: code.toUpperCase(),
      success,
      discountAmount,
    });
  },

  trackInitiateCheckout(items: any[], subtotal: number): void {
    this.trackCheckoutStarted(items.length, subtotal);
  },

  trackCustomOrderSubmitted(details: { jewelryType: string; budgetRange: string; metalFinish?: string }): void {
    this.track('custom_order_submitted', {
      jewelryType: details.jewelryType,
      budgetRange: details.budgetRange,
      metalFinish: details.metalFinish || 'Standard',
    });
  },
};
