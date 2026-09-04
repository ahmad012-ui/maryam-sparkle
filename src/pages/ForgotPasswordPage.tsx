import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Sparkles, ArrowLeft, AlertCircle, Info, Loader2 } from 'lucide-react';
import { isValidEmail } from '../utils/validation';
import { usePasswordReset } from '../context/PasswordResetContext';
import { SEO } from '../components/SEO';

export const ForgotPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const { email: initialEmail, requestReset } = usePasswordReset();

  const [emailInput, setEmailInput] = useState(initialEmail || '');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmed = emailInput.trim();

    if (!trimmed) {
      setError('Please enter your email address.');
      return;
    }

    if (!isValidEmail(trimmed)) {
      setError('Please enter a valid email address (e.g. name@example.com).');
      return;
    }

    setIsLoading(true);

    try {
      const response = await requestReset(trimmed);

      if (!response.success) {
        setError(response.message || 'Unable to process your request. Please try again.');
        setIsLoading(false);
        return;
      }

      // Smooth navigation to OTP verification screen
      navigate('/verify-otp');
    } catch {
      setError('A connection error occurred. Please check your network and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#efe8dc] py-12 md:py-20 flex items-center justify-center px-4 sm:px-6">
      <SEO
        title="Forgot Password | Maryam Sparkle"
        description="Reset your Maryam Sparkle account password. Enter your registered email address to receive a secure 6-digit verification code."
        canonical="/forgot-password"
      />

      <div className="bg-[#fdfaf5] rounded-3xl p-6 sm:p-10 border border-[#e0d8c8] shadow-xs max-w-md w-full">
        {/* Top badge */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-widest font-semibold text-[#2d5a61] mb-2">
            <Sparkles className="w-3.5 h-3.5 text-[#D4B982]" />
            <span>Account Security</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl text-[#333333] mb-2">
            Forgot Password?
          </h1>
          <p className="text-xs text-[#666666] leading-relaxed">
            Enter your registered email address and we will send a 6-digit verification code (OTP) to help you reset your password.
          </p>
        </div>

        {/* Backend integration architectural banner */}
        <div className="mb-6 p-3 bg-[#efe8dc]/60 border border-[#e0d8c8] rounded-2xl flex items-start gap-2.5 text-[11px] text-[#555555] leading-relaxed">
          <Info className="w-4 h-4 text-[#2d5a61] shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-[#333333]">Backend Ready:</span> Once the Laravel SMTP service is connected, an actual email with a 6-digit OTP will be dispatched.
          </div>
        </div>

        {/* Error notification banner */}
        {error && (
          <div
            role="alert"
            className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2 text-xs text-red-700"
          >
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Reset form */}
        <form onSubmit={handleSubmit} noValidate className="space-y-4 text-xs">
          <div>
            <label htmlFor="email" className="block font-medium text-[#333333] mb-1.5">
              Registered Email Address <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#888888] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="email"
                type="email"
                name="email"
                autoComplete="email"
                autoFocus
                disabled={isLoading}
                value={emailInput}
                onChange={(e) => {
                  setEmailInput(e.target.value);
                  if (error) setError(null);
                }}
                placeholder="e.g. name@example.com"
                className={`w-full bg-[#efe8dc]/40 border rounded-xl pl-10 pr-3.5 py-2.5 text-[#333333] focus:outline-none transition-colors disabled:opacity-50 ${
                  error
                    ? 'border-red-400 focus:border-red-500 ring-1 ring-red-400/20'
                    : 'border-[#e0d8c8] focus:border-[#2d5a61]'
                }`}
              />
            </div>
            {error && (
              <p className="text-[11px] text-red-500 font-medium mt-1">
                {error}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#2d5a61] text-white py-3 rounded-xl font-semibold text-xs hover:bg-[#1e3c41] transition-all shadow-xs cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Sending Code...</span>
              </>
            ) : (
              <span>Send OTP</span>
            )}
          </button>
        </form>

        {/* Back to Login link */}
        <div className="mt-6 pt-5 border-t border-[#e0d8c8] text-center text-xs">
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 text-[#2d5a61] font-semibold hover:underline cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Sign In</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
