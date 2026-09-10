import React, { useState, useEffect } from 'react';
import { AdminLayout } from './AdminLayout';
import { AdminDashboard } from './AdminDashboard';
import { AdminProducts } from './AdminProducts';
import { AdminOrders } from './AdminOrders';
import { AdminCustomOrders } from './AdminCustomOrders';
import { AdminCustomers } from './AdminCustomers';
import { AdminNotifications } from './AdminNotifications';
import { AdminSettings } from './AdminSettings';
import {
  AdminTab,
  AdminThemeConfig,
  AdminProduct,
  AdminOrder,
  AdminCustomOrder,
  AdminCustomer,
  AdminNotification,
  StoreSettings,
} from './types';
import { adminStorage } from './adminData';

interface AdminAppProps {
  onBackToStore: () => void;
}

export const AdminApp: React.FC<AdminAppProps> = ({ onBackToStore }) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [themeConfig, setThemeConfig] = useState<AdminThemeConfig>(adminStorage.getThemeConfig());
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [customOrders, setCustomOrders] = useState<AdminCustomOrder[]>([]);
  const [customers, setCustomers] = useState<AdminCustomer[]>([]);
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [settings, setSettings] = useState<StoreSettings>(adminStorage.getSettings());
  const [isHydrating, setIsHydrating] = useState(true);

  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [isAddCustomOrderOpen, setIsAddCustomOrderOpen] = useState(false);
  const [selectedOrderForModal, setSelectedOrderForModal] = useState<AdminOrder | null>(null);
  const [selectedCustomOrderForModal, setSelectedCustomOrderForModal] = useState<AdminCustomOrder | null>(null);

  useEffect(() => {
    if (themeConfig.darkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [themeConfig.darkMode]);

  const refreshFromSupabase = async () => {
    try {
      const data = await adminStorage.hydrate();
      setProducts(data.products);
      setOrders(data.orders);
      setCustomOrders(data.customOrders);
      setCustomers(data.customers);
      setNotifications(data.notifications);
      setSettings(adminStorage.getSettings());
      setThemeConfig(adminStorage.getThemeConfig());
    } catch (error) {
      console.error('Failed to refresh admin data from Supabase:', error);
    }
  };

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const data = await adminStorage.hydrate();
        if (!active) return;
        setProducts(data.products);
        setOrders(data.orders);
        setCustomOrders(data.customOrders);
        setCustomers(data.customers);
        setNotifications(data.notifications);
        setSettings(adminStorage.getSettings());
        setThemeConfig(adminStorage.getThemeConfig());
      } catch (error) {
        console.error('Failed to hydrate admin data from Supabase:', error);
      } finally {
        if (active) setIsHydrating(false);
      }
    })();
    return () => { active = false; };
  }, []);

  const handleUpdateTheme = async (updated: AdminThemeConfig) => {
    setThemeConfig(updated);
    try { await adminStorage.saveThemeConfig(updated); }
    catch (error) { console.error('Failed to save admin theme:', error); }
  };

  const handleSaveProducts = async (newProds: AdminProduct[]) => {
    setProducts(newProds);
    try { await adminStorage.saveProducts(newProds); await refreshFromSupabase(); }
    catch (error) { console.error('Failed to save products:', error); }
  };

  const handleSaveOrders = async (newOrders: AdminOrder[]) => {
    setOrders(newOrders);
    try { await adminStorage.saveOrders(newOrders); await refreshFromSupabase(); }
    catch (error) { console.error('Failed to save orders:', error); }
  };

  const handleSaveCustomOrders = async (newCustom: AdminCustomOrder[]) => {
    setCustomOrders(newCustom);
    try { await adminStorage.saveCustomOrders(newCustom); await refreshFromSupabase(); }
    catch (error) { console.error('Failed to save custom orders:', error); }
  };

  const handleSaveCustomers = async (newCust: AdminCustomer[]) => {
    setCustomers(newCust);
    try { await adminStorage.saveCustomers(newCust); await refreshFromSupabase(); }
    catch (error) { console.error('Failed to save customers:', error); }
  };

  const handleSaveNotifications = async (newNotifs: AdminNotification[]) => {
    setNotifications(newNotifs);
    await adminStorage.saveNotifications(newNotifs);
  };

  const handleSaveSettings = async (newSettings: StoreSettings) => {
    setSettings(newSettings);
    try { await adminStorage.saveSettings(newSettings); }
    catch (error) { console.error('Failed to save store settings:', error); }
  };

  const handleResetDefaults = async () => {
    try {
      await adminStorage.resetToDefaults();
      setSettings(adminStorage.getSettings());
      setThemeConfig(adminStorage.getThemeConfig());
    } catch (error) {
      console.error('Failed to reset settings:', error);
    }
  };

  const handleNotificationClick = (notif: AdminNotification) => {
    const updatedNotifs = notifications.map((n) =>
      n.id === notif.id ? { ...n, read: true, isRead: true } : n
    );
    void handleSaveNotifications(updatedNotifs);

    if (notif.type === 'order' || notif.linkTab === 'orders') {
      let matchedOrder: AdminOrder | undefined;
      if (notif.targetId) matchedOrder = orders.find((o) => o.id === notif.targetId || o.orderNumber === notif.targetId);
      if (!matchedOrder) {
        const matchRegex = (notif.title + ' ' + notif.message).match(/MS-?\d+/i);
        if (matchRegex) {
          const rawNum = matchRegex[0].replace('#', '').toUpperCase();
          matchedOrder = orders.find((o) => o.orderNumber.toUpperCase().includes(rawNum));
        }
      }
      if (!matchedOrder) {
        matchedOrder = orders.find((o) =>
          (notif.title && notif.title.includes(o.customerName)) ||
          (notif.message && notif.message.includes(o.customerName))
        );
      }
      if (matchedOrder) setSelectedOrderForModal(matchedOrder);
      setActiveTab('orders');
      return;
    }

    if (notif.type === 'custom' || notif.linkTab === 'custom-orders') {
      let matchedCustomOrder: AdminCustomOrder | undefined;
      if (notif.targetId) matchedCustomOrder = customOrders.find((c) => c.id === notif.targetId || c.requestNumber === notif.targetId);
      if (!matchedCustomOrder) {
        const matchRegex = (notif.title + ' ' + notif.message).match(/REQ-?\w+/i);
        if (matchRegex) {
          const rawReq = matchRegex[0].toUpperCase();
          matchedCustomOrder = customOrders.find((c) => c.requestNumber.toUpperCase().includes(rawReq));
        }
      }
      if (!matchedCustomOrder) {
        matchedCustomOrder = customOrders.find((c) =>
          (notif.title && notif.title.includes(c.customerName)) ||
          (notif.message && notif.message.includes(c.customerName))
        );
      }
      if (matchedCustomOrder) setSelectedCustomOrderForModal(matchedCustomOrder);
      setActiveTab('custom-orders');
      return;
    }

    if (notif.type === 'stock' || notif.linkTab === 'products') {
      setActiveTab('products');
      return;
    }
    setActiveTab(notif.linkTab || 'dashboard');
  };

  const unreadCount = notifications.filter((n) => !n.read && !n.isRead).length;

  if (isHydrating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#101318] text-gray-500 dark:text-gray-300">
        Loading admin data…
      </div>
    );
  }

  return (
    <AdminLayout
      activeTab={activeTab}
      onSelectTab={setActiveTab}
      themeConfig={themeConfig}
      onUpdateTheme={handleUpdateTheme}
      onBackToStore={onBackToStore}
      unreadNotificationsCount={unreadCount}
      notifications={notifications}
      onNotificationClick={handleNotificationClick}
      onMarkAllNotificationsAsRead={() =>
        void handleSaveNotifications(notifications.map((n) => ({ ...n, read: true, isRead: true })))
      }
    >
      {activeTab === 'dashboard' && (
        <AdminDashboard
          orders={orders}
          customOrders={customOrders}
          products={products}
          onNavigateTab={setActiveTab}
          onOpenNewProduct={() => { setActiveTab('products'); setIsAddProductOpen(true); }}
          onOpenNewCustomOrder={() => { setActiveTab('custom-orders'); setIsAddCustomOrderOpen(true); }}
          onSelectOrder={(ord) => { setSelectedOrderForModal(ord); setActiveTab('orders'); }}
        />
      )}
      {activeTab === 'products' && (
        <AdminProducts
          products={products}
          onSaveProducts={handleSaveProducts}
          isAddModalOpen={isAddProductOpen}
          onCloseAddModal={() => setIsAddProductOpen(false)}
        />
      )}
      {activeTab === 'orders' && (
        <AdminOrders
          orders={orders}
          onSaveOrders={handleSaveOrders}
          selectedOrder={selectedOrderForModal}
          onClearSelectedOrder={() => setSelectedOrderForModal(null)}
        />
      )}
      {activeTab === 'custom-orders' && (
        <AdminCustomOrders
          customOrders={customOrders}
          onSaveCustomOrders={handleSaveCustomOrders}
          isAddModalOpen={isAddCustomOrderOpen}
          onCloseAddModal={() => setIsAddCustomOrderOpen(false)}
          selectedCustomOrder={selectedCustomOrderForModal}
          onClearSelectedCustomOrder={() => setSelectedCustomOrderForModal(null)}
        />
      )}
      {activeTab === 'customers' && <AdminCustomers customers={customers} onSaveCustomers={handleSaveCustomers} />}
      {activeTab === 'notifications' && (
        <AdminNotifications
          notifications={notifications}
          onSaveNotifications={handleSaveNotifications}
          onNavigateTab={setActiveTab}
          onNotificationClick={handleNotificationClick}
        />
      )}
      {activeTab === 'settings' && (
        <AdminSettings
          settings={settings}
          onSaveSettings={handleSaveSettings}
          onResetToDefaults={handleResetDefaults}
        />
      )}
    </AdminLayout>
  );
};
