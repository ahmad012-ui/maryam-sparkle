import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Eye, EyeOff, Sparkles, CheckCircle2, XCircle, AlertCircle, Loader2 } from 'lucide-react';
import { usePasswordReset } from '../context/PasswordResetContext';
import { validatePasswordRequirements } from '../utils/validation';
import { SEO } from '../components/SEO';

export const ResetPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const { resetToken, submitNewPassword } = usePasswordReset();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Guard: Only allow access after successful OTP verification
  useEffect(() => {
    if (!resetToken) {
      navigate('/login', { replace: true });
    }
  }, [resetToken, navigate]);

  // Live password validation
  const validation = validatePasswordRequirements(newPassword, 8);
  const passwordsMatch = confirmPassword.length > 0 && newPassword === confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!newPassword) {
      setError('Please enter a new password.');
      return;
    }

    if (!validation.isValid) {
      setError('Your new password does not meet all security requirements listed below.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match. Please re-enter your password confirmation.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await submitNewPassword(newPassword);

      if (!response.success) {
        setError(response.message || 'Unable to update password. Please try again.');
        setIsLoading(false);
        return;
      }

      // Success: route to success confirmation screen
      navigate('/password-reset-success', { replace: true });
    } catch {
      setError('A network error occurred while updating your password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#efe8dc] py-12 md:py-20 flex items-center justify-center px-4 sm:px-6">
      <SEO
        title="Reset Password | Maryam Sparkle"
        description="Choose a new secure password for your Maryam Sparkle account."
        canonical="/reset-password"
      />

      <div className="bg-[#fdfaf5] rounded-3xl p-6 sm:p-10 border border-[#e0d8c8] shadow-xs max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-widest font-semibold text-[#2d5a61] mb-2">
            <Sparkles className="w-3.5 h-3.5 text-[#D4B982]" />
            <span>Step 3 of 3</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl text-[#333333] mb-2">
            Create New Password
          </h1>
          <p className="text-xs text-[#666666] leading-relaxed">
            Your identity has been verified. Enter and confirm your new password below.
          </p>
        </div>

        {/* Error notification */}
        {error && (
          <div
            role="alert"
            className="mb-5 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2 text-xs text-red-700"
          >
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="space-y-4 text-xs">
          {/* New Password Input */}
          <div>
            <label htmlFor="new-password" className="block font-medium text-[#333333] mb-1.5">
              New Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#888888] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="new-password"
                type={showNewPassword ? 'text' : 'password'}
                name="new-password"
                autoComplete="new-password"
                autoFocus
                disabled={isLoading}
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  if (error) setError(null);
                }}
                placeholder="At least 8 characters"
                className="w-full bg-[#efe8dc]/40 border border-[#e0d8c8] rounded-xl pl-10 pr-10 py-2.5 text-[#333333] focus:outline-none focus:border-[#2d5a61] transition-colors disabled:opacity-50"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                aria-label={showNewPassword ? 'Hide password' : 'Show password'}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#888888] hover:text-[#333333] p-1 cursor-pointer"
              >
                {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Confirm Password Input */}
          <div>
            <label htmlFor="confirm-password" className="block font-medium text-[#333333] mb-1.5">
              Confirm New Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#888888] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="confirm-password"
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirm-password"
                autoComplete="new-password"
                disabled={isLoading}
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (error) setError(null);
                }}
                placeholder="Re-enter your new password"
                className="w-full bg-[#efe8dc]/40 border border-[#e0d8c8] rounded-xl pl-10 pr-10 py-2.5 text-[#333333] focus:outline-none focus:border-[#2d5a61] transition-colors disabled:opacity-50"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#888888] hover:text-[#333333] p-1 cursor-pointer"
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Password Requirements Checklist */}
          <div className="bg-[#efe8dc]/50 border border-[#e0d8c8] rounded-2xl p-3.5 space-y-1.5 text-[11px] text-[#666666]">
            <p className="font-semibold text-[#333333] mb-1">Password Requirements:</p>

            <div className="flex items-center gap-2">
              {validation.hasMinLength ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              ) : (
                <XCircle className="w-3.5 h-3.5 text-[#aaaaaa] shrink-0" />
              )}
              <span className={validation.hasMinLength ? 'text-emerald-800 font-medium' : ''}>
                At least 8 characters
              </span>
            </div>

            <div className="flex items-center gap-2">
              {validation.hasLetter ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              ) : (
                <XCircle className="w-3.5 h-3.5 text-[#aaaaaa] shrink-0" />
              )}
              <span className={validation.hasLetter ? 'text-emerald-800 font-medium' : ''}>
                Contains at least one letter (a-z, A-Z)
              </span>
            </div>

            <div className="flex items-center gap-2">
              {validation.hasNumber ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              ) : (
                <XCircle className="w-3.5 h-3.5 text-[#aaaaaa] shrink-0" />
              )}
              <span className={validation.hasNumber ? 'text-emerald-800 font-medium' : ''}>
                Contains at least one number (0-9)
              </span>
            </div>

            {confirmPassword.length > 0 && (
              <div className="flex items-center gap-2 pt-0.5 border-t border-[#e0d8c8]">
                {passwordsMatch ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                ) : (
                  <XCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                )}
                <span className={passwordsMatch ? 'text-emerald-800 font-medium' : 'text-rose-600'}>
                  {passwordsMatch ? 'Passwords match' : 'Passwords do not match'}
                </span>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading || !validation.isValid || !passwordsMatch}
            className="w-full bg-[#2d5a61] text-white py-3 rounded-xl font-semibold text-xs hover:bg-[#1e3c41] transition-all shadow-xs cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-4"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Updating Password...</span>
              </>
            ) : (
              <span>Reset Password</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
