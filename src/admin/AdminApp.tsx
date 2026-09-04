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

  // Domain data states
  const [products, setProducts] = useState<AdminProduct[]>(() => adminStorage.getProducts());
  const [orders, setOrders] = useState<AdminOrder[]>(() => adminStorage.getOrders());
  const [customOrders, setCustomOrders] = useState<AdminCustomOrder[]>(() => adminStorage.getCustomOrders());
  const [customers, setCustomers] = useState<AdminCustomer[]>(() => adminStorage.getCustomers());
  const [notifications, setNotifications] = useState<AdminNotification[]>(() => adminStorage.getNotifications());
  const [settings, setSettings] = useState<StoreSettings>(() => adminStorage.getSettings());

  // Sub-modal triggers
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [isAddCustomOrderOpen, setIsAddCustomOrderOpen] = useState(false);
  const [selectedOrderForModal, setSelectedOrderForModal] = useState<AdminOrder | null>(null);

  // Sync dark mode class to html document or root
  useEffect(() => {
    if (themeConfig.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [themeConfig.darkMode]);

  const handleUpdateTheme = (updated: AdminThemeConfig) => {
    setThemeConfig(updated);
    adminStorage.saveThemeConfig(updated);
  };

  const handleSaveProducts = (newProds: AdminProduct[]) => {
    setProducts(newProds);
    adminStorage.saveProducts(newProds);
  };

  const handleSaveOrders = (newOrders: AdminOrder[]) => {
    setOrders(newOrders);
    adminStorage.saveOrders(newOrders);
  };

  const handleSaveCustomOrders = (newCustom: AdminCustomOrder[]) => {
    setCustomOrders(newCustom);
    adminStorage.saveCustomOrders(newCustom);
  };

  const handleSaveCustomers = (newCust: AdminCustomer[]) => {
    setCustomers(newCust);
    adminStorage.saveCustomers(newCust);
  };

  const handleSaveNotifications = (newNotifs: AdminNotification[]) => {
    setNotifications(newNotifs);
    adminStorage.saveNotifications(newNotifs);
  };

  const handleSaveSettings = (newSettings: StoreSettings) => {
    setSettings(newSettings);
    adminStorage.saveSettings(newSettings);
  };

  const handleResetDefaults = () => {
    adminStorage.resetToDefaults();
    setProducts(adminStorage.getProducts());
    setOrders(adminStorage.getOrders());
    setCustomOrders(adminStorage.getCustomOrders());
    setCustomers(adminStorage.getCustomers());
    setNotifications(adminStorage.getNotifications());
    setSettings(adminStorage.getSettings());
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <AdminLayout
      activeTab={activeTab}
      onSelectTab={setActiveTab}
      themeConfig={themeConfig}
      onUpdateTheme={handleUpdateTheme}
      onBackToStore={onBackToStore}
      unreadNotificationsCount={unreadCount}
    >
      {activeTab === 'dashboard' && (
        <AdminDashboard
          orders={orders}
          customOrders={customOrders}
          products={products}
          onNavigateTab={setActiveTab}
          onOpenNewProduct={() => {
            setActiveTab('products');
            setIsAddProductOpen(true);
          }}
          onOpenNewCustomOrder={() => {
            setActiveTab('custom-orders');
            setIsAddCustomOrderOpen(true);
          }}
          onSelectOrder={(ord) => {
            setSelectedOrderForModal(ord);
            setActiveTab('orders');
          }}
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
        />
      )}

      {activeTab === 'customers' && (
        <AdminCustomers
          customers={customers}
          onSaveCustomers={handleSaveCustomers}
        />
      )}

      {activeTab === 'notifications' && (
        <AdminNotifications
          notifications={notifications}
          onSaveNotifications={handleSaveNotifications}
          onNavigateTab={setActiveTab}
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
