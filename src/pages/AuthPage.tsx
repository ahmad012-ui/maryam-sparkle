import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Lock, Mail, User, Phone, Sparkles, Chrome, AlertCircle } from 'lucide-react';
import { authService } from '../services/authService';
import {
  sanitizePhoneNumber,
  isValidPhoneNumber,
  isValidEmail,
  isValidFullName,
  isValidPassword
} from '../utils/validation';

interface AuthPageProps {
  initialMode?: 'login' | 'register';
}

/**
 * AuthPage provides client-side login and registration interfaces
 * architected for future seamless connection to a backend API:
 * - POST /api/v1/auth/login -> { email, password }
 * - POST /api/v1/auth/register -> { name, email, phone, password }
 * - Social OAuth buttons preserved for Google authentication integration.
 */
export const AuthPage: React.FC<AuthPageProps> = ({ initialMode = 'login' }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const isRegisterRoute = location.pathname === '/register' || initialMode === 'register';
  const [isLogin, setIsLogin] = useState(!isRegisterRoute);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [oauthNotice, setOauthNotice] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (location.pathname === '/register') {
      setIsLogin(false);
    } else if (location.pathname === '/login') {
      setIsLogin(true);
    }
    setErrors({});
    setOauthNotice(null);
  }, [location.pathname]);

  const handleOAuthClick = () => {
    // Keep button in UI for future integration without making fake/non-functional auth calls
    setOauthNotice('Google OAuth login will be activated once backend service integration is completed.');
    setTimeout(() => {
      setOauthNotice(null);
    }, 4500);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Email validation
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      newErrors.email = 'Email address is required.';
    } else if (!isValidEmail(trimmedEmail)) {
      newErrors.email = 'Please enter a valid email address (e.g. name@example.com).';
    }

    // Password validation
    if (!password) {
      newErrors.password = 'Password is required.';
    } else if (!isValidPassword(password, 6)) {
      newErrors.password = 'Password must be at least 6 characters long.';
    }

    // Additional validation for Register
    if (!isLogin) {
      const trimmedName = name.trim();
      if (!trimmedName) {
        newErrors.name = 'Full name is required.';
      } else if (!isValidFullName(trimmedName)) {
        newErrors.name = 'Please enter a valid full name (at least 2 letters, no special symbols).';
      }

      const trimmedPhone = phone.trim();
      if (trimmedPhone && !isValidPhoneNumber(trimmedPhone)) {
        newErrors.phone = 'Please enter a valid phone number (e.g. 0300 1234567 or +92 300 1234567).';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setOauthNotice(null);

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      if (isLogin) {
        authService.login({
          email: email.trim(),
          name: name.trim() || undefined,
          phone: phone.trim() || undefined
        });
      } else {
        authService.register({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim() || undefined
        });
      }
      navigate('/account');
    } catch {
      setErrors({ form: 'An unexpected error occurred. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#efe8dc] py-12 md:py-20 flex items-center justify-center px-4 sm:px-6">
      <div className="bg-[#fdfaf5] rounded-3xl p-6 sm:p-10 border border-[#e0d8c8] shadow-xs max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-widest font-semibold text-[#2d5a61] mb-2">
            <Sparkles className="w-3.5 h-3.5 text-[#D4B982]" />
            <span>Studio Member Access</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl text-[#333333] mb-2">
            {isLogin ? 'Welcome Back' : 'Join the Studio'}
          </h1>
          <p className="text-xs text-[#666666] leading-relaxed">
            {isLogin
              ? 'Sign in to access your order tracking, custom requests & saved addresses.'
              : 'Create an account for quick checkout and exclusive artisanal drops.'}
          </p>
        </div>

        {/* OAuth Social Buttons (for future integration) */}
        <div className="space-y-2.5 mb-6">
          <button
            type="button"
            onClick={handleOAuthClick}
            className="w-full bg-white hover:bg-[#efe8dc]/40 text-[#333333] border border-[#e0d8c8] py-2.5 px-4 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-2.5 cursor-pointer shadow-2xs"
          >
            <Chrome className="w-4 h-4 text-[#2d5a61]" />
            <span>Continue with Google</span>
          </button>

          {oauthNotice && (
            <div className="p-2.5 bg-amber-50/90 border border-amber-200 rounded-xl text-[11px] text-amber-800 text-center leading-relaxed">
              {oauthNotice}
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#e0d8c8]" />
          </div>
          <div className="relative flex justify-center text-[10px] uppercase tracking-wider">
            <span className="bg-[#fdfaf5] px-3 text-[#888888] font-medium">Or continue with email</span>
          </div>
        </div>

        {/* General Form Error */}
        {errors.form && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs text-red-700">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errors.form}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate className="space-y-4 text-xs">
          {!isLogin && (
            <div>
              <label className="block font-medium text-[#333333] mb-1">Full Name *</label>
              <div className="relative">
                <User className="w-4 h-4 text-[#888888] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (errors.name) setErrors((prev) => ({ ...prev, name: '' }));
                  }}
                  placeholder="e.g. Ayesha Khan"
                  className={`w-full bg-[#efe8dc]/40 border rounded-xl pl-10 pr-3.5 py-2.5 text-[#333333] focus:outline-none transition-colors ${
                    errors.name
                      ? 'border-red-400 focus:border-red-500 ring-1 ring-red-400/20'
                      : 'border-[#e0d8c8] focus:border-[#2d5a61]'
                  }`}
                />
              </div>
              {errors.name && (
                <p className="text-[11px] text-red-500 font-medium mt-1 flex items-center gap-1">
                  <span>{errors.name}</span>
                </p>
              )}
            </div>
          )}

          <div>
            <label className="block font-medium text-[#333333] mb-1">Email Address *</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#888888] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors((prev) => ({ ...prev, email: '' }));
                }}
                placeholder="e.g. name@example.com"
                className={`w-full bg-[#efe8dc]/40 border rounded-xl pl-10 pr-3.5 py-2.5 text-[#333333] focus:outline-none transition-colors ${
                  errors.email
                    ? 'border-red-400 focus:border-red-500 ring-1 ring-red-400/20'
                    : 'border-[#e0d8c8] focus:border-[#2d5a61]'
                }`}
              />
            </div>
            {errors.email && (
              <p className="text-[11px] text-red-500 font-medium mt-1 flex items-center gap-1">
                <span>{errors.email}</span>
              </p>
            )}
          </div>

          {!isLogin && (
            <div>
              <label className="block font-medium text-[#333333] mb-1">Phone Number (Optional)</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-[#888888] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => {
                    setPhone(sanitizePhoneNumber(e.target.value));
                    if (errors.phone) setErrors((prev) => ({ ...prev, phone: '' }));
                  }}
                  placeholder="e.g. 0300 1234567 or +92 300 1234567"
                  className={`w-full bg-[#efe8dc]/40 border rounded-xl pl-10 pr-3.5 py-2.5 text-[#333333] focus:outline-none transition-colors ${
                    errors.phone
                      ? 'border-red-400 focus:border-red-500 ring-1 ring-red-400/20'
                      : 'border-[#e0d8c8] focus:border-[#2d5a61]'
                  }`}
                />
              </div>
              {errors.phone && (
                <p className="text-[11px] text-red-500 font-medium mt-1 flex items-center gap-1">
                  <span>{errors.phone}</span>
                </p>
              )}
            </div>
          )}

          <div>
            <label className="block font-medium text-[#333333] mb-1">Password *</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#888888] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) setErrors((prev) => ({ ...prev, password: '' }));
                }}
                placeholder="At least 6 characters"
                className={`w-full bg-[#efe8dc]/40 border rounded-xl pl-10 pr-3.5 py-2.5 text-[#333333] focus:outline-none transition-colors ${
                  errors.password
                    ? 'border-red-400 focus:border-red-500 ring-1 ring-red-400/20'
                    : 'border-[#e0d8c8] focus:border-[#2d5a61]'
                }`}
              />
            </div>
            {errors.password && (
              <p className="text-[11px] text-red-500 font-medium mt-1 flex items-center gap-1">
                <span>{errors.password}</span>
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#2d5a61] text-white py-3 rounded-xl font-semibold text-xs hover:bg-[#1e3c41] transition-all shadow-xs cursor-pointer mt-2 disabled:opacity-50"
          >
            {isLoading ? 'Processing...' : isLogin ? 'Sign In' : 'Create Studio Account'}
          </button>
        </form>

        {/* Toggle Login / Register */}
        <div className="mt-6 pt-5 border-t border-[#e0d8c8] text-center text-xs text-[#666666]">
          {isLogin ? (
            <p>
              Don&apos;t have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  setIsLogin(false);
                  navigate('/register');
                }}
                className="font-semibold text-[#2d5a61] hover:underline cursor-pointer"
              >
                Sign Up
              </button>
            </p>
          ) : (
            <p>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  setIsLogin(true);
                  navigate('/login');
                }}
                className="font-semibold text-[#2d5a61] hover:underline cursor-pointer"
              >
                Sign In
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

