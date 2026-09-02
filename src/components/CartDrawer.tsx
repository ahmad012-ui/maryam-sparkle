import React, { useState } from 'react';
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight, CheckCircle2, Sparkles, Tag, ShieldCheck } from 'lucide-react';
import { CartItem } from '../types';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (productId: string, delta: number) => void;
  onRemoveItem: (productId: string) => void;
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
    paymentMethod: 'cod',
    orderNotes: '',
  });

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

  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newOrderId = `MS-${Math.floor(100000 + Math.random() * 900000)}`;
    setOrderId(newOrderId);
    setOrderComplete(true);
    onClearCart();
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
            </div>

            <button
              onClick={() => {
                setOrderComplete(false);
                setIsCheckingOut(false);
                onClose();
              }}
              className="bg-[#2d5a61] text-white px-8 py-3 rounded-full font-medium text-sm hover:bg-[#1e3c41] transition-colors w-full"
            >
              Continue Shopping
            </button>
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
                  onChange={(e) => setCheckoutData({ ...checkoutData, phone: e.target.value })}
                  placeholder="e.g. 0300 1234567"
                  className="w-full bg-white border border-[#e0d8c8] rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#2d5a61]"
                />
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
                <label className="block text-[#444444] font-medium mb-1.5">Payment Method</label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 p-2.5 bg-white rounded-xl border border-[#e0d8c8] cursor-pointer">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cod"
                      checked={checkoutData.paymentMethod === 'cod'}
                      onChange={() => setCheckoutData({ ...checkoutData, paymentMethod: 'cod' })}
                      className="text-[#2d5a61] focus:ring-[#2d5a61]"
                    />
                    <span className="font-medium text-[#333333]">Cash on Delivery (COD)</span>
                  </label>

                  <label className="flex items-center gap-2 p-2.5 bg-white rounded-xl border border-[#e0d8c8] cursor-pointer">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="easypaisa"
                      checked={checkoutData.paymentMethod === 'easypaisa'}
                      onChange={() => setCheckoutData({ ...checkoutData, paymentMethod: 'easypaisa' })}
                      className="text-[#2d5a61] focus:ring-[#2d5a61]"
                    />
                    <span className="font-medium text-[#333333]">EasyPaisa / JazzCash</span>
                  </label>

                  <label className="flex items-center gap-2 p-2.5 bg-white rounded-xl border border-[#e0d8c8] cursor-pointer">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="bank"
                      checked={checkoutData.paymentMethod === 'bank'}
                      onChange={() => setCheckoutData({ ...checkoutData, paymentMethod: 'bank' })}
                      className="text-[#2d5a61] focus:ring-[#2d5a61]"
                    />
                    <span className="font-medium text-[#333333]">Direct Bank Transfer</span>
                  </label>
                </div>
              </div>

              {/* Order total preview */}
              <div className="bg-[#fdfaf5] p-3.5 rounded-xl border border-[#e0d8c8] space-y-1 text-xs">
                <div className="flex justify-between text-[#666666]">
                  <span>Total Amount Payable:</span>
                  <span className="font-bold text-sm text-[#2d5a61]">Rs. {grandTotal.toLocaleString()}</span>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-[#2d5a61] text-white py-3.5 rounded-full font-medium text-sm hover:bg-[#1e3c41] transition-colors shadow-md flex items-center justify-center gap-2"
              >
                <span>Place Handcrafted Order</span>
                <ArrowRight className="w-4 h-4" />
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
            {cartItems.map((item) => (
              <div
                key={item.product.id}
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
                        onClick={() => onRemoveItem(item.product.id)}
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
                        onClick={() => onUpdateQuantity(item.product.id, -1)}
                        className="p-1 hover:text-[#2d5a61] text-[#666666]"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-xs font-semibold px-2 text-[#333333]">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => onUpdateQuantity(item.product.id, 1)}
                        className="p-1 hover:text-[#2d5a61] text-[#666666]"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}

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
