import { UserProfile, UserAddress } from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

let currentUserCache: UserProfile | null = null;

function requireSupabase() {
  if (!isSupabaseConfigured()) throw new Error('Supabase is not configured. Authentication requires Supabase Auth.');
}

function mapAuthError(message: string): Error {
  const normalized = message.toLowerCase();
  if (normalized.includes('email rate limit exceeded') || normalized.includes('rate limit exceeded')) {
    return new Error('Supabase email sending is temporarily rate-limited. Please wait for the limit to reset, or disable Confirm Email while developing.');
  }
  if (normalized.includes('email not confirmed')) {
    return new Error('Please confirm your email address before signing in.');
  }
  if (normalized.includes('email address') && normalized.includes('invalid')) {
    return new Error('Supabase rejected this email address. Use a normal email such as Gmail, or configure a custom SMTP/domain for your own address.');
  }
  if (normalized.includes('user already registered')) {
    return new Error('An account with this email already exists. Please sign in instead.');
  }
  return new Error(message);
}

async function syncSessionUser(user: any): Promise<UserProfile | null> {
  if (!user) {
    currentUserCache = null;
    return null;
  }
  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle();
  const fullName = profile?.full_name || user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || 'Valued Patron';
  const { data: addresses } = await supabase.from('addresses').select('*').eq('user_id', user.id);
  currentUserCache = {
    id: user.id,
    name: fullName,
    email: user.email || '',
    phone: profile?.phone || user.user_metadata?.phone || '',
    role: profile?.role || 'customer',
    joinedDate: new Date(user.created_at || Date.now()).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
    addresses: (addresses || []).map((addr: any) => ({
      id: addr.id, label: addr.label || 'Home', fullName: addr.full_name, phone: addr.phone,
      address: addr.address_line_1 + (addr.address_line_2 ? `, ${addr.address_line_2}` : ''), city: addr.city,
      postalCode: addr.postal_code || '', isDefault: !!addr.is_default,
    })),
  };
  return currentUserCache;
}

export const authService = {
  initAuthListener(): () => void {
    if (!isSupabaseConfigured()) return () => {};
    void supabase.auth.getSession().then(({ data }) => syncSessionUser(data.session?.user || null));
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      void syncSessionUser(session?.user || null).then(() => {
        if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'USER_UPDATED') {
          window.dispatchEvent(new Event('auth-change'));
        }
      });
    });
    return () => data.subscription.unsubscribe();
  },

  async getCurrentUserAsync(): Promise<UserProfile | null> {
    requireSupabase();
    const { data, error } = await supabase.auth.getUser();
    if (error) {
      currentUserCache = null;
      return null;
    }
    return syncSessionUser(data.user || null);
  },

  async isAdmin(): Promise<boolean> {
    const user = await this.getCurrentUserAsync();
    return user?.role === 'admin';
  },

  getCurrentUser(): UserProfile | null { return currentUserCache; },
  isLoggedIn(): boolean { return currentUserCache !== null; },

  async login(credentials: { email: string; password?: string; name?: string; phone?: string }): Promise<UserProfile> {
    requireSupabase();
    if (!credentials.password) throw new Error('Password is required.');
    const { data, error } = await supabase.auth.signInWithPassword({ email: credentials.email.trim(), password: credentials.password });
    if (error) throw mapAuthError(error.message);
    const profile = await syncSessionUser(data.user);
    if (!profile) throw new Error('Unable to load your Supabase profile.');
    window.dispatchEvent(new Event('auth-change'));
    return profile;
  },

  async register(data: { name: string; email: string; password?: string; phone?: string }): Promise<UserProfile> {
    requireSupabase();
    if (!data.password) throw new Error('Password is required.');
    const { data: authData, error } = await supabase.auth.signUp({
      email: data.email.trim(),
      password: data.password,
      options: {
        data: { full_name: data.name.trim(), phone: data.phone?.trim() || '', role: 'customer' },
        emailRedirectTo: window.location.origin,
      },
    });
    if (error) throw mapAuthError(error.message);
    if (!authData.user) throw new Error('Supabase did not create the account.');

    // When Confirm Email is disabled, Supabase returns both user and session.
    // When it is enabled, session is null until the user confirms the email.
    if (!authData.session) {
      currentUserCache = null;
      throw new Error('Account created successfully. Please check your email and confirm your account before signing in.');
    }

    const profile = await syncSessionUser(authData.user);
    if (!profile) throw new Error('Unable to load your new Supabase profile.');
    window.dispatchEvent(new Event('auth-change'));
    return profile;
  },

  async signInWithGoogle(): Promise<void> {
    requireSupabase();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    });
    if (error) throw mapAuthError(error.message);
  },

  async logout(): Promise<void> {
    requireSupabase();
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    currentUserCache = null;
    window.dispatchEvent(new Event('auth-change'));
  },

  updateProfile(updates: Partial<UserProfile>): UserProfile | null {
    if (!currentUserCache) return null;
    const updated = { ...currentUserCache, ...updates };
    currentUserCache = updated;
    if (isSupabaseConfigured() && !updated.id.startsWith('usr-')) {
      void supabase.from('profiles').update({ full_name: updated.name, phone: updated.phone, updated_at: new Date().toISOString() }).eq('id', updated.id);
    }
    window.dispatchEvent(new Event('auth-change'));
    return updated;
  },

  addAddress(address: Omit<UserAddress, 'id'>): UserAddress | null {
    if (!currentUserCache) return null;
    const newAddr: UserAddress = { ...address, id: crypto.randomUUID() };
    const updatedAddresses = newAddr.isDefault
      ? (currentUserCache.addresses || []).map((a) => ({ ...a, isDefault: false })).concat(newAddr)
      : [...(currentUserCache.addresses || []), newAddr];
    this.updateProfile({ addresses: updatedAddresses });
    if (!currentUserCache.id.startsWith('usr-')) {
      void supabase.from('addresses').insert({ user_id: currentUserCache.id, label: newAddr.label || 'Home', full_name: newAddr.fullName, phone: newAddr.phone, address_line_1: newAddr.address, city: newAddr.city, postal_code: newAddr.postalCode, country: 'Pakistan', is_default: !!newAddr.isDefault });
    }
    return newAddr;
  },

  deleteAddress(addressId: string): void {
    if (!currentUserCache) return;
    currentUserCache = { ...currentUserCache, addresses: (currentUserCache.addresses || []).filter((a) => a.id !== addressId) };
    if (!addressId.startsWith('addr-')) void supabase.from('addresses').delete().eq('id', addressId);
    window.dispatchEvent(new Event('auth-change'));
  },
};
