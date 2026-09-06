/**
 * Image Upload Service for Laravel Backend Integration
 * Architecture: File -> FormData -> Laravel Storage (/api/v1/media/upload) -> URL -> Database
 *
 * Requirements:
 * - Direct file upload only (no base64 / data URL conversion)
 * - Strict whitelist: .jpg, .jpeg, .png, .webp only (GIF and others rejected)
 * - Strict max file size: 5MB per image
 * - Never return blob URLs as persisted storage URLs
 * - Backend upload failures throw descriptive errors for UX handling
 */

export const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB max
export const ALLOWED_IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'] as const;
export const ALLOWED_IMAGE_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;

export interface ImageValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Validates file against strict format whitelist and 5MB size limit.
 * Explicitly rejects GIF, SVG, BMP, and any unsupported file types.
 */
export function validateImageFile(file: File): ImageValidationResult {
  if (!file) {
    return { valid: false, error: 'No file provided.' };
  }

  // Check file size (5MB limit)
  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    const sizeInMb = (file.size / (1024 * 1024)).toFixed(1);
    return {
      valid: false,
      error: `"${file.name}" is ${sizeInMb}MB, exceeding the 5MB limit. Please upload images up to 5MB.`,
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
      error: `"${file.name}" is not a supported format (${ext || 'unknown'}). Only JPG, JPEG, PNG, and WEBP are accepted.`,
    };
  }

  return { valid: true };
}

/**
 * Creates a temporary local Object URL solely for browser image preview.
 * This URL must NEVER be saved to the database or treated as a persisted image.
 */
export function createLocalPreviewUrl(file: File): string {
  if (typeof window !== 'undefined' && window.URL && window.URL.createObjectURL) {
    return window.URL.createObjectURL(file);
  }
  return '';
}

/**
 * Revokes a temporary local preview Object URL to free memory.
 */
export function revokeLocalPreviewUrl(previewUrl: string): void {
  if (typeof window !== 'undefined' && window.URL && window.URL.revokeObjectURL && previewUrl.startsWith('blob:')) {
    try {
      window.URL.revokeObjectURL(previewUrl);
    } catch {
      // Ignore revocation errors
    }
  }
}

/**
 * Uploads a File directly to the Laravel backend via multipart/form-data.
 * Flow: File -> FormData -> Laravel (/api/v1/media/upload) -> Storage -> Public URL -> DB
 *
 * NOTE: If the backend is unavailable or returns an error, this throws an Error.
 * It NEVER falls back to returning a blob: URL or pretending persistence succeeded.
 *
 * @param file The File object selected by the user
 * @param folder Storage subfolder (default: 'products')
 * @returns The resolved public storage URL from Laravel
 */
export async function uploadImageFile(file: File, folder: string = 'products'): Promise<string> {
  // Validate before upload
  const validation = validateImageFile(file);
  if (!validation.valid) {
    throw new Error(validation.error || 'Invalid image file');
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('folder', folder);

  let response: Response;
  try {
    response = await fetch('/api/v1/media/upload', {
      method: 'POST',
      body: formData,
      headers: {
        Accept: 'application/json',
        // Content-Type is omitted so browser sets multipart/form-data with boundary
      },
    });
  } catch {
    throw new Error(
      `Cannot reach Laravel media upload endpoint (/api/v1/media/upload). The image "${file.name}" has not been persisted to the server.`
    );
  }

  if (!response.ok) {
    let errorDetail = `Server responded with status ${response.status}`;
    try {
      const errJson = await response.json();
      if (errJson?.message) {
        errorDetail = errJson.message;
      }
    } catch {
      // Ignore json parse error
    }
    throw new Error(`Upload failed for "${file.name}": ${errorDetail}`);
  }

  const result = await response.json();
  const resolvedUrl = result?.url || result?.data?.url;

  if (typeof resolvedUrl === 'string' && resolvedUrl.trim() && !resolvedUrl.startsWith('blob:')) {
    return resolvedUrl.trim();
  }

  throw new Error(`Invalid response received from upload endpoint for "${file.name}".`);
}

