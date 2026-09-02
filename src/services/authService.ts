import { UserProfile, UserAddress } from '../types';

const USER_STORAGE_KEY = 'maryam_sparkle_user_v1';

const DEMO_USER: UserProfile = {
  id: 'usr-001',
  name: 'Sara Siddiqui',
  email: 'sara.siddiqui@example.com',
  phone: '+92 300 1234567',
  joinedDate: 'January 2026',
  addresses: [
    {
      id: 'addr-1',
      label: 'Home',
      fullName: 'Sara Siddiqui',
      phone: '+92 300 1234567',
      address: 'House 18-B, Street 4, Defense Phase 5',
      city: 'Karachi',
      postalCode: '75500',
      isDefault: true
    },
    {
      id: 'addr-2',
      label: 'Studio / Office',
      fullName: 'Sara Siddiqui',
      phone: '+92 300 1234567',
      address: 'Suite 204, Creative Square, Clifton Block 2',
      city: 'Karachi',
      postalCode: '75600',
      isDefault: false
    }
  ]
};

export const authService = {
  getCurrentUser(): UserProfile | null {
    try {
      const raw = localStorage.getItem(USER_STORAGE_KEY);
      if (!raw) {
        // initialize demo user by default for seamless browsing experience
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(DEMO_USER));
        return DEMO_USER;
      }
      return JSON.parse(raw);
    } catch {
      return DEMO_USER;
    }
  },

  updateProfile(updates: Partial<UserProfile>): UserProfile {
    const current = this.getCurrentUser() || DEMO_USER;
    const updated: UserProfile = { ...current, ...updates };
    try {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updated));
    } catch (err) {
      console.error(err);
    }
    return updated;
  },

  addAddress(address: Omit<UserAddress, 'id'>): UserAddress {
    const current = this.getCurrentUser() || DEMO_USER;
    const newAddr: UserAddress = {
      ...address,
      id: `addr-${Date.now()}`
    };

    let updatedAddresses = [...current.addresses];
    if (newAddr.isDefault) {
      updatedAddresses = updatedAddresses.map((a) => ({ ...a, isDefault: false }));
    }
    updatedAddresses.push(newAddr);

    this.updateProfile({ addresses: updatedAddresses });
    return newAddr;
  },

  deleteAddress(addressId: string): void {
    const current = this.getCurrentUser() || DEMO_USER;
    const filtered = current.addresses.filter((a) => a.id !== addressId);
    this.updateProfile({ addresses: filtered });
  }
};
