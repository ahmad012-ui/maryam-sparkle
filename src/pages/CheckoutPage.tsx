import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ShieldCheck,
  Truck,
  CheckCircle2,
  Lock,
  ChevronLeft,
  Sparkles,
  CreditCard,
  Banknote,
  Smartphone,
  AlertCircle
} from 'lucide-react';
import { CartItem, Order } from '../types';
import { orderService } from '../services/orderService';
import { authService } from '../services/authService';

interface CheckoutPageProps {
  cart: CartItem[];
  onClearCart: () => void;
}

export const CheckoutPage: React.FC<CheckoutPageProps> = ({ cart, onClearCart }) => {
  const navigate = useNavigate();
  const currentUser = authService.getCurrentUser();
  const defaultAddress = currentUser?.addresses.find((a) => a.isDefault) || currentUser?.addresses[0];

  // Form State
  const [formData, setFormData] = useState({
    fullName: defaultAddress?.fullName || currentUser?.name || '',
    email: currentUser?.email || '',
    phone: defaultAddress?.phone || currentUser?.phone || '',
    address: defaultAddress?.address || '',
    city: defaultAddress?.city || 'Karachi',
    postalCode: defaultAddress?.postalCode || '75500',
    province: 'Sindh',
    country: 'Pakistan',
    deliveryMethod: 'standard' as 'standard' | 'express',
    paymentMethod: 'cod' as 'cod' | 'easypaisa' | 'bank_transfer',
    notes: ''
  });

  const [couponCode, setCouponCode] = useState('SPARKLE10');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Subtotal calculations
  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const discount = couponCode === 'SPARKLE10' ? Math.round(subtotal * 0.1) : 0;
  const shippingFee =
    formData.deliveryMethod === 'express'
      ? 350
      : subtotal >= 3000 || subtotal === 0
      ? 0
      : 200;
  const total = subtotal - discount + shippingFee;

  if (cart.length === 0) {
    return (
      <div className="min-h-[70vh] bg-[#efe8dc] flex flex-col items-center justify-center px-6 py-20 text-center">
        <h1 className="font-serif text-3xl text-[#333333] mb-3">No Items in Checkout</h1>
        <p className="text-[#666666] mb-6">Please add pieces to your cart before proceeding to checkout.</p>
        <Link
          to="/shop"
          className="bg-[#2d5a61] text-white px-8 py-3.5 rounded-full text-sm font-medium hover:bg-[#1e3c41]"
        >
          Return to Shop
        </Link>
      </div>
    );
  }

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formData.fullName.trim()) errors.fullName = 'Full name is required';
    if (!formData.email.trim() || !formData.email.includes('@')) errors.email = 'Valid email is required';
    if (!formData.phone.trim() || formData.phone.length < 10) errors.phone = 'Valid phone number is required';
    if (!formData.address.trim()) errors.address = 'Delivery address is required';
    if (!formData.city.trim()) errors.city = 'City is required';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const deliveryTitle =
        formData.deliveryMethod === 'express'
          ? 'Express Courier (1-2 Days)'
          : 'Standard Tracked Delivery (2-4 Days)';

      const paymentTitles = {
        cod: 'Cash on Delivery (COD)',
        easypaisa: 'EasyPaisa Mobile Account',
        bank_transfer: 'Direct Bank Transfer'
      };

      const newOrder: Order = await orderService.createOrder({
        customer: {
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone
        },
        shippingAddress: {
          address: formData.address,
          city: formData.city,
          postalCode: formData.postalCode,
          province: formData.province,
          country: formData.country
        },
        deliveryMethod: {
          id: formData.deliveryMethod,
          title: deliveryTitle,
          cost: shippingFee,
          estimatedDays: formData.deliveryMethod === 'express' ? '1-2 Days' : '2-4 Days'
        },
        paymentMethod: {
          id: formData.paymentMethod,
          title: paymentTitles[formData.paymentMethod]
        },
        items: [...cart],
        subtotal,
        shippingCost: shippingFee,
        discount,
        couponCode: couponCode || undefined,
        total,
        notes: formData.notes
      });

      // Clear the user's active cart
      onClearCart();

      // Navigate directly to Order Confirmation
      navigate(`/order-confirmation?orderId=${newOrder.orderNumber}`);
    } catch (err) {
      console.error('Order creation error:', err);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#efe8dc] py-10 md:py-16">
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        {/* Back Link & Header */}
        <div className="mb-8">
          <Link
            to="/cart"
            className="text-xs font-semibold text-[#2d5a61] hover:underline inline-flex items-center gap-1 mb-2"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Return to Shopping Bag</span>
          </Link>
          <div className="flex items-center justify-between">
            <h1 className="font-serif text-3xl md:text-4xl text-[#333333]">Secure Checkout</h1>
            <div className="flex items-center gap-1.5 text-xs text-[#555555] bg-[#fdfaf5] px-3.5 py-1.5 rounded-full border border-[#e0d8c8]">
              <Lock className="w-3.5 h-3.5 text-[#2d5a61]" />
              <span>SSL 256-Bit Encrypted</span>
            </div>
          </div>
        </div>

        <form onSubmit={handlePlaceOrder}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            {/* Left Column: Form Fields (7 cols) */}
            <div className="lg:col-span-7 space-y-8">
              {/* Section 1: Customer Contact */}
              <div className="bg-[#fdfaf5] rounded-3xl p-6 md:p-8 border border-[#e0d8c8] shadow-xs">
                <div className="flex items-center justify-between mb-5 pb-3 border-b border-[#e0d8c8]">
                  <h2 className="font-serif text-xl text-[#333333] flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-[#2d5a61] text-white text-xs flex items-center justify-center">1</span>
                    Customer Information
                  </h2>
                  <span className="text-xs text-[#666666]">Step 1 of 3</span>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#333333] mb-1.5">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      placeholder="e.g. Sara Siddiqui"
                      className={`w-full bg-[#efe8dc]/40 border rounded-xl px-4 py-2.5 text-xs text-[#333333] focus:outline-none focus:border-[#2d5a61] ${
                        formErrors.fullName ? 'border-red-500' : 'border-[#e0d8c8]'
                      }`}
                    />
                    {formErrors.fullName && <p className="text-[11px] text-red-500 mt-1">{formErrors.fullName}</p>}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#333333] mb-1.5">
                        Email Address (for Receipt & Tracking) *
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="sara@example.com"
                        className={`w-full bg-[#efe8dc]/40 border rounded-xl px-4 py-2.5 text-xs text-[#333333] focus:outline-none focus:border-[#2d5a61] ${
                          formErrors.email ? 'border-red-500' : 'border-[#e0d8c8]'
                        }`}
                      />
                      {formErrors.email && <p className="text-[11px] text-red-500 mt-1">{formErrors.email}</p>}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#333333] mb-1.5">
                        Phone Number (for Courier Delivery) *
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+92 300 1234567"
                        className={`w-full bg-[#efe8dc]/40 border rounded-xl px-4 py-2.5 text-xs text-[#333333] focus:outline-none focus:border-[#2d5a61] ${
                          formErrors.phone ? 'border-red-500' : 'border-[#e0d8c8]'
                        }`}
                      />
                      {formErrors.phone && <p className="text-[11px] text-red-500 mt-1">{formErrors.phone}</p>}
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 2: Delivery Address & Shipping Method */}
              <div className="bg-[#fdfaf5] rounded-3xl p-6 md:p-8 border border-[#e0d8c8] shadow-xs">
                <div className="flex items-center justify-between mb-5 pb-3 border-b border-[#e0d8c8]">
                  <h2 className="font-serif text-xl text-[#333333] flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-[#2d5a61] text-white text-xs flex items-center justify-center">2</span>
                    Shipping Details
                  </h2>
                  <span className="text-xs text-[#666666]">Step 2 of 3</span>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#333333] mb-1.5">
                      Street Address / House / Apartment Number *
                    </label>
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      placeholder="e.g. House 14-A, Street 7, Clifton Block 4"
                      className={`w-full bg-[#efe8dc]/40 border rounded-xl px-4 py-2.5 text-xs text-[#333333] focus:outline-none focus:border-[#2d5a61] ${
                        formErrors.address ? 'border-red-500' : 'border-[#e0d8c8]'
                      }`}
                    />
                    {formErrors.address && <p className="text-[11px] text-red-500 mt-1">{formErrors.address}</p>}
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#333333] mb-1.5">City *</label>
                      <input
                        type="text"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        placeholder="Karachi"
                        className="w-full bg-[#efe8dc]/40 border border-[#e0d8c8] rounded-xl px-4 py-2.5 text-xs text-[#333333] focus:outline-none focus:border-[#2d5a61]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#333333] mb-1.5">Postal Code</label>
                      <input
                        type="text"
                        value={formData.postalCode}
                        onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                        placeholder="75500"
                        className="w-full bg-[#efe8dc]/40 border border-[#e0d8c8] rounded-xl px-4 py-2.5 text-xs text-[#333333] focus:outline-none focus:border-[#2d5a61]"
                      />
                    </div>

                    <div className="col-span-2 sm:col-span-1">
                      <label className="block text-xs font-semibold text-[#333333] mb-1.5">Country</label>
                      <input
                        type="text"
                        disabled
                        value="Pakistan"
                        className="w-full bg-[#efe8dc]/60 border border-[#e0d8c8] rounded-xl px-4 py-2.5 text-xs text-[#666666]"
                      />
                    </div>
                  </div>

                  {/* Delivery Speed Selector */}
                  <div className="pt-2">
                    <label className="block text-xs font-semibold text-[#333333] mb-2.5">
                      Select Delivery Method
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <label
                        className={`flex items-start gap-3 p-3.5 rounded-2xl border cursor-pointer transition-all ${
                          formData.deliveryMethod === 'standard'
                            ? 'border-[#2d5a61] bg-[#efe8dc]/50 ring-2 ring-[#2d5a61]/20'
                            : 'border-[#e0d8c8] bg-white/60 hover:bg-[#efe8dc]/30'
                        }`}
                      >
                        <input
                          type="radio"
                          name="deliveryMethod"
                          checked={formData.deliveryMethod === 'standard'}
                          onChange={() => setFormData({ ...formData, deliveryMethod: 'standard' })}
                          className="mt-0.5 text-[#2d5a61]"
                        />
                        <div className="text-xs">
                          <p className="font-semibold text-[#333333]">Standard Tracked Delivery</p>
                          <p className="text-[11px] text-[#666666]">2–4 business days nationwide</p>
                          <p className="font-bold text-[#2d5a61] mt-1">
                            {subtotal >= 3000 ? 'FREE (Orders > Rs. 3,000)' : 'Rs. 200'}
                          </p>
                        </div>
                      </label>

                      <label
                        className={`flex items-start gap-3 p-3.5 rounded-2xl border cursor-pointer transition-all ${
                          formData.deliveryMethod === 'express'
                            ? 'border-[#2d5a61] bg-[#efe8dc]/50 ring-2 ring-[#2d5a61]/20'
                            : 'border-[#e0d8c8] bg-white/60 hover:bg-[#efe8dc]/30'
                        }`}
                      >
                        <input
                          type="radio"
                          name="deliveryMethod"
                          checked={formData.deliveryMethod === 'express'}
                          onChange={() => setFormData({ ...formData, deliveryMethod: 'express' })}
                          className="mt-0.5 text-[#2d5a61]"
                        />
                        <div className="text-xs">
                          <p className="font-semibold text-[#333333]">Express Priority Courier</p>
                          <p className="text-[11px] text-[#666666]">1–2 business days priority dispatch</p>
                          <p className="font-bold text-[#2d5a61] mt-1">Rs. 350</p>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 3: Payment Method Architecture */}
              <div className="bg-[#fdfaf5] rounded-3xl p-6 md:p-8 border border-[#e0d8c8] shadow-xs">
                <div className="flex items-center justify-between mb-5 pb-3 border-b border-[#e0d8c8]">
                  <h2 className="font-serif text-xl text-[#333333] flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-[#2d5a61] text-white text-xs flex items-center justify-center">3</span>
                    Payment Selection
                  </h2>
                  <span className="text-xs text-[#666666]">Step 3 of 3</span>
                </div>

                <div className="space-y-3">
                  {/* COD */}
                  <label
                    className={`flex items-start gap-3 p-4 rounded-2xl border cursor-pointer transition-all ${
                      formData.paymentMethod === 'cod'
                        ? 'border-[#2d5a61] bg-[#efe8dc]/50 ring-2 ring-[#2d5a61]/20'
                        : 'border-[#e0d8c8] bg-white/60 hover:bg-[#efe8dc]/30'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={formData.paymentMethod === 'cod'}
                      onChange={() => setFormData({ ...formData, paymentMethod: 'cod' })}
                      className="mt-0.5 text-[#2d5a61]"
                    />
                    <div className="flex-1 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-[#333333] flex items-center gap-2">
                          <Banknote className="w-4 h-4 text-[#2d5a61]" />
                          Cash on Delivery (COD)
                        </span>
                        <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                          Most Popular
                        </span>
                      </div>
                      <p className="text-[11px] text-[#666666] mt-1">
                        Pay cash directly to the courier rider upon parcel delivery at your doorstep.
                      </p>
                    </div>
                  </label>

                  {/* EasyPaisa / JazzCash */}
                  <label
                    className={`flex items-start gap-3 p-4 rounded-2xl border cursor-pointer transition-all ${
                      formData.paymentMethod === 'easypaisa'
                        ? 'border-[#2d5a61] bg-[#efe8dc]/50 ring-2 ring-[#2d5a61]/20'
                        : 'border-[#e0d8c8] bg-white/60 hover:bg-[#efe8dc]/30'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={formData.paymentMethod === 'easypaisa'}
                      onChange={() => setFormData({ ...formData, paymentMethod: 'easypaisa' })}
                      className="mt-0.5 text-[#2d5a61]"
                    />
                    <div className="flex-1 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-[#333333] flex items-center gap-2">
                          <Smartphone className="w-4 h-4 text-[#2d5a61]" />
                          EasyPaisa / JazzCash Mobile Account
                        </span>
                      </div>
                      <p className="text-[11px] text-[#666666] mt-1">
                        Transfer to <strong>0300-1234567</strong> (Title: Maryam Sparkle Studio) and share screenshot on WhatsApp.
                      </p>
                    </div>
                  </label>

                  {/* Direct Bank Transfer */}
                  <label
                    className={`flex items-start gap-3 p-4 rounded-2xl border cursor-pointer transition-all ${
                      formData.paymentMethod === 'bank_transfer'
                        ? 'border-[#2d5a61] bg-[#efe8dc]/50 ring-2 ring-[#2d5a61]/20'
                        : 'border-[#e0d8c8] bg-white/60 hover:bg-[#efe8dc]/30'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={formData.paymentMethod === 'bank_transfer'}
                      onChange={() => setFormData({ ...formData, paymentMethod: 'bank_transfer' })}
                      className="mt-0.5 text-[#2d5a61]"
                    />
                    <div className="flex-1 text-xs">
                      <span className="font-semibold text-[#333333] flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-[#2d5a61]" />
                        Direct Online Bank Transfer (Meezan / HBL)
                      </span>
                      <p className="text-[11px] text-[#666666] mt-1">
                        Bank details are displayed on the confirmation receipt.
                      </p>
                    </div>
                  </label>
                </div>

                {/* Special Artisan Instructions note */}
                <div className="mt-5">
                  <label className="block text-xs font-semibold text-[#333333] mb-1.5">
                    Order / Gift Notes for the Artisan Studio (Optional)
                  </label>
                  <textarea
                    rows={2}
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="e.g. Please include a birthday gift tag saying 'Happy Birthday Aiman!'"
                    className="w-full bg-[#efe8dc]/40 border border-[#e0d8c8] rounded-xl px-4 py-2.5 text-xs text-[#333333] focus:outline-none focus:border-[#2d5a61]"
                  />
                </div>
              </div>
            </div>

            {/* Right Column: Order Review Summary (5 cols) */}
            <div className="lg:col-span-5">
              <div className="bg-[#fdfaf5] rounded-3xl p-6 md:p-8 border border-[#e0d8c8] shadow-sm sticky top-24">
                <h2 className="font-serif text-xl text-[#333333] mb-4 pb-3 border-b border-[#e0d8c8]">
                  Order Summary ({cart.length})
                </h2>

                {/* Items List */}
                <div className="max-h-60 overflow-y-auto space-y-3 pr-1 mb-6 border-b border-[#e0d8c8] pb-6 scrollbar-thin">
                  {cart.map((item) => (
                    <div key={item.product.id} className="flex items-center gap-3.5">
                      <div className="w-14 h-14 rounded-xl overflow-hidden bg-[#efe8dc] shrink-0 border border-[#e0d8c8]">
                        <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-serif text-xs text-[#333333] font-medium truncate">
                          {item.product.name}
                        </h4>
                        <p className="text-[11px] text-[#666666]">
                          Qty: {item.quantity} {item.selectedSize ? `· ${item.selectedSize}` : ''}
                        </p>
                      </div>
                      <span className="text-xs font-semibold text-[#333333] shrink-0">
                        Rs. {(item.product.price * item.quantity).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Subtotal Calculation */}
                <div className="space-y-3 text-xs text-[#555555] mb-6 pb-6 border-b border-[#e0d8c8]">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="font-semibold text-[#333333]">Rs. {subtotal.toLocaleString()}</span>
                  </div>

                  {discount > 0 && (
                    <div className="flex justify-between text-emerald-700 font-semibold">
                      <span>Promo Discount ({couponCode})</span>
                      <span>-Rs. {discount.toLocaleString()}</span>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <span>Courier Delivery</span>
                    <span>{shippingFee === 0 ? <strong className="text-emerald-700">FREE</strong> : `Rs. ${shippingFee}`}</span>
                  </div>

                  <div className="flex justify-between">
                    <span>Studio Gift Box & Care Bag</span>
                    <span className="text-emerald-700 font-medium">Complimentary</span>
                  </div>
                </div>

                {/* Total */}
                <div className="flex justify-between items-baseline mb-6">
                  <span className="font-serif text-lg text-[#333333]">Total to Pay</span>
                  <div className="text-right">
                    <span className="text-2xl font-bold text-[#333333]">Rs. {total.toLocaleString()}</span>
                    <p className="text-[10px] text-[#888888]">All local courier handling included</p>
                  </div>
                </div>

                {/* Submit CTA */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-[#2d5a61] text-white py-4 rounded-2xl font-medium text-sm flex items-center justify-center gap-2 hover:bg-[#1e3c41] transition-all duration-300 shadow-sm hover:shadow-md cursor-pointer disabled:opacity-75"
                >
                  {isSubmitting ? (
                    <>
                      <Sparkles className="w-4 h-4 animate-spin" />
                      <span>Confirming Order...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Place Order (Rs. {total.toLocaleString()})</span>
                    </>
                  )}
                </button>

                <p className="text-[11px] text-center text-[#777777] mt-3">
                  By placing an order, you agree to Maryam Sparkle's 7-Day Exchange & Studio Care Policies.
                </p>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
