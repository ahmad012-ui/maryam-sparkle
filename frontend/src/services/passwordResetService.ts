import { isValidEmail, isValidOtpCode, validatePasswordRequirements } from '../utils/validation';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

/**
 * Supabase-Integrated Password Reset Service
 *
 * Provides native password recovery via Supabase Auth:
 * - supabase.auth.resetPasswordForEmail(email)
 * - supabase.auth.verifyOtp({ email, token, type: 'recovery' })
 * - supabase.auth.updateUser({ password: newPassword })
 */

export interface RequestResetResponse {
  success: boolean;
  message: string;
  email: string;
  expiresInSeconds?: number;
  isBackendConnected?: boolean;
}

export interface VerifyOtpResponse {
  success: boolean;
  message: string;
  resetToken?: string;
  isBackendConnected?: boolean;
}

export interface ResetPasswordResponse {
  success: boolean;
  message: string;
  isBackendConnected?: boolean;
}

interface TransientResetSession {
  email: string;
  expiresAt: number;
  resendAvailableAt: number;
  resetToken?: string;
  tokenExpiresAt?: number;
}

// In-memory transient store for tracking email and cooldowns
let memorySession: TransientResetSession | null = null;

class PasswordResetService {
  /**
   * Request password reset for a registered email using native Supabase Auth.
   */
  async requestPasswordReset(email: string): Promise<RequestResetResponse> {
    const trimmedEmail = (email || '').trim().toLowerCase();

    if (!trimmedEmail) {
      return {
        success: false,
        message: 'Email address is required.',
        email: '',
      };
    }

    if (!isValidEmail(trimmedEmail)) {
      return {
        success: false,
        message: 'Please enter a valid email address (e.g. name@example.com).',
        email: trimmedEmail,
      };
    }

    if (isSupabaseConfigured()) {
      try {
        const { error } = await supabase.auth.resetPasswordForEmail(trimmedEmail, {
          redirectTo: typeof window !== 'undefined' ? `${window.location.origin}/reset-password` : undefined,
        });

        if (error) {
          return {
            success: false,
            message: error.message,
            email: trimmedEmail,
          };
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Failed to send reset email';
        return {
          success: false,
          message: msg,
          email: trimmedEmail,
        };
      }
    }

    const now = Date.now();
    memorySession = {
      email: trimmedEmail,
      expiresAt: now + 10 * 60 * 1000,
      resendAvailableAt: now + 60 * 1000,
    };

    return {
      success: true,
      message: `A password reset link and verification code have been dispatched to ${trimmedEmail}.`,
      email: trimmedEmail,
      expiresInSeconds: 600,
      isBackendConnected: isSupabaseConfigured(),
    };
  }

  /**
   * Resend the password reset email / OTP.
   */
  async resendResetOtp(email: string): Promise<RequestResetResponse> {
    const trimmedEmail = (email || '').trim().toLowerCase();

    if (!trimmedEmail || !isValidEmail(trimmedEmail)) {
      return {
        success: false,
        message: 'Please provide a valid email address.',
        email: trimmedEmail,
      };
    }

    const now = Date.now();

    if (memorySession && memorySession.email === trimmedEmail && now < memorySession.resendAvailableAt) {
      const remainingSecs = Math.ceil((memorySession.resendAvailableAt - now) / 1000);
      return {
        success: false,
        message: `Please wait ${remainingSecs}s before requesting another verification email.`,
        email: trimmedEmail,
      };
    }

    if (isSupabaseConfigured()) {
      try {
        const { error } = await supabase.auth.resetPasswordForEmail(trimmedEmail, {
          redirectTo: typeof window !== 'undefined' ? `${window.location.origin}/reset-password` : undefined,
        });
        if (error) {
          return {
            success: false,
            message: error.message,
            email: trimmedEmail,
          };
        }
      } catch (err: any) {
        return {
          success: false,
          message: err.message || 'Failed to resend reset email',
          email: trimmedEmail,
        };
      }
    }

    memorySession = {
      email: trimmedEmail,
      expiresAt: now + 10 * 60 * 1000,
      resendAvailableAt: now + 60 * 1000,
    };

    return {
      success: true,
      message: `A new reset link and verification code has been dispatched to ${trimmedEmail}.`,
      email: trimmedEmail,
      expiresInSeconds: 600,
      isBackendConnected: isSupabaseConfigured(),
    };
  }

  /**
   * Verify recovery OTP code with native Supabase Auth.
   */
  async verifyResetOtp(email: string, otp: string): Promise<VerifyOtpResponse> {
    const trimmedEmail = (email || '').trim().toLowerCase();
    const cleanOtp = (otp || '').trim();

    if (!trimmedEmail) {
      return {
        success: false,
        message: 'Session invalid. Please start from the Forgot Password page.',
      };
    }

    if (!cleanOtp) {
      return {
        success: false,
        message: 'Please enter the 6-digit verification code.',
      };
    }

    if (!isValidOtpCode(cleanOtp)) {
      return {
        success: false,
        message: 'Verification code must be exactly 6 numeric digits.',
      };
    }

    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.auth.verifyOtp({
          email: trimmedEmail,
          token: cleanOtp,
          type: 'recovery'
        });

        if (error) {
          return {
            success: false,
            message: error.message || 'Invalid or expired verification code.',
          };
        }

        const token = data.session?.access_token || 'supabase_recovery_active';
        if (memorySession) {
          memorySession.resetToken = token;
          memorySession.tokenExpiresAt = Date.now() + 30 * 60 * 1000;
        }

        return {
          success: true,
          message: 'Code verified successfully. You may now create your new password.',
          resetToken: token,
          isBackendConnected: true,
        };
      } catch (err: any) {
        return {
          success: false,
          message: err.message || 'Verification failed. Please check your code.',
        };
      }
    }

    return {
      success: false,
      message: 'Supabase authentication is not configured.',
    };
  }

  /**
   * Reset the user's password using the authenticated Supabase session.
   */
  async resetPassword(resetToken: string, newPassword: string): Promise<ResetPasswordResponse> {
    const validation = validatePasswordRequirements(newPassword, 8);
    if (!validation.isValid) {
      return {
        success: false,
        message: 'Password does not meet security requirements (minimum 8 characters, with letters and numbers).',
      };
    }

    if (isSupabaseConfigured()) {
      try {
        const { error } = await supabase.auth.updateUser({
          password: newPassword,
        });

        if (error) {
          return {
            success: false,
            message: error.message || 'Failed to update password.',
          };
        }

        this.clearResetSession();

        return {
          success: true,
          message: 'Your password has been successfully updated.',
          isBackendConnected: true,
        };
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Password update failed';
        return {
          success: false,
          message: msg,
        };
      }
    }

    return {
      success: false,
      message: 'Supabase authentication is not configured.',
    };
  }

  getPendingEmail(): string | null {
    return memorySession ? memorySession.email : null;
  }

  setPendingEmail(email: string): void {
    const trimmed = (email || '').trim().toLowerCase();
    if (memorySession) {
      memorySession.email = trimmed;
    } else {
      memorySession = {
        email: trimmed,
        expiresAt: Date.now() + 10 * 60 * 1000,
        resendAvailableAt: Date.now() + 60 * 1000,
      };
    }
  }

  hasValidResetToken(token: string | null): boolean {
    if (!token) return false;
    if (memorySession && memorySession.resetToken === token) {
      const now = Date.now();
      return Boolean(memorySession.tokenExpiresAt && now <= memorySession.tokenExpiresAt);
    }
    return false;
  }

  clearResetSession(): void {
    memorySession = null;
  }
}

export const passwordResetService = new PasswordResetService();
