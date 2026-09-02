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
import { PRODUCTS } from '../data/products';

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

const SAMPLE_ORDERS: TrackingOrder[] = [
  {
    id: 'MS-8291',
    customerName: 'Ayesha Khan',
    phone: '03001234567',
    destinationCity: 'Lahore, Punjab',
    address: 'House #42, Street 8, DHA Phase 5, Lahore',
    orderDate: 'Aug 30, 2026',
    estimatedDelivery: 'Today by 5:00 PM',
    carrier: 'TCS Express Logistics',
    trackingNumber: 'TCS-9928172635',
    paymentMethod: 'Cash on Delivery (COD)',
    paymentStatus: 'Pending Cash on Delivery',
    currentStep: 5,
    statusText: 'Out for Delivery',
    statusDescription: 'Your parcel is with courier rider Usman (0321-9876543) for final delivery.',
    items: [
      {
        productId: PRODUCTS[0].id,
        productName: PRODUCTS[0].name,
        image: PRODUCTS[0].image,
        quantity: 1,
        price: PRODUCTS[0].price,
        size: 'Medium (6.5")',
        finish: '18k Gold Finish'
      },
      {
        productId: PRODUCTS[1].id,
        productName: PRODUCTS[1].name,
        image: PRODUCTS[1].image,
        quantity: 1,
        price: PRODUCTS[1].price,
        size: 'Medium (6.5")',
        finish: '18k Gold Finish'
      }
    ],
    timeline: [
      {
        title: 'Order Confirmed',
        description: 'Order placed & custom gemstone materials assigned in atelier.',
        timestamp: 'Aug 30, 11:20 AM',
        completed: true
      },
      {
        title: 'Handcrafted by Maryam',
        description: 'Baroque pearls & Ruby Quartz hand-threaded and knotted.',
        timestamp: 'Aug 31, 03:45 PM',
        completed: true
      },
      {
        title: 'Velvet Pouch Packaging & QA',
        description: 'Cleaned, jeweler-polished, and sealed with personalized note.',
        timestamp: 'Sep 01, 10:15 AM',
        completed: true
      },
      {
        title: 'Handed to TCS Express',
        description: 'Dispatched from Lahore Atelier Hub. In Transit.',
        timestamp: 'Sep 01, 04:30 PM',
        completed: true
      },
      {
        title: 'Out for Delivery',
        description: 'Rider is currently on the delivery route.',
        timestamp: 'Sep 02, 09:10 AM',
        completed: true
      },
      {
        title: 'Delivered',
        description: 'Package handed to recipient with signature.',
        timestamp: 'Expected today by 5:00 PM',
        completed: false
      }
    ]
  },
  {
    id: 'MS-9402',
    customerName: 'Zainab Fatima',
    phone: '03214567890',
    destinationCity: 'Karachi, Sindh',
    address: 'Apartment 4B, Clifton Block 2, Karachi',
    orderDate: 'Sep 01, 2026',
    estimatedDelivery: 'Sep 03, 2026',
    carrier: 'Leopard Courier Express',
    trackingNumber: 'LEO-771829341',
    paymentMethod: 'Bank Transfer (Meezan Bank)',
    paymentStatus: 'Paid',
    currentStep: 4,
    statusText: 'In Transit to Destination Hub',
    statusDescription: 'Parcel has departed Lahore sorting facility en route to Karachi Regional Center.',
    items: [
      {
        productId: PRODUCTS[2].id,
        productName: PRODUCTS[2].name,
        image: PRODUCTS[2].image,
        quantity: 1,
        price: PRODUCTS[2].price,
        size: 'Medium (6.5")',
        finish: 'Sterling Silver Finish'
      }
    ],
    timeline: [
      {
        title: 'Order Confirmed',
        description: 'Payment verified and verified in studio queue.',
        timestamp: 'Sep 01, 09:15 AM',
        completed: true
      },
      {
        title: 'Handcrafted & Assembled',
        description: 'Freshwater pearls strung with silver lock finish.',
        timestamp: 'Sep 01, 02:00 PM',
        completed: true
      },
      {
        title: 'Packaged in Signature Gift Box',
        description: 'Safely packed in tamper-evident velvet box.',
        timestamp: 'Sep 01, 05:40 PM',
        completed: true
      },
      {
        title: 'Dispatched via Leopard Air Express',
        description: 'Flight transit to Karachi Airport Cargo.',
        timestamp: 'Sep 02, 01:20 AM',
        completed: true
      },
      {
        title: 'Out for Delivery',
        description: 'Scheduled for tomorrow morning.',
        timestamp: 'Sep 03, 10:00 AM',
        completed: false
      },
      {
        title: 'Delivered',
        description: 'Pending final dispatch.',
        timestamp: 'Sep 03, 04:00 PM',
        completed: false
      }
    ]
  },
  {
    id: 'MS-3819',
    customerName: 'Hira Tariq',
    phone: '03337890123',
    destinationCity: 'Islamabad, ICT',
    address: 'Street 14, Sector F-7/2, Islamabad',
    orderDate: 'Sep 02, 2026',
    estimatedDelivery: 'Sep 04, 2026',
    carrier: 'TCS Express Logistics',
    trackingNumber: 'TCS-1049281734',
    paymentMethod: 'Cash on Delivery (COD)',
    paymentStatus: 'Pending Cash on Delivery',
    currentStep: 2,
    statusText: 'Handcrafting in Atelier',
    statusDescription: 'Maryam is currently hand-threading and sizing your bespoke Aventurine bracelets.',
    items: [
      {
        productId: PRODUCTS[3].id,
        productName: PRODUCTS[3].name,
        image: PRODUCTS[3].image,
        quantity: 2,
        price: PRODUCTS[3].price,
        size: 'Small (6.0")',
        finish: '18k Gold Finish'
      }
    ],
    timeline: [
      {
        title: 'Order Confirmed',
        description: 'Custom sizing notes confirmed by team.',
        timestamp: 'Sep 02, 08:30 AM',
        completed: true
      },
      {
        title: 'Handcrafting on Design Board',
        description: 'Currently on the jeweler bench.',
        timestamp: 'Sep 02, 11:00 AM',
        completed: true
      },
      {
        title: 'Packaging & QA Check',
        description: 'Scheduled for this afternoon.',
        timestamp: 'Sep 02, 04:00 PM',
        completed: false
      },
      {
        title: 'Handover to Courier',
        description: 'Scheduled for evening pickup.',
        timestamp: 'Sep 02, 06:30 PM',
        completed: false
      },
      {
        title: 'In Transit',
        description: 'Overnight ground freight to Islamabad.',
        timestamp: 'Sep 03',
        completed: false
      },
      {
        title: 'Delivered',
        description: 'Estimated delivery on Wednesday.',
        timestamp: 'Sep 04',
        completed: false
      }
    ]
  }
];

export const TrackOrderPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [searchInput, setSearchInput] = useState('');
  const [activeOrder, setActiveOrder] = useState<TrackingOrder | null>(SAMPLE_ORDERS[0]);
  const [copied, setCopied] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Initial load check from URL query parameter (e.g., /track?id=MS-8291)
  useEffect(() => {
    const idFromUrl = searchParams.get('id');
    if (idFromUrl) {
      setSearchInput(idFromUrl);
      handleSearchQuery(idFromUrl);
    }
  }, [searchParams]);

  const handleSearchQuery = (query: string) => {
    const cleanQuery = query.trim().toUpperCase();
    if (!cleanQuery) return;

    setHasSearched(true);
    setErrorMessage('');

    // Check predefined sample orders
    const matched = SAMPLE_ORDERS.find(
      (o) =>
        o.id.toUpperCase() === cleanQuery ||
        o.phone.includes(cleanQuery) ||
        o.trackingNumber.toUpperCase().includes(cleanQuery)
    );

    if (matched) {
      setActiveOrder(matched);
    } else {
      // Create a simulated live order for any entered order ID (e.g. MS-1234 or phone number)
      const dynamicOrder: TrackingOrder = {
        id: cleanQuery.startsWith('MS-') ? cleanQuery : `MS-${cleanQuery.slice(-4) || '5501'}`,
        customerName: 'Valued Sparkle Patron',
        phone: cleanQuery.startsWith('03') ? cleanQuery : '0300-1234567',
        destinationCity: 'Pakistan',
        address: 'Standard Domestic Delivery Address',
        orderDate: 'Recent Order',
        estimatedDelivery: 'Estimated in 2-3 business days',
        carrier: 'TCS Express Logistics',
        trackingNumber: `TCS-${Math.floor(1000000000 + Math.random() * 9000000000)}`,
        paymentMethod: 'Cash on Delivery (COD)',
        paymentStatus: 'Pending Cash on Delivery',
        currentStep: 3,
        statusText: 'Packaging & Quality Inspection',
        statusDescription: 'Your jewelry has been handcrafted and is undergoing ultrasonic polishing & gift wrapping.',
        items: [
          {
            productId: PRODUCTS[0].id,
            productName: PRODUCTS[0].name,
            image: PRODUCTS[0].image,
            quantity: 1,
            price: PRODUCTS[0].price,
            size: 'Medium (6.5")',
            finish: '18k Gold Finish'
          }
        ],
        timeline: [
          {
            title: 'Order Confirmed',
            description: 'Order registered in our atelier system.',
            timestamp: 'Yesterday',
            completed: true
          },
          {
            title: 'Handcrafted at Atelier',
            description: 'Assembled by hand with natural stones.',
            timestamp: 'Today, Morning',
            completed: true
          },
          {
            title: 'Velvet Packaging & QA',
            description: 'Polished and packaged in luxury pouch.',
            timestamp: 'In Progress',
            completed: true
          },
          {
            title: 'Courier Dispatch',
            description: 'Handover to courier rider.',
            timestamp: 'Upcoming',
            completed: false
          },
          {
            title: 'Out for Delivery',
            description: 'Delivery to your doorstep.',
            timestamp: 'Upcoming',
            completed: false
          },
          {
            title: 'Delivered',
            description: 'Delivered & signed.',
            timestamp: 'Expected Soon',
            completed: false
          }
        ]
      };
      setActiveOrder(dynamicOrder);
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
                  placeholder="Enter Order ID (e.g. MS-8291) or Phone (03001234567)"
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
                className="bg-[#2d5a61] hover:bg-[#1e3c41] text-white px-8 py-3.5 rounded-full text-sm font-semibold transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer shrink-0"
              >
                <Package className="w-4 h-4" />
                <span>Track Parcel</span>
              </button>
            </div>

            {errorMessage && (
              <div className="flex items-center gap-1.5 text-xs text-rose-600 pl-4">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Clickable Quick Sample Test Buttons */}
            <div className="pt-3 border-t border-[#e0d8c8]/60 flex flex-wrap items-center gap-2 text-xs text-[#666666]">
              <span className="font-medium text-[#444444]">Try Demo Orders:</span>
              {SAMPLE_ORDERS.map((sample) => (
                <button
                  key={sample.id}
                  type="button"
                  onClick={() => {
                    setSearchInput(sample.id);
                    setActiveOrder(sample);
                    setHasSearched(true);
                  }}
                  className={`px-3 py-1 rounded-full text-xs font-mono font-medium border transition-all cursor-pointer ${
                    activeOrder?.id === sample.id
                      ? 'bg-[#2d5a61] text-white border-[#2d5a61]'
                      : 'bg-white/80 text-[#2d5a61] border-[#e0d8c8] hover:bg-[#efe8dc]'
                  }`}
                >
                  {sample.id} ({sample.statusText.split(' ')[0]})
                </button>
              ))}
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
            <p className="text-xs text-[#666666]">WhatsApp Maryam anytime at +92 300 1234567.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
