import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Package, 
  Truck, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Phone, 
  Sparkles, 
  Copy, 
  Check, 
  ExternalLink, 
  MessageCircle, 
  ShieldCheck, 
  ChevronRight,
  AlertCircle
} from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { orderService } from '../services/orderService';
import { Order } from '../types';
import { SEO } from '../components/SEO';

interface TrackingOrder {
  id: string;
  customerName: string;
  phone: string;
  destinationCity: string;
  address: string;
  orderDate: string;
  estimatedDelivery: string;
  carrier: string;
  trackingNumber: string;
  paymentMethod: string;
  paymentStatus: 'Paid' | 'Pending Cash on Delivery';
  currentStep: number; // 1: Confirmed, 2: Crafting, 3: Packaged, 4: In Transit, 5: Out for Delivery, 6: Delivered
  statusText: string;
  statusDescription: string;
  items: {
    productId: string;
    productName: string;
    image: string;
    quantity: number;
    price: number;
    size: string;
    finish: string;
  }[];
  timeline: {
    title: string;
    description: string;
    timestamp: string;
    completed: boolean;
  }[];
}

function convertOrderToTrackingOrder(ord: Order): TrackingOrder {
  const stepMap: Record<string, number> = {
    placed: 1,
    confirmed: 2,
    processing: 3,
    shipped: 4,
    out_for_delivery: 5,
    delivered: 6
  };
  const statusLabels: Record<string, string> = {
    placed: 'Order Placed & Queued',
    confirmed: 'Artisan Confirmed',
    processing: 'Handcrafted & Packed',
    shipped: 'Dispatched with Courier',
    out_for_delivery: 'Out for Delivery',
    delivered: 'Delivered'
  };

  return {
    id: ord.orderNumber,
    customerName: ord.customer.fullName,
    phone: ord.customer.phone,
    destinationCity: `${ord.shippingAddress.city}, ${ord.shippingAddress.province || 'Pakistan'}`,
    address: `${ord.shippingAddress.address}, ${ord.shippingAddress.city}`,
    orderDate: new Date(ord.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    estimatedDelivery: ord.estimatedDelivery || 'Pending dispatch calculation',
    carrier: ord.courierName || 'Not assigned yet',
    trackingNumber: ord.trackingNumber || 'Not assigned yet',
    paymentMethod: ord.paymentMethod.title,
    paymentStatus: ord.paymentStatus === 'paid' ? 'Paid' : 'Pending Cash on Delivery',
    currentStep: stepMap[ord.status] || 1,
    statusText: statusLabels[ord.status] || ord.status.replace('_', ' ').toUpperCase(),
    statusDescription: ord.timeline?.find((t) => t.current)?.description || 'Your jewelry order is being processed by our atelier.',
    items: ord.items.map((it) => ({
      productId: it.product.id,
      productName: it.product.name,
      image: it.product.image,
      quantity: it.quantity,
      price: it.product.price,
      size: it.selectedSize || 'Standard',
      finish: it.selectedFinish || 'Natural'
    })),
    timeline: (ord.timeline || []).map((tl) => ({
      title: tl.title,
      description: tl.description,
      timestamp: tl.date,
      completed: tl.completed
    }))
  };
}

export const TrackOrderPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [searchInput, setSearchInput] = useState('');
  const [activeOrder, setActiveOrder] = useState<TrackingOrder | null>(null);
  const [copied, setCopied] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Initial load check from URL query parameter (e.g., /track?order=MS-8291 or /track?id=MS-8291)
  useEffect(() => {
    const orderQuery = searchParams.get('order') || searchParams.get('id') || searchParams.get('orderId');
    if (orderQuery) {
      setSearchInput(orderQuery);
      handleSearchQuery(orderQuery);
    }
  }, [searchParams]);

  const handleSearchQuery = async (query: string) => {
    const cleanQuery = query.trim().toUpperCase();
    if (!cleanQuery) return;

    setHasSearched(true);
    setErrorMessage('');
    setIsSearching(true);

    try {
      // Look up genuine order in persistent storage (guest & registered orders)
      const realOrder = await orderService.getOrder(cleanQuery);
      if (realOrder) {
        setActiveOrder(convertOrderToTrackingOrder(realOrder));
        return;
      }

      setActiveOrder(null);
      setErrorMessage(`No active order found with reference "${cleanQuery}". Please verify your order number.`);
    } catch (err) {
      console.error('Error fetching order from storage:', err);
      setActiveOrder(null);
      setErrorMessage(`Unable to look up order "${cleanQuery}". Please check your internet connection or try again.`);
    } finally {
      setIsSearching(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchInput.trim()) {
      setErrorMessage('Please enter an Order ID or Phone number.');
      return;
    }
    handleSearchQuery(searchInput);
  };

  const handleCopyTracking = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const orderTotal = activeOrder
    ? activeOrder.items.reduce((acc, item) => acc + item.price * item.quantity, 0)
    : 0;

  return (
    <div className="bg-[#efe8dc] min-h-screen py-8 md:py-14">
      <SEO
        title="Track Your Order"
        description="Track your Maryam Sparkle handmade jewelry delivery status, TCS courier updates, and estimated arrival."
        canonical="/track"
      />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Page Header */}
        <div className="text-center max-w-2xl mx-auto">
          <div className="flex items-center justify-center gap-2 text-xs font-medium uppercase tracking-[0.2em] text-[#2d5a61] mb-2">
            <Link to="/" className="hover:underline">Home</Link>
            <span>/</span>
            <span>Order Tracking</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl text-[#2d5a61] mb-3">
            Track Your Parcel
          </h1>
          <p className="text-sm sm:text-base text-[#666666] font-light leading-relaxed">
            Follow every step of your jewelry&apos;s journey from our workshop bench directly to your doorstep.
          </p>
        </div>

        {/* Search Lookup Box */}
        <div className="bg-white/85 border border-[#e0d8c8] rounded-3xl p-6 sm:p-8 shadow-sm">
          <form onSubmit={handleFormSubmit} className="max-w-2xl mx-auto space-y-3">
            <div className="relative flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="w-5 h-5 text-[#888888] absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  id="tracking-search-input"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Enter Order ID (e.g. MS-8291) or customer phone number"
                  className="w-full bg-[#efe8dc]/50 border border-[#e0d8c8] rounded-full pl-11 pr-4 py-3.5 text-sm text-[#333333] placeholder-[#888888] focus:outline-none focus:ring-2 focus:ring-[#2d5a61] focus:bg-white transition-all shadow-inner"
                />
                {searchInput && (
                  <button
                    type="button"
                    onClick={() => setSearchInput('')}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-[#888888] hover:text-[#333333]"
                  >
                    Clear
                  </button>
                )}
              </div>

              <button
                type="submit"
                id="track-order-submit-btn"
                disabled={isSearching}
                className="bg-[#2d5a61] hover:bg-[#1e3c41] text-white px-8 py-3.5 rounded-full text-sm font-semibold transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer shrink-0 disabled:opacity-75"
              >
                {isSearching ? (
                  <>
                    <Sparkles className="w-4 h-4 animate-spin" />
                    <span>Searching...</span>
                  </>
                ) : (
                  <>
                    <Package className="w-4 h-4" />
                    <span>Track Parcel</span>
                  </>
                )}
              </button>
            </div>

            {errorMessage && (
              <div className="flex items-center gap-1.5 text-xs text-rose-600 pl-4">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Helpful reference note */}
            <div className="pt-3 border-t border-[#e0d8c8]/60 flex flex-wrap items-center justify-between gap-2 text-xs text-[#777777]">
              <span>Enter your 6-digit Order ID (e.g., MS-8291) or your order contact number.</span>
              <span className="text-[#2d5a61] font-medium">Official Maryam Sparkle Dispatch</span>
            </div>
          </form>
        </div>

        {/* Tracking Details View */}
        {activeOrder && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {/* Top Status Banner */}
            <div className="bg-white/90 border border-[#e0d8c8] rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#e0d8c8] pb-6">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs uppercase tracking-wider font-semibold text-[#888888]">
                      Order Reference
                    </span>
                    <span className="bg-[#2d5a61]/10 text-[#2d5a61] text-xs font-mono font-bold px-2 py-0.5 rounded-md">
                      {activeOrder.id}
                    </span>
                  </div>
                  <h2 className="font-serif text-2xl sm:text-3xl text-[#2d5a61] flex items-center gap-2">
                    <span>{activeOrder.statusText}</span>
                    <Sparkles className="w-5 h-5 text-[#D4B982]" />
                  </h2>
                  <p className="text-xs sm:text-sm text-[#555555] mt-1">
                    {activeOrder.statusDescription}
                  </p>
                </div>

                <div className="bg-[#efe8dc]/70 p-4 rounded-2xl border border-[#e0d8c8] text-right md:min-w-56">
                  <span className="text-xs text-[#777777] block">Estimated Delivery</span>
                  <div className="font-serif text-lg font-bold text-emerald-800">
                    {activeOrder.estimatedDelivery}
                  </div>
                  <span className="text-[11px] text-[#666666] block mt-0.5">
                    Carrier: <strong>{activeOrder.carrier}</strong>
                  </span>
                </div>
              </div>

              {/* Progress Steps Visualizer */}
              <div className="py-2">
                {/* Step Labels */}
                <div className="grid grid-cols-6 gap-1 sm:gap-2 text-center mb-4">
                  {[
                    { label: 'Confirmed', icon: CheckCircle2, step: 1 },
                    { label: 'Crafting', icon: Sparkles, step: 2 },
                    { label: 'Packaging', icon: Package, step: 3 },
                    { label: 'In Transit', icon: Truck, step: 4 },
                    { label: 'Out for Delivery', icon: MapPin, step: 5 },
                    { label: 'Delivered', icon: Check, step: 6 },
                  ].map((item) => {
                    const isCompleted = activeOrder.currentStep >= item.step;
                    const isCurrent = activeOrder.currentStep === item.step;
                    const Icon = item.icon;

                    return (
                      <div key={item.step} className="flex flex-col items-center space-y-1.5">
                        <div
                          className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all ${
                            isCurrent
                              ? 'bg-[#2d5a61] text-white ring-4 ring-[#2d5a61]/25 scale-110 shadow-md'
                              : isCompleted
                              ? 'bg-[#2d5a61] text-white'
                              : 'bg-white text-gray-400 border border-gray-300'
                          }`}
                        >
                          <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                        </div>
                        <span
                          className={`text-[10px] sm:text-xs leading-tight font-medium ${
                            isCurrent
                              ? 'text-[#2d5a61] font-bold'
                              : isCompleted
                              ? 'text-[#333333]'
                              : 'text-gray-400'
                          }`}
                        >
                          {item.label}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Progress Bar Line */}
                <div className="w-full bg-[#e0d8c8] h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-[#2d5a61] h-full transition-all duration-500 rounded-full"
                    style={{
                      width: `${((activeOrder.currentStep - 1) / 5) * 100}%`,
                    }}
                  />
                </div>
              </div>

              {/* Waybill & Courier Details Ribbon */}
              <div className="bg-[#efe8dc]/50 rounded-2xl p-4 border border-[#e0d8c8] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-[#2d5a61]" />
                  <span>
                    Tracking AWB Number: <strong className="font-mono text-[#2d5a61]">{activeOrder.trackingNumber}</strong>
                  </span>
                  <button
                    onClick={() => handleCopyTracking(activeOrder.trackingNumber)}
                    className="p-1 rounded hover:bg-white/80 text-[#2d5a61] transition-colors cursor-pointer"
                    title="Copy tracking code"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  <a
                    href="https://wa.me/923001234567?text=Hi%20Maryam!%20Could%20you%20help%20me%20with%20my%20order%20status%20for%20"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#2d5a61] hover:underline font-semibold flex items-center gap-1"
                  >
                    <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                    <span>WhatsApp Courier Support</span>
                  </a>
                </div>
              </div>
            </div>

            {/* 2-Column Details: Left is Items in Parcel, Right is Realtime Log & Shipping info */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left: Items in this order */}
              <div className="lg:col-span-6 bg-white/85 border border-[#e0d8c8] rounded-3xl p-6 sm:p-8 space-y-5">
                <h3 className="font-serif text-xl text-[#2d5a61] pb-3 border-b border-[#e0d8c8] flex items-center justify-between">
                  <span>Items in This Package</span>
                  <span className="text-xs font-sans font-normal text-[#888888]">
                    {activeOrder.items.length} {activeOrder.items.length === 1 ? 'item' : 'items'}
                  </span>
                </h3>

                <div className="space-y-4">
                  {activeOrder.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-4 bg-[#efe8dc]/40 p-3.5 rounded-2xl border border-[#e0d8c8]/60"
                    >
                      <img
                        src={item.image}
                        alt={item.productName}
                        className="w-16 h-16 object-cover rounded-xl border border-[#e0d8c8] shrink-0"
                        referrerPolicy="no-referrer"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-serif text-sm font-semibold text-[#333333] truncate">
                          {item.productName}
                        </h4>
                        <div className="text-[11px] text-[#666666] space-x-2 mt-0.5">
                          <span>Qty: {item.quantity}</span>
                          <span>•</span>
                          <span>{item.finish}</span>
                          <span>•</span>
                          <span>{item.size}</span>
                        </div>
                        <div className="font-serif text-xs font-semibold text-[#2d5a61] mt-1">
                          Rs. {(item.price * item.quantity).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pricing Summary */}
                <div className="pt-4 border-t border-[#e0d8c8] text-xs space-y-2 text-[#666666]">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>Rs. {orderTotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-emerald-800 font-medium">
                    <span>Delivery Fee:</span>
                    <span>FREE (Domestic Promo)</span>
                  </div>
                  <div className="flex justify-between font-serif text-sm font-bold text-[#2d5a61] pt-2 border-t border-[#e0d8c8]">
                    <span>Total Amount:</span>
                    <span>Rs. {orderTotal.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-[#888888] pt-1">
                    <span>Payment Method:</span>
                    <span className="font-medium text-[#444444]">{activeOrder.paymentMethod}</span>
                  </div>
                </div>
              </div>

              {/* Right: Detailed Activity Timeline & Delivery Address */}
              <div className="lg:col-span-6 space-y-6">
                {/* Delivery Address Card */}
                <div className="bg-white/85 border border-[#e0d8c8] rounded-3xl p-6 sm:p-8 space-y-3">
                  <h3 className="font-serif text-xl text-[#2d5a61] pb-2 border-b border-[#e0d8c8] flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-[#2d5a61]" />
                    <span>Destination & Recipient</span>
                  </h3>
                  <div className="text-xs sm:text-sm text-[#444444] space-y-1">
                    <p className="font-semibold text-[#2d5a61]">{activeOrder.customerName}</p>
                    <p className="text-[#666666]">{activeOrder.address}</p>
                    <p className="text-[#888888] font-mono text-xs">Contact: {activeOrder.phone}</p>
                  </div>
                </div>

                {/* Detailed Timeline Log */}
                <div className="bg-white/85 border border-[#e0d8c8] rounded-3xl p-6 sm:p-8 space-y-5">
                  <h3 className="font-serif text-xl text-[#2d5a61] pb-2 border-b border-[#e0d8c8] flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[#2d5a61]" />
                    <span>Real-time Tracking Updates</span>
                  </h3>

                  <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#e0d8c8]">
                    {activeOrder.timeline.map((event, idx) => (
                      <div key={idx} className="relative group">
                        <div
                          className={`absolute -left-6 top-1 w-4 h-4 rounded-full border-2 border-white transition-colors ${
                            event.completed
                              ? 'bg-[#2d5a61]'
                              : 'bg-gray-300'
                          }`}
                        />
                        <div>
                          <div className="flex items-center justify-between text-xs">
                            <span className={`font-semibold ${event.completed ? 'text-[#2d5a61]' : 'text-gray-500'}`}>
                              {event.title}
                            </span>
                            <span className="text-[10px] text-[#888888] font-mono">{event.timestamp}</span>
                          </div>
                          <p className="text-xs text-[#666666] mt-0.5 leading-relaxed">
                            {event.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Initial Prompt State */}
        {!activeOrder && !hasSearched && (
          <div className="bg-white/80 border border-[#e0d8c8] rounded-3xl p-10 text-center max-w-xl mx-auto space-y-4 shadow-xs">
            <div className="w-14 h-14 rounded-full bg-[#2d5a61]/10 text-[#2d5a61] flex items-center justify-center mx-auto">
              <Package className="w-7 h-7" />
            </div>
            <h3 className="font-serif text-xl text-[#2d5a61] font-medium">Track Your Atelier Dispatch</h3>
            <p className="text-xs sm:text-sm text-[#666666] leading-relaxed">
              Enter your Order ID (from your confirmation email or checkout summary) above to view real-time artisan crafting, inspection, and delivery progress.
            </p>
          </div>
        )}

        {/* Not Found State */}
        {!activeOrder && hasSearched && errorMessage && (
          <div className="bg-white/80 border border-[#e0d8c8] rounded-3xl p-10 text-center max-w-xl mx-auto space-y-4 shadow-xs">
            <div className="w-14 h-14 rounded-full bg-amber-50 text-amber-700 flex items-center justify-center mx-auto">
              <Search className="w-7 h-7" />
            </div>
            <h3 className="font-serif text-xl text-[#333333] font-medium">Order Not Found</h3>
            <p className="text-xs sm:text-sm text-[#666666] leading-relaxed">
              {errorMessage}
            </p>
            <div className="pt-2">
              <Link
                to="/shop"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#2d5a61] text-white text-xs rounded-full hover:bg-[#23474d] transition-colors"
              >
                Browse Jewelry Collection
              </Link>
            </div>
          </div>
        )}

        {/* Reassurance & Care Promise */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6">
          <div className="bg-white/70 border border-[#e0d8c8] p-5 rounded-2xl text-center space-y-2">
            <ShieldCheck className="w-6 h-6 text-[#2d5a61] mx-auto" />
            <h4 className="font-serif text-sm font-semibold text-[#2d5a61]">Tamper-Proof Packaging</h4>
            <p className="text-xs text-[#666666]">Every order is sealed in an authentic velvet jewelry box.</p>
          </div>

          <div className="bg-white/70 border border-[#e0d8c8] p-5 rounded-2xl text-center space-y-2">
            <Truck className="w-6 h-6 text-[#2d5a61] mx-auto" />
            <h4 className="font-serif text-sm font-semibold text-[#2d5a61]">Reliable Express Couriers</h4>
            <p className="text-xs text-[#666666]">Handled by TCS and Leopard Express with live SMS updates.</p>
          </div>

          <div className="bg-white/70 border border-[#e0d8c8] p-5 rounded-2xl text-center space-y-2">
            <MessageCircle className="w-6 h-6 text-[#2d5a61] mx-auto" />
            <h4 className="font-serif text-sm font-semibold text-[#2d5a61]">Need Help with Order?</h4>
            <p className="text-xs text-[#666666]">Reach our studio concierge for immediate order updates.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
