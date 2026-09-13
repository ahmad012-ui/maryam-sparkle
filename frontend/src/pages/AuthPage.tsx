import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Lock, Mail, User, Phone, Sparkles, Chrome, AlertCircle, CheckCircle2 } from 'lucide-react';
import { authService } from '../services/authService';
import { sanitizePhoneNumber, isValidPhoneNumber, isValidEmail, isValidFullName, isValidPassword } from '../utils/validation';

interface AuthPageProps { initialMode?: 'login' | 'register'; }

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
  const [notice, setNotice] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLogin(location.pathname !== '/register' && initialMode !== 'register');
    setErrors({});
    setNotice(null);
  }, [location.pathname, initialMode]);

  const handleOAuthClick = async () => {
    setErrors({});
    setNotice(null);
    setIsLoading(true);
    try {
      await authService.signInWithGoogle();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unable to continue with Google.';
      setErrors({ form: msg });
      setIsLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const next: Record<string, string> = {};
    const trimmedEmail = email.trim();
    if (!trimmedEmail) next.email = 'Email address is required.';
    else if (!isValidEmail(trimmedEmail)) next.email = 'Please enter a valid email address.';
    if (!password) next.password = 'Password is required.';
    else if (!isValidPassword(password, 6)) next.password = 'Password must be at least 6 characters long.';
    if (!isLogin) {
      const trimmedName = name.trim();
      if (!trimmedName) next.name = 'Full name is required.';
      else if (!isValidFullName(trimmedName)) next.name = 'Please enter a valid full name.';
      if (phone.trim() && !isValidPhoneNumber(phone.trim())) next.phone = 'Please enter a valid phone number.';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setNotice(null);
    if (!validateForm()) return;
    setIsLoading(true);
    try {
      if (isLogin) {
        await authService.login({ email: email.trim(), password });
        navigate('/account');
      } else {
        await authService.register({ name: name.trim(), email: email.trim(), password, phone: phone.trim() || undefined });
        navigate('/account');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'An unexpected authentication error occurred. Please try again.';
      const confirmationPending = msg.toLowerCase().includes('check your email') || msg.toLowerCase().includes('confirm your email');
      if (confirmationPending) {
        setErrors({});
        setNotice(msg);
      } else {
        setErrors({ form: msg });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const fieldClass = (field: string) => `w-full bg-[#efe8dc]/40 border rounded-xl pl-10 pr-3.5 py-2.5 text-[#333333] focus:outline-none transition-colors ${errors[field] ? 'border-red-400 focus:border-red-500 ring-1 ring-red-400/20' : 'border-[#e0d8c8] focus:border-[#2d5a61]'}`;

  return (
    <div className="min-h-screen bg-[#efe8dc] py-12 md:py-20 flex items-center justify-center px-4 sm:px-6">
      <div className="bg-[#fdfaf5] rounded-3xl p-6 sm:p-10 border border-[#e0d8c8] shadow-xs max-w-md w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-widest font-semibold text-[#2d5a61] mb-2"><Sparkles className="w-3.5 h-3.5 text-[#D4B982]" /><span>Studio Member Access</span></div>
          <h1 className="font-serif text-2xl sm:text-3xl text-[#333333] mb-2">{isLogin ? 'Welcome Back' : 'Join the Studio'}</h1>
          <p className="text-xs text-[#666666] leading-relaxed">{isLogin ? 'Sign in to access your order tracking, custom requests & saved addresses.' : 'Create an account for quick checkout and exclusive artisanal drops.'}</p>
        </div>

        <div className="space-y-2.5 mb-6">
          <button type="button" onClick={handleOAuthClick} disabled={isLoading} className="w-full bg-white hover:bg-[#efe8dc]/40 text-[#333333] border border-[#e0d8c8] py-2.5 px-4 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-2.5 cursor-pointer shadow-2xs disabled:opacity-50">
            <Chrome className="w-4 h-4 text-[#2d5a61]" /><span>{isLoading ? 'Connecting...' : 'Continue with Google'}</span>
          </button>
        </div>

        <div className="relative my-6"><div className="absolute inset-0 flex items-center"><div className="w-full border-t border-[#e0d8c8]" /></div><div className="relative flex justify-center text-[10px] uppercase tracking-wider"><span className="bg-[#fdfaf5] px-3 text-[#888888] font-medium">Or continue with email</span></div></div>

        {notice && <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-2 text-xs text-emerald-800"><CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" /><span>{notice}</span></div>}
        {errors.form && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2 text-xs text-red-700"><AlertCircle className="w-4 h-4 shrink-0 mt-0.5" /><span>{errors.form}</span></div>}

        <form onSubmit={handleSubmit} noValidate className="space-y-4 text-xs">
          {!isLogin && <div>
            <label className="block font-medium text-[#333333] mb-1">Full Name *</label>
            <div className="relative"><User className="w-4 h-4 text-[#888888] absolute left-3.5 top-1/2 -translate-y-1/2" /><input type="text" value={name} onChange={e => { setName(e.target.value); setErrors(p => ({ ...p, name: '' })); }} placeholder="e.g. Ayesha Khan" className={fieldClass('name')} /></div>
            {errors.name && <p className="text-[11px] text-red-500 font-medium mt-1">{errors.name}</p>}
          </div>}

          <div>
            <label className="block font-medium text-[#333333] mb-1">Email Address *</label>
            <div className="relative"><Mail className="w-4 h-4 text-[#888888] absolute left-3.5 top-1/2 -translate-y-1/2" /><input type="email" value={email} onChange={e => { setEmail(e.target.value); setErrors(p => ({ ...p, email: '' })); }} placeholder="e.g. name@example.com" className={fieldClass('email')} /></div>
            {errors.email && <p className="text-[11px] text-red-500 font-medium mt-1">{errors.email}</p>}
          </div>

          {!isLogin && <div>
            <label className="block font-medium text-[#333333] mb-1">Phone Number (Optional)</label>
            <div className="relative"><Phone className="w-4 h-4 text-[#888888] absolute left-3.5 top-1/2 -translate-y-1/2" /><input type="tel" value={phone} onChange={e => { setPhone(sanitizePhoneNumber(e.target.value)); setErrors(p => ({ ...p, phone: '' })); }} placeholder="e.g. 0300 1234567 or +92 300 1234567" className={fieldClass('phone')} /></div>
            {errors.phone && <p className="text-[11px] text-red-500 font-medium mt-1">{errors.phone}</p>}
          </div>}

          <div>
            <div className="flex items-center justify-between mb-1"><label className="block font-medium text-[#333333]">Password *</label>{isLogin && <Link to="/forgot-password" className="text-[11px] font-semibold text-[#2d5a61] hover:underline">Forgot Password?</Link>}</div>
            <div className="relative"><Lock className="w-4 h-4 text-[#888888] absolute left-3.5 top-1/2 -translate-y-1/2" /><input type="password" value={password} onChange={e => { setPassword(e.target.value); setErrors(p => ({ ...p, password: '' })); }} placeholder="At least 6 characters" className={fieldClass('password')} /></div>
            {errors.password && <p className="text-[11px] text-red-500 font-medium mt-1">{errors.password}</p>}
          </div>

          <button type="submit" disabled={isLoading} className="w-full bg-[#2d5a61] text-white py-3 rounded-xl font-semibold text-xs hover:bg-[#1e3c41] transition-all shadow-xs cursor-pointer mt-2 disabled:opacity-50">{isLoading ? 'Processing...' : isLogin ? 'Sign In' : 'Create Studio Account'}</button>
        </form>

        <div className="mt-6 pt-5 border-t border-[#e0d8c8] text-center text-xs text-[#666666]">
          {isLogin ? <p>Don&apos;t have an account? <button type="button" onClick={() => { setIsLogin(false); setErrors({}); setNotice(null); navigate('/register'); }} className="font-semibold text-[#2d5a61] hover:underline">Sign Up</button></p> : <p>Already have an account? <button type="button" onClick={() => { setIsLogin(true); setErrors({}); setNotice(null); navigate('/login'); }} className="font-semibold text-[#2d5a61] hover:underline">Sign In</button></p>}
        </div>
      </div>
    </div>
  );
};
