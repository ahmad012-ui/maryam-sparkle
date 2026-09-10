import React, { useState } from 'react';
import {
  Bell,
  CheckCheck,
  ShoppingBag,
  Sparkles,
  AlertTriangle,
  Info,
  Clock,
  Trash2,
  CheckCircle,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import { AdminNotification, AdminTab } from './types';

interface AdminNotificationsProps {
  notifications: AdminNotification[];
  onSaveNotifications: (notifs: AdminNotification[]) => void;
  onNavigateTab: (tab: AdminTab) => void;
  onNotificationClick?: (notif: AdminNotification) => void;
}

export const AdminNotifications: React.FC<AdminNotificationsProps> = ({
  notifications,
  onSaveNotifications,
  onNavigateTab,
  onNotificationClick,
}) => {
  const [filterType, setFilterType] = useState<string>('All');
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);

  const isItemRead = (n: AdminNotification) => Boolean(n.read || n.isRead);

  const unreadCount = notifications.filter((n) => !isItemRead(n)).length;

  const filtered = notifications.filter((n) => {
    const matchesType = filterType === 'All' || n.type === filterType;
    const isRead = isItemRead(n);
    const matchesRead = !showUnreadOnly || !isRead;
    return matchesType && matchesRead;
  });

  const handleMarkAllAsRead = () => {
    onSaveNotifications(
      notifications.map((n) => ({ ...n, read: true, isRead: true }))
    );
  };

  const handleMarkAsRead = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    onSaveNotifications(
      notifications.map((n) =>
        n.id === id ? { ...n, read: true, isRead: true } : n
      )
    );
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onSaveNotifications(notifications.filter((n) => n.id !== id));
  };

  const handleItemClick = (notif: AdminNotification) => {
    // 1. Mark as read
    handleMarkAsRead(notif.id);

    // 2. Direct to designated page / details modal
    if (onNotificationClick) {
      onNotificationClick(notif);
    } else {
      if (notif.type === 'order' || notif.linkTab === 'orders') {
        onNavigateTab('orders');
      } else if (notif.type === 'custom' || notif.linkTab === 'custom-orders') {
        onNavigateTab('custom-orders');
      } else if (notif.type === 'stock' || notif.linkTab === 'products') {
        onNavigateTab('products');
      } else if (notif.linkTab) {
        onNavigateTab(notif.linkTab);
      } else {
        onNavigateTab('dashboard');
      }
    }
  };

  const getIcon = (type: AdminNotification['type']) => {
    switch (type) {
      case 'order':
        return <ShoppingBag className="w-5 h-5 text-[#2d5a61] dark:text-teal-400" />;
      case 'custom':
        return <Sparkles className="w-5 h-5 text-[#c59d5f]" />;
      case 'stock':
        return <AlertTriangle className="w-5 h-5 text-amber-500" />;
      default:
        return <Info className="w-5 h-5 text-sky-500" />;
    }
  };

  const getActionLabel = (notif: AdminNotification) => {
    if (notif.type === 'order' || notif.linkTab === 'orders') return 'View Order Details';
    if (notif.type === 'custom' || notif.linkTab === 'custom-orders') return 'View Bespoke Request';
    if (notif.type === 'stock' || notif.linkTab === 'products') return 'Check Inventory Stock';
    return 'Open Section';
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white dark:bg-[#1a1e24] p-5 sm:p-6 rounded-2xl border border-gray-200/80 dark:border-gray-800 shadow-2xs">
        <div>
          <h2 className="font-serif text-xl sm:text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Bell className="w-5 h-5 text-[#2d5a61] dark:text-teal-400" />
            Studio Alerts & Notifications
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
            Real-time triggers for incoming orders, WhatsApp bespoke inquiries, and bead stock limits. Click any alert to jump directly to its details.
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            className="px-4 py-2 rounded-xl text-xs font-semibold border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center gap-2 shadow-2xs cursor-pointer"
          >
            <CheckCheck className="w-4 h-4 text-[#2d5a61]" />
            <span>Mark All as Read ({unreadCount})</span>
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="bg-white dark:bg-[#1a1e24] p-4 rounded-2xl border border-gray-200/80 dark:border-gray-800 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 overflow-x-auto">
          {['All', 'order', 'custom', 'stock', 'system'].map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-colors cursor-pointer ${
                filterType === type
                  ? 'bg-[#2d5a61] text-white shadow-xs'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {type === 'All' ? 'All Alerts' : type === 'order' ? 'Orders' : type === 'custom' ? 'Bespoke' : type}
            </button>
          ))}
        </div>

        <label className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={showUnreadOnly}
            onChange={(e) => setShowUnreadOnly(e.target.checked)}
            className="rounded text-[#2d5a61] focus:ring-[#2d5a61]"
          />
          <span>Show Unread Only ({unreadCount})</span>
        </label>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="bg-white dark:bg-[#1a1e24] p-12 text-center text-gray-400 rounded-2xl border border-gray-200 dark:border-gray-800">
            No alerts found matching this filter.
          </div>
        ) : (
          filtered.map((notif) => {
            const isRead = isItemRead(notif);
            return (
              <div
                key={notif.id}
                onClick={() => handleItemClick(notif)}
                className={`group p-4 sm:p-5 rounded-2xl border transition-all flex items-start justify-between gap-4 cursor-pointer relative ${
                  isRead
                    ? 'bg-white dark:bg-[#1a1e24] border-gray-200/80 dark:border-gray-800 opacity-90 hover:opacity-100 hover:border-gray-300 dark:hover:border-gray-700 shadow-2xs'
                    : 'bg-gradient-to-r from-teal-50/70 to-emerald-50/30 dark:from-teal-950/30 dark:to-emerald-950/10 border-teal-200/90 dark:border-teal-800/80 shadow-xs ring-1 ring-teal-500/10'
                } hover:shadow-md`}
              >
                <div className="flex items-start gap-3.5 sm:gap-4 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-white dark:bg-gray-800 border border-gray-200/80 dark:border-gray-700 flex items-center justify-center shrink-0 shadow-2xs mt-0.5 group-hover:scale-105 transition-transform">
                    {getIcon(notif.type)}
                  </div>

                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-semibold text-xs sm:text-sm text-gray-900 dark:text-white group-hover:text-[#2d5a61] dark:group-hover:text-teal-400 transition-colors">
                        {notif.title}
                      </h4>
                      {!isRead && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#2d5a61] text-white">
                          NEW
                        </span>
                      )}
                      {notif.badge && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
                          {notif.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed break-words">
                      {notif.message}
                    </p>
                    <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-gray-400">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {notif.timestamp}
                      </span>
                      <span className="text-gray-300 dark:text-gray-700">•</span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleItemClick(notif);
                        }}
                        className="text-[#2d5a61] dark:text-teal-400 font-bold hover:underline flex items-center gap-1 group-hover:translate-x-0.5 transition-transform"
                      >
                        <span>{getActionLabel(notif)}</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0 self-start mt-0.5">
                  {!isRead && (
                    <button
                      type="button"
                      onClick={(e) => handleMarkAsRead(notif.id, e)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-[#2d5a61] hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                      title="Mark as read"
                    >
                      <CheckCircle className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={(e) => handleDelete(notif.id, e)}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                    title="Dismiss notification"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
