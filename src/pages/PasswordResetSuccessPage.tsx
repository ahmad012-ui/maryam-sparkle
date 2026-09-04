import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';
import { SEO } from '../components/SEO';

export const PasswordResetSuccessPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#efe8dc] py-12 md:py-20 flex items-center justify-center px-4 sm:px-6">
      <SEO
        title="Password Reset Successful | Maryam Sparkle"
        description="Your password has been successfully updated. Continue to login."
        canonical="/password-reset-success"
      />

      <div className="bg-[#fdfaf5] rounded-3xl p-6 sm:p-10 border border-[#e0d8c8] shadow-xs max-w-md w-full text-center">
        {/* Animated checkmark icon */}
        <div className="mx-auto w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200/80 flex items-center justify-center text-emerald-600 mb-6 shadow-2xs">
          <CheckCircle2 className="w-8 h-8" />
        </div>

        <div className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-widest font-semibold text-[#2d5a61] mb-2">
          <Sparkles className="w-3.5 h-3.5 text-[#D4B982]" />
          <span>Security Updated</span>
        </div>

        <h1 className="font-serif text-2xl sm:text-3xl text-[#333333] mb-3">
          Password Reset Successful
        </h1>

        <p className="text-xs sm:text-sm text-[#666666] leading-relaxed max-w-sm mx-auto mb-6">
          Your Maryam Sparkle account password has been safely updated. You can now sign in using your new credentials.
        </p>

        <div className="p-3 bg-[#efe8dc]/50 border border-[#e0d8c8] rounded-2xl flex items-center justify-center gap-2 text-xs text-[#555555] mb-8">
          <ShieldCheck className="w-4 h-4 text-[#2d5a61] shrink-0" />
          <span>All active security sessions refreshed</span>
        </div>

        {/* Continue to Login Button */}
        <Link
          to="/login"
          className="w-full bg-[#2d5a61] text-white py-3.5 px-6 rounded-xl font-semibold text-xs hover:bg-[#1e3c41] transition-all shadow-xs inline-flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>Continue to Login</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
};
