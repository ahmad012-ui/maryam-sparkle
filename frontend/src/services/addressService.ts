/**
 * Customer Address Management Service
 * Persists addresses to Supabase addresses table with local storage fallback
 */
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { authService } from './authService';

export interface UserAddress {
  id: string;
  userId?: string;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  province?: string;
  postalCode?: string;
  country: string;
  isDefault: boolean;
  type?: 'shipping' | 'billing';
}

const LOCAL_ADDRESSES_KEY = 'maryam_sparkle_user_addresses_v1';

export const addressService = {
  async getAddresses(): Promise<UserAddress[]> {
    const user = authService.getCurrentUser();
    if (user?.id && !user.id.startsWith('usr-') && isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('addresses')
          .select('*')
          .eq('user_id', user.id)
          .order('is_default', { ascending: false })
          .order('created_at', { ascending: false });

        if (!error && data) {
          return data.map((row: any) => ({
            id: row.id,
            userId: row.user_id,
            fullName: row.full_name || '',
            phone: row.phone || '',
            addressLine1: row.address_line_1 || '',
            addressLine2: row.address_line_2 || undefined,
            city: row.city || '',
            province: row.state || undefined,
            postalCode: row.postal_code || undefined,
            country: row.country || 'Pakistan',
            isDefault: Boolean(row.is_default),
            type: row.type || 'shipping',
          }));
        }
      } catch (err) {
        console.warn('Failed to load addresses from Supabase, using local fallback:', err);
      }
    }

    // Local fallback
    try {
      const raw = localStorage.getItem(LOCAL_ADDRESSES_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  },

  async saveAddress(address: Omit<UserAddress, 'id'> & { id?: string }): Promise<UserAddress> {
    const user = authService.getCurrentUser();
    const addressId = address.id || `addr-${Date.now()}`;

    if (user?.id && !user.id.startsWith('usr-') && isSupabaseConfigured()) {
      try {
        // If setting as default, unset other defaults
        if (address.isDefault) {
          await supabase
            .from('addresses')
            .update({ is_default: false })
            .eq('user_id', user.id);
        }

        const payload = {
          user_id: user.id,
          full_name: address.fullName,
          phone: address.phone,
          address_line_1: address.addressLine1,
          address_line_2: address.addressLine2 || null,
          city: address.city,
          state: address.province || null,
          postal_code: address.postalCode || null,
          country: address.country || 'Pakistan',
          is_default: Boolean(address.isDefault),
          type: address.type || 'shipping',
        };

        if (address.id && !address.id.startsWith('addr-')) {
          const { data, error } = await supabase
            .from('addresses')
            .update(payload)
            .eq('id', address.id)
            .select()
            .single();

          if (error) throw error;
          return {
            id: data.id,
            userId: data.user_id,
            fullName: data.full_name,
            phone: data.phone,
            addressLine1: data.address_line_1,
            addressLine2: data.address_line_2 || undefined,
            city: data.city,
            province: data.state || undefined,
            postalCode: data.postal_code || undefined,
            country: data.country,
            isDefault: Boolean(data.is_default),
          };
        } else {
          const { data, error } = await supabase
            .from('addresses')
            .insert(payload)
            .select()
            .single();

          if (error) throw error;
          return {
            id: data.id,
            userId: data.user_id,
            fullName: data.full_name,
            phone: data.phone,
            addressLine1: data.address_line_1,
            addressLine2: data.address_line_2 || undefined,
            city: data.city,
            province: data.state || undefined,
            postalCode: data.postal_code || undefined,
            country: data.country,
            isDefault: Boolean(data.is_default),
          };
        }
      } catch (err) {
        console.warn('Failed to save address to Supabase, saving locally:', err);
      }
    }

    // Local fallback
    const savedAddress: UserAddress = {
      ...address,
      id: addressId,
      userId: user?.id,
    };

    const current = await this.getAddresses();
    let updated: UserAddress[];

    if (address.isDefault) {
      updated = current.map((a) => ({ ...a, isDefault: false }));
    } else {
      updated = [...current];
    }

    const index = updated.findIndex((a) => a.id === addressId);
    if (index >= 0) {
      updated[index] = savedAddress;
    } else {
      if (updated.length === 0) {
        savedAddress.isDefault = true;
      }
      updated.push(savedAddress);
    }

    localStorage.setItem(LOCAL_ADDRESSES_KEY, JSON.stringify(updated));
    return savedAddress;
  },

  async deleteAddress(addressId: string): Promise<void> {
    const user = authService.getCurrentUser();
    if (user?.id && !user.id.startsWith('usr-') && isSupabaseConfigured()) {
      try {
        await supabase
          .from('addresses')
          .delete()
          .eq('id', addressId)
          .eq('user_id', user.id);
      } catch (err) {
        console.warn('Failed to delete address from Supabase:', err);
      }
    }

    const current = await this.getAddresses();
    const updated = current.filter((a) => a.id !== addressId);
    localStorage.setItem(LOCAL_ADDRESSES_KEY, JSON.stringify(updated));
  },

  async setDefaultAddress(addressId: string): Promise<void> {
    const user = authService.getCurrentUser();
    if (user?.id && !user.id.startsWith('usr-') && isSupabaseConfigured()) {
      try {
        await supabase
          .from('addresses')
          .update({ is_default: false })
          .eq('user_id', user.id);

        await supabase
          .from('addresses')
          .update({ is_default: true })
          .eq('id', addressId)
          .eq('user_id', user.id);
      } catch (err) {
        console.warn('Failed to update default address in Supabase:', err);
      }
    }

    const current = await this.getAddresses();
    const updated = current.map((a) => ({
      ...a,
      isDefault: a.id === addressId,
    }));
    localStorage.setItem(LOCAL_ADDRESSES_KEY, JSON.stringify(updated));
  },
};
