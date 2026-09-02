import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, ShoppingBag, ArrowRight, ShieldCheck, Truck, Sparkles, Tag, ArrowLeft } from 'lucide-react';
import { CartItem } from '../types';

interface CartPageProps {
  cart: CartItem[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
}

export const CartPage: React.FC<CartPageProps> = ({ cart, onUpdateQuantity, onRemoveItem }) => {
  const navigate = useNavigate();
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);

  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const freeShippingThreshold = 3000;
  const progressToFreeShipping = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));
  const amountNeededForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);

  const discount = appliedCoupon === 'SPARKLE10' ? Math.round(subtotal * 0.1) : 0;
  const shipping = subtotal >= freeShippingThreshold || subtotal === 0 ? 0 : 200;
  const total = subtotal - discount + shipping;

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError(null);
    if (!couponInput.trim()) return;

    if (couponInput.trim().toUpperCase() === 'SPARKLE10') {
      setAppliedCoupon('SPARKLE10');
      setCouponInput('');
    } else {
      setCouponError('Invalid coupon code. Try code SPARKLE10 for 10% off!');
    }
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-[70vh] bg-[#efe8dc] flex flex-col items-center justify-center px-6 py-20 text-center">
        <div className="w-24 h-24 bg-[#fdfaf5] rounded-full flex items-center justify-center mb-6 shadow-sm border border-[#e0d8c8]">
          <ShoppingBag className="w-10 h-10 text-[#2d5a61]/60" />
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl text-[#333333] mb-3">Your Shopping Bag is Empty</h1>
        <p className="text-[#666666] max-w-md mb-8 text-sm sm:text-base leading-relaxed">
          Looks like you haven't added any handmade gemstone treasures to your bag yet. Explore our latest arrivals or stackable bracelets!
        </p>
        <Link
          to="/shop"
          className="inline-flex items-center gap-2 bg-[#2d5a61] text-white px-8 py-4 rounded-full font-medium text-sm hover:bg-[#1e3c41] transition-all duration-300 shadow-sm hover:shadow-md"
        >
          <span>Explore Handmade Collections</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#efe8dc] py-10 md:py-16">
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-[#e0d8c8] mb-8">
          <div>
            <h1 className="font-serif text-3xl md:text-4xl text-[#333333]">Shopping Bag</h1>
            <p className="text-xs md:text-sm text-[#666666] mt-1">
              You have {cart.reduce((c, i) => c + i.quantity, 0)} handcrafted {cart.reduce((c, i) => c + i.quantity, 0) === 1 ? 'piece' : 'pieces'} in your bag.
            </p>
          </div>
          <Link
            to="/shop"
            className="text-xs md:text-sm font-medium text-[#2d5a61] hover:underline flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Continue Shopping</span>
          </Link>
        </div>

        {/* Free Shipping Progress Indicator */}
        <div className="bg-[#fdfaf5] rounded-2xl p-4 md:p-5 border border-[#e0d8c8] mb-8 shadow-xs">
          <div className="flex items-center justify-between text-xs font-semibold text-[#333333] mb-2">
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-[#2d5a61]" />
              <span>
                {amountNeededForFreeShipping === 0
                  ? '🎉 Congratulations! You have unlocked FREE Nationwide Delivery!'
                  : `Add Rs. ${amountNeededForFreeShipping.toLocaleString()} more to qualify for FREE Nationwide Delivery.`}
              </span>
            </div>
            <span className="text-[#2d5a61]">{progressToFreeShipping}%</span>
          </div>
          <div className="w-full bg-[#efe8dc] h-2.5 rounded-full overflow-hidden">
            <div
              className="bg-[#2d5a61] h-full rounded-full transition-all duration-500"
              style={{ width: `${progressToFreeShipping}%` }}
            />
          </div>
        </div>

        {/* 2-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Left Column: Cart Items List (8 cols) */}
          <div className="lg:col-span-8 space-y-4">
            {cart.map((item) => (
              <div
                key={item.product.id}
                className="bg-[#fdfaf5] rounded-2xl p-4 sm:p-5 border border-[#e0d8c8] shadow-xs flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 justify-between transition-all hover:shadow-sm"
              >
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-[#efe8dc] shrink-0 border border-[#e0d8c8]">
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#2d5a61] bg-[#2d5a61]/10 px-2 py-0.5 rounded-md">
                      {item.product.category}
                    </span>
                    <h3 className="font-serif text-base sm:text-lg text-[#333333] mt-1 font-medium">
                      <Link to={`/product/${item.product.slug}`} className="hover:text-[#2d5a61] transition-colors">
                        {item.product.name}
                      </Link>
                    </h3>

                    {item.selectedSize && (
                      <p className="text-xs text-[#666666] mt-0.5">
                        Size: <span className="font-medium text-[#444444]">{item.selectedSize}</span>
                      </p>
                    )}

                    {item.selectedFinish && (
                      <p className="text-xs text-[#666666]">
                        Finish: <span className="font-medium text-[#444444]">{item.selectedFinish}</span>
                      </p>
                    )}

                    <p className="text-sm font-semibold text-[#333333] mt-1 sm:hidden">
                      Rs. {(item.product.price * item.quantity).toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Right side controls on desktop */}
                <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-[#e0d8c8]">
                  {/* Quantity Counter */}
                  <div className="flex items-center bg-[#efe8dc]/70 border border-[#e0d8c8] rounded-xl overflow-hidden">
                    <button
                      onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
                      className="px-3 py-1.5 text-xs font-bold text-[#444444] hover:bg-[#e0d8c8] transition-colors cursor-pointer"
                    >
                      -
                    </button>
                    <span className="px-3 py-1.5 text-xs font-bold text-[#333333] min-w-[2rem] text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                      className="px-3 py-1.5 text-xs font-bold text-[#444444] hover:bg-[#e0d8c8] transition-colors cursor-pointer"
                    >
                      +
                    </button>
                  </div>

                  {/* Price */}
                  <div className="hidden sm:block text-right min-w-[90px]">
                    <p className="text-sm font-bold text-[#333333]">
                      Rs. {(item.product.price * item.quantity).toLocaleString()}
                    </p>
                    <p className="text-[11px] text-[#888888]">
                      Rs. {item.product.price.toLocaleString()} each
                    </p>
                  </div>

                  {/* Remove action */}
                  <button
                    onClick={() => onRemoveItem(item.product.id)}
                    className="p-2 text-[#888888] hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                    title="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Right Column: Order Summary (4 cols) */}
          <div className="lg:col-span-4">
            <div className="bg-[#fdfaf5] rounded-3xl p-6 md:p-8 border border-[#e0d8c8] shadow-sm sticky top-24">
              <h2 className="font-serif text-xl text-[#333333] mb-6 pb-4 border-b border-[#e0d8c8]">
                Order Summary
              </h2>

              {/* Coupon Form */}
              <div className="mb-6">
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="w-4 h-4 text-[#888888] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Promo Code (SPARKLE10)"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value)}
                      className="w-full bg-[#efe8dc]/50 border border-[#e0d8c8] rounded-xl pl-9 pr-3 py-2 text-xs text-[#333333] placeholder-[#888888] focus:outline-none focus:border-[#2d5a61]"
                    />
                  </div>
                  <button
                    type="submit"
                    className="bg-[#2d5a61] text-white px-4 py-2 rounded-xl text-xs font-semibold hover:bg-[#1e3c41] transition-colors cursor-pointer"
                  >
                    Apply
                  </button>
                </form>

                {appliedCoupon && (
                  <p className="text-xs text-emerald-700 font-semibold mt-2 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    Code {appliedCoupon} applied (10% discount)!
                  </p>
                )}

                {couponError && (
                  <p className="text-xs text-red-600 font-medium mt-2">{couponError}</p>
                )}
              </div>

              {/* Calculation Rows */}
              <div className="space-y-3.5 text-xs text-[#555555] mb-6 pb-6 border-b border-[#e0d8c8]">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-[#333333]">Rs. {subtotal.toLocaleString()}</span>
                </div>

                {discount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-semibold">
                    <span>Discount (SPARKLE10)</span>
                    <span>-Rs. {discount.toLocaleString()}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span>Estimated Courier Shipping</span>
                  <span>{shipping === 0 ? <strong className="text-emerald-700">FREE</strong> : `Rs. ${shipping}`}</span>
                </div>

                <div className="flex justify-between">
                  <span>Artisan Gift Packaging</span>
                  <span className="text-emerald-700 font-medium">Included Complimentary</span>
                </div>
              </div>

              {/* Total */}
              <div className="flex justify-between items-baseline mb-8">
                <span className="font-serif text-lg text-[#333333]">Total</span>
                <div className="text-right">
                  <span className="text-2xl font-bold text-[#333333]">Rs. {total.toLocaleString()}</span>
                  <p className="text-[10px] text-[#888888]">Taxes included</p>
                </div>
              </div>

              {/* Checkout Button */}
              <button
                onClick={() => navigate('/checkout')}
                className="w-full bg-[#2d5a61] text-white py-4 rounded-2xl font-medium text-sm flex items-center justify-center gap-2 hover:bg-[#1e3c41] transition-all duration-300 shadow-sm hover:shadow-md cursor-pointer mb-4"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="flex items-center justify-center gap-2 text-[11px] text-[#777777]">
                <ShieldCheck className="w-4 h-4 text-[#2d5a61]" />
                <span>Encrypted checkout & Cash on Delivery Available</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
