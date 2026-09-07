import React, { useState } from 'react';
import {
  Settings,
  Save,
  CheckCircle2,
  Sparkles,
  Truck,
  CreditCard,
  Shield,
  RotateCcw,
  Download,
  Upload,
} from 'lucide-react';
import { StoreSettings } from './types';
import { adminStorage } from './adminData';
import { MultiImageUpload } from './MultiImageUpload';

interface AdminSettingsProps {
  settings: StoreSettings;
  onSaveSettings: (settings: StoreSettings) => void;
  onResetToDefaults: () => void;
}

export const AdminSettings: React.FC<AdminSettingsProps> = ({
  settings,
  onSaveSettings,
  onResetToDefaults,
}) => {
  const [formData, setFormData] = useState<StoreSettings>({ ...settings });
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings(formData);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleExportData = () => {
    const data = {
      products: adminStorage.getProducts(),
      orders: adminStorage.getOrders(),
      customOrders: adminStorage.getCustomOrders(),
      customers: adminStorage.getCustomers(),
      settings: formData,
      exportedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `maryam-sparkle-admin-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white dark:bg-[#1a1e24] p-5 sm:p-6 rounded-2xl border border-gray-200/80 dark:border-gray-800 shadow-2xs">
        <div>
          <h2 className="font-serif text-xl sm:text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Settings className="w-5 h-5 text-[#2d5a61] dark:text-teal-400" />
            Studio & Store Configuration
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
            Shipping rates, JazzCash/Easypaisa payment details, WhatsApp business number, and store policies.
          </p>
        </div>
        {isSaved && (
          <div className="px-3.5 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 text-xs font-semibold flex items-center gap-1.5 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Settings Saved!</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Studio Brand & Contact */}
        <div className="bg-white dark:bg-[#1a1e24] p-5 sm:p-6 rounded-2xl border border-gray-200/80 dark:border-gray-800 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-gray-100 dark:border-gray-800">
            <Sparkles className="w-4 h-4 text-[#c59d5f]" />
            <h3 className="font-serif text-base font-bold text-gray-900 dark:text-white">
              Studio Identity & Contact Info
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-gray-700 dark:text-gray-200 mb-1">
                Store Brand Name
              </label>
              <input
                type="text"
                value={formData.storeName}
                onChange={(e) => setFormData({ ...formData, storeName: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block font-semibold text-gray-700 dark:text-gray-200 mb-1">
                Artisan Tagline
              </label>
              <input
                type="text"
                value={formData.tagline}
                onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 dark:text-gray-200 mb-1">
                WhatsApp Hotline
              </label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block font-semibold text-gray-700 dark:text-gray-200 mb-1">
                Studio Email Address
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-gray-700 dark:text-gray-200 mb-1">
                Physical Workshop / Return Address
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>
          </div>
        </div>

        {/* Shipping & Delivery Options */}
        <div className="bg-white dark:bg-[#1a1e24] p-5 sm:p-6 rounded-2xl border border-gray-200/80 dark:border-gray-800 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-gray-100 dark:border-gray-800">
            <Truck className="w-4 h-4 text-[#2d5a61] dark:text-teal-400" />
            <h3 className="font-serif text-base font-bold text-gray-900 dark:text-white">
              Logistics & Courier Delivery
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-gray-700 dark:text-gray-200 mb-1">
                Standard Shipping Rate (PKR)
              </label>
              <input
                type="number"
                value={formData.shippingFee}
                onChange={(e) =>
                  setFormData({ ...formData, shippingFee: Number(e.target.value) })
                }
                className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block font-semibold text-gray-700 dark:text-gray-200 mb-1">
                Free Delivery Over (PKR)
              </label>
              <input
                type="number"
                value={formData.freeShippingThreshold}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    freeShippingThreshold: Number(e.target.value),
                  })
                }
                className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block font-semibold text-gray-700 dark:text-gray-200 mb-1">
                Estimated Delivery Window
              </label>
              <input
                type="text"
                value={formData.deliveryDays}
                onChange={(e) => setFormData({ ...formData, deliveryDays: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>
          </div>
        </div>

        {/* Payment Channels */}
        <div className="bg-white dark:bg-[#1a1e24] p-5 sm:p-6 rounded-2xl border border-gray-200/80 dark:border-gray-800 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-gray-100 dark:border-gray-800">
            <CreditCard className="w-4 h-4 text-[#c59d5f]" />
            <h3 className="font-serif text-base font-bold text-gray-900 dark:text-white">
              Payment Methods & Accounts
            </h3>
          </div>

          <div className="space-y-3 text-xs">
            <label className="flex items-center justify-between p-3 rounded-xl border border-gray-200 dark:border-gray-800 hover:bg-gray-50/50 dark:hover:bg-gray-800/40 cursor-pointer">
              <div>
                <span className="font-bold text-gray-900 dark:text-white block">
                  Cash on Delivery (COD)
                </span>
                <span className="text-gray-400">Allow customers to pay the courier upon receipt</span>
              </div>
              <input
                type="checkbox"
                checked={formData.codEnabled}
                onChange={(e) => setFormData({ ...formData, codEnabled: e.target.checked })}
                className="rounded text-[#2d5a61] w-4 h-4"
              />
            </label>

            <div className="p-3 rounded-xl border border-gray-200 dark:border-gray-800 space-y-3">
              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <span className="font-bold text-gray-900 dark:text-white block">JazzCash Payment</span>
                  <span className="text-gray-400">Accept direct mobile wallet transfers</span>
                </div>
                <input
                  type="checkbox"
                  checked={formData.jazzCashEnabled}
                  onChange={(e) =>
                    setFormData({ ...formData, jazzCashEnabled: e.target.checked })
                  }
                  className="rounded text-[#2d5a61] w-4 h-4"
                />
              </label>
              {formData.jazzCashEnabled && (
                <input
                  type="text"
                  placeholder="JazzCash Account Number (e.g. 0300-1234567)"
                  value={formData.jazzCashNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, jazzCashNumber: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              )}
            </div>

            <div className="p-3 rounded-xl border border-gray-200 dark:border-gray-800 space-y-3">
              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <span className="font-bold text-gray-900 dark:text-white block">Easypaisa Payment</span>
                  <span className="text-gray-400">Accept Telenor Easypaisa wallet transfers</span>
                </div>
                <input
                  type="checkbox"
                  checked={formData.easypaisaEnabled}
                  onChange={(e) =>
                    setFormData({ ...formData, easypaisaEnabled: e.target.checked })
                  }
                  className="rounded text-[#2d5a61] w-4 h-4"
                />
              </label>
              {formData.easypaisaEnabled && (
                <input
                  type="text"
                  placeholder="Easypaisa Account Number (e.g. 0345-1234567)"
                  value={formData.easypaisaNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, easypaisaNumber: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              )}
            </div>
          </div>
        </div>

        {/* Lookbook & Store Banners Photography */}
        <div className="bg-white dark:bg-[#1a1e24] p-5 sm:p-6 rounded-2xl border border-gray-200/80 dark:border-gray-800 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-gray-100 dark:border-gray-800">
            <Sparkles className="w-4 h-4 text-[#c59d5f]" />
            <h3 className="font-serif text-base font-bold text-gray-900 dark:text-white">
              Studio Hero Banners & Lookbook Photography
            </h3>
          </div>

          <MultiImageUpload
            images={formData.bannerImages || []}
            onChange={(newImages) =>
              setFormData({ ...formData, bannerImages: newImages })
            }
            maxImages={6}
            label="Storefront Banners & Editorial Pictures (Multiple Upload)"
            description="Upload seasonal collection hero pictures, Instagram lookbook captures, or studio artisan craft shots."
          />
        </div>

        {/* Save Button */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExportData}
              className="px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-xs font-semibold flex items-center gap-1.5 hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Backup Store Data (JSON)</span>
            </button>
            <button
              type="button"
              onClick={() => {
                if (
                  confirm(
                    'Reset all studio data (products, orders, bespoke inquiries) to initial factory sample dataset?'
                  )
                ) {
                  onResetToDefaults();
                }
              }}
              className="px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-center gap-1.5 hover:bg-rose-50 dark:hover:bg-rose-950/30"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restore Demo Data</span>
            </button>
          </div>

          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-[#2d5a61] text-white text-xs font-semibold hover:bg-[#1e3c41] flex items-center gap-2 shadow-xs"
          >
            <Save className="w-4 h-4" />
            <span>Save All Configuration</span>
          </button>
        </div>
      </form>
    </div>
  );
};
