import React, { useState, useRef, useEffect } from 'react';
import {
  LayoutDashboard,
  Gem,
  ShoppingBag,
  Sparkles,
  Users,
  Bell,
  Settings,
  ExternalLink,
  Menu,
  X,
  Moon,
  Sun,
  ChevronRight,
  Package,
  CheckCheck,
  ArrowRight,
  AlertTriangle,
  Info,
} from 'lucide-react';
import { AdminTab, AdminThemeConfig, AdminNotification } from './types';

interface AdminLayoutProps {
  activeTab: AdminTab;
  onSelectTab: (tab: AdminTab) => void;
  themeConfig: AdminThemeConfig;
  onUpdateTheme: (config: AdminThemeConfig) => void;
  onBackToStore: () => void;
  unreadNotificationsCount?: number;
  notifications?: AdminNotification[];
  onNotificationClick?: (notif: AdminNotification) => void;
  onMarkAllNotificationsAsRead?: () => void;
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  activeTab,
  onSelectTab,
  themeConfig,
  onUpdateTheme,
  onBackToStore,
  unreadNotificationsCount = 0,
  notifications = [],
  onNotificationClick,
  onMarkAllNotificationsAsRead,
  children,
}) => {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const notifDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        notifDropdownRef.current &&
        !notifDropdownRef.current.contains(event.target as Node)
      ) {
        setIsNotificationsOpen(false);
      }
    };
    if (isNotificationsOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isNotificationsOpen]);

  const navItems = [
    {
      id: 'dashboard' as AdminTab,
      label: 'Studio Dashboard',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'products' as AdminTab,
      label: 'Jewelry Inventory',
      icon: Gem,
      badge: null,
    },
    {
      id: 'orders' as AdminTab,
      label: 'Store Dispatches',
      icon: ShoppingBag,
      badge: null,
    },
    {
      id: 'custom-orders' as AdminTab,
      label: 'Bespoke Requests',
      icon: Sparkles,
      badge: 'Atelier',
    },
    {
      id: 'customers' as AdminTab,
      label: 'Patrons & Clients',
      icon: Users,
      badge: null,
    },
    {
      id: 'notifications' as AdminTab,
      label: 'Studio Alerts',
      icon: Bell,
      badge: unreadNotificationsCount > 0 ? `${unreadNotificationsCount}` : null,
    },
    {
      id: 'settings' as AdminTab,
      label: 'Store Settings',
      icon: Settings,
      badge: null,
    },
  ];

  const currentTabTitle =
    navItems.find((item) => item.id === activeTab)?.label || 'Dashboard';

  const getNotifIcon = (type: AdminNotification['type']) => {
    switch (type) {
      case 'order':
        return <ShoppingBag className="w-3.5 h-3.5 text-[#2d5a61] dark:text-teal-400" />;
      case 'custom':
        return <Sparkles className="w-3.5 h-3.5 text-[#c59d5f]" />;
      case 'stock':
        return <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />;
      default:
        return <Info className="w-3.5 h-3.5 text-sky-500" />;
    }
  };

  return (
    <div
      className={`min-h-screen ${
        themeConfig.darkMode ? 'dark bg-[#121519] text-gray-100' : 'bg-[#f8f9fa] text-gray-800'
      } flex transition-colors duration-200`}
    >
      {/* Mobile Backdrop */}
      {isMobileNavOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs lg:hidden"
          onClick={() => setIsMobileNavOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isMobileNavOpen ? 'translate-x-0' : '-translate-x-full'
        } bg-gray-950 text-gray-100 border-r border-gray-800/80`}
      >
        {/* Sidebar Brand Header */}
        <div className="p-6 flex items-center justify-between border-b border-gray-800/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#2d5a61] to-[#c59d5f] text-white flex items-center justify-center font-serif text-lg font-bold shadow-md">
              MS
            </div>
            <div>
              <h1 className="font-serif text-base font-bold tracking-wider uppercase leading-tight">
                Maryam Sparkle
              </h1>
              <span className="text-[10px] tracking-widest text-[#c59d5f] font-semibold uppercase block">
                Artisan Admin Studio
              </span>
            </div>
          </div>
          <button
            onClick={() => setIsMobileNavOpen(false)}
            className="lg:hidden p-1.5 rounded-lg text-gray-400 hover:text-gray-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 px-4 py-5 overflow-y-auto space-y-1">
          <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-gray-400/80 mb-2">
            Store Management
          </p>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectTab(item.id);
                  setIsMobileNavOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-[#2d5a61] text-white shadow-md shadow-[#2d5a61]/25'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-[#c59d5f]/20 text-[#c59d5f]'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Bottom Sidebar Controls: Storefront */}
        <div className="p-4 border-t border-gray-800/60 space-y-2">
          <button
            onClick={onBackToStore}
            className="w-full py-2.5 px-3 rounded-xl text-xs font-semibold bg-gray-900 text-gray-200 hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 border border-gray-800"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>View Public Storefront</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-72">
        {/* Top Navbar */}
        <header
          className={`sticky top-0 z-30 px-4 sm:px-8 py-3.5 flex items-center justify-between border-b transition-colors ${
            themeConfig.darkMode
              ? 'bg-[#121519]/90 backdrop-blur-md border-gray-800'
              : 'bg-white/90 backdrop-blur-md border-gray-200/80 shadow-2xs'
          }`}
        >
          {/* Left: Breadcrumbs & Mobile Menu Button */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileNavOpen(true)}
              className="lg:hidden p-2 rounded-xl border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-300"
            >
              <Menu className="w-5 h-5" />
            </button>

            <nav className="flex items-center text-xs text-gray-400 gap-1.5">
              <span>Admin</span>
              <ChevronRight className="w-3.5 h-3.5" />
              <span className="font-semibold text-gray-800 dark:text-gray-200">
                {currentTabTitle}
              </span>
            </nav>
          </div>

          {/* Right: Quick Actions (Theme toggle, Notifications, Back to Store) */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Quick Dark Mode Toggle */}
            <button
              onClick={() =>
                onUpdateTheme({
                  ...themeConfig,
                  darkMode: !themeConfig.darkMode,
                })
              }
              className="p-2 rounded-xl text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
              title="Toggle Dark / Light Mode"
            >
              {themeConfig.darkMode ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4" />
              )}
            </button>

            {/* Notifications Dropdown Container */}
            <div className="relative" ref={notifDropdownRef}>
              <button
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className="relative p-2 rounded-xl text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                title="Studio Alerts"
              >
                <Bell className="w-4 h-4" />
                {unreadNotificationsCount > 0 && (
                  <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center animate-pulse">
                    {unreadNotificationsCount > 9 ? '9+' : unreadNotificationsCount}
                  </span>
                )}
              </button>

              {/* Notification Popover Dropdown */}
              {isNotificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-[#1a1e24] rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 z-50 overflow-hidden animate-fade-in">
                  <div className="p-3.5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4 text-[#2d5a61] dark:text-teal-400" />
                      <span className="font-semibold text-xs text-gray-900 dark:text-white">
                        Studio Alerts
                      </span>
                      {unreadNotificationsCount > 0 && (
                        <span className="text-[10px] font-bold bg-[#2d5a61] text-white px-2 py-0.2 rounded-full">
                          {unreadNotificationsCount} new
                        </span>
                      )}
                    </div>
                    {unreadNotificationsCount > 0 && onMarkAllNotificationsAsRead && (
                      <button
                        onClick={() => {
                          onMarkAllNotificationsAsRead();
                        }}
                        className="text-[11px] text-[#2d5a61] dark:text-teal-400 hover:underline flex items-center gap-1 font-medium"
                      >
                        <CheckCheck className="w-3.5 h-3.5" />
                        <span>Mark read</span>
                      </button>
                    )}
                  </div>

                  <div className="max-h-80 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-800">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-xs text-gray-400">
                        No alerts at this moment.
                      </div>
                    ) : (
                      notifications.slice(0, 5).map((notif) => {
                        const isRead = Boolean(notif.read || notif.isRead);
                        return (
                          <div
                            key={notif.id}
                            onClick={() => {
                              setIsNotificationsOpen(false);
                              if (onNotificationClick) {
                                onNotificationClick(notif);
                              } else {
                                onSelectTab(notif.linkTab || 'orders');
                              }
                            }}
                            className={`p-3.5 hover:bg-gray-50 dark:hover:bg-gray-800/60 cursor-pointer transition-colors flex items-start gap-3 ${
                              !isRead
                                ? 'bg-teal-50/50 dark:bg-teal-950/20'
                                : ''
                            }`}
                          >
                            <div className="w-7 h-7 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center shrink-0 mt-0.5">
                              {getNotifIcon(notif.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-1">
                                <p className="text-xs font-semibold text-gray-900 dark:text-white truncate">
                                  {notif.title}
                                </p>
                                <span className="text-[10px] text-gray-400 shrink-0">
                                  {notif.timestamp}
                                </span>
                              </div>
                              <p className="text-[11px] text-gray-500 dark:text-gray-400 line-clamp-2 mt-0.5 leading-tight">
                                {notif.message}
                              </p>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  <div className="p-2.5 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-800 text-center">
                    <button
                      onClick={() => {
                        setIsNotificationsOpen(false);
                        onSelectTab('notifications');
                      }}
                      className="text-xs font-semibold text-[#2d5a61] dark:text-teal-400 hover:underline flex items-center justify-center gap-1 w-full"
                    >
                      <span>View All Studio Alerts ({notifications.length})</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Back to Store Button */}
            <button
              onClick={onBackToStore}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#2d5a61] text-white hover:bg-[#1e3c41] transition-colors shadow-2xs cursor-pointer"
            >
              <Package className="w-3.5 h-3.5" />
              <span>Exit to Store</span>
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

