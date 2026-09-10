import { UserProfile, UserAddress } from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const USER_STORAGE_KEY = 'maryam_sparkle_user_v1';
const AUTH_STATUS_KEY = 'maryam_sparkle_auth_status_v1';

export const authService = {
  /**
   * Initializes Supabase Auth state change listener
   */
  initAuthListener(): () => void {
    if (!isSupabaseConfigured()) {
      return () => {};
    }

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        // Fetch or sync profile from Supabase profiles table
        try {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          const fullName =
            profile?.full_name ||
            session.user.user_metadata?.full_name ||
            session.user.user_metadata?.name ||
            session.user.email?.split('@')[0] ||
            'Valued Patron';

          const userProfile: UserProfile = {
            id: session.user.id,
            name: fullName,
            email: session.user.email || '',
            phone: profile?.phone || session.user.user_metadata?.phone || '',
            role: profile?.role || 'customer',
            joinedDate: new Date(session.user.created_at || Date.now()).toLocaleDateString('en-US', {
              month: 'long',
              year: 'numeric',
            }),
            addresses: [],
          };

          // Fetch user addresses from Supabase addresses table
          const { data: addresses } = await supabase
            .from('addresses')
            .select('*')
            .eq('user_id', session.user.id);

          if (addresses && addresses.length > 0) {
            userProfile.addresses = addresses.map((addr) => ({
              id: addr.id,
              label: addr.label || 'Home',
              fullName: addr.full_name,
              phone: addr.phone,
              address: addr.address_line_1 + (addr.address_line_2 ? `, ${addr.address_line_2}` : ''),
              city: addr.city,
              postalCode: addr.postal_code || '',
              isDefault: addr.is_default || false,
            }));
          }

          localStorage.removeItem(AUTH_STATUS_KEY);
          localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userProfile));
          window.dispatchEvent(new Event('auth-change'));
        } catch (err) {
          console.error('Error syncing Supabase user profile:', err);
        }
      } else if (event === 'SIGNED_OUT') {
        localStorage.removeItem(USER_STORAGE_KEY);
        localStorage.setItem(AUTH_STATUS_KEY, 'logged_out');
        window.dispatchEvent(new Event('auth-change'));
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  },

  getCurrentUser(): UserProfile | null {
    try {
      if (typeof window === 'undefined') return null;

      if (localStorage.getItem(AUTH_STATUS_KEY) === 'logged_out') {
        return null;
      }
      const raw = localStorage.getItem(USER_STORAGE_KEY);
      if (!raw) {
        return null;
      }
      const parsed = JSON.parse(raw);
      if (parsed?.id === 'usr-001' || parsed?.email === 'sara.siddiqui@example.com') {
        localStorage.removeItem(USER_STORAGE_KEY);
        return null;
      }
      return parsed;
    } catch {
      return null;
    }
  },

  isLoggedIn(): boolean {
    return this.getCurrentUser() !== null;
  },

  async logout(): Promise<void> {
    try {
      if (isSupabaseConfigured()) {
        await supabase.auth.signOut();
      }
      localStorage.removeItem(USER_STORAGE_KEY);
      localStorage.setItem(AUTH_STATUS_KEY, 'logged_out');
      window.dispatchEvent(new Event('auth-change'));
    } catch (err) {
      console.error('Logout error:', err);
    }
  },

  async login(credentials: { email: string; password?: string; name?: string; phone?: string }): Promise<UserProfile> {
    try {
      localStorage.removeItem(AUTH_STATUS_KEY);
      const trimmedEmail = credentials.email.trim();

      // If Supabase is configured and password is provided, sign in via Supabase Auth
      if (isSupabaseConfigured() && credentials.password) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: trimmedEmail,
          password: credentials.password,
        });

        if (error) {
          throw new Error(error.message);
        }

        if (data.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .maybeSingle();

          const derivedName =
            profile?.full_name ||
            data.user.user_metadata?.full_name ||
            (trimmedEmail.split('@')[0]
              ? trimmedEmail.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
              : 'Valued Patron');

          const fullUser: UserProfile = {
            id: data.user.id,
            name: derivedName,
            email: data.user.email || trimmedEmail,
            phone: profile?.phone || credentials.phone?.trim() || '',
            role: profile?.role || 'customer',
            joinedDate: new Date(data.user.created_at || Date.now()).toLocaleDateString('en-US', {
              month: 'long',
              year: 'numeric',
            }),
            addresses: [],
          };

          localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(fullUser));
          window.dispatchEvent(new Event('auth-change'));
          return fullUser;
        }
      }

      // Fallback for demo / preview without Supabase configuration
      const derivedName =
        credentials.name?.trim() ||
        (trimmedEmail.split('@')[0]
          ? trimmedEmail.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
          : 'Valued Patron');

      const fullUser: UserProfile = {
        id: `usr-${Date.now()}`,
        name: derivedName,
        email: trimmedEmail,
        phone: credentials.phone?.trim() || '',
        joinedDate: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
        addresses: [],
      };
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(fullUser));
      window.dispatchEvent(new Event('auth-change'));
      return fullUser;
    } catch (err) {
      console.error('Login error:', err);
      throw err;
    }
  },

  async register(data: { name: string; email: string; password?: string; phone?: string }): Promise<UserProfile> {
    try {
      localStorage.removeItem(AUTH_STATUS_KEY);
      const trimmedEmail = data.email.trim();
      const trimmedName = data.name.trim();

      // If Supabase is configured and password is provided, sign up via Supabase Auth
      if (isSupabaseConfigured() && data.password) {
        const { data: authData, error } = await supabase.auth.signUp({
          email: trimmedEmail,
          password: data.password,
          options: {
            data: {
              full_name: trimmedName,
              phone: data.phone?.trim() || '',
              role: 'customer',
            },
          },
        });

        if (error) {
          throw new Error(error.message);
        }

        const userId = authData.user?.id || `usr-${Date.now()}`;
        const fullUser: UserProfile = {
          id: userId,
          name: trimmedName,
          email: trimmedEmail,
          phone: data.phone?.trim() || '',
          role: 'customer',
          joinedDate: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
          addresses: [],
        };

        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(fullUser));
        window.dispatchEvent(new Event('auth-change'));
        return fullUser;
      }

      // Fallback for preview / demo mode
      const fullUser: UserProfile = {
        id: `usr-${Date.now()}`,
        name: trimmedName,
        email: trimmedEmail,
        phone: data.phone?.trim() || '',
        role: 'customer',
        joinedDate: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
        addresses: [],
      };
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(fullUser));
      window.dispatchEvent(new Event('auth-change'));
      return fullUser;
    } catch (err) {
      console.error('Register error:', err);
      throw err;
    }
  },

  updateProfile(updates: Partial<UserProfile>): UserProfile | null {
    const current = this.getCurrentUser();
    if (!current) {
      return null;
    }
    const updated: UserProfile = { ...current, ...updates };
    try {
      localStorage.removeItem(AUTH_STATUS_KEY);
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updated));
      window.dispatchEvent(new Event('auth-change'));

      // If Supabase is configured, sync updates to Supabase profiles table
      if (isSupabaseConfigured() && current.id && !current.id.startsWith('usr-')) {
        supabase
          .from('profiles')
          .update({
            full_name: updated.name,
            phone: updated.phone,
            updated_at: new Date().toISOString(),
          })
          .eq('id', current.id)
          .then();
      }
    } catch (err) {
      console.error('Update profile error:', err);
    }
    return updated;
  },

  addAddress(address: Omit<UserAddress, 'id'>): UserAddress | null {
    const current = this.getCurrentUser();
    if (!current) return null;

    const newAddr: UserAddress = {
      ...address,
      id: `addr-${Date.now()}`,
    };

    let updatedAddresses = [...(current.addresses || [])];
    if (newAddr.isDefault) {
      updatedAddresses = updatedAddresses.map((a) => ({ ...a, isDefault: false }));
    }
    updatedAddresses.push(newAddr);

    this.updateProfile({ addresses: updatedAddresses });

    // Sync to Supabase addresses table if authenticated
    if (isSupabaseConfigured() && current.id && !current.id.startsWith('usr-')) {
      supabase
        .from('addresses')
        .insert({
          user_id: current.id,
          label: newAddr.label || 'Home',
          full_name: newAddr.fullName,
          phone: newAddr.phone,
          address_line_1: newAddr.address,
          city: newAddr.city,
          postal_code: newAddr.postalCode,
          country: 'Pakistan',
          is_default: newAddr.isDefault || false,
        })
        .then();
    }

    return newAddr;
  },

  deleteAddress(addressId: string): void {
    const current = this.getCurrentUser();
    if (!current) return;
    const filtered = (current.addresses || []).filter((a) => a.id !== addressId);
    this.updateProfile({ addresses: filtered });

    if (isSupabaseConfigured() && !addressId.startsWith('addr-')) {
      supabase.from('addresses').delete().eq('id', addressId).then();
    }
  },
};
