/**
 * Image Upload Service for Supabase Storage.
 *
 * Security rules:
 * - Client-side validation is UX only; Supabase bucket restrictions are authoritative.
 * - Public product assets are uploaded only by admins.
 * - Private payment/custom-order uploads require an authenticated user.
 * - Private object paths begin with the authenticated user's UUID so Storage RLS
 *   can bind the object to the uploader.
 * - Raw file contents are never stored in the database.
 */

import { supabase, isSupabaseConfigured, SUPABASE_BUCKETS } from '../lib/supabase';
import { authService } from './authService';

export const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;
export const ALLOWED_IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'] as const;
export const ALLOWED_IMAGE_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;

export interface ImageValidationResult {
  valid: boolean;
  error?: string;
}

export interface UploadResult {
  url: string;
  storagePath: string;
  bucket: string;
}

export function validateImageFile(file: File): ImageValidationResult {
  if (!file) return { valid: false, error: 'No file provided.' };

  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    const sizeInMb = (file.size / (1024 * 1024)).toFixed(1);
    return {
      valid: false,
      error: `"${file.name}" is ${sizeInMb}MB, exceeding the 5MB limit. Please upload images up to 5MB.`,
    };
  }

  const dotIndex = file.name.lastIndexOf('.');
  const ext = dotIndex !== -1 ? file.name.slice(dotIndex).toLowerCase() : '';
  const mime = file.type.toLowerCase();
  const isExtAllowed = (ALLOWED_IMAGE_EXTENSIONS as readonly string[]).includes(ext);
  const isMimeAllowed = (ALLOWED_IMAGE_MIME_TYPES as readonly string[]).includes(mime);

  if (ext === '.gif' || mime === 'image/gif') {
    return {
      valid: false,
      error: `"${file.name}" is a GIF. Animated or static GIFs are not allowed. Only JPG, PNG, and WEBP formats are accepted.`,
    };
  }

  if (!isExtAllowed || !isMimeAllowed) {
    return {
      valid: false,
      error: `"${file.name}" is not a supported format (${ext || 'unknown'}). Only JPG, JPEG, PNG, and WEBP are accepted.`,
    };
  }

  return { valid: true };
}

export function createLocalPreviewUrl(file: File): string {
  if (typeof window !== 'undefined' && window.URL?.createObjectURL) {
    return window.URL.createObjectURL(file);
  }
  return '';
}

export function revokeLocalPreviewUrl(previewUrl: string): void {
  if (typeof window !== 'undefined' && window.URL?.revokeObjectURL && previewUrl.startsWith('blob:')) {
    try {
      window.URL.revokeObjectURL(previewUrl);
    } catch {
      // Ignore revocation errors.
    }
  }
}

function sanitizeSegment(value: string): string {
  return value.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 60);
}

function buildFileName(file: File): string {
  const fileExt = file.name.slice(file.name.lastIndexOf('.')).toLowerCase() || '.jpg';
  const cleanName = file.name
    .replace(/\.[^/.]+$/, '')
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    .slice(0, 30);
  const randomSuffix = crypto.randomUUID().replace(/-/g, '').slice(0, 16);
  return `${Date.now()}_${cleanName}_${randomSuffix}${fileExt}`;
}

/**
 * Uploads an image to Supabase Storage.
 * Private buckets return a short-lived signed URL; the durable database value
 * should be the returned storage path rather than a bearer URL.
 */
export async function uploadImageFile(
  file: File,
  folder: 'products' | 'payment-proofs' | 'custom-orders' | string = 'products',
  resourceId?: string
): Promise<string> {
  const validation = validateImageFile(file);
  if (!validation.valid) throw new Error(validation.error || 'Invalid image file');

  let bucketName = SUPABASE_BUCKETS.PRODUCTS;
  if (folder === 'payment-proofs' || folder === 'proofs') bucketName = SUPABASE_BUCKETS.PAYMENT_PROOFS;
  else if (folder === 'custom-orders' || folder === 'custom') bucketName = SUPABASE_BUCKETS.CUSTOM_ORDERS;

  const isPrivateBucket = bucketName === SUPABASE_BUCKETS.PAYMENT_PROOFS || bucketName === SUPABASE_BUCKETS.CUSTOM_ORDERS;
  const currentUser = authService.getCurrentUser();
  const userId = currentUser?.id && !currentUser.id.startsWith('usr-') ? currentUser.id : null;

  if (isPrivateBucket && !userId) {
    throw new Error('Please sign in before uploading payment proof or custom-order reference images.');
  }

  const fileName = buildFileName(file);
  const resourceSegment = resourceId ? `${sanitizeSegment(resourceId)}/` : '';
  const filePath = isPrivateBucket
    ? `${userId}/${resourceSegment}${fileName}`
    : `${folder}/${fileName}`;

  if (!isSupabaseConfigured()) {
    throw new Error('Secure image storage is not configured. Please try again later.');
  }

  try {
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(filePath, file, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: false,
      });

    if (error) throw new Error(error.message);
    if (!data?.path) throw new Error('Storage did not return an object path.');

    if (!isPrivateBucket) {
      const { data: publicUrlData } = supabase.storage.from(bucketName).getPublicUrl(data.path);
      if (!publicUrlData?.publicUrl) throw new Error('Storage did not return a public URL.');
      return publicUrlData.publicUrl;
    }

    const { data: signedUrlData, error: signedUrlError } = await supabase.storage
      .from(bucketName)
      .createSignedUrl(data.path, 60 * 60);

    if (signedUrlError || !signedUrlData?.signedUrl) {
      throw new Error('Upload succeeded, but a temporary preview URL could not be created.');
    }

    return signedUrlData.signedUrl;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown storage upload failure';
    throw new Error(`Failed to upload "${file.name}" to Supabase Storage: ${msg}`);
  }
}

export const imageUploadService = {
  validateImageFile,
  createLocalPreviewUrl,
  revokeLocalPreviewUrl,
  uploadImageFile,
  uploadProductImage: async (file: File) => {
    const url = await uploadImageFile(file, 'products');
    return { success: true, url };
  },
  uploadPaymentProof: async (file: File, orderId?: string) => {
    const url = await uploadImageFile(file, 'payment-proofs', orderId);
    return { success: true, url, storagePath: url };
  },
  uploadCustomOrderImage: async (file: File, customOrderId?: string) => {
    const url = await uploadImageFile(file, 'custom-orders', customOrderId);
    return { success: true, url, storagePath: url };
  },
};
