import React from 'react';
import { X, Moon, Sun, Pin, Palette, Check } from 'lucide-react';
import { AdminThemeConfig, SidebarColor, SidenavType } from './types';

interface AdminConfiguratorProps {
  isOpen: boolean;
  onClose: () => void;
  config: AdminThemeConfig;
  onChange: (newConfig: AdminThemeConfig) => void;
}

export const AdminConfigurator: React.FC<AdminConfiguratorProps> = ({
  isOpen,
  onClose,
  config,
  onChange,
}) => {
  if (!isOpen) return null;

  const colorOptions: { id: SidebarColor; name: string; bg: string }[] = [
    { id: 'teal', name: 'Artisan Teal', bg: 'bg-[#2d5a61]' },
    { id: 'gold', name: 'Sparkle Gold', bg: 'bg-[#c59d5f]' },
    { id: 'dark', name: 'Midnight Slate', bg: 'bg-[#1e293b]' },
    { id: 'emerald', name: 'Emerald Gem', bg: 'bg-[#059669]' },
    { id: 'rose', name: 'Rose Petal', bg: 'bg-[#e11d48]' },
    { id: 'navy', name: 'Sapphire Navy', bg: 'bg-[#2563eb]' },
  ];

  const handleColorSelect = (color: SidebarColor) => {
    onChange({ ...config, sidebarColor: color });
  };

  const handleSidenavTypeSelect = (type: SidenavType) => {
    onChange({ ...config, sidenavType: type });
  };

  const handleDarkModeToggle = () => {
    onChange({ ...config, darkMode: !config.darkMode });
  };

  const handleNavbarFixedToggle = () => {
    onChange({ ...config, navbarFixed: !config.navbarFixed });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div
          className={`w-screen max-w-sm shadow-2xl transition-all duration-300 ${
            config.darkMode ? 'bg-[#1a1e24] text-white border-l border-gray-800' : 'bg-white text-gray-800'
          }`}
        >
          {/* Header */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
            <div>
              <h3 className="font-serif text-lg font-semibold flex items-center gap-2">
                <Palette className="w-5 h-5 text-[#c59d5f]" />
                Studio Configurator
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Customize admin appearance & theme
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 dark:hover:text-gray-200 transition-colors"
              aria-label="Close configurator"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(100vh-80px)]">
            {/* Sidenav Accent Colors */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3">
                Sidebar Accent Palette
              </h4>
              <div className="flex items-center gap-2.5 flex-wrap">
                {colorOptions.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => handleColorSelect(c.id)}
                    title={c.name}
                    className={`w-8 h-8 rounded-full ${c.bg} flex items-center justify-center transition-all ${
                      config.sidebarColor === c.id
                        ? 'ring-3 ring-offset-2 ring-gray-400 scale-110 shadow-sm'
                        : 'opacity-85 hover:opacity-100 hover:scale-105'
                    }`}
                  >
                    {config.sidebarColor === c.id && (
                      <Check className="w-4 h-4 text-white drop-shadow-xs" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            <hr className="border-gray-100 dark:border-gray-800" />

            {/* Sidenav Type */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">
                Sidenav Background Style
              </h4>
              <p className="text-xs text-gray-400 mb-3">Choose the sidebar card surface</p>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleSidenavTypeSelect('white')}
                  className={`py-2 px-3 rounded-xl text-xs font-medium border transition-all ${
                    config.sidenavType === 'white'
                      ? 'bg-[#2d5a61] text-white border-[#2d5a61] shadow-xs'
                      : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  Pure White
                </button>
                <button
                  type="button"
                  onClick={() => handleSidenavTypeSelect('dark')}
                  className={`py-2 px-3 rounded-xl text-xs font-medium border transition-all ${
                    config.sidenavType === 'dark'
                      ? 'bg-[#2d5a61] text-white border-[#2d5a61] shadow-xs'
                      : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  Dark Slate
                </button>
                <button
                  type="button"
                  onClick={() => handleSidenavTypeSelect('transparent')}
                  className={`py-2 px-3 rounded-xl text-xs font-medium border transition-all ${
                    config.sidenavType === 'transparent'
                      ? 'bg-[#2d5a61] text-white border-[#2d5a61] shadow-xs'
                      : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  Glass
                </button>
              </div>
            </div>

            <hr className="border-gray-100 dark:border-gray-800" />

            {/* Navbar Fixed */}
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Sticky Navbar
                </h4>
                <p className="text-xs text-gray-400">Pin top navigation when scrolling</p>
              </div>
              <button
                type="button"
                onClick={handleNavbarFixedToggle}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                  config.navbarFixed ? 'bg-[#2d5a61]' : 'bg-gray-200 dark:bg-gray-700'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                    config.navbarFixed ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <hr className="border-gray-100 dark:border-gray-800" />

            {/* Dark / Light Version */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {config.darkMode ? (
                  <Moon className="w-4 h-4 text-amber-400" />
                ) : (
                  <Sun className="w-4 h-4 text-amber-500" />
                )}
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Studio Dark Mode
                  </h4>
                  <p className="text-xs text-gray-400">Night-friendly workspace</p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleDarkModeToggle}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                  config.darkMode ? 'bg-[#2d5a61]' : 'bg-gray-200 dark:bg-gray-700'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                    config.darkMode ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <hr className="border-gray-100 dark:border-gray-800" />

            {/* Quick Tips */}
            <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40">
              <div className="flex items-center gap-2 text-xs font-semibold text-amber-800 dark:text-amber-300 mb-1">
                <Pin className="w-3.5 h-3.5" />
                <span>Live Customization</span>
              </div>
              <p className="text-[11px] text-amber-700/90 dark:text-amber-400/90 leading-relaxed">
                Theme changes are instantly saved to browser storage and apply across all admin panels.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
