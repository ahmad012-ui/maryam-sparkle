import React from 'react';
import { CreditCard, LockKeyhole } from 'lucide-react';

interface CardPaymentFieldsProps {
  cardholderName: string;
  cardNumber: string;
  expiry: string;
  cvv: string;
  onChange: (field: 'cardholderName' | 'cardNumber' | 'expiry' | 'cvv', value: string) => void;
}

/**
 * Presentation-only card fields for the future Safepay integration.
 * Never send these values to Maryam Sparkle's own API or persist them.
 */
export const CardPaymentFields: React.FC<CardPaymentFieldsProps> = ({
  cardholderName,
  cardNumber,
  expiry,
  cvv,
  onChange,
}) => {
  const formatCardNumber = (value: string) =>
    value.replace(/\D/g, '').slice(0, 19).replace(/(.{4})/g, '$1 ').trim();

  const formatExpiry = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 4);
    return digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
  };

  return (
    <div className="mt-5 p-5 bg-[#efe8dc]/40 border border-[#e0d8c8] rounded-2xl space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold text-[#333333]">Card details</p>
          <p className="text-[10px] text-[#777777] mt-0.5">Secure card payment via Safepay when connected.</p>
        </div>
        <div className="inline-flex items-center gap-1 text-[10px] text-[#2d5a61] bg-[#fdfaf5] border border-[#e0d8c8] rounded-full px-2.5 py-1">
          <LockKeyhole className="w-3 h-3" />
          <span>Secure</span>
        </div>
      </div>

      <div className="rounded-2xl bg-[#2d5a61] text-white p-4 shadow-sm">
        <div className="flex items-center justify-between mb-7">
          <CreditCard className="w-6 h-6" />
          <span className="text-[10px] tracking-[0.2em] uppercase opacity-80">Card</span>
        </div>
        <p className="font-mono text-sm tracking-[0.14em] truncate">
          {cardNumber || '•••• •••• •••• ••••'}
        </p>
        <div className="flex justify-between mt-4 text-[9px] uppercase tracking-wider opacity-75">
          <span>{cardholderName || 'Cardholder name'}</span>
          <span>{expiry || 'MM/YY'}</span>
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-[#333333] mb-1.5">Cardholder Name</label>
        <input
          type="text"
          autoComplete="cc-name"
          value={cardholderName}
          onChange={(e) => onChange('cardholderName', e.target.value)}
          placeholder="Name on card"
          className="w-full bg-white border border-[#e0d8c8] rounded-xl px-4 py-2.5 text-xs text-[#333333] focus:outline-none focus:border-[#2d5a61]"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-[#333333] mb-1.5">Card Number</label>
        <input
          type="text"
          inputMode="numeric"
          autoComplete="cc-number"
          value={cardNumber}
          onChange={(e) => onChange('cardNumber', formatCardNumber(e.target.value))}
          placeholder="1234 5678 9012 3456"
          maxLength={23}
          className="w-full bg-white border border-[#e0d8c8] rounded-xl px-4 py-2.5 text-xs font-mono tracking-wide text-[#333333] focus:outline-none focus:border-[#2d5a61]"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-[#333333] mb-1.5">Expiry Date</label>
          <input
            type="text"
            inputMode="numeric"
            autoComplete="cc-exp"
            value={expiry}
            onChange={(e) => onChange('expiry', formatExpiry(e.target.value))}
            placeholder="MM/YY"
            maxLength={5}
            className="w-full bg-white border border-[#e0d8c8] rounded-xl px-4 py-2.5 text-xs font-mono text-[#333333] focus:outline-none focus:border-[#2d5a61]"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-[#333333] mb-1.5">CVV</label>
          <input
            type="password"
            inputMode="numeric"
            autoComplete="cc-csc"
            value={cvv}
            onChange={(e) => onChange('cvv', e.target.value.replace(/\D/g, '').slice(0, 4))}
            placeholder="•••"
            maxLength={4}
            className="w-full bg-white border border-[#e0d8c8] rounded-xl px-4 py-2.5 text-xs font-mono text-[#333333] focus:outline-none focus:border-[#2d5a61]"
          />
        </div>
      </div>

      <div className="rounded-xl bg-amber-50 border border-amber-200 px-3 py-2.5 text-[10px] leading-relaxed text-amber-900">
        <strong>Preview only:</strong> these fields are not submitted to Maryam Sparkle or stored. Safepay's secure card component will replace this form when live card processing is enabled.
      </div>
    </div>
  );
};
