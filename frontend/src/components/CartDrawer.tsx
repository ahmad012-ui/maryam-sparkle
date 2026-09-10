import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  X,
  Plus,
  Minus,
  Trash2,
  ShoppingBag,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Tag,
  ShieldCheck,
  Truck,
  User,
  AlertCircle,
  Upload,
  Copy,
  Check,
  Loader2,
  Smartphone,
  CreditCard,
  Banknote
} from 'lucide-react';
import { CartItem, PaymentMethodId, PAYMENT_METHODS } from '../types';
import { sanitizePhoneNumber, isValidPhoneNumber } from '../utils/validation';
import { authService } from '../services/authService';
import { orderService } from '../services/orderService';
import {
  uploadImageFile,
  validateImageFile,
  createLocalPreviewUrl,
  revokeLocalPreviewUrl
} from '../services/imageUploadService';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (productId: string, delta: number, size?: string, finish?: string) => void;
  onRemoveItem: (productId: string, size?: string, finish?: string) => void;
  onClearCart: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
}) => {
  const [promoCode, setPromoCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState<number>(0);
  const [promoError, setPromoError] = useState('');
  const [promoSuccess, setPromoSuccess] = useState('');
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderId, setOrderId] = useState('');

  // Checkout form fields
  const [checkoutData, setCheckoutData] = useState({
    fullName: '',
    phone: '',
    city: 'Lahore',
    address: '',
    paymentMethod: PAYMENT_METHODS.COD as PaymentMethodId,
    transactionReference: '',
    orderNotes: '',
  });

  const [proofOfPaymentUrl, setProofOfPaymentUrl] = useState<string>('');
  const [proofOfPaymentPreview, setProofOfPaymentPreview] = useState<string>('');
  const [isUploadingProof, setIsUploadingProof] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [paymentErrors, setPaymentErrors] = useState<{ transactionReference?: string; proofOfPayment?: string }>({});

  const [phoneError, setPhoneError] = useState('');
  const [drawerError, setDrawerError] = useState<string | null>(null);
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);

  const currentUser = authService.getCurrentUser();

  // Clean up Object URL on unmount/close
  useEffect(() => {
    return () => {
      if (proofOfPaymentPreview) {
        revokeLocalPreviewUrl(proofOfPaymentPreview);
      }
    };
  }, [proofOfPaymentPreview]);

  // Handle proof of payment upload in drawer
  const handleProofFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateImageFile(file);
    if (!validation.valid) {
      setUploadError(validation.error || 'Invalid file format or size');
      return;
    }

    setUploadError(null);
    setIsUploadingProof(true);

    const preview = createLocalPreviewUrl(file);
    setProofOfPaymentPreview(preview);

    try {
      const uploadedUrl = await uploadImageFile(file, 'payment-proofs');
      setProofOfPaymentUrl(uploadedUrl);
      setPaymentErrors((prev) => {
        const next = { ...prev };
        delete next.proofOfPayment;
        return next;
      });
    } catch (err: any) {
      setUploadError(err.message || 'Failed to upload proof of payment.');
      setProofOfPaymentUrl('');
    } finally {
      setIsUploadingProof(false);
    }
  };

  const handleRemoveProof = () => {
    if (proofOfPaymentPreview) {
      revokeLocalPreviewUrl(proofOfPaymentPreview);
    }
    setProofOfPaymentPreview('');
    setProofOfPaymentUrl('');
    setUploadError(null);
  };

  const handleCopy = (text: string, fieldKey: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedField(fieldKey);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // Prefill when drawer opens if logged in
  useEffect(() => {
    if (isOpen) {
      setDrawerError(null);
      setPaymentErrors({});
      setUploadError(null);
      const user = authService.getCurrentUser();
      if (user) {
        const defAddr = user.addresses.find((a) => a.isDefault) || user.addresses[0];
        setCheckoutData((prev) => ({
          ...prev,
          fullName: defAddr?.fullName || user.name || prev.fullName,
          phone: defAddr?.phone || user.phone || prev.phone,
          city: defAddr?.city || prev.city,
          address: defAddr?.address || prev.address
        }));
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const subtotal = cartItems.reduce(
    (acc, item) => acc + item.product.price * item.quantity,
    0
  );

  const discountAmount = Math.round(subtotal * appliedDiscount);
  const freeShippingThreshold = 3000;
  const shippingFee = subtotal >= freeShippingThreshold || subtotal === 0 ? 0 : 200;
  const grandTotal = Math.max(0, subtotal - discountAmount + shippingFee);
  const progressToFreeShipping = Math.min(100, (subtotal / freeShippingThreshold) * 100);

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    setPromoError('');
    setPromoSuccess('');

    const cleanCode = promoCode.trim().toUpperCase();
    if (cleanCode === 'SPARKLE10' || cleanCode === 'LOVEHANDMADE') {
      setAppliedDiscount(0.1);
      setPromoSuccess('10% discount applied to your order!');
    } else if (cleanCode === 'MARYAM15') {
      setAppliedDiscount(0.15);
      setPromoSuccess('15% special VIP discount applied!');
    } else {
      setPromoError('Invalid code. Try "SPARKLE10"');
    }
  };

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPhoneError('');
    setDrawerError(null);
    setPaymentErrors({});

    if (!isValidPhoneNumber(checkoutData.phone)) {
      setPhoneError('Please enter a valid phone number (e.g. 0300 1234567 or +92 300 1234567)');
      return;
    }

    if (!checkoutData.fullName.trim() || !checkoutData.address.trim()) {
      return;
    }

    const isNonCod = checkoutData.paymentMethod !== PAYMENT_METHODS.COD;
    const errors: { transactionReference?: string; proofOfPayment?: string } = {};

    if (isNonCod) {
      if (!checkoutData.transactionReference.trim()) {
        errors.transactionReference = 'Transaction / Reference ID is required for verification.';
      }
      if (!proofOfPaymentUrl) {
        errors.proofOfPayment = 'Please upload a screenshot proof of payment.';
      }
    }

    if (Object.keys(errors).length > 0) {
      setPaymentErrors(errors);
      setDrawerError('Please provide your transaction ID and upload a screenshot proof of payment to proceed.');
      return;
    }

    setIsSubmittingOrder(true);

    try {
      const pmId: PaymentMethodId = checkoutData.paymentMethod;
      const pmTitle =
        checkoutData.paymentMethod === PAYMENT_METHODS.COD
          ? 'Cash on Delivery (COD)'
          : checkoutData.paymentMethod === PAYMENT_METHODS.EASYPAISA
          ? 'EasyPaisa Mobile Account'
          : checkoutData.paymentMethod === PAYMENT_METHODS.JAZZCASH
          ? 'JazzCash Mobile Account'
          : 'Direct Bank Transfer';

      const newOrder = await orderService.createOrder({
        customer: {
          fullName: checkoutData.fullName.trim(),
          email: currentUser?.email || `${checkoutData.phone.replace(/\D/g, '')}@sparkleguest.pk`,
          phone: checkoutData.phone.trim()
        },
        shippingAddress: {
          address: checkoutData.address.trim(),
          city: checkoutData.city,
          postalCode: '54000',
          country: 'Pakistan'
        },
        deliveryMethod: {
          id: 'standard',
          title: 'Standard Tracked Delivery (2-4 Days)',
          cost: shippingFee,
          estimatedDays: '2-4 Days'
        },
        paymentMethod: {
          id: pmId,
          title: pmTitle
        },
        transactionReference: isNonCod ? checkoutData.transactionReference.trim() : undefined,
        proofOfPaymentUrl: isNonCod ? proofOfPaymentUrl.trim() : undefined,
        items: [...cartItems],
        subtotal,
        shippingCost: shippingFee,
        discount: discountAmount,
        couponCode: appliedDiscount > 0 ? promoCode : undefined,
        total: grandTotal,
        notes: checkoutData.orderNotes
      });

      setOrderId(newOrder.orderNumber);
      setOrderComplete(true);
      onClearCart();
    } catch (err: any) {
      console.error('Error creating order from drawer:', err);
      setDrawerError(err?.message || 'We could not complete your order at this time. Please try again.');
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/45 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Drawer Body */}
      <div className="relative w-full max-w-md bg-[#efe8dc] h-full shadow-2xl flex flex-col z-10 border-l border-[#e0d8c8] overflow-hidden">
        {/* Header */}
        <div className="p-6 bg-[#fdfaf5] border-b border-[#e0d8c8] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-[#2d5a61]" />
            <h3 className="font-serif text-xl text-[#333333]">Your Sparkle Bag</h3>
            <span className="text-xs bg-[#efe8dc] text-[#2d5a61] px-2 py-0.5 rounded-full font-bold">
              {cartItems.reduce((total, item) => total + item.quantity, 0)}
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-[#efe8dc] text-[#666666] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Free Shipping Progress */}
        <div className="bg-[#f4ebd8] px-6 py-3 border-b border-[#e0d8c8]">
          <div className="flex justify-between text-xs text-[#333333] font-medium mb-1.5">
            {subtotal >= freeShippingThreshold ? (
              <span className="text-[#2d5a61] font-semibold flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-[#D4B982]" />
                You unlocked Free Delivery across Pakistan!
              </span>
            ) : (
              <span>
                Add{' '}
                <strong className="text-[#2d5a61]">
                  Rs. {(freeShippingThreshold - subtotal).toLocaleString()}
                </strong>{' '}
                more for Free Shipping
              </span>
            )}
            <span>{Math.round(progressToFreeShipping)}%</span>
          </div>
          <div className="w-full bg-[#e0d8c8] h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-[#2d5a61] h-full transition-all duration-500 rounded-full"
              style={{ width: `${progressToFreeShipping}%` }}
            />
          </div>
        </div>

        {/* Content View: Cart Items vs Checkout vs Order Complete */}
        {orderComplete ? (
          <div className="flex-1 overflow-y-auto p-8 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-[#2d5a61] text-white rounded-full flex items-center justify-center mb-4 shadow-md">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="font-serif text-2xl text-[#333333] mb-2">Order Confirmed!</h3>
            <p className="text-sm text-[#666666] mb-4">
              Thank you for supporting handcrafted artisanal jewelry. Your order has been placed in our studio queue.
            </p>

            <div className="bg-[#fdfaf5] p-4 rounded-2xl border border-[#e0d8c8] w-full text-left mb-6 text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-[#888888]">Order ID:</span>
                <span className="font-mono font-bold text-[#2d5a61]">{orderId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#888888]">Recipient:</span>
                <span className="font-medium text-[#333333]">{checkoutData.fullName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#888888]">Phone:</span>
                <span className="font-medium text-[#333333]">{checkoutData.phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#888888]">Shipping to:</span>
                <span className="font-medium text-[#333333]">{checkoutData.city}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#888888]">Payment Method:</span>
                <span className="font-medium text-[#333333]">
                  {checkoutData.paymentMethod === PAYMENT_METHODS.COD
                    ? 'Cash on Delivery (COD)'
                    : checkoutData.paymentMethod === PAYMENT_METHODS.EASYPAISA
                    ? 'EasyPaisa Mobile'
                    : checkoutData.paymentMethod === PAYMENT_METHODS.JAZZCASH
                    ? 'JazzCash Mobile'
                    : 'Direct Bank Transfer'}
                </span>
              </div>
              {checkoutData.transactionReference && (
                <div className="flex justify-between items-center pt-1 border-t border-[#e0d8c8]/60">
                  <span className="text-[#888888]">Transaction Ref:</span>
                  <span className="font-mono font-bold text-[#333333]">{checkoutData.transactionReference}</span>
                </div>
              )}
              {proofOfPaymentPreview && (
                <div className="pt-2 border-t border-[#e0d8c8]/60">
                  <span className="text-[#888888] block mb-1">Proof Attached:</span>
                  <img src={proofOfPaymentPreview} alt="Receipt" className="w-14 h-14 object-cover rounded-lg border border-[#e0d8c8]" />
                </div>
              )}
            </div>

            <div className="w-full space-y-2.5">
              <Link
                to={`/track?order=${orderId}`}
                onClick={() => {
                  setOrderComplete(false);
                  setIsCheckingOut(false);
                  onClose();
                }}
                className="w-full bg-[#2d5a61] text-white py-3 rounded-full font-medium text-xs hover:bg-[#1e3c41] transition-colors flex items-center justify-center gap-2 shadow-xs cursor-pointer"
              >
                <Truck className="w-4 h-4" />
                <span>Track Live Progress ({orderId})</span>
              </Link>
              <button
                onClick={() => {
                  setOrderComplete(false);
                  setIsCheckingOut(false);
                  onClose();
                }}
                className="w-full bg-white border border-[#e0d8c8] text-[#333333] px-8 py-2.5 rounded-full font-medium text-xs hover:bg-[#efe8dc]/50 transition-colors cursor-pointer"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        ) : isCheckingOut ? (
          <div className="flex-1 overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-serif text-lg text-[#333333]">Shipping & Delivery</h4>
              <button
                type="button"
                onClick={() => setIsCheckingOut(false)}
                className="text-xs text-[#2d5a61] hover:underline"
              >
                ← Back to bag
              </button>
            </div>

            {/* Guest vs Member indicator */}
            {currentUser ? (
              <div className="mb-4 p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-[11px] text-emerald-800">
                <User className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Signed in as <strong>{currentUser.name}</strong></span>
              </div>
            ) : (
              <div className="mb-4 p-2.5 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-2 text-[11px] text-amber-800">
                <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span><strong>Guest Checkout:</strong> Enter name, phone & delivery address below.</span>
              </div>
            )}

            <form onSubmit={handleCheckoutSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-[#444444] font-medium mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={checkoutData.fullName}
                  onChange={(e) => setCheckoutData({ ...checkoutData, fullName: e.target.value })}
                  placeholder="e.g. Ayesha Khan"
                  className="w-full bg-white border border-[#e0d8c8] rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#2d5a61]"
                />
              </div>

              <div>
                <label className="block text-[#444444] font-medium mb-1">Phone Number (WhatsApp) *</label>
                <input
                  type="tel"
                  required
                  value={checkoutData.phone}
                  onChange={(e) => {
                    setPhoneError('');
                    setCheckoutData({ ...checkoutData, phone: sanitizePhoneNumber(e.target.value) });
                  }}
                  placeholder="e.g. 0300 1234567"
                  className={`w-full bg-white border rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#2d5a61] ${
                    phoneError ? 'border-red-500' : 'border-[#e0d8c8]'
                  }`}
                />
                {phoneError && <p className="text-[11px] text-red-500 mt-1">{phoneError}</p>}
              </div>

              <div>
                <label className="block text-[#444444] font-medium mb-1">City *</label>
                <select
                  value={checkoutData.city}
                  onChange={(e) => setCheckoutData({ ...checkoutData, city: e.target.value })}
                  className="w-full bg-white border border-[#e0d8c8] rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#2d5a61]"
                >
                  <option value="Lahore">Lahore</option>
                  <option value="Karachi">Karachi</option>
                  <option value="Islamabad">Islamabad</option>
                  <option value="Rawalpindi">Rawalpindi</option>
                  <option value="Faisalabad">Faisalabad</option>
                  <option value="Multan">Multan</option>
                  <option value="Peshawar">Peshawar</option>
                  <option value="Quetta">Quetta</option>
                  <option value="Other">Other City / International</option>
                </select>
              </div>

              <div>
                <label className="block text-[#444444] font-medium mb-1">Delivery Address *</label>
                <textarea
                  required
                  rows={2}
                  value={checkoutData.address}
                  onChange={(e) => setCheckoutData({ ...checkoutData, address: e.target.value })}
                  placeholder="House #, Street, Area / Sector..."
                  className="w-full bg-white border border-[#e0d8c8] rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#2d5a61]"
                />
              </div>

              <div>
                <label className="block text-[#444444] font-medium mb-1.5">Payment Method *</label>
                <div className="space-y-2">
                  {/* COD */}
                  <label className={`flex items-start gap-2.5 p-3 rounded-xl border cursor-pointer transition-all ${
                    checkoutData.paymentMethod === PAYMENT_METHODS.COD
                      ? 'border-[#2d5a61] bg-[#efe8dc]/40 ring-1 ring-[#2d5a61]/30'
                      : 'border-[#e0d8c8] bg-white hover:bg-[#efe8dc]/20'
                  }`}>
                    <input
                      type="radio"
                      name="drawerPaymentMethod"
                      value={PAYMENT_METHODS.COD}
                      checked={checkoutData.paymentMethod === PAYMENT_METHODS.COD}
                      onChange={() => {
                        setCheckoutData({ ...checkoutData, paymentMethod: PAYMENT_METHODS.COD });
                        setPaymentErrors({});
                      }}
                      className="mt-0.5 text-[#2d5a61] focus:ring-[#2d5a61]"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-[#333333] flex items-center gap-1.5">
                          <Banknote className="w-3.5 h-3.5 text-[#2d5a61]" />
                          Cash on Delivery (COD)
                        </span>
                        <span className="text-[9px] font-bold bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded-full">
                          Popular
                        </span>
                      </div>
                      <p className="text-[10px] text-[#666666] mt-0.5">
                        Pay cash directly to courier rider upon delivery.
                      </p>
                    </div>
                  </label>

                  {/* EasyPaisa */}
                  <label className={`flex items-start gap-2.5 p-3 rounded-xl border cursor-pointer transition-all ${
                    checkoutData.paymentMethod === PAYMENT_METHODS.EASYPAISA
                      ? 'border-[#2d5a61] bg-[#efe8dc]/40 ring-1 ring-[#2d5a61]/30'
                      : 'border-[#e0d8c8] bg-white hover:bg-[#efe8dc]/20'
                  }`}>
                    <input
                      type="radio"
                      name="drawerPaymentMethod"
                      value={PAYMENT_METHODS.EASYPAISA}
                      checked={checkoutData.paymentMethod === PAYMENT_METHODS.EASYPAISA}
                      onChange={() => {
                        setCheckoutData({ ...checkoutData, paymentMethod: PAYMENT_METHODS.EASYPAISA });
                        setPaymentErrors({});
                      }}
                      className="mt-0.5 text-[#2d5a61] focus:ring-[#2d5a61]"
                    />
                    <div className="flex-1">
                      <span className="font-medium text-[#333333] flex items-center gap-1.5">
                        <Smartphone className="w-3.5 h-3.5 text-[#2d5a61]" />
                        EasyPaisa Mobile Account
                      </span>
                      <p className="text-[10px] text-[#666666] mt-0.5">
                        Transfer to 0300-1234567 and attach payment receipt.
                      </p>
                    </div>
                  </label>

                  {/* JazzCash */}
                  <label className={`flex items-start gap-2.5 p-3 rounded-xl border cursor-pointer transition-all ${
                    checkoutData.paymentMethod === PAYMENT_METHODS.JAZZCASH
                      ? 'border-[#2d5a61] bg-[#efe8dc]/40 ring-1 ring-[#2d5a61]/30'
                      : 'border-[#e0d8c8] bg-white hover:bg-[#efe8dc]/20'
                  }`}>
                    <input
                      type="radio"
                      name="drawerPaymentMethod"
                      value={PAYMENT_METHODS.JAZZCASH}
                      checked={checkoutData.paymentMethod === PAYMENT_METHODS.JAZZCASH}
                      onChange={() => {
                        setCheckoutData({ ...checkoutData, paymentMethod: PAYMENT_METHODS.JAZZCASH });
                        setPaymentErrors({});
                      }}
                      className="mt-0.5 text-[#2d5a61] focus:ring-[#2d5a61]"
                    />
                    <div className="flex-1">
                      <span className="font-medium text-[#333333] flex items-center gap-1.5">
                        <Smartphone className="w-3.5 h-3.5 text-[#2d5a61]" />
                        JazzCash Mobile Account
                      </span>
                      <p className="text-[10px] text-[#666666] mt-0.5">
                        Transfer to 0300-7654321 and attach payment receipt.
                      </p>
                    </div>
                  </label>

                  {/* Direct Bank Transfer */}
                  <label className={`flex items-start gap-2.5 p-3 rounded-xl border cursor-pointer transition-all ${
                    checkoutData.paymentMethod === PAYMENT_METHODS.BANK_TRANSFER
                      ? 'border-[#2d5a61] bg-[#efe8dc]/40 ring-1 ring-[#2d5a61]/30'
                      : 'border-[#e0d8c8] bg-white hover:bg-[#efe8dc]/20'
                  }`}>
                    <input
                      type="radio"
                      name="drawerPaymentMethod"
                      value={PAYMENT_METHODS.BANK_TRANSFER}
                      checked={checkoutData.paymentMethod === PAYMENT_METHODS.BANK_TRANSFER}
                      onChange={() => {
                        setCheckoutData({ ...checkoutData, paymentMethod: PAYMENT_METHODS.BANK_TRANSFER });
                        setPaymentErrors({});
                      }}
                      className="mt-0.5 text-[#2d5a61] focus:ring-[#2d5a61]"
                    />
                    <div className="flex-1">
                      <span className="font-medium text-[#333333] flex items-center gap-1.5">
                        <CreditCard className="w-3.5 h-3.5 text-[#2d5a61]" />
                        Direct Bank Transfer (Meezan Bank)
                      </span>
                      <p className="text-[10px] text-[#666666] mt-0.5">
                        Online transfer to Meezan Bank studio account.
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Non-COD Transfer Instructions & Proof Capture in Drawer */}
              {checkoutData.paymentMethod !== PAYMENT_METHODS.COD && (
                <div className="p-3.5 bg-[#fdfaf5] border border-[#e0d8c8] rounded-2xl space-y-3">
                  {/* EasyPaisa Box */}
                  {checkoutData.paymentMethod === PAYMENT_METHODS.EASYPAISA && (
                    <div className="bg-white p-3 rounded-xl border border-[#e0d8c8] text-[11px] space-y-1.5">
                      <div className="flex justify-between font-medium text-[#2d5a61] pb-1 border-b border-[#e0d8c8]">
                        <span>EasyPaisa Details</span>
                        <span>Pay: Rs. {grandTotal.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center pt-0.5">
                        <span className="text-[#666666]">Number:</span>
                        <div className="flex items-center gap-1.5">
                          <strong className="font-mono text-[#333333]">0300-1234567</strong>
                          <button
                            type="button"
                            onClick={() => handleCopy('03001234567', 'ep_num')}
                            className="text-[10px] text-[#2d5a61] hover:underline flex items-center"
                          >
                            {copiedField === 'ep_num' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                          </button>
                        </div>
                      </div>
                      <div className="flex justify-between text-[#666666]">
                        <span>Title:</span>
                        <strong className="text-[#333333]">Maryam Sparkle Studio</strong>
                      </div>
                    </div>
                  )}

                  {/* JazzCash Box */}
                  {checkoutData.paymentMethod === PAYMENT_METHODS.JAZZCASH && (
                    <div className="bg-white p-3 rounded-xl border border-[#e0d8c8] text-[11px] space-y-1.5">
                      <div className="flex justify-between font-medium text-[#2d5a61] pb-1 border-b border-[#e0d8c8]">
                        <span>JazzCash Details</span>
                        <span>Pay: Rs. {grandTotal.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center pt-0.5">
                        <span className="text-[#666666]">Number:</span>
                        <div className="flex items-center gap-1.5">
                          <strong className="font-mono text-[#333333]">0300-7654321</strong>
                          <button
                            type="button"
                            onClick={() => handleCopy('03007654321', 'jc_num')}
                            className="text-[10px] text-[#2d5a61] hover:underline flex items-center"
                          >
                            {copiedField === 'jc_num' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                          </button>
                        </div>
                      </div>
                      <div className="flex justify-between text-[#666666]">
                        <span>Title:</span>
                        <strong className="text-[#333333]">Maryam Sparkle Studio</strong>
                      </div>
                    </div>
                  )}

                  {/* Bank Transfer Box */}
                  {checkoutData.paymentMethod === PAYMENT_METHODS.BANK_TRANSFER && (
                    <div className="bg-white p-3 rounded-xl border border-[#e0d8c8] text-[11px] space-y-1.5">
                      <div className="flex justify-between font-medium text-[#2d5a61] pb-1 border-b border-[#e0d8c8]">
                        <span>Meezan Bank Details</span>
                        <span>Pay: Rs. {grandTotal.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-[#666666]">
                        <span>Title:</span>
                        <strong className="text-[#333333]">Maryam Sparkle Studio</strong>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[#666666]">Account:</span>
                        <div className="flex items-center gap-1.5">
                          <strong className="font-mono text-[#333333]">01020304050607</strong>
                          <button
                            type="button"
                            onClick={() => handleCopy('01020304050607', 'acc_num')}
                            className="text-[10px] text-[#2d5a61] hover:underline"
                          >
                            {copiedField === 'acc_num' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                          </button>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[#666666]">IBAN:</span>
                        <div className="flex items-center gap-1.5">
                          <strong className="font-mono text-[10px] text-[#333333]">PK36MEZN...0607</strong>
                          <button
                            type="button"
                            onClick={() => handleCopy('PK36MEZN0001020304050607', 'iban_num')}
                            className="text-[10px] text-[#2d5a61] hover:underline"
                          >
                            {copiedField === 'iban_num' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Transaction ID Input */}
                  <div>
                    <label className="block text-[#444444] font-medium mb-1">
                      Transaction / Reference ID <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={checkoutData.transactionReference}
                      onChange={(e) => {
                        setCheckoutData({ ...checkoutData, transactionReference: e.target.value });
                        if (paymentErrors.transactionReference) {
                          setPaymentErrors((prev) => {
                            const next = { ...prev };
                            delete next.transactionReference;
                            return next;
                          });
                        }
                      }}
                      placeholder="e.g. TRX12345678 or 0987654321"
                      className={`w-full bg-white border ${
                        paymentErrors.transactionReference ? 'border-red-400 bg-red-50/20' : 'border-[#e0d8c8]'
                      } rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#2d5a61]`}
                    />
                    {paymentErrors.transactionReference && (
                      <p className="text-[10px] text-red-500 mt-1">{paymentErrors.transactionReference}</p>
                    )}
                  </div>

                  {/* Proof of Payment Screenshot Upload */}
                  <div>
                    <label className="block text-[#444444] font-medium mb-1">
                      Proof of Payment Screenshot <span className="text-red-500">*</span>
                    </label>

                    {proofOfPaymentPreview || proofOfPaymentUrl ? (
                      <div className="bg-white p-2.5 rounded-xl border border-[#e0d8c8] flex items-center justify-between gap-2.5">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-10 h-10 rounded-lg bg-[#efe8dc] overflow-hidden shrink-0 border border-[#e0d8c8]">
                            <img
                              src={proofOfPaymentPreview || proofOfPaymentUrl}
                              alt="Payment Proof"
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-medium text-[#333333] truncate flex items-center gap-1">
                              {isUploadingProof ? (
                                <>
                                  <Loader2 className="w-3 h-3 animate-spin text-[#2d5a61]" />
                                  <span>Uploading...</span>
                                </>
                              ) : (
                                <>
                                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                  <span className="text-emerald-700">Receipt Attached</span>
                                </>
                              )}
                            </p>
                            <span className="text-[10px] text-[#777777]">
                              {isUploadingProof ? 'Please wait' : 'Ready to verify'}
                            </span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={handleRemoveProof}
                          className="text-xs text-red-500 hover:text-red-700 font-medium px-2 py-1 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <label className={`block border-2 border-dashed ${
                        paymentErrors.proofOfPayment ? 'border-red-300 bg-red-50/20' : 'border-[#e0d8c8] bg-white hover:bg-[#efe8dc]/20'
                      } rounded-xl p-3 text-center cursor-pointer transition-colors`}>
                        <input
                          type="file"
                          accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                          onChange={handleProofFileUpload}
                          className="hidden"
                          disabled={isUploadingProof}
                        />
                        <div className="flex flex-col items-center gap-1">
                          <Upload className="w-5 h-5 text-[#2d5a61]" />
                          <span className="text-xs font-medium text-[#2d5a61]">
                            {isUploadingProof ? 'Uploading...' : 'Tap to Upload Screenshot'}
                          </span>
                          <span className="text-[10px] text-[#888888]">JPG, PNG, or WEBP (max 5MB)</span>
                        </div>
                      </label>
                    )}

                    {uploadError && (
                      <p className="text-[10px] text-red-500 mt-1">{uploadError}</p>
                    )}
                    {paymentErrors.proofOfPayment && !uploadError && (
                      <p className="text-[10px] text-red-500 mt-1">{paymentErrors.proofOfPayment}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Order total preview */}
              <div className="bg-[#fdfaf5] p-3.5 rounded-xl border border-[#e0d8c8] space-y-1 text-xs">
                <div className="flex justify-between text-[#666666]">
                  <span>Total Amount Payable:</span>
                  <span className="font-bold text-sm text-[#2d5a61]">Rs. {grandTotal.toLocaleString()}</span>
                </div>
              </div>

              {drawerError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{drawerError}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmittingOrder}
                className="w-full bg-[#2d5a61] text-white py-3.5 rounded-full font-medium text-sm hover:bg-[#1e3c41] transition-colors shadow-md flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSubmittingOrder ? (
                  <span>Securing Handcrafted Order...</span>
                ) : (
                  <>
                    <span>Place Handcrafted Order</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        ) : cartItems.length === 0 ? (
          <div className="flex-1 overflow-y-auto p-8 flex flex-col items-center justify-center text-center">
            <div className="w-14 h-14 rounded-full bg-[#fdfaf5] border border-[#e0d8c8] flex items-center justify-center mb-4 text-[#888888]">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <h4 className="font-serif text-lg text-[#333333] mb-1">Your bag is empty</h4>
            <p className="text-xs text-[#666666] mb-6 max-w-xs">
              Explore our handcrafted beaded collections to find a piece made just for you.
            </p>
            <button
              onClick={onClose}
              className="bg-[#2d5a61] text-white px-6 py-2.5 rounded-full text-xs font-medium hover:bg-[#1e3c41] transition-colors"
            >
              Start Exploring
            </button>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {cartItems.map((item) => {
              const itemKey = `${item.product.id}-${item.selectedSize || 'default'}-${item.selectedFinish || 'default'}`;
              return (
                <div
                  key={itemKey}
                  className="flex gap-3.5 bg-[#fdfaf5] p-3.5 rounded-2xl border border-[#e0d8c8] shadow-2xs"
                >
                  {/* Product thumbnail */}
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    className="w-20 h-20 object-cover rounded-xl border border-[#e0d8c8]/50"
                  />

                  {/* Details */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start">
                        <h4 className="font-serif text-sm text-[#333333] font-medium leading-tight">
                          {item.product.name}
                        </h4>
                        <button
                          onClick={() => onRemoveItem(item.product.id, item.selectedSize, item.selectedFinish)}
                          className="text-[#888888] hover:text-red-500 p-1 transition-colors"
                          aria-label="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <p className="text-xs text-[#2d5a61] font-semibold mt-1">
                        Rs. {item.product.price.toLocaleString()}
                      </p>

                      {item.selectedSize && (
                        <span className="text-[10px] text-[#888888]">
                          Size: {item.selectedSize}
                        </span>
                      )}
                    </div>

                    {/* Quantity selector */}
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex items-center border border-[#e0d8c8] rounded-full bg-[#efe8dc]/50 px-2 py-0.5">
                        <button
                          onClick={() => onUpdateQuantity(item.product.id, -1, item.selectedSize, item.selectedFinish)}
                          className="p-1 hover:text-[#2d5a61] text-[#666666]"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-semibold px-2 text-[#333333]">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => onUpdateQuantity(item.product.id, 1, item.selectedSize, item.selectedFinish)}
                          className="p-1 hover:text-[#2d5a61] text-[#666666]"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Promo Code Form */}
            <form onSubmit={handleApplyPromo} className="pt-2">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Tag className="w-3.5 h-3.5 absolute left-3.5 top-3 text-[#888888]" />
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    placeholder="Promo Code (e.g. SPARKLE10)"
                    className="w-full bg-white border border-[#e0d8c8] rounded-full pl-9 pr-3 py-2 text-xs text-[#333333] focus:outline-none focus:ring-1 focus:ring-[#2d5a61]"
                  />
                </div>
                <button
                  type="submit"
                  className="bg-[#efe8dc] border border-[#e0d8c8] hover:bg-[#2d5a61] hover:text-white px-4 py-2 rounded-full text-xs font-medium text-[#333333] transition-colors"
                >
                  Apply
                </button>
              </div>
              {promoError && <p className="text-[11px] text-red-600 mt-1 pl-3">{promoError}</p>}
              {promoSuccess && <p className="text-[11px] text-green-700 mt-1 pl-3">{promoSuccess}</p>}
            </form>
          </div>
        )}

        {/* Footer Summary & Checkout Trigger */}
        {!orderComplete && !isCheckingOut && cartItems.length > 0 && (
          <div className="p-6 bg-[#fdfaf5] border-t border-[#e0d8c8] space-y-3">
            <div className="space-y-1.5 text-xs text-[#666666]">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-medium text-[#333333]">Rs. {subtotal.toLocaleString()}</span>
              </div>

              {appliedDiscount > 0 && (
                <div className="flex justify-between text-green-700">
                  <span>Discount ({appliedDiscount * 100}%)</span>
                  <span>- Rs. {discountAmount.toLocaleString()}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>Shipping</span>
                <span>{shippingFee === 0 ? 'FREE' : `Rs. ${shippingFee}`}</span>
              </div>

              <div className="flex justify-between text-sm font-semibold text-[#333333] pt-2 border-t border-[#e0d8c8]">
                <span>Total</span>
                <span className="text-[#2d5a61]">Rs. {grandTotal.toLocaleString()}</span>
              </div>
            </div>

            <button
              onClick={() => setIsCheckingOut(true)}
              className="w-full bg-[#2d5a61] text-white py-3.5 rounded-full font-medium text-sm hover:bg-[#1e3c41] transition-colors shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="flex items-center justify-center gap-1 text-[11px] text-[#888888]">
              <ShieldCheck className="w-3.5 h-3.5 text-[#2d5a61]" />
              <span>Safe & Secure Handcrafted Checkout</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
