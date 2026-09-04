import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, ArrowLeft, AlertCircle, Sparkles, Loader2, CheckCircle2, RotateCw, Edit2 } from 'lucide-react';
import { usePasswordReset } from '../context/PasswordResetContext';
import { SEO } from '../components/SEO';

const OTP_LENGTH = 6;
const RESEND_COOLDOWN_SECONDS = 60;

export const VerifyOtpPage: React.FC = () => {
  const navigate = useNavigate();
  const { email, verifyOtp, resendOtp } = usePasswordReset();

  const [otpDigits, setOtpDigits] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [error, setError] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(RESEND_COOLDOWN_SECONDS);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Guard: if user navigates directly without an email, redirect to /forgot-password
  useEffect(() => {
    if (!email) {
      navigate('/forgot-password', { replace: true });
    }
  }, [email, navigate]);

  // Countdown timer for Resend OTP
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [countdown]);

  // Auto-focus first input box on load
  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const fullOtp = otpDigits.join('');

  const handleInputChange = (index: number, rawValue: string) => {
    setError(null);
    setSuccessNotice(null);

    // Handle paste of full or partial code
    const digitsOnly = rawValue.replace(/\D/g, '');

    if (digitsOnly.length > 1) {
      const newDigits = [...otpDigits];
      const pastedChars = digitsOnly.slice(0, OTP_LENGTH).split('');

      for (let i = 0; i < OTP_LENGTH; i++) {
        if (pastedChars[i] !== undefined) {
          newDigits[i] = pastedChars[i];
        }
      }

      setOtpDigits(newDigits);

      // Focus last filled box or next empty box
      const nextEmptyIndex = newDigits.findIndex((d) => d === '');
      const focusTarget = nextEmptyIndex === -1 ? OTP_LENGTH - 1 : nextEmptyIndex;
      inputRefs.current[focusTarget]?.focus();
      return;
    }

    // Single digit input
    const singleDigit = digitsOnly.slice(-1);
    const newDigits = [...otpDigits];
    newDigits[index] = singleDigit;
    setOtpDigits(newDigits);

    // Auto-advance to next input if digit entered
    if (singleDigit && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!otpDigits[index] && index > 0) {
        // Move focus backward and clear previous box
        const newDigits = [...otpDigits];
        newDigits[index - 1] = '';
        setOtpDigits(newDigits);
        inputRefs.current[index - 1]?.focus();
      } else if (otpDigits[index]) {
        // Clear current box
        const newDigits = [...otpDigits];
        newDigits[index] = '';
        setOtpDigits(newDigits);
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleVerify = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);

    if (fullOtp.length < OTP_LENGTH) {
      setError('Please enter the complete 6-digit verification code.');
      const firstEmpty = otpDigits.findIndex((d) => d === '');
      if (firstEmpty !== -1) {
        inputRefs.current[firstEmpty]?.focus();
      }
      return;
    }

    setIsVerifying(true);

    try {
      const response = await verifyOtp(fullOtp);

      if (!response.success) {
        setError(response.message || 'Invalid or expired code. Please verify and try again.');
        setIsVerifying(false);
        return;
      }

      // Successful OTP verification -> route to reset password page
      navigate('/reset-password');
    } catch {
      setError('Verification failed due to a network issue. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0 || isResending) return;

    setError(null);
    setSuccessNotice(null);
    setIsResending(true);

    try {
      const response = await resendOtp();

      if (!response.success) {
        setError(response.message || 'Failed to resend code. Please try again later.');
        return;
      }

      setCountdown(RESEND_COOLDOWN_SECONDS);
      setSuccessNotice('A new verification code has been dispatched.');
      setOtpDigits(Array(OTP_LENGTH).fill(''));
      inputRefs.current[0]?.focus();
    } catch {
      setError('Network error while requesting new code. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#efe8dc] py-12 md:py-20 flex items-center justify-center px-4 sm:px-6">
      <SEO
        title="Verify Code | Maryam Sparkle"
        description="Verify your 6-digit email confirmation code to complete your password reset."
        canonical="/verify-otp"
      />

      <div className="bg-[#fdfaf5] rounded-3xl p-6 sm:p-10 border border-[#e0d8c8] shadow-xs max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-widest font-semibold text-[#2d5a61] mb-2">
            <Sparkles className="w-3.5 h-3.5 text-[#D4B982]" />
            <span>Step 2 of 3</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl text-[#333333] mb-2">
            Verify Your Email
          </h1>
          <p className="text-xs text-[#666666] leading-relaxed">
            Please enter the 6-digit verification code sent to:
          </p>

          {/* Email badge with change option */}
          <div className="mt-3 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#efe8dc]/70 border border-[#e0d8c8] text-xs text-[#333333]">
            <Mail className="w-3.5 h-3.5 text-[#2d5a61]" />
            <span className="font-medium truncate max-w-[200px]">{email || 'your email'}</span>
            <Link
              to="/forgot-password"
              title="Change email address"
              className="text-[#2d5a61] hover:underline text-[11px] font-semibold flex items-center gap-0.5 ml-1"
            >
              <Edit2 className="w-3 h-3" />
              <span>Change</span>
            </Link>
          </div>
        </div>

        {/* Informative Preview Banner */}
        <div className="mb-6 p-3 bg-teal-50/70 border border-teal-200/80 rounded-2xl text-[11px] text-teal-900 leading-relaxed">
          <span className="font-semibold">Backend Integration Notice:</span> While Laravel SMTP is connecting, you can enter any 6-digit code (e.g. <span className="font-mono font-semibold bg-white/80 px-1 py-0.5 rounded">123456</span>) to verify the flow and create a new password.
        </div>

        {/* Error Alert */}
        {error && (
          <div
            role="alert"
            className="mb-5 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2 text-xs text-red-700"
          >
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Success Alert */}
        {successNotice && (
          <div
            role="status"
            className="mb-5 p-3 bg-green-50 border border-green-200 rounded-xl flex items-center gap-2 text-xs text-green-800"
          >
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successNotice}</span>
          </div>
        )}

        {/* 6-Digit OTP Inputs */}
        <form onSubmit={handleVerify} className="space-y-6">
          <div>
            <label className="block text-center font-medium text-xs text-[#333333] mb-3">
              Enter 6-Digit Code
            </label>
            <div className="flex justify-center items-center gap-2 sm:gap-2.5">
              {otpDigits.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => {
                    inputRefs.current[index] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  value={digit}
                  disabled={isVerifying}
                  onChange={(e) => handleInputChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  aria-label={`Digit ${index + 1} of 6`}
                  className={`w-11 h-13 sm:w-12 sm:h-14 text-center text-lg sm:text-xl font-mono font-semibold rounded-xl border bg-[#efe8dc]/40 text-[#333333] focus:outline-none transition-all shadow-2xs ${
                    digit
                      ? 'border-[#2d5a61] bg-white ring-1 ring-[#2d5a61]/30'
                      : 'border-[#e0d8c8] focus:border-[#2d5a61]'
                  } ${error ? 'border-red-400 focus:border-red-500' : ''}`}
                />
              ))}
            </div>
          </div>

          {/* Action Button */}
          <button
            type="submit"
            disabled={isVerifying || fullOtp.length < OTP_LENGTH}
            className="w-full bg-[#2d5a61] text-white py-3 rounded-xl font-semibold text-xs hover:bg-[#1e3c41] transition-all shadow-xs cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isVerifying ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Verifying Code...</span>
              </>
            ) : (
              <span>Verify OTP</span>
            )}
          </button>
        </form>

        {/* Resend Section */}
        <div className="mt-6 pt-5 border-t border-[#e0d8c8] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#666666]">
          <span>Didn&apos;t receive the code?</span>
          {countdown > 0 ? (
            <span className="text-[#888888] font-mono text-[11px]">
              Resend in {countdown}s
            </span>
          ) : (
            <button
              type="button"
              onClick={handleResend}
              disabled={isResending}
              className="inline-flex items-center gap-1.5 font-semibold text-[#2d5a61] hover:underline cursor-pointer disabled:opacity-50"
            >
              <RotateCw className={`w-3.5 h-3.5 ${isResending ? 'animate-spin' : ''}`} />
              <span>{isResending ? 'Sending...' : 'Resend OTP'}</span>
            </button>
          )}
        </div>

        {/* Back Link */}
        <div className="mt-4 text-center">
          <Link
            to="/forgot-password"
            className="inline-flex items-center gap-1.5 text-xs text-[#666666] hover:text-[#2d5a61] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Change Email Address</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
