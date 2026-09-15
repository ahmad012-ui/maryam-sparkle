import { supabase, isSupabaseConfigured } from '../lib/supabase';

export interface CouponValidationResult {
  valid: boolean;
  code?: string;
  discountType?: 'percentage' | 'fixed';
  discountValue?: number;
  discountAmount: number;
  message?: string;
}

export const couponService = {
  /**
   * Validate coupon against Supabase public.coupons table with authoritative rules
   */
  async validateCoupon(code: string, subtotal: number): Promise<CouponValidationResult> {
    const cleanCode = code.trim().toUpperCase();
    if (!cleanCode) {
      return { valid: false, discountAmount: 0, message: 'Please enter a coupon code.' };
    }

    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('coupons')
          .select('*')
          .eq('code', cleanCode)
          .eq('status', 'active')
          .maybeSingle();

        if (!error && data) {
          const now = new Date();

          if (data.starts_at && new Date(data.starts_at) > now) {
            return {
              valid: false,
              discountAmount: 0,
              message: 'This coupon code is not active yet.',
            };
          }

          if (data.expires_at && new Date(data.expires_at) < now) {
            return {
              valid: false,
              discountAmount: 0,
              message: 'This coupon code has expired.',
            };
          }

          if (data.usage_limit && (data.used_count || 0) >= data.usage_limit) {
            return {
              valid: false,
              discountAmount: 0,
              message: 'This coupon has reached its maximum usage limit.',
            };
          }

          const minOrder = Number(data.minimum_order_amount) || 0;
          if (subtotal < minOrder) {
            return {
              valid: false,
              discountAmount: 0,
              message: `Minimum order amount of Rs. ${minOrder.toLocaleString()} required for code ${cleanCode}.`,
            };
          }

          let discountAmount = 0;
          const discountVal = Number(data.discount_value) || 0;

          if (data.discount_type === 'percentage') {
            discountAmount = Math.round(subtotal * (discountVal / 100));
            if (data.maximum_discount && discountAmount > Number(data.maximum_discount)) {
              discountAmount = Number(data.maximum_discount);
            }
          } else {
            discountAmount = Math.min(subtotal, discountVal);
          }

          return {
            valid: true,
            code: cleanCode,
            discountType: data.discount_type,
            discountValue: discountVal,
            discountAmount,
            message: `Coupon ${cleanCode} applied successfully!`,
          };
        }
      } catch (err) {
        console.warn('Coupon verification network error, checking standard promotions:', err);
      }
    }

    // Local fallback for authoritative seeded test coupons
    if (cleanCode === 'SPARKLE10') {
      const discountAmount = Math.round(subtotal * 0.1);
      return {
        valid: true,
        code: 'SPARKLE10',
        discountType: 'percentage',
        discountValue: 10,
        discountAmount,
        message: 'Coupon SPARKLE10 applied (10% off)!',
      };
    }

    if (cleanCode === 'MARYAM500') {
      if (subtotal < 4000) {
        return {
          valid: false,
          discountAmount: 0,
          message: 'Minimum order amount of Rs. 4,000 required for code MARYAM500.',
        };
      }
      return {
        valid: true,
        code: 'MARYAM500',
        discountType: 'fixed',
        discountValue: 500,
        discountAmount: Math.min(subtotal, 500),
        message: 'Coupon MARYAM500 applied (Rs. 500 off)!',
      };
    }

    return {
      valid: false,
      discountAmount: 0,
      message: 'Invalid coupon code. Try SPARKLE10 or MARYAM500.',
    };
  },

  /**
   * Authoritative shipping calculation helper matching place_order RPC
   */
  calculateShipping(deliveryMethod: 'standard' | 'express', subtotal: number): number {
    if (deliveryMethod === 'express') {
      return 350;
    }
    if (subtotal >= 3000 || subtotal === 0) {
      return 0;
    }
    return 200;
  },
};
