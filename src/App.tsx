import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { PRODUCTS, CATEGORIES } from './data/products';
import { Product, CartItem } from './types';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { ShopPage } from './pages/ShopPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { OrderConfirmationPage } from './pages/OrderConfirmationPage';
import { WishlistPage } from './pages/WishlistPage';
import { SearchPage } from './pages/SearchPage';
import { AccountPage } from './pages/AccountPage';
import { AuthPage } from './pages/AuthPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { VerifyOtpPage } from './pages/VerifyOtpPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';
import { PasswordResetSuccessPage } from './pages/PasswordResetSuccessPage';
import { PasswordResetProvider } from './context/PasswordResetContext';
import { CustomOrderPage } from './pages/CustomOrderPage';
import { CustomerCarePage } from './pages/CustomerCarePage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { TrackOrderPage } from './pages/TrackOrderPage';
import { CartDrawer } from './components/CartDrawer';
import { WishlistDrawer } from './components/WishlistDrawer';
import { ProductModal } from './components/ProductModal';
import { SearchModal } from './components/SearchModal';
import { CustomOrderModal } from './components/CustomOrderModal';
import { StoryModal } from './components/StoryModal';
import { CustomerCareModal } from './components/CustomerCareModal';
import { AskMaryamWidget } from './components/AskMaryamWidget';
import { MobileDynamicIslandNav } from './components/MobileDynamicIslandNav';
import { AdminApp } from './admin';

// Helper component to automatically scroll to top on route change
function ScrollToTop() {
  const { pathname, search } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [pathname, search]);

  return null;
}

function MainApp() {
  const location = useLocation();
  const navigate = useNavigate();

  // Initial cart items (3 items matching the design badge)
  const [cartItems, setCartItems] = useState<CartItem[]>([
    { product: PRODUCTS[0], quantity: 1, selectedSize: 'Medium (6.5")', selectedFinish: 'Gold-Tone' },
    { product: PRODUCTS[1], quantity: 1, selectedSize: 'Medium (6.5")', selectedFinish: 'Gold-Tone' },
    { product: PRODUCTS[2], quantity: 1, selectedSize: 'Medium (6.5")', selectedFinish: 'Silver-Tone' },
  ]);

  const [wishlistIds, setWishlistIds] = useState<string[]>([PRODUCTS[0].id]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  // Modals & Drawers state
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCustomOrderOpen, setIsCustomOrderOpen] = useState(false);
  const [isStoryOpen, setIsStoryOpen] = useState(false);
  const [customerCareTab, setCustomerCareTab] = useState<string | null>(null);

  // Sync category query parameter from URL (e.g. /shop?category=bracelets)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const catParam = params.get('category');
    if (catParam) {
      setSelectedCategory(catParam);
    }
  }, [location.search]);

  // If visiting /admin, render dedicated admin dashboard
  if (location.pathname.startsWith('/admin')) {
    return (
      <>
        <ScrollToTop />
        <AdminApp onBackToStore={() => navigate('/')} />
      </>
    );
  }

  // Cart operations
  const handleAddToCart = (
    product: Product,
    size?: string,
    finish?: string,
    customNote?: string
  ) => {
    const itemSize = size || 'Medium (6.5")';
    const itemFinish = finish || product.finish || product.availableFinishes?.[0] || 'Gold-Tone';
    setCartItems((prev) => {
      const existingIndex = prev.findIndex(
        (item) =>
          item.product.id === product.id &&
          item.selectedSize === itemSize &&
          item.selectedFinish === itemFinish
      );
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += 1;
        return updated;
      }
      return [
        ...prev,
        {
          product,
          quantity: 1,
          selectedSize: itemSize,
          selectedFinish: itemFinish,
          customNote,
        },
      ];
    });
    setIsCartOpen(true);
  };

  const handleUpdateQuantity = (productId: string, delta: number, size?: string, finish?: string) => {
    setCartItems((prev) =>
      prev
        .map((item) => {
          const isMatch =
            item.product.id === productId &&
            (!size || item.selectedSize === size) &&
            (!finish || item.selectedFinish === finish);
          if (isMatch) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const handleRemoveFromCart = (productId: string, size?: string, finish?: string) => {
    setCartItems((prev) =>
      prev.filter((item) => {
        const isMatch =
          item.product.id === productId &&
          (!size || item.selectedSize === size) &&
          (!finish || item.selectedFinish === finish);
        return !isMatch;
      })
    );
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  // Wishlist operations
  const handleToggleWishlist = (product: Product) => {
    setWishlistIds((prev) =>
      prev.includes(product.id) ? prev.filter((id) => id !== product.id) : [...prev, product.id]
    );
  };

  const handleMoveToBag = (product: Product) => {
    handleAddToCart(product);
    setWishlistIds((prev) => prev.filter((id) => id !== product.id));
  };

  const handleMoveAllWishlistToBag = () => {
    const itemsToAdd = PRODUCTS.filter((p) => wishlistIds.includes(p.id));
    itemsToAdd.forEach((p) => handleAddToCart(p));
    setWishlistIds([]);
    navigate('/cart');
  };

  const totalCartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const totalCartAmount = cartItems.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const wishlistProducts = PRODUCTS.filter((p) => wishlistIds.includes(p.id));

  const handleCategorySelect = (slug: string | null) => {
    setSelectedCategory(slug);
    if (location.pathname !== '/shop') {
      if (slug) {
        navigate(`/shop?category=${slug}`);
      } else {
        navigate('/shop');
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#efe8dc] text-[#333333] flex flex-col font-sans selection:bg-[#2d5a61] selection:text-white pb-[calc(6.5rem+env(safe-area-inset-bottom,0px))] sm:pb-0">
      <ScrollToTop />

      {/* Main Responsive Header */}
      <Header
        cartCount={totalCartCount}
        cartTotal={totalCartAmount}
        wishlistCount={wishlistIds.length}
        categories={CATEGORIES}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenWishlist={() => setIsWishlistOpen(true)}
        onOpenSearch={() => setIsSearchOpen(true)}
        onSelectCategory={handleCategorySelect}
        onOpenCustomOrder={() => setIsCustomOrderOpen(true)}
        onOpenStory={() => setIsStoryOpen(true)}
        onOpenCustomerCare={(tab) => setCustomerCareTab(tab || 'faqs')}
      />

      {/* Main Routes */}
      <main className="flex-1">
        <Routes>
          <Route
            path="/"
            element={
              <HomePage
                products={PRODUCTS}
                categories={CATEGORIES}
                wishlistIds={wishlistIds}
                onAddToCart={handleAddToCart}
                onToggleWishlist={handleToggleWishlist}
                onQuickView={(p) => setQuickViewProduct(p)}
                onOpenCustomOrder={() => setIsCustomOrderOpen(true)}
                onOpenStory={() => setIsStoryOpen(true)}
                onOpenCustomerCare={(tab) => setCustomerCareTab(tab || 'faqs')}
              />
            }
          />
          <Route
            path="/shop"
            element={
              <ShopPage
                products={PRODUCTS}
                categories={CATEGORIES}
                wishlistIds={wishlistIds}
                selectedCategory={selectedCategory}
                onSelectCategory={setSelectedCategory}
                onAddToCart={handleAddToCart}
                onToggleWishlist={handleToggleWishlist}
                onQuickView={(p) => setQuickViewProduct(p)}
                onOpenCustomOrder={() => setIsCustomOrderOpen(true)}
              />
            }
          />
          <Route
            path="/product/:slug"
            element={
              <ProductDetailPage
                wishlistIds={wishlistIds}
                onAddToCart={handleAddToCart}
                onToggleWishlist={handleToggleWishlist}
                onQuickView={(p) => setQuickViewProduct(p)}
              />
            }
          />
          <Route
            path="/cart"
            element={
              <CartPage
                cart={cartItems}
                onUpdateQuantity={handleUpdateQuantity}
                onRemoveItem={handleRemoveFromCart}
                onClearCart={handleClearCart}
              />
            }
          />
          <Route
            path="/checkout"
            element={
              <CheckoutPage
                cart={cartItems}
                onClearCart={handleClearCart}
              />
            }
          />
          <Route
            path="/order-confirmation"
            element={<OrderConfirmationPage />}
          />
          <Route
            path="/wishlist"
            element={
              <WishlistPage
                wishlist={wishlistProducts}
                onMoveToBag={handleMoveToBag}
                onRemoveFromWishlist={handleToggleWishlist}
                onMoveAllToCart={handleMoveAllWishlistToBag}
              />
            }
          />
          <Route
            path="/search"
            element={
              <SearchPage
                wishlistIds={wishlistIds}
                onAddToCart={handleAddToCart}
                onToggleWishlist={handleToggleWishlist}
                onQuickView={(p) => setQuickViewProduct(p)}
              />
            }
          />
          <Route
            path="/account"
            element={<AccountPage />}
          />
          <Route
            path="/login"
            element={<AuthPage initialMode="login" />}
          />
          <Route
            path="/register"
            element={<AuthPage initialMode="register" />}
          />
          <Route
            path="/forgot-password"
            element={<ForgotPasswordPage />}
          />
          <Route
            path="/verify-otp"
            element={<VerifyOtpPage />}
          />
          <Route
            path="/reset-password"
            element={<ResetPasswordPage />}
          />
          <Route
            path="/password-reset-success"
            element={<PasswordResetSuccessPage />}
          />
          <Route
            path="/custom-orders"
            element={<CustomOrderPage />}
          />
          <Route
            path="/customer-care"
            element={<CustomerCarePage />}
          />
          <Route
            path="/help"
            element={<CustomerCarePage />}
          />
          <Route
            path="/faqs"
            element={<CustomerCarePage />}
          />
          <Route
            path="/shipping"
            element={<CustomerCarePage />}
          />
          <Route
            path="/returns"
            element={<CustomerCarePage />}
          />
          <Route
            path="/jewelry-care"
            element={<CustomerCarePage />}
          />
          <Route
            path="/about"
            element={<AboutPage onOpenCustomOrder={() => setIsCustomOrderOpen(true)} />}
          />
          <Route
            path="/contact"
            element={<ContactPage onOpenCustomOrder={() => setIsCustomOrderOpen(true)} />}
          />
          <Route
            path="/track"
            element={<TrackOrderPage />}
          />
          <Route
            path="/track-order"
            element={<TrackOrderPage />}
          />
          {/* Fallback route */}
          <Route
            path="*"
            element={
              <ShopPage
                products={PRODUCTS}
                categories={CATEGORIES}
                wishlistIds={wishlistIds}
                selectedCategory={selectedCategory}
                onSelectCategory={setSelectedCategory}
                onAddToCart={handleAddToCart}
                onToggleWishlist={handleToggleWishlist}
                onQuickView={(p) => setQuickViewProduct(p)}
                onOpenCustomOrder={() => setIsCustomOrderOpen(true)}
              />
            }
          />
        </Routes>
      </main>

      {/* Global Footer */}
      <Footer
        onSelectCategory={handleCategorySelect}
        onOpenCustomOrder={() => setIsCustomOrderOpen(true)}
        onOpenCustomerCare={(tab) => setCustomerCareTab(tab || 'faqs')}
      />

      {/* Floating Mobile Dynamic Island Navigation */}
      <MobileDynamicIslandNav
        cartCount={totalCartCount}
        wishlistCount={wishlistIds.length}
      />

      {/* Floating Stylist Assistant */}
      <AskMaryamWidget
        products={PRODUCTS}
        onAddToCart={handleAddToCart}
        onQuickView={(product) => setQuickViewProduct(product)}
      />

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveFromCart}
        onClearCart={handleClearCart}
      />

      {/* Wishlist Drawer */}
      <WishlistDrawer
        isOpen={isWishlistOpen}
        onClose={() => setIsWishlistOpen(false)}
        wishlistProducts={wishlistProducts}
        onRemoveFromWishlist={handleToggleWishlist}
        onMoveToBag={handleMoveToBag}
        onMoveAllToBag={handleMoveAllWishlistToBag}
      />

      {/* Product Detail Modal */}
      <ProductModal
        product={quickViewProduct}
        isOpen={!!quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
        onAddToCart={(product, size, finish, note) =>
          handleAddToCart(product, size, finish, note)
        }
        isWishlisted={quickViewProduct ? wishlistIds.includes(quickViewProduct.id) : false}
        onToggleWishlist={handleToggleWishlist}
      />

      {/* Live Search & Filter Modal */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        products={PRODUCTS}
        onSelectProduct={(product) => setQuickViewProduct(product)}
        onAddToCart={handleAddToCart}
        wishlistIds={wishlistIds}
        onToggleWishlist={handleToggleWishlist}
      />

      {/* Custom Bespoke Jewelry Designer Modal */}
      <CustomOrderModal
        isOpen={isCustomOrderOpen}
        onClose={() => setIsCustomOrderOpen(false)}
      />

      {/* Story & Workshop Details Modal */}
      <StoryModal
        isOpen={isStoryOpen}
        onClose={() => setIsStoryOpen(false)}
        onExplore={() => navigate('/shop')}
      />

      {/* Customer Care, FAQs, Shipping & Tracking Modal */}
      <CustomerCareModal
        isOpen={!!customerCareTab}
        onClose={() => setCustomerCareTab(null)}
        initialTab={customerCareTab || 'faqs'}
      />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <PasswordResetProvider>
        <MainApp />
      </PasswordResetProvider>
    </BrowserRouter>
  );
}
