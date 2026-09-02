import React, { useEffect, useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import {
  CheckCircle2,
  Package,
  Truck,
  Calendar,
  ArrowRight,
  Sparkles,
  MapPin,
  Phone,
  Mail,
  Copy,
  Check,
  MessageSquare
} from 'lucide-react';
import { Order } from '../types';
import { orderService } from '../services/orderService';

export const OrderConfirmationPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId') || 'MS-8291';
  const navigate = useNavigate();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function loadOrder() {
      setLoading(true);
      const found = await orderService.getOrder(orderId);
      setOrder(found);
      setLoading(false);
      window.scrollTo(0, 0);
    }
    loadOrder();
  }, [orderId]);

  const copyOrderNumber = () => {
    if (!order) return;
    navigator.clipboard.writeText(order.orderNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center bg-[#efe8dc] px-4">
        <Sparkles className="w-8 h-8 text-[#2d5a61] animate-spin mb-4" />
        <p className="font-serif text-lg text-[#333333]">Retrieving order receipt...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-[70vh] max-w-xl mx-auto px-6 py-20 text-center bg-[#efe8dc]">
        <h2 className="font-serif text-3xl text-[#333333] mb-4">Order Not Found</h2>
        <p className="text-[#666666] mb-6">
          We couldn't locate the receipt for order ID <strong>{orderId}</strong>.
        </p>
        <Link
          to="/shop"
          className="bg-[#2d5a61] text-white px-8 py-3.5 rounded-full text-sm font-medium hover:bg-[#1e3c41]"
        >
          Return to Shop
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#efe8dc] py-12 md:py-20">
      <div className="max-w-4xl mx-auto px-6 md:px-10">
        {/* Celebration Banner */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-100 text-emerald-800 mb-6 shadow-sm border border-emerald-200">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <span className="text-xs uppercase tracking-widest font-semibold text-[#2d5a61] block mb-2">
            Handcrafted with Love in Karachi
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl text-[#333333] mb-4">
            Thank You, {order.customer.fullName.split(' ')[0]}!
          </h1>
          <p className="text-[#555555] max-w-lg mx-auto text-sm md:text-base leading-relaxed">
            Your order has been confirmed and queued on the artisan's workbench. A confirmation SMS & email have been dispatched.
          </p>
        </div>

        {/* Order Identifier Card */}
        <div className="bg-[#fdfaf5] rounded-3xl p-6 md:p-8 border border-[#e0d8c8] shadow-sm mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-[#e0d8c8]">
            <div>
              <span className="text-xs text-[#666666] block mb-1">Your Unique Order Tracking Number:</span>
              <div className="flex items-center gap-3">
                <span className="font-serif text-2xl md:text-3xl font-bold text-[#2d5a61]">
                  {order.orderNumber}
                </span>
                <button
                  onClick={copyOrderNumber}
                  className="p-1.5 rounded-lg text-[#666666] hover:text-[#2d5a61] hover:bg-[#efe8dc] transition-colors cursor-pointer"
                  title="Copy Order ID"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex flex-wrap gap-2.5">
              <Link
                to={`/track?order=${order.orderNumber}`}
                className="bg-[#2d5a61] text-white px-5 py-2.5 rounded-xl text-xs font-semibold hover:bg-[#1e3c41] transition-colors flex items-center gap-1.5 shadow-xs"
              >
                <Truck className="w-3.5 h-3.5" />
                <span>Track Live Progress</span>
              </Link>
            </div>
          </div>

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6">
            <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-[#efe8dc]/50 border border-[#e0d8c8]">
              <Calendar className="w-5 h-5 text-[#2d5a61] shrink-0" />
              <div>
                <span className="text-[11px] text-[#666666] block">Estimated Delivery</span>
                <strong className="text-xs text-[#333333]">{order.estimatedDelivery}</strong>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-[#efe8dc]/50 border border-[#e0d8c8]">
              <Package className="w-5 h-5 text-[#2d5a61] shrink-0" />
              <div>
                <span className="text-[11px] text-[#666666] block">Payment Method</span>
                <strong className="text-xs text-[#333333]">{order.paymentMethod.title}</strong>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-[#efe8dc]/50 border border-[#e0d8c8]">
              <Truck className="w-5 h-5 text-[#2d5a61] shrink-0" />
              <div>
                <span className="text-[11px] text-[#666666] block">Courier Service</span>
                <strong className="text-xs text-[#333333]">{order.courierName || 'TCS Express'}</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Item Breakdown & Address Details */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-10">
          {/* Purchased Items List (7 cols) */}
          <div className="md:col-span-7 bg-[#fdfaf5] rounded-3xl p-6 md:p-8 border border-[#e0d8c8] shadow-xs">
            <h3 className="font-serif text-lg text-[#333333] mb-4 pb-3 border-b border-[#e0d8c8]">
              Ordered Items ({order.items.length})
            </h3>

            <div className="space-y-4 mb-6">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-[#efe8dc] shrink-0 border border-[#e0d8c8]">
                    <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-serif text-sm text-[#333333] font-medium truncate">
                      {item.product.name}
                    </h4>
                    <p className="text-xs text-[#666666]">
                      Qty: {item.quantity} {item.selectedSize ? `· Size: ${item.selectedSize}` : ''}
                    </p>
                  </div>
                  <span className="text-xs font-bold text-[#333333] shrink-0">
                    Rs. {(item.product.price * item.quantity).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>

            {/* Financial Totals */}
            <div className="space-y-2.5 text-xs text-[#555555] pt-4 border-t border-[#e0d8c8]">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span className="font-semibold text-[#333333]">Rs. {order.subtotal.toLocaleString()}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>Discount ({order.couponCode || 'Promo'}):</span>
                  <span>-Rs. {order.discount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Shipping Cost:</span>
                <span>{order.shippingCost === 0 ? <strong className="text-emerald-700">FREE</strong> : `Rs. ${order.shippingCost}`}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-[#333333] pt-2 border-t border-[#e0d8c8]">
                <span>Total Amount:</span>
                <span>Rs. {order.total.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Shipping & Contact Summary (5 cols) */}
          <div className="md:col-span-5 space-y-6">
            <div className="bg-[#fdfaf5] rounded-3xl p-6 border border-[#e0d8c8] shadow-xs space-y-4">
              <h3 className="font-serif text-base text-[#333333] pb-2 border-b border-[#e0d8c8]">
                Delivery Destination
              </h3>

              <div className="space-y-2 text-xs text-[#555555]">
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-[#2d5a61] shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-[#333333] block">{order.customer.fullName}</strong>
                    <p>{order.shippingAddress.address}</p>
                    <p>{order.shippingAddress.city}, {order.shippingAddress.postalCode}</p>
                    <p>{order.shippingAddress.country}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-[#e0d8c8]">
                  <Phone className="w-4 h-4 text-[#2d5a61] shrink-0" />
                  <span>{order.customer.phone}</span>
                </div>

                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-[#2d5a61] shrink-0" />
                  <span>{order.customer.email}</span>
                </div>
              </div>
            </div>

            <div className="bg-[#2d5a61]/10 rounded-3xl p-6 border border-[#2d5a61]/20 space-y-3">
              <h4 className="font-serif text-sm font-semibold text-[#2d5a61] flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Need urgent modifications?
              </h4>
              <p className="text-xs text-[#444444] leading-relaxed">
                If you need to change your delivery address or add custom gift notes, please WhatsApp our studio right away at <strong>+92 300 1234567</strong> with order ID <strong>{order.orderNumber}</strong>.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link
            to={`/track?order=${order.orderNumber}`}
            className="w-full sm:w-auto bg-[#2d5a61] text-white px-8 py-3.5 rounded-full text-xs md:text-sm font-medium hover:bg-[#1e3c41] transition-all flex items-center justify-center gap-2 shadow-sm"
          >
            <span>View Step-by-Step Live Journey</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            to="/shop"
            className="w-full sm:w-auto text-[#2d5a61] border border-[#2d5a61]/40 px-8 py-3.5 rounded-full text-xs md:text-sm font-medium hover:bg-[#2d5a61]/10 transition-colors text-center"
          >
            Continue Browsing Collections
          </Link>
        </div>
      </div>
    </div>
  );
};
