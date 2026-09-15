/**
 * Newsletter subscription service for Maryam Sparkle Studio
 * Persists subscriptions to Supabase newsletter_subscribers with local storage fallback
 */
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { isValidEmail } from '../utils/validation';

export interface NewsletterSubscribeResult {
  success: boolean;
  message: string;
  isNewSubscriber: boolean;
}

const LOCAL_SUBSCRIBERS_KEY = 'maryam_sparkle_newsletter_subscribers_v1';

export const newsletterService = {
  /**
   * Subscribe an email address to the studio newsletter / VIP drops list
   */
  async subscribe(email: string, source: string = 'footer_signup'): Promise<NewsletterSubscribeResult> {
    const cleanEmail = email?.trim().toLowerCase();

    if (!cleanEmail || !isValidEmail(cleanEmail)) {
      return {
        success: false,
        message: 'Please enter a valid email address (e.g. name@example.com).',
        isNewSubscriber: false,
      };
    }

    if (isSupabaseConfigured()) {
      try {
        const { error } = await supabase
          .from('newsletter_subscribers')
          .insert({
            email: cleanEmail,
            source,
            status: 'subscribed',
          });

        if (error) {
          // Check for unique violation (already subscribed)
          if (error.code === '23505' || error.message.includes('unique') || error.message.includes('duplicate')) {
            return {
              success: true,
              message: 'You are already subscribed to the Maryam Sparkle Studio list! Thank you for staying connected.',
              isNewSubscriber: false,
            };
          }
          throw error;
        }

        return {
          success: true,
          message: 'Welcome to the Studio Circle! Check your inbox soon for exclusive gemstone previews.',
          isNewSubscriber: true,
        };
      } catch (err) {
        console.warn('Supabase newsletter subscribe fallback to local storage:', err);
      }
    }

    // Local fallback
    try {
      const raw = localStorage.getItem(LOCAL_SUBSCRIBERS_KEY);
      const list: string[] = raw ? JSON.parse(raw) : [];
      if (list.includes(cleanEmail)) {
        return {
          success: true,
          message: 'You are already on our studio list! Thank you for staying connected.',
          isNewSubscriber: false,
        };
      }
      list.push(cleanEmail);
      localStorage.setItem(LOCAL_SUBSCRIBERS_KEY, JSON.stringify(list));
      return {
        success: true,
        message: 'Welcome to the Studio Circle! Check your inbox soon for exclusive gemstone previews.',
        isNewSubscriber: true,
      };
    } catch {
      return {
        success: true,
        message: 'Thank you for subscribing to Maryam Sparkle updates.',
        isNewSubscriber: true,
      };
    }
  },
};
