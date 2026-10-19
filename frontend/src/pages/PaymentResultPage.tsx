import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { SEO } from '../components/SEO';
import { CheckCircle2, Clock3, ShieldCheck, XCircle, Loader2, ArrowRight } from 'lucide-react';

type PaymentState = 'checking' | 'paid' | 'pending' | 'cancelled' | 'error';

export const PaymentResultPage: React.FC = () => {
  const [params] = useSearchParams();
  const orderNumber = params.get('order') || '';
  const tracker = params.get('tracker') || '';
  const cancelledByCustomer = params.get('cancelled') === '1';
  const [state, setState] = useState<PaymentState>('checking');
  const [message, setMessage] = useState('');
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!orderNumber || !tracker) {
      setState('error');
      setMessage('The payment reference is incomplete. If you attempted a payment, please contact support before trying again.');
      return;
    }

    let active = true;
    let timeout: ReturnType<typeof setTimeout> | undefined;
    const check = async (count: number) => {
      try {
        const response = await fetch('/api/safepay/status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          cache: 'no-store',
          body: JSON.stringify({ orderNumber, tracker })
        });
        const result = await response.json().catch(() => ({}));
        if (!active) return;
        if (response.ok && result.status === 'paid') {
          setState('paid');
          setMessage('Safepay has confirmed your payment. Your order is now marked as paid.');
          window.dispatchEvent(new Event('safepay-payment-confirmed'));
          return;
        }
        if (result.status === 'cancelled' || (cancelledByCustomer && count >= 1)) {
          setState('cancelled');
          setMessage('The checkout was cancelled or expired. Your order has not been marked as paid.');
          return;
        }
        if (count >= 20) {
          setState('pending');
          setMessage('Your payment is not confirmed yet. If money was deducted, do not pay again; contact support with your order number.');
          return;
        }
        setState('checking');
        setAttempt(count);
        timeout = setTimeout(() => { void check(count + 1); }, 3000);
      } catch {
        if (!active) return;
        if (count >= 20) {
          setState('pending');
          setMessage('We could not confirm the payment yet. If money was deducted, do not pay again; contact support with your order number.');
          return;
        }
        timeout = setTimeout(() => { void check(count + 1); }, 3000);
      }
    };

    void check(0);
    return () => {
      active = false;
      if (timeout) clearTimeout(timeout);
    };
  }, [orderNumber, tracker, cancelledByCustomer]);

  const paid = state === 'paid';
  const cancelled = state === 'cancelled';
  const pending = state === 'pending' || state === 'checking';

  return (
    <main className="min-h-[70vh] bg-[#efe8dc] px-4 py-16 sm:py-24">
      <SEO title="Payment status" description="Check the status of your Maryam Sparkle order payment." canonical="/payment-result" noindex />
      <section className="mx-auto max-w-xl rounded-3xl border border-[#e0d8c8] bg-[#fdfaf5] p-6 text-center shadow-sm sm:p-10">
        <div className={`mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full ${paid ? 'bg-emerald-100 text-emerald-700' : cancelled || state === 'error' ? 'bg-amber-100 text-amber-800' : 'bg-[#efe8dc] text-[#2d5a61]'}`}>
          {paid ? <CheckCircle2 className="h-8 w-8" /> : cancelled || state === 'error' ? <XCircle className="h-8 w-8" /> : pending ? <Loader2 className="h-8 w-8 animate-spin" /> : <Clock3 className="h-8 w-8" />}
        </div>
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.25em] text-[#2d5a61]">Maryam Sparkle · Secure Checkout</p>
        <h1 className="mb-3 font-serif text-3xl text-[#333333] sm:text-4xl">
          {paid ? 'Payment confirmed' : cancelled ? 'Payment not completed' : state === 'error' ? 'Unable to verify payment' : 'Verifying your payment'}
        </h1>
        <p className="mx-auto max-w-md text-sm leading-6 text-[#666666]">
          {message || 'We are checking the payment status directly with Safepay. Please keep this page open.'}
        </p>
        {orderNumber && <p className="mt-5 rounded-xl border border-[#e0d8c8] bg-white px-4 py-3 text-sm text-[#333333]">Order reference: <strong>{orderNumber}</strong></p>}
        {pending && state !== 'pending' && <p className="mt-3 text-xs text-[#777777]">Check {Math.min(attempt + 1, 20)} of 20</p>}
        <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
          {paid ? (
            <Link to="/track" className="inline-flex items-center justify-center gap-2 rounded-full bg-[#2d5a61] px-6 py-3 text-sm font-semibold text-white hover:bg-[#1e3c41]">Track your order <ArrowRight className="h-4 w-4" /></Link>
          ) : (
            <Link to="/customer-care" className="inline-flex items-center justify-center gap-2 rounded-full bg-[#2d5a61] px-6 py-3 text-sm font-semibold text-white hover:bg-[#1e3c41]"><ShieldCheck className="h-4 w-4" /> Contact support</Link>
          )}
          <Link to="/shop" className="inline-flex items-center justify-center rounded-full border border-[#d6cbbb] px-6 py-3 text-sm font-semibold text-[#333333] hover:bg-white">Continue shopping</Link>
        </div>
      </section>
    </main>
  );
};
