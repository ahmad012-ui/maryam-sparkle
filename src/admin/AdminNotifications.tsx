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
} from 'lucide-react';
import { AdminNotification, AdminTab } from './types';

interface AdminNotificationsProps {
  notifications: AdminNotification[];
  onSaveNotifications: (notifs: AdminNotification[]) => void;
  onNavigateTab: (tab: AdminTab) => void;
}

export const AdminNotifications: React.FC<AdminNotificationsProps> = ({
  notifications,
  onSaveNotifications,
  onNavigateTab,
}) => {
  const [filterType, setFilterType] = useState<string>('All');
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const filtered = notifications.filter((n) => {
    const matchesType = filterType === 'All' || n.type === filterType;
    const matchesRead = !showUnreadOnly || !n.isRead;
    return matchesType && matchesRead;
  });

  const handleMarkAllAsRead = () => {
    onSaveNotifications(notifications.map((n) => ({ ...n, isRead: true })));
  };

  const handleMarkAsRead = (id: string) => {
    onSaveNotifications(
      notifications.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const handleDelete = (id: string) => {
    onSaveNotifications(notifications.filter((n) => n.id !== id));
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
            Real-time triggers for incoming orders, WhatsApp bespoke inquiries, and bead stock limits.
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            className="px-4 py-2 rounded-xl text-xs font-semibold border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center gap-2 shadow-2xs"
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
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-colors ${
                filterType === type
                  ? 'bg-[#2d5a61] text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {type === 'All' ? 'All Alerts' : type === 'order' ? 'Orders' : type === 'custom' ? 'Bespoke' : type}
            </button>
          ))}
        </div>

        <label className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300 cursor-pointer">
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
          filtered.map((notif) => (
            <div
              key={notif.id}
              className={`p-4 rounded-2xl border transition-all flex items-start justify-between gap-4 ${
                notif.isRead
                  ? 'bg-white dark:bg-[#1a1e24] border-gray-200/80 dark:border-gray-800 opacity-80 hover:opacity-100'
                  : 'bg-teal-50/40 dark:bg-teal-950/20 border-teal-200/80 dark:border-teal-800 shadow-2xs'
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-white dark:bg-gray-800 border border-gray-200/80 dark:border-gray-700 flex items-center justify-center shrink-0 shadow-2xs mt-0.5">
                  {getIcon(notif.type)}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-xs sm:text-sm text-gray-900 dark:text-white">
                      {notif.title}
                    </h4>
                    {!notif.isRead && (
                      <span className="w-2 h-2 rounded-full bg-[#2d5a61]" />
                    )}
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                    {notif.message}
                  </p>
                  <div className="flex items-center gap-3 pt-1 text-[11px] text-gray-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {notif.timestamp}
                    </span>
                    {notif.link && (
                      <button
                        onClick={() => {
                          if (notif.type === 'order') onNavigateTab('orders');
                          else if (notif.type === 'custom') onNavigateTab('custom-orders');
                          else if (notif.type === 'stock') onNavigateTab('products');
                        }}
                        className="text-[#2d5a61] dark:text-teal-400 font-semibold hover:underline"
                      >
                        Quick Action →
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                {!notif.isRead && (
                  <button
                    onClick={() => handleMarkAsRead(notif.id)}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-[#2d5a61] hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    title="Mark as read"
                  >
                    <CheckCircle className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => handleDelete(notif.id)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                  title="Dismiss notification"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
