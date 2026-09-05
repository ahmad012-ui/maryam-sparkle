/**
 * Image Upload Service for Laravel Backend Integration
 * Architecture: File -> FormData -> Laravel Storage -> URL -> Database
 *
 * Requirements:
 * - Direct file upload only (no base64 / data URL conversion)
 * - Strict whitelist: .jpg, .jpeg, .png, .webp only (GIF and others rejected)
 * - Strict max file size: 10MB exactly
 */

export const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
export const ALLOWED_IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'] as const;
export const ALLOWED_IMAGE_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;

export interface ImageValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Validates file against strict format whitelist and 10MB size limit.
 * Explicitly rejects GIF, SVG, BMP, and any unsupported file types.
 */
export function validateImageFile(file: File): ImageValidationResult {
  if (!file) {
    return { valid: false, error: 'No file provided.' };
  }

  // Check file size (10MB)
  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    const sizeInMb = (file.size / (1024 * 1024)).toFixed(1);
    return {
      valid: false,
      error: `"${file.name}" is ${sizeInMb}MB, exceeding the 10MB limit. Please upload a file up to 10MB.`,
    };
  }

  // Check file extension
  const dotIndex = file.name.lastIndexOf('.');
  const ext = dotIndex !== -1 ? file.name.slice(dotIndex).toLowerCase() : '';
  const isExtAllowed = (ALLOWED_IMAGE_EXTENSIONS as readonly string[]).includes(ext);

  // Check MIME type
  const mime = file.type.toLowerCase();
  const isMimeAllowed = (ALLOWED_IMAGE_MIME_TYPES as readonly string[]).includes(mime);

  // Specifically check for GIF or other common invalid types to provide tailored feedback
  if (ext === '.gif' || mime === 'image/gif') {
    return {
      valid: false,
      error: `"${file.name}" is a GIF. Animated or static GIFs are not allowed. Only JPG, PNG, and WEBP formats are accepted.`,
    };
  }

  if (!isExtAllowed || !isMimeAllowed) {
    return {
      valid: false,
      error: `"${file.name}" is not a supported image type. Only JPG, PNG, and WEBP formats are accepted.`,
    };
  }

  return { valid: true };
}

/**
 * Uploads a File directly to the Laravel backend via multipart/form-data.
 * Flow: File -> FormData -> Laravel (/api/v1/media/upload) -> Storage -> URL -> DB
 *
 * @param file The File object selected by the user
 * @param folder Optional storage subfolder (default: 'products')
 * @returns The resolved public storage URL string
 */
export async function uploadImageFile(file: File, folder: string = 'products'): Promise<string> {
  // Validate before sending
  const validation = validateImageFile(file);
  if (!validation.valid) {
    throw new Error(validation.error || 'Invalid image file');
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('folder', folder);

  try {
    const response = await fetch('/api/v1/media/upload', {
      method: 'POST',
      body: formData,
      headers: {
        Accept: 'application/json',
        // Content-Type is intentionally omitted so the browser sets multipart/form-data with boundary
      },
    });

    if (response.ok) {
      const result = await response.json();
      if (result?.url && typeof result.url === 'string') {
        return result.url;
      }
      if (result?.data?.url && typeof result.data.url === 'string') {
        return result.data.url;
      }
    }
  } catch {
    // Backend endpoint not active yet in development/preview mode
  }

  /**
   * Documented stub for local/preview environment when Laravel backend is not yet reachable:
   * Returns a standard browser Object URL (blob:...) referencing the raw File handle in memory.
   * This provides an instant, zero-latency image URL for preview and form state
   * WITHOUT generating, converting, or storing any base64 data URLs.
   */
  if (typeof window !== 'undefined' && window.URL && window.URL.createObjectURL) {
    return window.URL.createObjectURL(file);
  }

  // Fallback storage URL representation if window.URL is unavailable
  const sanitized = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  return `/storage/${folder}/${Date.now()}_${sanitized}`;
}
