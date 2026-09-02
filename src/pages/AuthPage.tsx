import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Lock, Mail, User, Phone, Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';
import { authService } from '../services/authService';

interface AuthPageProps {
  initialMode?: 'login' | 'register';
}

/**
 * AuthPage provides client-side login and registration interfaces
 * architected for future seamless connection to a Laravel + MySQL backend API:
 * - POST /api/v1/auth/login -> { email, password }
 * - POST /api/v1/auth/register -> { name, email, phone, password }
 * - Uses standard token/session storage.
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
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (location.pathname === '/register') {
      setIsLogin(false);
    } else if (location.pathname === '/login') {
      setIsLogin(true);
    }
  }, [location.pathname]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isLogin) {
        // Ready for Laravel Sanctum API: POST /api/login
        authService.updateProfile({
          email: email || 'sara.siddiqui@example.com',
          name: name || (email.split('@')[0] ? email.split('@')[0].replace('.', ' ') : 'Studio Guest')
        });
      } else {
        // Ready for Laravel Sanctum API: POST /api/register
        authService.updateProfile({
          name: name || 'Sara Siddiqui',
          email: email || 'sara@example.com',
          phone: phone || '+92 300 1234567'
        });
      }
      navigate('/account');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = () => {
    authService.getCurrentUser(); // ensures demo profile is ready
    navigate('/account');
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {!isLogin && (
            <div>
              <label className="block font-medium text-[#333333] mb-1">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-[#888888] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Sara Siddiqui"
                  className="w-full bg-[#efe8dc]/40 border border-[#e0d8c8] rounded-xl pl-10 pr-3.5 py-2.5 text-[#333333] focus:outline-none focus:border-[#2d5a61]"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block font-medium text-[#333333] mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#888888] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="sara@example.com"
                className="w-full bg-[#efe8dc]/40 border border-[#e0d8c8] rounded-xl pl-10 pr-3.5 py-2.5 text-[#333333] focus:outline-none focus:border-[#2d5a61]"
              />
            </div>
          </div>

          {!isLogin && (
            <div>
              <label className="block font-medium text-[#333333] mb-1">Phone Number (Optional)</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-[#888888] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+92 300 1234567"
                  className="w-full bg-[#efe8dc]/40 border border-[#e0d8c8] rounded-xl pl-10 pr-3.5 py-2.5 text-[#333333] focus:outline-none focus:border-[#2d5a61]"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block font-medium text-[#333333] mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#888888] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#efe8dc]/40 border border-[#e0d8c8] rounded-xl pl-10 pr-3.5 py-2.5 text-[#333333] focus:outline-none focus:border-[#2d5a61]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#2d5a61] text-white py-3 rounded-xl font-semibold text-xs hover:bg-[#1e3c41] transition-all shadow-xs cursor-pointer mt-2 disabled:opacity-50"
          >
            {isLoading ? 'Processing...' : isLogin ? 'Sign In' : 'Create Studio Account'}
          </button>
        </form>

        {/* Demo Fast Login */}
        <div className="mt-6 pt-5 border-t border-[#e0d8c8] text-center">
          <button
            type="button"
            onClick={handleDemoLogin}
            className="w-full bg-[#efe8dc] hover:bg-[#e0d8c8] text-[#2d5a61] py-2.5 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#D4B982]" />
            <span>Instant Demo Account Sign-In</span>
          </button>
        </div>

        {/* Toggle Login / Register */}
        <div className="mt-5 text-center text-xs text-[#666666]">
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
