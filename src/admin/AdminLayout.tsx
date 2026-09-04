import React, { useState } from 'react';
import {
  LayoutDashboard,
  Gem,
  ShoppingBag,
  Sparkles,
  Users,
  Bell,
  Settings,
  Sliders,
  ExternalLink,
  Menu,
  X,
  Search,
  Moon,
  Sun,
  ChevronRight,
  ShieldCheck,
  Package,
} from 'lucide-react';
import { AdminTab, AdminThemeConfig } from './types';
import { AdminConfigurator } from './AdminConfigurator';

interface AdminLayoutProps {
  activeTab: AdminTab;
  onSelectTab: (tab: AdminTab) => void;
  themeConfig: AdminThemeConfig;
  onUpdateTheme: (config: AdminThemeConfig) => void;
  onBackToStore: () => void;
  unreadNotificationsCount?: number;
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  activeTab,
  onSelectTab,
  themeConfig,
  onUpdateTheme,
  onBackToStore,
  unreadNotificationsCount = 0,
  children,
}) => {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isConfiguratorOpen, setIsConfiguratorOpen] = useState(false);

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

  // Map themeConfig.sidebarColor to active button classes
  const getSidebarActiveColor = () => {
    switch (themeConfig.sidebarColor) {
      case 'primary': // Dark Teal / Gold
        return 'bg-[#2d5a61] text-white shadow-md shadow-[#2d5a61]/25';
      case 'dark':
        return 'bg-gray-900 text-white shadow-md shadow-gray-900/25';
      case 'info':
        return 'bg-sky-600 text-white shadow-md shadow-sky-600/25';
      case 'success':
        return 'bg-emerald-600 text-white shadow-md shadow-emerald-600/25';
      case 'warning':
        return 'bg-[#c59d5f] text-white shadow-md shadow-[#c59d5f]/25';
      case 'danger':
        return 'bg-rose-600 text-white shadow-md shadow-rose-600/25';
      default:
        return 'bg-[#2d5a61] text-white shadow-md shadow-[#2d5a61]/25';
    }
  };

  // Map themeConfig.sidenavType to sidebar background
  const getSidebarBgClass = () => {
    if (themeConfig.sidenavType === 'bg-white') {
      return 'bg-white text-gray-800 border-r border-gray-200 shadow-sm dark:bg-[#1a1e24] dark:border-gray-800 dark:text-gray-100';
    }
    if (themeConfig.sidenavType === 'transparent') {
      return 'bg-transparent text-gray-800 border-r border-gray-200/50 dark:border-gray-800/50 dark:text-gray-100';
    }
    // Default dark
    return 'bg-gray-950 text-gray-100 border-r border-gray-800/80';
  };

  const currentTabTitle =
    navItems.find((item) => item.id === activeTab)?.label || 'Dashboard';

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
        } ${getSidebarBgClass()}`}
      >
        {/* Sidebar Brand Header */}
        <div className="p-6 flex items-center justify-between border-b border-gray-200/20 dark:border-gray-800/60">
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
                    ? getSidebarActiveColor()
                    : 'text-gray-400 hover:text-gray-900 hover:bg-gray-100/70 dark:hover:text-white dark:hover:bg-gray-800/50'
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

        {/* Bottom Sidebar Controls: Storefront & Configurator */}
        <div className="p-4 border-t border-gray-200/20 dark:border-gray-800/60 space-y-2">
          <button
            onClick={onBackToStore}
            className="w-full py-2.5 px-3 rounded-xl text-xs font-semibold bg-gray-100 dark:bg-gray-800/70 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>View Public Storefront</span>
          </button>
          <button
            onClick={() => setIsConfiguratorOpen(true)}
            className="w-full py-2 px-3 rounded-xl text-xs font-semibold text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors flex items-center justify-center gap-1.5"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Material Theme Controls</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-72">
        {/* Top Navbar */}
        <header
          className={`sticky top-0 z-30 px-4 sm:px-8 py-3.5 flex items-center justify-between border-b transition-colors ${
            themeConfig.navbarFixed
              ? themeConfig.darkMode
                ? 'bg-[#121519]/90 backdrop-blur-md border-gray-800'
                : 'bg-white/90 backdrop-blur-md border-gray-200/80 shadow-2xs'
              : 'border-transparent'
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

          {/* Right: Quick Actions (Theme toggle, Notifications, Configurator, Back to Store) */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Quick Dark Mode Toggle */}
            <button
              onClick={() =>
                onUpdateTheme({
                  ...themeConfig,
                  darkMode: !themeConfig.darkMode,
                })
              }
              className="p-2 rounded-xl text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              title="Toggle Dark / Light Mode"
            >
              {themeConfig.darkMode ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4" />
              )}
            </button>

            {/* Notifications Shortcut */}
            <button
              onClick={() => onSelectTab('notifications')}
              className="relative p-2 rounded-xl text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              title="Studio Alerts"
            >
              <Bell className="w-4 h-4" />
              {unreadNotificationsCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500" />
              )}
            </button>

            {/* Theme Configurator Toggle */}
            <button
              onClick={() => setIsConfiguratorOpen(true)}
              className="p-2 rounded-xl text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              title="Dashboard Color & Sidenav Settings"
            >
              <Sliders className="w-4 h-4" />
            </button>

            {/* Back to Store Button */}
            <button
              onClick={onBackToStore}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#2d5a61] text-white hover:bg-[#1e3c41] transition-colors shadow-2xs"
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

      {/* Material Dashboard Configurator Drawer */}
      <AdminConfigurator
        isOpen={isConfiguratorOpen}
        onClose={() => setIsConfiguratorOpen(false)}
        config={themeConfig}
        onChange={onUpdateTheme}
      />
    </div>
  );
};
