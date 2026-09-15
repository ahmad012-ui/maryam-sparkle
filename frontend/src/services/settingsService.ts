import { supabase, isSupabaseConfigured } from '../lib/supabase';

export interface StoreSettings {
  storeName: string;
  tagline: string;
  currency: string;
  adminName: string;
  adminEmail: string;
  adminPhone: string;
  whatsappNumber: string;
  standardShippingFee: number;
  freeShippingThreshold: number;
  expressShippingFee: number;
  city: string;
  country: string;
  courierPartners: string[];
}

export const DEFAULT_STORE_SETTINGS: StoreSettings = {
  storeName: 'Maryam Sparkle',
  tagline: 'Handcrafted Artistry & Delicate Jewelry',
  currency: 'PKR',
  adminName: 'Maryam Rehman',
  adminEmail: 'artisan@maryamsparkle.com',
  adminPhone: '+92 300 1234567',
  whatsappNumber: '+92 300 1234567',
  standardShippingFee: 200,
  freeShippingThreshold: 3000,
  expressShippingFee: 350,
  city: 'Karachi',
  country: 'Pakistan',
  courierPartners: ['Trax Logistics', 'TCS Express', 'Leopards Courier', 'Call Courier'],
};

let cachedSettings: StoreSettings = { ...DEFAULT_STORE_SETTINGS };
let fetchPromise: Promise<StoreSettings> | null = null;

export const settingsService = {
  getCachedSettings(): StoreSettings {
    return cachedSettings;
  },

  async getSettings(): Promise<StoreSettings> {
    if (!isSupabaseConfigured()) {
      return cachedSettings;
    }

    if (fetchPromise) {
      return fetchPromise;
    }

    fetchPromise = (async () => {
      try {
        const { data, error } = await supabase
          .from('store_settings')
          .select('settings')
          .eq('id', 'default')
          .maybeSingle();

        if (!error && data?.settings) {
          const loaded = data.settings.storeSettings || data.settings;
          cachedSettings = {
            ...DEFAULT_STORE_SETTINGS,
            ...loaded,
            standardShippingFee: Number(loaded.standardShippingFee) || DEFAULT_STORE_SETTINGS.standardShippingFee,
            freeShippingThreshold: Number(loaded.freeShippingThreshold) || DEFAULT_STORE_SETTINGS.freeShippingThreshold,
            expressShippingFee: Number(loaded.expressShippingFee) || DEFAULT_STORE_SETTINGS.expressShippingFee,
          };
        }
      } catch (err) {
        console.warn('Failed to load store settings from Supabase, using defaults:', err);
      } finally {
        fetchPromise = null;
      }
      return cachedSettings;
    })();

    return fetchPromise;
  },

  calculateShipping(deliveryMethod: 'standard' | 'express', subtotal: number): number {
    const settings = cachedSettings;
    if (deliveryMethod === 'express') {
      return settings.expressShippingFee;
    }
    if (subtotal >= settings.freeShippingThreshold || subtotal === 0) {
      return 0;
    }
    return settings.standardShippingFee;
  },
};
