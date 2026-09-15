import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { authService } from './authService';

export interface ProductReview {
  id: string;
  productId: string;
  userId?: string;
  authorName: string;
  rating: number;
  title?: string;
  comment: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

export interface SubmitReviewPayload {
  productId: string;
  rating: number;
  title?: string;
  comment: string;
  authorName?: string;
}

const isUuid = (val: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(val);

export const reviewService = {
  async getProductReviews(productId: string): Promise<ProductReview[]> {
    if (!isSupabaseConfigured() || !isUuid(productId)) {
      return [];
    }

    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('*, profiles(full_name, first_name, last_name)')
        .eq('product_id', productId)
        .eq('status', 'approved')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (data || []).map((r: any) => {
        const profile = r.profiles;
        const authorName =
          profile?.full_name ||
          [profile?.first_name, profile?.last_name].filter(Boolean).join(' ') ||
          'Studio Patron';

        return {
          id: r.id,
          productId: r.product_id,
          userId: r.user_id || undefined,
          authorName,
          rating: Number(r.rating) || 5,
          title: r.title || undefined,
          comment: r.comment || '',
          status: r.status,
          createdAt: r.created_at,
        };
      });
    } catch (err) {
      console.warn('Failed to load reviews from Supabase:', err);
      return [];
    }
  },

  async submitReview(payload: SubmitReviewPayload): Promise<{ success: boolean; message: string; review?: ProductReview }> {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase is not configured.');
    }

    if (!isUuid(payload.productId)) {
      throw new Error('Invalid product identifier.');
    }

    if (payload.rating < 1 || payload.rating > 5) {
      throw new Error('Rating must be between 1 and 5 stars.');
    }

    if (!payload.comment.trim() || payload.comment.trim().length < 5) {
      throw new Error('Please write at least 5 characters in your review comment.');
    }

    const currentUser = authService.getCurrentUser();
    const userId = currentUser && isUuid(currentUser.id) ? currentUser.id : null;

    const row = {
      product_id: payload.productId,
      user_id: userId,
      rating: Math.round(payload.rating),
      title: payload.title?.trim() || null,
      comment: payload.comment.trim(),
      status: 'approved', // Live approved with trigger updating product rating
    };

    const { data, error } = await supabase.from('reviews').insert(row).select().single();
    if (error) throw error;

    const createdReview: ProductReview = {
      id: data?.id || `rev-${Date.now()}`,
      productId: payload.productId,
      userId: userId || undefined,
      authorName: payload.authorName || currentUser?.name || 'Studio Patron',
      rating: Math.round(payload.rating),
      title: payload.title?.trim() || undefined,
      comment: payload.comment.trim(),
      status: 'approved',
      createdAt: data?.created_at || new Date().toISOString(),
    };

    return {
      success: true,
      message: 'Thank you! Your verified studio review has been published.',
      review: createdReview,
    };
  },
};
