import { UserProfile, UserAddress } from '../types';

const USER_STORAGE_KEY = 'maryam_sparkle_user_v1';
const AUTH_STATUS_KEY = 'maryam_sparkle_auth_status_v1';

export const authService = {
  getCurrentUser(): UserProfile | null {
    try {
      if (typeof window === 'undefined') return null;

      // If user has explicitly logged out, respect guest status
      if (localStorage.getItem(AUTH_STATUS_KEY) === 'logged_out') {
        return null;
      }
      const raw = localStorage.getItem(USER_STORAGE_KEY);
      if (!raw) {
        return null;
      }
      const parsed = JSON.parse(raw);
      // Clean up legacy fake demo user if found in browser storage
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

  logout(): void {
    try {
      localStorage.removeItem(USER_STORAGE_KEY);
      localStorage.setItem(AUTH_STATUS_KEY, 'logged_out');
      window.dispatchEvent(new Event('auth-change'));
    } catch (err) {
      console.error('Logout error:', err);
    }
  },

  login(credentials: { email: string; name?: string; phone?: string }): UserProfile {
    try {
      localStorage.removeItem(AUTH_STATUS_KEY);
      const trimmedEmail = credentials.email.trim();
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
        addresses: []
      };
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(fullUser));
      window.dispatchEvent(new Event('auth-change'));
      return fullUser;
    } catch (err) {
      console.error('Login error:', err);
      throw err;
    }
  },

  register(data: { name: string; email: string; phone?: string }): UserProfile {
    try {
      localStorage.removeItem(AUTH_STATUS_KEY);
      const fullUser: UserProfile = {
        id: `usr-${Date.now()}`,
        name: data.name.trim(),
        email: data.email.trim(),
        phone: data.phone?.trim() || '',
        joinedDate: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
        addresses: []
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
      id: `addr-${Date.now()}`
    };

    let updatedAddresses = [...(current.addresses || [])];
    if (newAddr.isDefault) {
      updatedAddresses = updatedAddresses.map((a) => ({ ...a, isDefault: false }));
    }
    updatedAddresses.push(newAddr);

    this.updateProfile({ addresses: updatedAddresses });
    return newAddr;
  },

  deleteAddress(addressId: string): void {
    const current = this.getCurrentUser();
    if (!current) return;
    const filtered = (current.addresses || []).filter((a) => a.id !== addressId);
    this.updateProfile({ addresses: filtered });
  }
};

