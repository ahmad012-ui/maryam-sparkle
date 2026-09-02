import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  User,
  Package,
  MapPin,
  Heart,
  LogOut,
  Calendar,
  Truck,
  ChevronRight,
  ExternalLink,
  Sparkles,
  Plus,
  Trash2,
  CheckCircle2,
  Clock,
  ShieldCheck
} from 'lucide-react';
import { UserProfile, Order } from '../types';
import { authService } from '../services/authService';
import { orderService } from '../services/orderService';
import {
  sanitizePhoneNumber,
  isValidPhoneNumber,
  sanitizePostalCode,
  isValidPostalCode
} from '../utils/validation';

export const AccountPage: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeTab, setActiveTab] = useState<'orders' | 'addresses' | 'profile'>('orders');
  const [selectedOrderDetails, setSelectedOrderDetails] = useState<Order | null>(null);

  // Address modal state
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [addressErrors, setAddressErrors] = useState<Record<string, string>>({});
  const [newAddress, setNewAddress] = useState({
    label: 'Home',
    fullName: '',
    phone: '',
    address: '',
    city: 'Karachi',
    postalCode: '75500',
    isDefault: false
  });

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);

    async function loadUserOrders() {
      const allOrders = await orderService.getAllOrders();
      setOrders(allOrders);
    }
    loadUserOrders();
  }, []);

  const handleAddAddress = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};

    if (!newAddress.fullName.trim()) {
      errors.fullName = 'Full name is required';
    }
    if (!newAddress.phone.trim() || !isValidPhoneNumber(newAddress.phone)) {
      errors.phone = 'Valid phone number required (e.g. 0300 1234567)';
    }
    if (!newAddress.address.trim()) {
      errors.address = 'Street address is required';
    }
    if (newAddress.postalCode && !isValidPostalCode(newAddress.postalCode)) {
      errors.postalCode = 'Postal code must be 4 to 6 digits';
    }

    if (Object.keys(errors).length > 0) {
      setAddressErrors(errors);
      return;
    }

    const added = authService.addAddress(newAddress);
    setUser(authService.getCurrentUser());
    setShowAddressModal(false);
    setAddressErrors({});
    setNewAddress({
      label: 'Home',
      fullName: '',
      phone: '',
      address: '',
      city: 'Karachi',
      postalCode: '75500',
      isDefault: false
    });
  };

  const handleDeleteAddress = (id: string) => {
    authService.deleteAddress(id);
    setUser(authService.getCurrentUser());
  };

  if (!user) {
    return (
      <div className="min-h-[70vh] bg-[#efe8dc] flex flex-col items-center justify-center px-6 py-20 text-center">
        <h2 className="font-serif text-3xl text-[#333333] mb-4">Please Sign In</h2>
        <p className="text-[#666666] mb-6">Log in to view your orders and saved shipping addresses.</p>
        <Link
          to="/login"
          className="bg-[#2d5a61] text-white px-8 py-3 rounded-full text-xs font-semibold hover:bg-[#1e3c41]"
        >
          Go to Login
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#efe8dc] py-10 md:py-16">
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        {/* Profile Welcome Header */}
        <div className="bg-[#fdfaf5] rounded-3xl p-6 md:p-8 border border-[#e0d8c8] shadow-xs mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-[#efe8dc] text-[#2d5a61] flex items-center justify-center font-serif text-2xl font-bold border border-[#e0d8c8]">
              {user.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-serif text-2xl sm:text-3xl text-[#333333]">{user.name}</h1>
                <span className="text-[10px] font-bold bg-[#2d5a61]/10 text-[#2d5a61] px-2.5 py-0.5 rounded-full">
                  Artisan VIP Member
                </span>
              </div>
              <p className="text-xs text-[#666666] mt-0.5">
                {user.email} · Member since {user.joinedDate}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2.5">
            <Link
              to="/track"
              className="bg-[#2d5a61] text-white px-5 py-2.5 rounded-xl text-xs font-semibold hover:bg-[#1e3c41] transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <Truck className="w-3.5 h-3.5" />
              <span>Track Any Order</span>
            </Link>
            <Link
              to="/custom-orders"
              className="bg-[#A96745] text-white px-5 py-2.5 rounded-xl text-xs font-semibold hover:bg-[#8e5233] transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>New Custom Request</span>
            </Link>
          </div>
        </div>

        {/* Account Nav Tabs */}
        <div className="flex gap-2 border-b border-[#e0d8c8] pb-4 mb-8">
          {[
            { id: 'orders', label: `My Orders (${orders.length})`, icon: Package },
            { id: 'addresses', label: `Saved Addresses (${user.addresses.length})`, icon: MapPin },
            { id: 'profile', label: 'Profile Details', icon: User }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-2 px-4 rounded-xl text-xs sm:text-sm font-medium transition-all flex items-center gap-2 cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-[#2d5a61] text-white shadow-xs'
                    : 'text-[#666666] hover:bg-[#fdfaf5] hover:text-[#333333]'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab 1: Orders List */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            {orders.length === 0 ? (
              <div className="bg-[#fdfaf5] rounded-3xl p-10 text-center border border-[#e0d8c8]">
                <Package className="w-10 h-10 text-[#888888] mx-auto mb-3" />
                <h3 className="font-serif text-lg text-[#333333] mb-1">No Orders Yet</h3>
                <p className="text-xs text-[#666666] mb-4">When you place an order, its live progress will appear here.</p>
                <Link to="/shop" className="bg-[#2d5a61] text-white px-6 py-2 rounded-full text-xs font-medium">
                  Start Shopping
                </Link>
              </div>
            ) : (
              orders.map((ord) => (
                <div
                  key={ord.id}
                  className="bg-[#fdfaf5] rounded-3xl p-6 border border-[#e0d8c8] shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6 hover:shadow-sm transition-all"
                >
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-[#efe8dc] rounded-2xl text-[#2d5a61] shrink-0">
                      <Package className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-serif text-base font-bold text-[#333333]">{ord.orderNumber}</span>
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                            ord.status === 'delivered'
                              ? 'bg-emerald-100 text-emerald-800'
                              : ord.status === 'shipped'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {ord.status.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-xs text-[#666666]">
                        Placed on {new Date(ord.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} · {ord.items.length} {ord.items.length === 1 ? 'item' : 'items'}
                      </p>
                      <p className="text-xs font-bold text-[#333333] mt-1">
                        Total: Rs. {ord.total.toLocaleString()} ({ord.paymentMethod.title})
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 w-full md:w-auto pt-4 md:pt-0 border-t md:border-t-0 border-[#e0d8c8]">
                    <button
                      onClick={() => setSelectedOrderDetails(ord)}
                      className="px-4 py-2 border border-[#e0d8c8] rounded-xl text-xs font-semibold text-[#444444] hover:bg-[#efe8dc] transition-colors cursor-pointer"
                    >
                      View Receipt Details
                    </button>
                    <Link
                      to={`/track?order=${ord.orderNumber}`}
                      className="px-4 py-2 bg-[#2d5a61] text-white rounded-xl text-xs font-semibold hover:bg-[#1e3c41] transition-colors flex items-center gap-1.5 shadow-2xs"
                    >
                      <Truck className="w-3.5 h-3.5" />
                      <span>Track Journey</span>
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab 2: Saved Addresses */}
        {activeTab === 'addresses' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-serif text-lg text-[#333333]">Shipping Address Book</h3>
              <button
                onClick={() => setShowAddressModal(true)}
                className="bg-[#2d5a61] text-white px-4 py-2 rounded-xl text-xs font-semibold hover:bg-[#1e3c41] transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add New Address</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {user.addresses.map((addr) => (
                <div
                  key={addr.id}
                  className="bg-[#fdfaf5] rounded-3xl p-6 border border-[#e0d8c8] shadow-xs flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-serif text-sm font-bold text-[#333333] flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-[#2d5a61]" />
                        {addr.label}
                      </span>
                      {addr.isDefault && (
                        <span className="text-[10px] font-bold bg-[#2d5a61]/10 text-[#2d5a61] px-2 py-0.5 rounded-full">
                          Default Address
                        </span>
                      )}
                    </div>

                    <div className="text-xs text-[#555555] space-y-1">
                      <p className="font-semibold text-[#333333]">{addr.fullName}</p>
                      <p>{addr.address}</p>
                      <p>{addr.city}, {addr.postalCode}</p>
                      <p>Phone: {addr.phone}</p>
                    </div>
                  </div>

                  <div className="pt-4 mt-4 border-t border-[#e0d8c8] flex justify-end">
                    <button
                      onClick={() => handleDeleteAddress(addr.id)}
                      className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Profile Details */}
        {activeTab === 'profile' && (
          <div className="bg-[#fdfaf5] rounded-3xl p-6 md:p-8 border border-[#e0d8c8] shadow-xs max-w-2xl">
            <h3 className="font-serif text-xl text-[#333333] mb-6 pb-3 border-b border-[#e0d8c8]">
              Personal Information
            </h3>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-[#666666] mb-1 font-medium">Full Name</label>
                <input
                  type="text"
                  disabled
                  value={user.name}
                  className="w-full bg-[#efe8dc]/50 border border-[#e0d8c8] rounded-xl px-4 py-2.5 text-[#333333]"
                />
              </div>

              <div>
                <label className="block text-[#666666] mb-1 font-medium">Email Address</label>
                <input
                  type="email"
                  disabled
                  value={user.email}
                  className="w-full bg-[#efe8dc]/50 border border-[#e0d8c8] rounded-xl px-4 py-2.5 text-[#333333]"
                />
              </div>

              <div>
                <label className="block text-[#666666] mb-1 font-medium">Phone Number</label>
                <input
                  type="tel"
                  disabled
                  value={user.phone}
                  className="w-full bg-[#efe8dc]/50 border border-[#e0d8c8] rounded-xl px-4 py-2.5 text-[#333333]"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add Address Modal */}
      {showAddressModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#fdfaf5] rounded-3xl max-w-lg w-full p-6 md:p-8 border border-[#e0d8c8] shadow-2xl animate-fade-in">
            <h3 className="font-serif text-xl text-[#333333] mb-4 pb-2 border-b border-[#e0d8c8]">
              Add Shipping Address
            </h3>

            <form onSubmit={handleAddAddress} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-medium text-[#333333] mb-1">Address Label</label>
                <input
                  type="text"
                  value={newAddress.label}
                  onChange={(e) => setNewAddress({ ...newAddress, label: e.target.value })}
                  placeholder="e.g. Home, Office, Studio"
                  className="w-full bg-[#efe8dc]/40 border border-[#e0d8c8] rounded-xl px-3.5 py-2 text-[#333333]"
                />
              </div>

              <div>
                <label className="block font-medium text-[#333333] mb-1">Full Recipient Name</label>
                <input
                  type="text"
                  required
                  value={newAddress.fullName}
                  onChange={(e) => setNewAddress({ ...newAddress, fullName: e.target.value })}
                  placeholder="Recipient Name"
                  className="w-full bg-[#efe8dc]/40 border border-[#e0d8c8] rounded-xl px-3.5 py-2 text-[#333333]"
                />
              </div>

              <div>
                <label className="block font-medium text-[#333333] mb-1">Contact Phone *</label>
                <input
                  type="tel"
                  required
                  value={newAddress.phone}
                  onChange={(e) => {
                    setAddressErrors((prev) => ({ ...prev, phone: '' }));
                    setNewAddress({ ...newAddress, phone: sanitizePhoneNumber(e.target.value) });
                  }}
                  placeholder="+92 300 1234567"
                  className={`w-full bg-[#efe8dc]/40 border rounded-xl px-3.5 py-2 text-[#333333] focus:outline-none focus:border-[#2d5a61] ${
                    addressErrors.phone ? 'border-red-500' : 'border-[#e0d8c8]'
                  }`}
                />
                {addressErrors.phone && (
                  <p className="text-[11px] text-red-500 mt-1">{addressErrors.phone}</p>
                )}
              </div>

              <div>
                <label className="block font-medium text-[#333333] mb-1">Street Address *</label>
                <input
                  type="text"
                  required
                  value={newAddress.address}
                  onChange={(e) => {
                    setAddressErrors((prev) => ({ ...prev, address: '' }));
                    setNewAddress({ ...newAddress, address: e.target.value });
                  }}
                  placeholder="Street / House details"
                  className={`w-full bg-[#efe8dc]/40 border rounded-xl px-3.5 py-2 text-[#333333] focus:outline-none focus:border-[#2d5a61] ${
                    addressErrors.address ? 'border-red-500' : 'border-[#e0d8c8]'
                  }`}
                />
                {addressErrors.address && (
                  <p className="text-[11px] text-red-500 mt-1">{addressErrors.address}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-[#333333] mb-1">City</label>
                  <input
                    type="text"
                    value={newAddress.city}
                    onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                    className="w-full bg-[#efe8dc]/40 border border-[#e0d8c8] rounded-xl px-3.5 py-2 text-[#333333] focus:outline-none focus:border-[#2d5a61]"
                  />
                </div>
                <div>
                  <label className="block font-medium text-[#333333] mb-1">Postal Code</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={newAddress.postalCode}
                    onChange={(e) => {
                      setAddressErrors((prev) => ({ ...prev, postalCode: '' }));
                      setNewAddress({ ...newAddress, postalCode: sanitizePostalCode(e.target.value) });
                    }}
                    placeholder="e.g. 75500"
                    className={`w-full bg-[#efe8dc]/40 border rounded-xl px-3.5 py-2 text-[#333333] focus:outline-none focus:border-[#2d5a61] ${
                      addressErrors.postalCode ? 'border-red-500' : 'border-[#e0d8c8]'
                    }`}
                  />
                  {addressErrors.postalCode && (
                    <p className="text-[11px] text-red-500 mt-1">{addressErrors.postalCode}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isDefault"
                  checked={newAddress.isDefault}
                  onChange={(e) => setNewAddress({ ...newAddress, isDefault: e.target.checked })}
                />
                <label htmlFor="isDefault" className="text-xs text-[#555555]">Set as default shipping address</label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-[#e0d8c8]">
                <button
                  type="button"
                  onClick={() => setShowAddressModal(false)}
                  className="px-4 py-2 border border-[#e0d8c8] rounded-xl text-xs font-semibold text-[#666666]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#2d5a61] text-white rounded-xl text-xs font-semibold hover:bg-[#1e3c41]"
                >
                  Save Address
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Order Details Modal */}
      {selectedOrderDetails && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#fdfaf5] rounded-3xl max-w-xl w-full p-6 md:p-8 border border-[#e0d8c8] shadow-2xl max-h-[90vh] overflow-y-auto scrollbar-thin animate-fade-in">
            <div className="flex items-center justify-between pb-4 border-b border-[#e0d8c8] mb-4">
              <div>
                <h3 className="font-serif text-xl text-[#333333]">{selectedOrderDetails.orderNumber}</h3>
                <p className="text-xs text-[#666666]">
                  Placed on {new Date(selectedOrderDetails.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </p>
              </div>
              <button
                onClick={() => setSelectedOrderDetails(null)}
                className="text-xs text-[#666666] hover:text-[#333333] px-3 py-1.5 border border-[#e0d8c8] rounded-lg"
              >
                Close
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <h4 className="font-semibold text-[#333333] mb-2">Items in Order:</h4>
                <div className="space-y-2">
                  {selectedOrderDetails.items.map((it, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 rounded-xl bg-[#efe8dc]/40">
                      <div className="flex items-center gap-3">
                        <img src={it.product.image} alt={it.product.name} className="w-10 h-10 rounded-lg object-cover" />
                        <div>
                          <p className="font-medium text-[#333333]">{it.product.name}</p>
                          <p className="text-[11px] text-[#666666]">Qty: {it.quantity}</p>
                        </div>
                      </div>
                      <span className="font-bold text-[#333333]">Rs. {(it.product.price * it.quantity).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-[#e0d8c8] space-y-1.5">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span className="font-semibold">Rs. {selectedOrderDetails.subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping:</span>
                  <span>{selectedOrderDetails.shippingCost === 0 ? 'FREE' : `Rs. ${selectedOrderDetails.shippingCost}`}</span>
                </div>
                <div className="flex justify-between font-bold text-sm text-[#333333] pt-1">
                  <span>Total Paid:</span>
                  <span>Rs. {selectedOrderDetails.total.toLocaleString()}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-[#e0d8c8]">
                <h4 className="font-semibold text-[#333333] mb-1">Delivered to:</h4>
                <p>{selectedOrderDetails.customer.fullName}</p>
                <p>{selectedOrderDetails.shippingAddress.address}, {selectedOrderDetails.shippingAddress.city}</p>
                <p>Courier Tracking: <strong>{selectedOrderDetails.trackingNumber || 'Pending'}</strong></p>
              </div>

              <div className="pt-4 flex justify-end gap-2">
                <Link
                  to={`/track?order=${selectedOrderDetails.orderNumber}`}
                  className="bg-[#2d5a61] text-white px-5 py-2.5 rounded-xl text-xs font-semibold hover:bg-[#1e3c41] flex items-center gap-1.5"
                >
                  <Truck className="w-3.5 h-3.5" />
                  <span>Open Live Tracker</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
