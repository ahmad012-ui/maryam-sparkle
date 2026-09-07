import React, { useState } from 'react';
import {
  TrendingUp,
  ShoppingBag,
  Sparkles,
  Gem,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  Truck,
  Eye,
  Plus,
  ChevronRight,
  MessageCircle,
  Package,
  Calendar,
} from 'lucide-react';
import { AdminOrder, AdminCustomOrder, AdminProduct, AdminTab } from './types';

interface AdminDashboardProps {
  orders: AdminOrder[];
  customOrders: AdminCustomOrder[];
  products: AdminProduct[];
  onNavigateTab: (tab: AdminTab) => void;
  onOpenNewProduct: () => void;
  onOpenNewCustomOrder: () => void;
  onSelectOrder: (order: AdminOrder) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  orders,
  customOrders,
  products,
  onNavigateTab,
  onOpenNewProduct,
  onOpenNewCustomOrder,
  onSelectOrder,
}) => {
  // Real calculations directly from actual records
  const totalRevenue = orders.reduce((sum, ord) => sum + ord.totalAmount, 0);
  const deliveredCount = orders.filter((o) => o.orderStatus === 'Delivered').length;
  const inFulfillmentCount = orders.filter(
    (o) => o.orderStatus !== 'Delivered' && o.orderStatus !== 'Cancelled'
  ).length;
  const avgOrderValue = orders.length > 0 ? Math.round(totalRevenue / orders.length) : 0;

  const activeCustomRequests = customOrders.filter(
    (c) => c.status !== 'Completed' && c.status !== 'Declined'
  ).length;
  const lowStockProducts = products.filter((p) => p.stock <= 5);
  const totalStockUnits = products.reduce((sum, p) => sum + p.stock, 0);

  // Dynamic order status breakdown from actual orders
  const statusCounts: Record<AdminOrder['orderStatus'], number> = {
    Placed: orders.filter((o) => o.orderStatus === 'Placed').length,
    Confirmed: orders.filter((o) => o.orderStatus === 'Confirmed').length,
    Processing: orders.filter((o) => o.orderStatus === 'Processing').length,
    Shipped: orders.filter((o) => o.orderStatus === 'Shipped').length,
    Delivered: orders.filter((o) => o.orderStatus === 'Delivered').length,
    Cancelled: orders.filter((o) => o.orderStatus === 'Cancelled').length,
  };

  // Dynamic category distribution from actual catalog
  const categoryStats = React.useMemo(() => {
    const counts: Record<string, number> = {};
    products.forEach((p) => {
      counts[p.category] = (counts[p.category] || 0) + 1;
    });
    const total = products.length || 1;
    return Object.entries(counts)
      .map(([name, count]) => ({
        name,
        count,
        percentage: Math.round((count / total) * 100),
      }))
      .sort((a, b) => b.count - a.count);
  }, [products]);

  const getStatusBadge = (status: AdminOrder['orderStatus']) => {
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

  const getCustomBadge = (status: AdminCustomOrder['status']) => {
    switch (status) {
      case 'New Request':
        return 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/30 dark:text-purple-400';
      case 'Quote Sent':
        return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400';
      case 'In Production':
        return 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/30 dark:text-sky-400';
      case 'Completed':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white dark:bg-[#1a1e24] p-5 sm:p-6 rounded-2xl border border-gray-200/80 dark:border-gray-800 shadow-2xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold tracking-wider uppercase bg-[#2d5a61]/10 text-[#2d5a61] dark:bg-[#2d5a61]/30 dark:text-teal-300 border border-[#2d5a61]/20">
              Studio Intelligence
            </span>
          </div>
          <h2 className="font-serif text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
            Maryam Sparkle Studio Overview
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
            Handcrafted jewelry metrics, order dispatches, and bespoke artisan inquiries at a glance.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={onOpenNewCustomOrder}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center gap-1.5 shadow-2xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#c59d5f]" />
            <span>Bespoke Request</span>
          </button>
          <button
            onClick={onOpenNewProduct}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#2d5a61] text-white hover:bg-[#1e3c41] transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>New Jewelry</span>
          </button>
        </div>
      </div>

      {/* 4 Stat Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5">
        {/* Card 1: Total Revenue */}
        <div className="bg-white dark:bg-[#1a1e24] rounded-2xl border border-gray-200/80 dark:border-gray-800 p-5 shadow-2xs relative overflow-hidden transition-all hover:shadow-xs">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Total Revenue
              </p>
              <h3 className="font-serif text-2xl font-bold text-gray-900 dark:text-white mt-1">
                PKR {totalRevenue.toLocaleString()}
              </h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-[#2d5a61] to-[#43838d] text-white flex items-center justify-center shadow-md shadow-[#2d5a61]/20">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs">
            <span className="text-gray-600 dark:text-gray-300 font-medium">
              {orders.length > 0 ? `Avg PKR ${avgOrderValue.toLocaleString()} / order` : 'No orders recorded'}
            </span>
            <span className="text-gray-400">{orders.length} order(s)</span>
          </div>
        </div>

        {/* Card 2: Store Orders */}
        <div className="bg-white dark:bg-[#1a1e24] rounded-2xl border border-gray-200/80 dark:border-gray-800 p-5 shadow-2xs relative overflow-hidden transition-all hover:shadow-xs">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Store Orders
              </p>
              <h3 className="font-serif text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {orders.length} Total
              </h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-gray-900 to-gray-700 dark:from-gray-800 dark:to-gray-600 text-white flex items-center justify-center shadow-md shadow-gray-900/20">
              <ShoppingBag className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs">
            <span className="text-emerald-600 dark:text-emerald-400 font-medium">
              {deliveredCount} delivered
            </span>
            <span className="text-amber-600 dark:text-amber-400 font-medium">
              {inFulfillmentCount} in progress
            </span>
          </div>
        </div>

        {/* Card 3: Bespoke Custom Orders */}
        <div className="bg-white dark:bg-[#1a1e24] rounded-2xl border border-gray-200/80 dark:border-gray-800 p-5 shadow-2xs relative overflow-hidden transition-all hover:shadow-xs">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Bespoke Inquiries
              </p>
              <h3 className="font-serif text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {customOrders.length} Inquiries
              </h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-[#c59d5f] to-[#e6be8a] text-white flex items-center justify-center shadow-md shadow-[#c59d5f]/20">
              <Sparkles className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs">
            <span className="text-amber-600 dark:text-amber-400 font-medium">
              {activeCustomRequests} in studio pipeline
            </span>
            <button
              onClick={() => onNavigateTab('custom-orders')}
              className="text-[#2d5a61] dark:text-teal-400 hover:underline font-medium text-[11px]"
            >
              Review →
            </button>
          </div>
        </div>

        {/* Card 4: Catalog & Stock */}
        <div className="bg-white dark:bg-[#1a1e24] rounded-2xl border border-gray-200/80 dark:border-gray-800 p-5 shadow-2xs relative overflow-hidden transition-all hover:shadow-xs">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Active Catalog
              </p>
              <h3 className="font-serif text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {products.length} Designs
              </h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-md shadow-emerald-600/20">
              <Gem className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs">
            <span
              className={`font-medium ${
                lowStockProducts.length > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'
              }`}
            >
              {lowStockProducts.length > 0 ? `${lowStockProducts.length} low stock` : 'Inventory healthy'}
            </span>
            <button
              onClick={() => onNavigateTab('products')}
              className="text-[#2d5a61] dark:text-teal-400 hover:underline font-medium text-[11px]"
            >
              Manage →
            </button>
          </div>
        </div>
      </div>

      {/* Real Breakdown Section: Order Lifecycle & Category Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Order Lifecycle Pipeline */}
        <div className="lg:col-span-2 bg-white dark:bg-[#1a1e24] rounded-2xl border border-gray-200/80 dark:border-gray-800 p-5 sm:p-6 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="font-serif text-base font-bold text-gray-900 dark:text-white">
                Order Fulfillment Lifecycle
              </h4>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Live distribution of registered orders across production & courier stages
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
              {orders.length} Total Orders
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
            {(
              [
                { label: 'Placed', count: statusCounts.Placed, color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-950/30 border-purple-200 dark:border-purple-900' },
                { label: 'Confirmed', count: statusCounts.Confirmed, color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-950/30 border-indigo-200 dark:border-indigo-900' },
                { label: 'Processing', count: statusCounts.Processing, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900' },
                { label: 'Shipped', count: statusCounts.Shipped, color: 'text-sky-600 dark:text-sky-400', bg: 'bg-sky-50 dark:bg-sky-950/30 border-sky-200 dark:border-sky-900' },
                { label: 'Delivered', count: statusCounts.Delivered, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900' },
                { label: 'Cancelled', count: statusCounts.Cancelled, color: 'text-gray-500 dark:text-gray-400', bg: 'bg-gray-50 dark:bg-gray-800/40 border-gray-200 dark:border-gray-800' },
              ] as const
            ).map((stage) => {
              const pct = orders.length > 0 ? Math.round((stage.count / orders.length) * 100) : 0;
              return (
                <div key={stage.label} className={`p-3.5 rounded-xl border ${stage.bg} space-y-1`}>
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-gray-700 dark:text-gray-300">{stage.label}</span>
                    <span className={`font-bold ${stage.color}`}>{stage.count}</span>
                  </div>
                  <div className="h-1.5 w-full bg-black/5 dark:bg-white/10 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${stage.color.replace('text-', 'bg-')}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-gray-400 block text-right">{pct}% of orders</span>
                </div>
              );
            })}
          </div>

          <div className="mt-5 pt-3 border-t border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs text-gray-500 dark:text-gray-400">
            <span className="flex items-center gap-1.5">
              <Package className="w-3.5 h-3.5 text-[#2d5a61] dark:text-teal-400" />
              {inFulfillmentCount} order(s) currently require packing or dispatch
            </span>
            <button
              onClick={() => onNavigateTab('orders')}
              className="text-[#2d5a61] dark:text-teal-400 font-semibold hover:underline text-left sm:text-right"
            >
              Open Orders Registry →
            </button>
          </div>
        </div>

        {/* Catalog Categories Breakdown */}
        <div className="bg-white dark:bg-[#1a1e24] rounded-2xl border border-gray-200/80 dark:border-gray-800 p-5 sm:p-6 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-serif text-base font-bold text-gray-900 dark:text-white">
                Catalog by Category
              </h4>
              <span className="text-xs text-gray-400">{products.length} Products</span>
            </div>

            <div className="space-y-3.5">
              {categoryStats.length === 0 ? (
                <p className="text-xs text-gray-400 py-4 text-center">No products in catalog yet.</p>
              ) : (
                categoryStats.map((cat) => (
                  <div key={cat.name} className="space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-medium text-gray-700 dark:text-gray-200">{cat.name}</span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {cat.count} design{cat.count === 1 ? '' : 's'} ({cat.percentage}%)
                      </span>
                    </div>
                    <div className="h-2 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#2d5a61] dark:bg-teal-500 rounded-full transition-all duration-300"
                        style={{ width: `${cat.percentage}%` }}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="mt-5 p-3.5 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 text-xs">
            <div className="flex justify-between items-center text-gray-600 dark:text-gray-300 mb-1">
              <span className="font-medium">Total In-Stock Units:</span>
              <span className="font-bold text-gray-900 dark:text-white">{totalStockUnits}</span>
            </div>
            {lowStockProducts.length > 0 && (
              <p className="text-[11px] text-rose-600 dark:text-rose-400 font-medium">
                {lowStockProducts.length} product(s) have 5 or fewer items remaining.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Main Tables: Recent Orders & Bespoke Requests */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Recent Orders Table (2 Cols) */}
        <div className="xl:col-span-2 bg-white dark:bg-[#1a1e24] rounded-2xl border border-gray-200/80 dark:border-gray-800 p-5 sm:p-6 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="font-serif text-base font-bold text-gray-900 dark:text-white">
                Recent Store Dispatches
              </h4>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Latest customer purchases & shipment status
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('orders')}
              className="text-xs font-semibold text-[#2d5a61] dark:text-teal-400 hover:underline flex items-center gap-1"
            >
              <span>View All ({orders.length})</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-[11px] uppercase tracking-wider text-gray-400 border-b border-gray-100 dark:border-gray-800">
                <tr>
                  <th className="pb-3 font-semibold">Order</th>
                  <th className="pb-3 font-semibold">Customer</th>
                  <th className="pb-3 font-semibold">Jewelry Items</th>
                  <th className="pb-3 font-semibold text-right">Amount</th>
                  <th className="pb-3 font-semibold text-center">Status</th>
                  <th className="pb-3 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {orders.slice(0, 5).map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50/70 dark:hover:bg-gray-800/40 transition-colors">
                    <td className="py-3 font-semibold text-gray-900 dark:text-white">
                      {order.orderNumber}
                      <span className="block text-[10px] font-normal text-gray-400">{order.date}</span>
                    </td>
                    <td className="py-3">
                      <p className="font-medium text-gray-800 dark:text-gray-200">{order.customerName}</p>
                      <p className="text-[10px] text-gray-400">{order.city} • {order.paymentMethod}</p>
                    </td>
                    <td className="py-3 max-w-[180px]">
                      <p className="truncate font-medium text-gray-700 dark:text-gray-300">
                        {order.items[0]?.productName}
                      </p>
                      {order.items.length > 1 && (
                        <span className="text-[10px] text-gray-400">
                          +{order.items.length - 1} more piece(s)
                        </span>
                      )}
                    </td>
                    <td className="py-3 text-right font-semibold text-gray-900 dark:text-white">
                      PKR {order.totalAmount.toLocaleString()}
                    </td>
                    <td className="py-3 text-center">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${getStatusBadge(
                          order.orderStatus
                        )}`}
                      >
                        {order.orderStatus}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <button
                        onClick={() => onSelectOrder(order)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-[#2d5a61] hover:bg-teal-50 dark:hover:bg-teal-950/30 transition-colors"
                        title="View order details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Bespoke Requests Feed (1 Col) */}
        <div className="bg-white dark:bg-[#1a1e24] rounded-2xl border border-gray-200/80 dark:border-gray-800 p-5 sm:p-6 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="font-serif text-base font-bold text-gray-900 dark:text-white">
                  Bespoke Inquiries
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Custom bead & metal orders
                </p>
              </div>
              <button
                onClick={() => onNavigateTab('custom-orders')}
                className="text-xs font-semibold text-[#2d5a61] dark:text-teal-400 hover:underline flex items-center gap-1"
              >
                <span>All ({customOrders.length})</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3.5">
              {customOrders.slice(0, 4).map((req) => (
                <div
                  key={req.id}
                  className="p-3 rounded-xl border border-gray-100 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-xs font-bold text-gray-900 dark:text-white">
                        {req.customerName}
                      </p>
                      <p className="text-[11px] font-medium text-[#2d5a61] dark:text-teal-400">
                        {req.jewelryType}
                      </p>
                    </div>
                    <span
                      className={`text-[9px] font-semibold px-2 py-0.5 rounded-full border ${getCustomBadge(
                        req.status
                      )}`}
                    >
                      {req.status}
                    </span>
                  </div>

                  <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1 line-clamp-1">
                    Materials: {req.preferredStones.join(', ')} • {req.wristSize}
                  </p>

                  <div className="mt-2 pt-2 border-t border-gray-50 dark:border-gray-800/60 flex items-center justify-between text-[10px]">
                    <span className="text-gray-400">{req.date}</span>
                    <a
                      href={`https://wa.me/${req.phone.replace(/[^0-9]/g, '')}?text=Hello%20${encodeURIComponent(
                        req.customerName
                      )},%20this%20is%20Maryam%20Sparkle%20Jewelry%20regarding%20your%20custom%20order%20request%20${req.requestNumber}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 hover:underline font-semibold"
                    >
                      <MessageCircle className="w-3 h-3" />
                      <span>WhatsApp Quote</span>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => onNavigateTab('custom-orders')}
            className="w-full mt-4 py-2 px-3 rounded-xl border border-dashed border-gray-300 dark:border-gray-700 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-center"
          >
            Manage All Custom Inquiries & WhatsApp Quotes
          </button>
        </div>
      </div>
    </div>
  );
};
