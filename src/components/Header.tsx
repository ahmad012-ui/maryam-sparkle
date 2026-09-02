import React, { useState } from 'react';
import { 
  Menu, 
  Search, 
  ShoppingBag, 
  X, 
  Heart, 
  Sparkles, 
  Phone, 
  Mail, 
  Instagram, 
  ChevronRight, 
  Home, 
  Gem, 
  MessageCircle,
  Package,
  User,
  HelpCircle,
  ShieldCheck,
  RotateCcw
} from 'lucide-react';
import { Category } from '../types';
import { NavLink, Link, useNavigate, useLocation } from 'react-router-dom';

interface HeaderProps {
  cartCount: number;
  cartTotal: number;
  wishlistCount: number;
  categories: Category[];
  onOpenCart: () => void;
  onOpenWishlist: () => void;
  onOpenSearch: () => void;
  onSelectCategory: (categorySlug: string | null) => void;
  onOpenCustomOrder: () => void;
  onOpenStory: () => void;
  onOpenCustomerCare: (tab?: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  cartCount,
  cartTotal,
  wishlistCount,
  categories,
  onOpenCart,
  onOpenWishlist,
  onOpenSearch,
  onSelectCategory,
  onOpenCustomOrder,
  onOpenStory,
  onOpenCustomerCare,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isShopExpanded, setIsShopExpanded] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  const handleCategoryClick = (slug: string | null) => {
    setIsMenuOpen(false);
    onSelectCategory(slug);
    if (slug) {
      navigate(`/shop?category=${slug}`);
    } else {
      navigate('/shop');
    }
  };

  return (
    <>
      {/* Top Announcement Utility Bar */}
      <div className="bg-[#2d5a61] text-[#fdfaf5] py-2 px-4 text-xs font-medium border-b border-[#24484e]">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Left: Contact Hotline & Track Order Shortcut */}
          <div className="hidden sm:flex items-center gap-4 text-[11px] text-white/90">
            <a 
              href="https://wa.me/923001234567" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 hover:text-[#D4B982] transition-colors"
            >
              <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span>WhatsApp: +92 300 1234567</span>
            </a>
            <span className="text-white/30">•</span>
            <Link 
              to="/track" 
              className="flex items-center gap-1 hover:text-[#D4B982] transition-colors text-white/95"
            >
              <Package className="w-3 h-3 text-[#D4B982]" />
              <span>Track Order</span>
            </Link>
          </div>

          {/* Center: Promo Announcement */}
          <div className="flex-1 sm:flex-initial text-center flex items-center justify-center gap-2">
            <Sparkles className="w-3 h-3 text-[#D4B982] shrink-0" />
            <span className="tracking-wide text-[11px] sm:text-xs">
              Free Delivery in Pakistan on orders over Rs. 3,000 • Code: <strong className="text-[#D4B982]">SPARKLE10</strong>
            </span>
            <Sparkles className="w-3 h-3 text-[#D4B982] shrink-0" />
          </div>

          {/* Right: Currency Indicator & Account */}
          <div className="hidden sm:flex items-center gap-3 text-[11px] text-white/90">
            <Link to="/account" className="hover:text-[#D4B982] flex items-center gap-1">
              <User className="w-3 h-3" />
              <span>My Account</span>
            </Link>
            <span className="text-white/30">•</span>
            <span className="bg-white/10 px-2 py-0.5 rounded text-[10px] font-semibold text-[#D4B982]">
              PKR (Rs.)
            </span>
          </div>
        </div>
      </div>

      {/* Main Simple Navbar: Menu on Left, Logo in Center, Actions on Right */}
      <header className="sticky top-0 z-40 bg-[#efe8dc]/95 backdrop-blur-md border-b border-[#e0d8c8]/80 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-3 items-center h-20 md:h-22">
            
            {/* Left: Minimalist Menu Button */}
            <div className="flex items-center justify-start gap-2">
              <button
                id="main-nav-menu-btn"
                onClick={() => setIsMenuOpen(true)}
                className="group flex items-center gap-2.5 px-3 py-2 rounded-full border border-[#e0d8c8] bg-white/70 hover:bg-white text-[#333333] hover:text-[#2d5a61] transition-all focus:outline-none cursor-pointer shadow-2xs"
                aria-label="Open Navigation Menu"
              >
                <Menu className="w-5 h-5 text-[#2d5a61] transition-transform group-hover:scale-110" strokeWidth={1.75} />
                <span className="text-xs font-semibold uppercase tracking-widest text-[#333333] group-hover:text-[#2d5a61]">
                  Menu
                </span>
              </button>
            </div>

            {/* Center: Brand Logo */}
            <div className="flex items-center justify-center text-center">
              <Link
                to="/"
                className="flex flex-col items-center justify-center focus:outline-none group cursor-pointer"
                aria-label="Maryam Sparkle Home"
              >
                {/* Geometric Diamond Emblem */}
                <div className="w-7 h-7 sm:w-8 sm:h-8 text-[#2d5a61] mb-0.5 relative transition-transform duration-300 group-hover:rotate-45">
                  <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                    <path d="M20 2L38 20L20 38L2 20L20 2Z" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M20 8L32 20L20 32L8 20L20 8Z" stroke="currentColor" strokeWidth="1" />
                    <circle cx="20" cy="20" r="3.5" fill="currentColor" />
                  </svg>
                </div>
                <span className="font-serif text-lg sm:text-xl md:text-2xl tracking-[0.25em] leading-tight text-[#2d5a61] font-normal">
                  MARYAM
                </span>
                <span className="text-[7px] sm:text-[8px] md:text-[9px] tracking-[0.35em] uppercase text-[#666666] font-medium">
                  Sparkle
                </span>
              </Link>
            </div>

            {/* Right: Minimalist Action Icons (Search, Wishlist, Bag, Account) */}
            <div className="flex items-center justify-end gap-2 sm:gap-3 md:gap-4 text-sm text-[#333333]">
              {/* Search Trigger */}
              <button
                id="search-header-btn"
                onClick={onOpenSearch}
                className="p-2 sm:p-2.5 rounded-full hover:text-[#2d5a61] bg-white/60 hover:bg-white border border-[#e0d8c8]/70 transition-colors focus:outline-none cursor-pointer flex items-center justify-center shadow-2xs"
                aria-label="Search jewelry"
                title="Search jewels"
              >
                <Search className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={1.75} />
              </button>

              {/* Wishlist Trigger */}
              <Link
                to="/wishlist"
                className="relative p-2 sm:p-2.5 rounded-full hover:text-[#2d5a61] bg-white/60 hover:bg-white border border-[#e0d8c8]/70 transition-colors focus:outline-none cursor-pointer flex items-center justify-center shadow-2xs"
                aria-label="Wishlist"
                title="Your Wishlist"
              >
                <Heart className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={1.75} />
                {wishlistCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#D4B982] text-[#1e3c41] text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                    {wishlistCount}
                  </span>
                )}
              </Link>

              {/* Shopping Bag Button */}
              <button
                id="cart-header-btn"
                onClick={onOpenCart}
                className="flex items-center gap-2 bg-white/90 border border-[#e0d8c8] hover:border-[#2d5a61]/50 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full font-medium hover:text-[#2d5a61] transition-all focus:outline-none shadow-2xs cursor-pointer"
                aria-label="Shopping bag"
              >
                <div className="relative">
                  <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 text-[#2d5a61]" strokeWidth={1.75} />
                  <span className="absolute -top-1.5 -right-2 bg-[#2d5a61] text-white text-[9px] font-bold min-w-[16px] h-[16px] px-0.5 rounded-full flex items-center justify-center shadow-xs">
                    {cartCount}
                  </span>
                </div>
                <div className="hidden md:flex flex-col text-left">
                  <span className="text-[9px] uppercase tracking-wider text-[#888888] leading-none">Bag</span>
                  <span className="text-xs font-serif font-medium text-[#2d5a61] leading-tight">
                    Rs. {cartTotal.toLocaleString()}
                  </span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Slide-out Menu Drawer for All Pages & Navigation */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity duration-300"
            onClick={() => setIsMenuOpen(false)}
          />

          {/* Drawer Panel */}
          <div className="relative w-full max-w-md bg-[#efe8dc] h-full shadow-2xl flex flex-col justify-between overflow-y-auto p-6 sm:p-8 z-10 border-r border-[#e0d8c8] animate-in slide-in-from-left duration-300">
            <div className="space-y-6">
              {/* Drawer Header */}
              <div className="flex items-center justify-between pb-5 border-b border-[#e0d8c8]">
                <div className="flex items-center gap-2.5">
                  <div className="w-6 h-6 text-[#2d5a61]">
                    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                      <path d="M20 2L38 20L20 38L2 20L20 2Z" stroke="currentColor" strokeWidth="2" />
                      <circle cx="20" cy="20" r="4" fill="currentColor" />
                    </svg>
                  </div>
                  <div>
                    <span className="font-serif text-lg text-[#2d5a61] font-semibold tracking-wider block leading-none">
                      Maryam Sparkle
                    </span>
                    <span className="text-[9px] tracking-[0.2em] uppercase text-[#666666]">
                      Artisanal Jewelry Menu
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="p-2 rounded-full hover:bg-[#e0d8c8]/80 text-[#333333] transition-colors cursor-pointer"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* In-Menu Search Field */}
              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  onOpenSearch();
                }}
                className="w-full bg-white/80 border border-[#e0d8c8] rounded-full px-4 py-2.5 text-xs text-[#666666] flex items-center gap-2.5 hover:bg-white transition-colors cursor-pointer shadow-inner"
              >
                <Search className="w-4 h-4 text-[#888888]" />
                <span>Search jewelry, gemstones, styles...</span>
              </button>

              {/* Pages & Main Navigation Links */}
              <nav className="space-y-2">
                {/* 1. Home */}
                <NavLink
                  to="/"
                  onClick={() => setIsMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3 py-2.5 rounded-xl transition-all ${
                      isActive
                        ? 'bg-[#2d5a61] text-white font-medium shadow-xs'
                        : 'text-[#333333] hover:bg-white/60 hover:text-[#2d5a61]'
                    }`
                  }
                >
                  <div className="flex items-center gap-3">
                    <Home className="w-4 h-4" />
                    <span className="font-serif text-lg">Home</span>
                  </div>
                  <ChevronRight className="w-4 h-4 opacity-60" />
                </NavLink>

                {/* 2. Shop Catalog & Collections Dropdown */}
                <div className="border-t border-[#e0d8c8]/60 pt-2">
                  <div className="flex items-center justify-between px-3 py-2 text-[#333333]">
                    <NavLink
                      to="/shop"
                      onClick={() => setIsMenuOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center gap-3 font-serif text-lg ${
                          isActive ? 'text-[#2d5a61] font-bold' : 'hover:text-[#2d5a61]'
                        }`
                      }
                    >
                      <Gem className="w-4 h-4 text-[#2d5a61]" />
                      <span>Shop Collections</span>
                    </NavLink>
                    <button
                      onClick={() => setIsShopExpanded(!isShopExpanded)}
                      className="p-1 text-xs text-[#888888] hover:text-[#2d5a61] cursor-pointer"
                    >
                      {isShopExpanded ? 'Collapse' : 'View All'}
                    </button>
                  </div>

                  {isShopExpanded && (
                    <div className="pl-6 pr-2 py-1 space-y-1">
                      <button
                        onClick={() => handleCategoryClick(null)}
                        className="w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium text-[#444444] hover:bg-white/70 hover:text-[#2d5a61] transition-colors flex items-center justify-between cursor-pointer"
                      >
                        <span>All Jewelry ({categories.reduce((acc, c) => acc + c.itemCount, 0)} pieces)</span>
                        <ChevronRight className="w-3.5 h-3.5 opacity-40" />
                      </button>
                      {categories.map((cat) => (
                        <button
                          key={cat.id}
                          onClick={() => handleCategoryClick(cat.slug)}
                          className="w-full text-left px-3 py-1.5 rounded-lg text-xs text-[#555555] hover:bg-white/70 hover:text-[#2d5a61] transition-colors flex items-center justify-between cursor-pointer"
                        >
                          <span>{cat.name}</span>
                          <span className="text-[10px] bg-white/80 px-2 py-0.5 rounded-full text-[#777777]">
                            {cat.itemCount}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* 3. Track Your Order */}
                <div className="border-t border-[#e0d8c8]/60 pt-2">
                  <NavLink
                    to="/track"
                    onClick={() => setIsMenuOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center justify-between px-3 py-2.5 rounded-xl transition-all ${
                        isActive
                          ? 'bg-[#2d5a61] text-white font-medium shadow-xs'
                          : 'bg-white/70 border border-[#2d5a61]/20 text-[#2d5a61] hover:bg-white'
                      }`
                    }
                  >
                    <div className="flex items-center gap-3">
                      <Package className="w-4 h-4 text-[#D4B982]" />
                      <span className="font-serif text-lg font-medium">Track Your Order</span>
                    </div>
                    <span className="text-[10px] uppercase font-bold tracking-wider bg-[#2d5a61]/10 px-2 py-0.5 rounded-full">
                      Live
                    </span>
                  </NavLink>
                </div>

                {/* 4. Custom Bespoke Request */}
                <div className="border-t border-[#e0d8c8]/60 pt-2">
                  <NavLink
                    to="/custom-orders"
                    onClick={() => setIsMenuOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center justify-between px-3 py-2.5 rounded-xl transition-all ${
                        isActive
                          ? 'bg-[#2d5a61] text-white font-medium shadow-xs'
                          : 'text-[#333333] hover:bg-white/60 hover:text-[#2d5a61]'
                      }`
                    }
                  >
                    <div className="flex items-center gap-3">
                      <Sparkles className="w-4 h-4 text-[#D4B982]" />
                      <span className="font-serif text-lg font-medium">Custom Bespoke Atelier</span>
                    </div>
                    <ChevronRight className="w-4 h-4 opacity-60" />
                  </NavLink>
                </div>

                {/* 5. Account & Orders */}
                <div className="border-t border-[#e0d8c8]/60 pt-2">
                  <NavLink
                    to="/account"
                    onClick={() => setIsMenuOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center justify-between px-3 py-2.5 rounded-xl transition-all ${
                        isActive
                          ? 'bg-[#2d5a61] text-white font-medium shadow-xs'
                          : 'text-[#333333] hover:bg-white/60 hover:text-[#2d5a61]'
                      }`
                    }
                  >
                    <div className="flex items-center gap-3">
                      <User className="w-4 h-4 text-[#2d5a61]" />
                      <span className="font-serif text-lg">My Account & Orders</span>
                    </div>
                    <ChevronRight className="w-4 h-4 opacity-60" />
                  </NavLink>
                </div>

                {/* 6. Our Story & Atelier */}
                <div className="border-t border-[#e0d8c8]/60 pt-2">
                  <NavLink
                    to="/about"
                    onClick={() => setIsMenuOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center justify-between px-3 py-2.5 rounded-xl transition-all ${
                        isActive
                          ? 'bg-[#2d5a61] text-white font-medium shadow-xs'
                          : 'text-[#333333] hover:bg-white/60 hover:text-[#2d5a61]'
                      }`
                    }
                  >
                    <div className="flex items-center gap-3">
                      <Sparkles className="w-4 h-4 text-[#D4B982]" />
                      <span className="font-serif text-lg">Our Story & Atelier</span>
                    </div>
                    <ChevronRight className="w-4 h-4 opacity-60" />
                  </NavLink>
                </div>

                {/* 7. Contact & Studio */}
                <div className="border-t border-[#e0d8c8]/60 pt-2">
                  <NavLink
                    to="/contact"
                    onClick={() => setIsMenuOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center justify-between px-3 py-2.5 rounded-xl transition-all ${
                        isActive
                          ? 'bg-[#2d5a61] text-white font-medium shadow-xs'
                          : 'text-[#333333] hover:bg-white/60 hover:text-[#2d5a61]'
                      }`
                    }
                  >
                    <div className="flex items-center gap-3">
                      <Phone className="w-4 h-4 text-[#2d5a61]" />
                      <span className="font-serif text-lg">Contact & Studio</span>
                    </div>
                    <ChevronRight className="w-4 h-4 opacity-60" />
                  </NavLink>
                </div>

                {/* 8. Consolidated Customer Care & Help */}
                <div className="border-t border-[#e0d8c8]/60 pt-2">
                  <NavLink
                    to="/customer-care"
                    onClick={() => setIsMenuOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center justify-between px-3 py-2.5 rounded-xl transition-all ${
                        isActive
                          ? 'bg-[#2d5a61] text-white font-medium shadow-xs'
                          : 'text-[#333333] hover:bg-white/60 hover:text-[#2d5a61]'
                      }`
                    }
                  >
                    <div className="flex items-center gap-3">
                      <HelpCircle className="w-4 h-4 text-[#2d5a61]" />
                      <span className="font-serif text-lg">Customer Care & Help</span>
                    </div>
                    <ChevronRight className="w-4 h-4 opacity-60" />
                  </NavLink>
                </div>
              </nav>
            </div>

            {/* Drawer Footer Contact Info */}
            <div className="pt-6 border-t border-[#e0d8c8] text-xs text-[#666666] space-y-3">
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-[#2d5a61]" />
                <a href="tel:+923001234567" className="hover:text-[#2d5a61] font-medium">+92 300 1234567</a>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-[#2d5a61]" />
                <a href="mailto:maryamsparkle@gmail.com" className="hover:text-[#2d5a61]">maryamsparkle@gmail.com</a>
              </div>
              <div className="flex items-center gap-2">
                <Instagram className="w-3.5 h-3.5 text-[#2d5a61]" />
                <a 
                  href="https://instagram.com/maryamsparkle456" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="hover:text-[#2d5a61]"
                >
                  @maryamsparkle456
                </a>
              </div>
              <div className="pt-2 text-[11px] text-[#888888] flex items-center justify-between">
                <span>Handcrafted in Pakistan</span>
                <span className="text-[#2d5a61] font-medium">Free Shipping &gt; Rs. 3,000</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Sticky Bottom Navigation Bar */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#efe8dc]/95 backdrop-blur-md border-t border-[#e0d8c8] px-3 py-2 flex items-center justify-around shadow-lg">
        <NavLink
          to="/"
          className={({ isActive }) =>
            `flex flex-col items-center gap-0.5 text-[10px] font-medium transition-colors ${
              isActive ? 'text-[#2d5a61]' : 'text-[#666666]'
            }`
          }
        >
          <Home className="w-5 h-5" />
          <span>Home</span>
        </NavLink>

        <NavLink
          to="/shop"
          className={({ isActive }) =>
            `flex flex-col items-center gap-0.5 text-[10px] font-medium transition-colors ${
              isActive ? 'text-[#2d5a61]' : 'text-[#666666]'
            }`
          }
        >
          <Gem className="w-5 h-5" />
          <span>Shop</span>
        </NavLink>

        {/* Track Order Direct in mobile bar */}
        <NavLink
          to="/track"
          className={({ isActive }) =>
            `flex flex-col items-center gap-0.5 text-[10px] font-medium transition-colors ${
              isActive ? 'text-[#2d5a61]' : 'text-[#666666]'
            }`
          }
        >
          <Package className="w-5 h-5" />
          <span>Track</span>
        </NavLink>

        <Link
          to="/wishlist"
          className="relative flex flex-col items-center gap-0.5 text-[10px] font-medium text-[#666666] hover:text-[#2d5a61]"
        >
          <div className="relative">
            <Heart className="w-5 h-5" />
            {wishlistCount > 0 && (
              <span className="absolute -top-1 -right-2 bg-[#D4B982] text-[#1e3c41] text-[9px] font-bold w-3.5 h-3.5 rounded-full flex items-center justify-center">
                {wishlistCount}
              </span>
            )}
          </div>
          <span>Wishlist</span>
        </Link>

        <button
          onClick={onOpenCart}
          className="relative flex flex-col items-center gap-0.5 text-[10px] font-medium text-[#666666] hover:text-[#2d5a61]"
        >
          <div className="relative">
            <ShoppingBag className="w-5 h-5 text-[#2d5a61]" />
            <span className="absolute -top-1 -right-2 bg-[#2d5a61] text-white text-[9px] font-bold min-w-[15px] h-[15px] px-0.5 rounded-full flex items-center justify-center">
              {cartCount}
            </span>
          </div>
          <span>Bag</span>
        </button>
      </div>
    </>
  );
};
