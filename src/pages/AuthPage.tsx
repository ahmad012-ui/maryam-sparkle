import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, Mail, User, Phone, Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react';
import { authService } from '../services/authService';

export const AuthPage: React.FC<{ initialMode?: 'login' | 'register' }> = ({ initialMode = 'login' }) => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(initialMode === 'login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLogin) {
      // demo login
      authService.updateProfile({
        email: email || 'sara.siddiqui@example.com',
        name: name || 'Sara Siddiqui'
      });
    } else {
      authService.updateProfile({
        name: name || 'Sara Siddiqui',
        email: email || 'sara@example.com',
        phone: phone || '+92 300 1234567'
      });
    }
    navigate('/account');
  };

  const handleDemoLogin = () => {
    authService.getCurrentUser(); // ensures demo user initialized
    navigate('/account');
  };

  return (
    <div className="min-h-screen bg-[#efe8dc] py-12 md:py-20 flex items-center justify-center px-6">
      <div className="bg-[#fdfaf5] rounded-3xl p-8 sm:p-10 border border-[#e0d8c8] shadow-sm max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 text-xs uppercase tracking-widest font-semibold text-[#2d5a61] mb-2">
            <Sparkles className="w-3.5 h-3.5 text-[#D4B982]" />
            <span>Studio Member Access</span>
          </div>
          <h1 className="font-serif text-3xl text-[#333333] mb-2">
            {isLogin ? 'Welcome Back' : 'Join the Studio'}
          </h1>
          <p className="text-xs text-[#666666]">
            {isLogin
              ? 'Sign in to access your order history & saved addresses.'
              : 'Create an account for quick checkout and exclusive artisan drops.'}
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
              <label className="block font-medium text-[#333333] mb-1">Phone Number</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-[#888888] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  required
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
            className="w-full bg-[#2d5a61] text-white py-3.5 rounded-xl font-semibold text-xs hover:bg-[#1e3c41] transition-all shadow-sm cursor-pointer mt-2"
          >
            {isLogin ? 'Sign In' : 'Create Studio Account'}
          </button>
        </form>

        {/* Demo Fast Login */}
        <div className="mt-6 pt-6 border-t border-[#e0d8c8] text-center">
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
        <div className="mt-6 text-center text-xs text-[#666666]">
          {isLogin ? (
            <p>
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => setIsLogin(false)}
                className="font-semibold text-[#2d5a61] hover:underline"
              >
                Sign Up
              </button>
            </p>
          ) : (
            <p>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => setIsLogin(true)}
                className="font-semibold text-[#2d5a61] hover:underline"
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
