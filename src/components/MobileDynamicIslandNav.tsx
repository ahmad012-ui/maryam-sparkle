import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Sparkles, Heart, ShoppingBag, User } from 'lucide-react';

interface MobileDynamicIslandNavProps {
  cartCount: number;
  wishlistCount: number;
}

export const MobileDynamicIslandNav: React.FC<MobileDynamicIslandNavProps> = ({
  cartCount,
  wishlistCount,
}) => {
  const location = useLocation();
  const currentPath = location.pathname;

  // Active route helpers
  const isHomeActive = currentPath === '/';
  const isShopActive =
    currentPath.startsWith('/shop') ||
    currentPath.startsWith('/product') ||
    currentPath.startsWith('/custom-orders');
  const isWishlistActive = currentPath === '/wishlist';
  const isCartActive = currentPath === '/cart' || currentPath === '/checkout';
  const isAccountActive =
    currentPath === '/account' || currentPath === '/login' || currentPath === '/register';

  const navItems = [
    {
      id: 'home',
      label: 'Home',
      path: '/',
      icon: Home,
      isActive: isHomeActive,
      badge: 0,
    },
    {
      id: 'shop',
      label: 'Shop',
      path: '/shop',
      icon: Sparkles,
      isActive: isShopActive,
      badge: 0,
    },
    {
      id: 'wishlist',
      label: 'Wishlist',
      path: '/wishlist',
      icon: Heart,
      isActive: isWishlistActive,
      badge: wishlistCount,
    },
    {
      id: 'cart',
      label: 'Cart',
      path: '/cart',
      icon: ShoppingBag,
      isActive: isCartActive,
      badge: cartCount,
    },
    {
      id: 'account',
      label: 'Account',
      path: '/account',
      icon: User,
      isActive: isAccountActive,
      badge: 0,
    },
  ];

  return (
    <nav
      aria-label="Mobile Navigation"
      className="fixed left-1/2 -translate-x-1/2 z-40 sm:hidden w-[92%] max-w-[440px] h-[66px] rounded-[33px] bg-[#fdfaf5]/95 backdrop-blur-md border border-[#e0d8c8]/90 shadow-[0_12px_32px_-4px_rgba(45,90,97,0.18),0_4px_12px_rgba(0,0,0,0.06)] px-3 py-1.5 transition-all duration-300"
      style={{
        bottom: 'calc(0.75rem + env(safe-area-inset-bottom, 0px))',
      }}
    >
      <div className="grid grid-cols-5 h-full items-center justify-items-center">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = item.isActive;

          return (
            <Link
              key={item.id}
              to={item.path}
              className={`relative flex flex-col items-center justify-center w-full h-full py-1 group transition-all duration-200 select-none ${
                active ? 'text-[#2d5a61]' : 'text-[#666666] hover:text-[#2d5a61]'
              }`}
              aria-label={item.label}
              aria-current={active ? 'page' : undefined}
            >
              {/* Icon Container with Badge */}
              <div className="relative flex items-center justify-center">
                <Icon
                  className={`w-5 h-5 transition-transform duration-200 ${
                    active ? 'scale-110 stroke-[2.2]' : 'group-hover:scale-105 stroke-[1.6]'
                  }`}
                />

                {/* Dynamic Badge */}
                {item.badge > 0 && (
                  <span
                    className={`absolute -top-1.5 -right-2 min-w-[15px] h-[15px] px-0.5 rounded-full text-[9px] font-bold flex items-center justify-center shadow-xs leading-none ${
                      item.id === 'wishlist'
                        ? 'bg-[#D4B982] text-[#1e3c41]'
                        : 'bg-[#2d5a61] text-white'
                    }`}
                  >
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                )}
              </div>

              {/* Label */}
              <span
                className={`text-[10px] tracking-tight mt-1 leading-none transition-colors ${
                  active ? 'font-bold text-[#2d5a61]' : 'font-medium text-[#666666]'
                }`}
              >
                {item.label}
              </span>

              {/* Active Indicator Dot */}
              <span
                className={`w-1 h-1 rounded-full transition-all duration-200 mt-0.5 ${
                  active ? 'bg-[#2d5a61] opacity-100 scale-100' : 'bg-transparent opacity-0 scale-0'
                }`}
              />
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
