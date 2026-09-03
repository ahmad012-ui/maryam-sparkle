/**
 * Form validation and input sanitization utilities for Maryam Sparkle
 */

/**
 * Standard RFC 5322-compatible email regular expression for strict syntax checking
 */
export const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

/**
 * Validates whether an email string matches standard valid email format
 */
export function isValidEmail(email: string): boolean {
  if (!email || typeof email !== 'string') return false;
  return EMAIL_REGEX.test(email.trim());
}

/**
 * Full name regular expression: accepts letters, spaces, hyphens, periods, and apostrophes (min 2 characters, max 50)
 */
export const FULL_NAME_REGEX = /^[a-zA-Z\u00C0-\u024F\u0600-\u06FF\s'.\-]{2,50}$/;

/**
 * Validates whether a full name is at least 2 characters and contains only letters/allowed name characters
 */
export function isValidFullName(name: string): boolean {
  if (!name || typeof name !== 'string') return false;
  const trimmed = name.trim();
  if (trimmed.length < 2 || trimmed.length > 50) return false;
  return FULL_NAME_REGEX.test(trimmed);
}

/**
 * Password validation: must be at least 6 characters in length
 */
export function isValidPassword(password: string, minLength: number = 6): boolean {
  if (!password || typeof password !== 'string') return false;
  return password.length >= minLength;
}

/**
 * Sanitizes phone number input by only allowing digits, leading '+', spaces, and hyphens.
 * Strips all alphabetic characters (a-z, A-Z) and invalid symbols.
 */
export function sanitizePhoneNumber(value: string, maxLength: number = 16): string {
  if (!value) return '';

  const trimmed = value.trimStart();
  const hasLeadingPlus = trimmed.startsWith('+');

  // Strip all non-digit characters except we keep track of leading '+'
  const digitsOnly = value.replace(/\D/g, '');

  // If the user typed a leading +, retain it
  let result = hasLeadingPlus ? `+${digitsOnly}` : digitsOnly;

  // Format if user wants readable grouping for Pakistani/International numbers
  // e.g., 0300 1234567 or +92 300 1234567
  if (result.length > maxLength) {
    result = result.slice(0, maxLength);
  }

  return result;
}

/**
 * Validates whether a phone number is valid:
 * - Must have between 10 and 15 digits
 * - Must not contain alphabetic characters or invalid symbols
 */
export function isValidPhoneNumber(phone: string): boolean {
  if (!phone || typeof phone !== 'string') return false;

  const trimmed = phone.trim();
  if (!trimmed) return false;

  // Must not have letters
  if (/[a-zA-Z]/.test(trimmed)) return false;

  // Extract only numbers
  const digits = trimmed.replace(/\D/g, '');

  // Valid phone numbers (Pakistani local e.g. 03001234567 or intl +923001234567)
  // have between 10 and 15 digits
  return digits.length >= 10 && digits.length <= 15;
}

/**
 * Sanitizes postal code to only contain numeric digits (0-9).
 * Strips all alphabetic characters and special symbols.
 */
export function sanitizePostalCode(value: string, maxLength: number = 6): string {
  if (!value) return '';
  return value.replace(/\D/g, '').slice(0, maxLength);
}

/**
 * Validates postal code:
 * Must be 4 to 6 digits (e.g. 75500 for Karachi, 44000 for Islamabad).
 */
export function isValidPostalCode(code: string): boolean {
  if (!code) return true; // Optional in some forms, but if present must be valid
  const trimmed = code.trim();
  if (!trimmed) return true;
  return /^\d{4,6}$/.test(trimmed);
}

/**
 * Sanitizes generic integer / number-only fields.
 */
export function sanitizeDigitsOnly(value: string, maxLength?: number): string {
  if (!value) return '';
  const digits = value.replace(/\D/g, '');
  return maxLength ? digits.slice(0, maxLength) : digits;
}

/**
 * Sanitizes decimal numbers (e.g. for custom size in inches like 6.5).
 */
export function sanitizeDecimal(value: string, maxDecimals: number = 2): string {
  if (!value) return '';
  // Allow numbers and at most one decimal point
  let clean = value.replace(/[^0-9.]/g, '');
  const parts = clean.split('.');
  if (parts.length > 2) {
    clean = `${parts[0]}.${parts.slice(1).join('')}`;
  }
  if (parts.length === 2 && maxDecimals > 0) {
    clean = `${parts[0]}.${parts[1].slice(0, maxDecimals)}`;
  }
  return clean;
}
