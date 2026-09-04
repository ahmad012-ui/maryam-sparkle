import React, { useState } from 'react';
import {
  ShoppingBag,
  Search,
  Truck,
  CheckCircle2,
  Clock,
  Eye,
  X,
  Phone,
  Mail,
  MapPin,
  Printer,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { AdminOrder } from './types';

interface AdminOrdersProps {
  orders: AdminOrder[];
  onSaveOrders: (orders: AdminOrder[]) => void;
  selectedOrder?: AdminOrder | null;
  onClearSelectedOrder?: () => void;
}

export const AdminOrders: React.FC<AdminOrdersProps> = ({
  orders,
  onSaveOrders,
  selectedOrder: initialSelected,
  onClearSelectedOrder,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [activeModalOrder, setActiveModalOrder] = useState<AdminOrder | null>(
    initialSelected || null
  );

  // Filter orders
  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customerPhone.includes(searchQuery) ||
      o.city.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'All' || o.orderStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statuses: AdminOrder['orderStatus'][] = [
    'Placed',
    'Confirmed',
    'Processing',
    'Shipped',
    'Delivered',
    'Cancelled',
  ];

  const handleUpdateStatus = (orderId: string, newStatus: AdminOrder['orderStatus']) => {
    const updated = orders.map((o) =>
      o.id === orderId
        ? {
            ...o,
            orderStatus: newStatus,
            paymentStatus:
              newStatus === 'Delivered' && o.paymentMethod === 'COD'
                ? ('Paid' as const)
                : o.paymentStatus,
          }
        : o
    );
    onSaveOrders(updated);

    if (activeModalOrder && activeModalOrder.id === orderId) {
      setActiveModalOrder({
        ...activeModalOrder,
        orderStatus: newStatus,
      });
    }
  };

  const handleUpdateTracking = (
    orderId: string,
    courierName: string,
    trackingNumber: string
  ) => {
    const updated = orders.map((o) =>
      o.id === orderId ? { ...o, courierName, trackingNumber } : o
    );
    onSaveOrders(updated);
    if (activeModalOrder && activeModalOrder.id === orderId) {
      setActiveModalOrder({ ...activeModalOrder, courierName, trackingNumber });
    }
  };

  const getStatusBadgeClass = (status: AdminOrder['orderStatus']) => {
    switch (status) {
      case 'Delivered':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800';
      case 'Shipped':
        return 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/30 dark:text-sky-400 dark:border-sky-800';
      case 'Processing':
        return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800';
      case 'Confirmed':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/30 dark:text-indigo-400 dark:border-indigo-800';
      case 'Placed':
        return 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/30 dark:text-purple-400 dark:border-purple-800';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white dark:bg-[#1a1e24] p-5 sm:p-6 rounded-2xl border border-gray-200/80 dark:border-gray-800 shadow-2xs">
        <div>
          <h2 className="font-serif text-xl sm:text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-[#2d5a61] dark:text-teal-400" />
            Customer Orders & Dispatches
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
            Track nationwide courier delivery, payment methods (COD/Easypaisa/JazzCash), and packaging status.
          </p>
        </div>
      </div>

      {/* Quick KPI Count */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white dark:bg-[#1a1e24] p-4 rounded-xl border border-gray-200/80 dark:border-gray-800">
          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">All Orders</p>
          <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">{orders.length}</p>
        </div>
        <div className="bg-white dark:bg-[#1a1e24] p-4 rounded-xl border border-gray-200/80 dark:border-gray-800">
          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Pending / Processing</p>
          <p className="text-xl font-bold text-amber-600 dark:text-amber-400 mt-1">
            {orders.filter((o) => o.orderStatus === 'Placed' || o.orderStatus === 'Processing' || o.orderStatus === 'Confirmed').length}
          </p>
        </div>
        <div className="bg-white dark:bg-[#1a1e24] p-4 rounded-xl border border-gray-200/80 dark:border-gray-800">
          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">In Transit (Courier)</p>
          <p className="text-xl font-bold text-sky-600 dark:text-sky-400 mt-1">
            {orders.filter((o) => o.orderStatus === 'Shipped').length}
          </p>
        </div>
        <div className="bg-white dark:bg-[#1a1e24] p-4 rounded-xl border border-gray-200/80 dark:border-gray-800">
          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Delivered</p>
          <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
            {orders.filter((o) => o.orderStatus === 'Delivered').length}
          </p>
        </div>
      </div>

      {/* Filters and Search Bar */}
      <div className="bg-white dark:bg-[#1a1e24] p-4 sm:p-5 rounded-2xl border border-gray-200/80 dark:border-gray-800 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by order #, customer, phone, or city..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9.5 pr-4 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#2d5a61]/30 focus:border-[#2d5a61]"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
            <button
              onClick={() => setStatusFilter('All')}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-colors ${
                statusFilter === 'All'
                  ? 'bg-[#2d5a61] text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              All
            </button>
            {statuses.map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-colors ${
                  statusFilter === st
                    ? 'bg-[#2d5a61] text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white dark:bg-[#1a1e24] rounded-2xl border border-gray-200/80 dark:border-gray-800 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50/70 dark:bg-gray-800/50 text-[11px] uppercase tracking-wider text-gray-400 border-b border-gray-200 dark:border-gray-800">
              <tr>
                <th className="py-3.5 px-4 font-semibold">Order</th>
                <th className="py-3.5 px-3 font-semibold">Customer & City</th>
                <th className="py-3.5 px-3 font-semibold">Jewelry Pieces</th>
                <th className="py-3.5 px-3 font-semibold text-right">Total Amount</th>
                <th className="py-3.5 px-3 font-semibold text-center">Payment</th>
                <th className="py-3.5 px-3 font-semibold text-center">Dispatch Status</th>
                <th className="py-3.5 px-4 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-400">
                    No orders match your search criteria.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((o) => (
                  <tr
                    key={o.id}
                    className="hover:bg-gray-50/60 dark:hover:bg-gray-800/30 transition-colors"
                  >
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-gray-900 dark:text-white block">
                        {o.orderNumber}
                      </span>
                      <span className="text-[10px] text-gray-400">{o.date}</span>
                    </td>

                    <td className="py-3.5 px-3">
                      <p className="font-semibold text-gray-800 dark:text-gray-200">
                        {o.customerName}
                      </p>
                      <p className="text-[10px] text-gray-400">
                        {o.city} • {o.customerPhone}
                      </p>
                    </td>

                    <td className="py-3.5 px-3 max-w-[200px]">
                      <div className="flex items-center gap-2">
                        {o.items[0]?.image && (
                          <img
                            src={o.items[0].image}
                            alt=""
                            className="w-8 h-8 rounded-lg object-cover border border-gray-200 dark:border-gray-700 shrink-0"
                          />
                        )}
                        <div className="truncate">
                          <p className="font-medium text-gray-700 dark:text-gray-300 truncate">
                            {o.items[0]?.productName}
                          </p>
                          <span className="text-[10px] text-gray-400">
                            {o.items.length > 1
                              ? `${o.items[0].quantity}x + ${o.items.length - 1} item(s)`
                              : `${o.items[0]?.quantity} unit(s)`}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-3 text-right">
                      <span className="font-bold text-gray-900 dark:text-white block">
                        PKR {o.totalAmount.toLocaleString()}
                      </span>
                      <span className="text-[10px] text-gray-400">{o.paymentMethod}</span>
                    </td>

                    <td className="py-3.5 px-3 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                          o.paymentStatus === 'Paid'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400'
                            : 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400'
                        }`}
                      >
                        {o.paymentStatus}
                      </span>
                    </td>

                    <td className="py-3.5 px-3 text-center">
                      <select
                        value={o.orderStatus}
                        onChange={(e) =>
                          handleUpdateStatus(o.id, e.target.value as AdminOrder['orderStatus'])
                        }
                        className={`text-[10px] font-semibold px-2 py-1 rounded-full border cursor-pointer ${getStatusBadgeClass(
                          o.orderStatus
                        )} bg-transparent focus:ring-1 focus:ring-[#2d5a61]`}
                      >
                        {statuses.map((st) => (
                          <option key={st} value={st} className="bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200">
                            {st}
                          </option>
                        ))}
                      </select>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setActiveModalOrder(o)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-[#2d5a61] hover:bg-teal-50 dark:hover:bg-teal-950/40 transition-colors"
                        title="View complete order packing slip"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail Modal */}
      {activeModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#1a1e24] rounded-2xl border border-gray-200 dark:border-gray-800 max-w-2xl w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-800">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-serif text-lg font-bold text-gray-900 dark:text-white">
                    Order {activeModalOrder.orderNumber}
                  </h3>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${getStatusBadgeClass(
                      activeModalOrder.orderStatus
                    )}`}
                  >
                    {activeModalOrder.orderStatus}
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-0.5">Placed on {activeModalOrder.date}</p>
              </div>
              <button
                onClick={() => {
                  setActiveModalOrder(null);
                  if (onClearSelectedOrder) onClearSelectedOrder();
                }}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-5 text-xs">
              {/* Customer & Address Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-gray-50/70 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800">
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                    Customer Information
                  </h4>
                  <p className="font-medium text-gray-800 dark:text-gray-200">
                    {activeModalOrder.customerName}
                  </p>
                  <p className="text-gray-500 dark:text-gray-400 flex items-center gap-1.5 mt-1">
                    <Mail className="w-3.5 h-3.5" />
                    {activeModalOrder.customerEmail}
                  </p>
                  <p className="text-gray-500 dark:text-gray-400 flex items-center gap-1.5 mt-1">
                    <Phone className="w-3.5 h-3.5" />
                    {activeModalOrder.customerPhone}
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                    Shipping Destination
                  </h4>
                  <p className="text-gray-700 dark:text-gray-300 flex items-start gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0 mt-0.5" />
                    <span>
                      {activeModalOrder.address}, {activeModalOrder.city}
                    </span>
                  </p>
                  <div className="mt-2 text-gray-500">
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                      Payment Method:
                    </span>{' '}
                    {activeModalOrder.paymentMethod} ({activeModalOrder.paymentStatus})
                  </div>
                </div>
              </div>

              {/* Order Items Table */}
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2.5">
                  Ordered Jewelry Items
                </h4>
                <div className="divide-y divide-gray-100 dark:divide-gray-800 border border-gray-100 dark:border-gray-800 rounded-xl overflow-hidden">
                  {activeModalOrder.items.map((item, index) => (
                    <div
                      key={index}
                      className="p-3 flex items-center justify-between gap-3 bg-white dark:bg-[#1a1e24]"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={item.image}
                          alt=""
                          className="w-12 h-12 rounded-lg object-cover border border-gray-200 dark:border-gray-700 shrink-0"
                        />
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {item.productName}
                          </p>
                          <p className="text-[11px] text-gray-400 mt-0.5">
                            {item.finish || 'Gold Plated'} • {item.size || 'Standard'} • Qty:{' '}
                            {item.quantity}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-gray-900 dark:text-white">
                          PKR {(item.price * item.quantity).toLocaleString()}
                        </span>
                        <span className="block text-[10px] text-gray-400">
                          PKR {item.price.toLocaleString()} each
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total Calculation */}
              <div className="p-3 bg-gray-50/70 dark:bg-gray-800/40 rounded-xl flex items-center justify-between">
                <span className="font-semibold text-gray-700 dark:text-gray-300">
                  Total Order Value (incl. shipping)
                </span>
                <span className="font-serif text-base font-bold text-[#2d5a61] dark:text-teal-400">
                  PKR {activeModalOrder.totalAmount.toLocaleString()}
                </span>
              </div>

              {/* Courier & Tracking Assignment */}
              <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 space-y-3">
                <h4 className="font-semibold text-gray-900 dark:text-white flex items-center gap-1.5">
                  <Truck className="w-4 h-4 text-[#2d5a61]" />
                  Courier Logistics Assignment
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-gray-500 mb-1 font-medium">Courier Partner</label>
                    <select
                      value={activeModalOrder.courierName || 'Trax Logistics'}
                      onChange={(e) =>
                        handleUpdateTracking(
                          activeModalOrder.id,
                          e.target.value,
                          activeModalOrder.trackingNumber || ''
                        )
                      }
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    >
                      <option value="Trax Logistics">Trax Logistics</option>
                      <option value="TCS Express">TCS Express</option>
                      <option value="Leopards Courier">Leopards Courier</option>
                      <option value="Call Courier">Call Courier</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-500 mb-1 font-medium">Tracking Number</label>
                    <input
                      type="text"
                      placeholder="e.g. TRX-99214"
                      value={activeModalOrder.trackingNumber || ''}
                      onChange={(e) =>
                        handleUpdateTracking(
                          activeModalOrder.id,
                          activeModalOrder.courierName || 'Trax Logistics',
                          e.target.value
                        )
                      }
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              {activeModalOrder.notes && (
                <div className="p-3 bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/50 rounded-xl text-amber-900 dark:text-amber-300">
                  <span className="font-semibold block mb-0.5">Customer Delivery Notes:</span>
                  <p className="text-[11px] leading-relaxed">{activeModalOrder.notes}</p>
                </div>
              )}
            </div>

            {/* Footer Buttons */}
            <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-xs font-semibold flex items-center gap-1.5 hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Packing Slip</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveModalOrder(null);
                  if (onClearSelectedOrder) onClearSelectedOrder();
                }}
                className="px-5 py-2 rounded-xl bg-[#2d5a61] text-white text-xs font-semibold hover:bg-[#1e3c41] shadow-xs"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
