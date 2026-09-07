import React from 'react';
import { Hero } from '../components/Hero';
import { ValueProps } from '../components/ValueProps';
import { ShopByCollection } from '../components/ShopByCollection';
import { BestSellers } from '../components/BestSellers';
import { OurStory } from '../components/OurStory';
import { InstagramGrid } from '../components/InstagramGrid';
import { Product, Category } from '../types';
import { useNavigate } from 'react-router-dom';
import { SEO } from '../components/SEO';

interface HomePageProps {
  products: Product[];
  categories: Category[];
  wishlistIds: string[];
  onAddToCart: (product: Product) => void;
  onToggleWishlist: (product: Product) => void;
  onQuickView: (product: Product) => void;
  onOpenCustomOrder: () => void;
  onOpenStory: () => void;
  onOpenCustomerCare: (tab?: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  products,
  categories,
  wishlistIds,
  onAddToCart,
  onToggleWishlist,
  onQuickView,
  onOpenCustomOrder,
  onOpenStory,
  onOpenCustomerCare,
}) => {
  const navigate = useNavigate();

  const handleSelectCategory = (slug: string | null) => {
    if (slug) {
      navigate(`/shop?category=${slug}`);
    } else {
      navigate('/shop');
    }
  };

  const handleShopNow = () => {
    navigate('/shop');
  };

  return (
    <div className="space-y-0">
      <SEO
        title="Maryam Sparkle | Handmade Jewellery Studio"
        description="Discover artisanal handmade beaded bracelets, dainty necklaces, anklets, and custom bespoke jewelry crafted with love in Pakistan."
        canonical="/"
        keywords="handmade jewellery, bead bracelets, custom jewellery Pakistan, Maryam Sparkle, artisanal jewelry, dainty necklaces"
      />

      {/* Hero Section */}
      <Hero
        onShopNow={handleShopNow}
        onExploreNew={handleShopNow}
      />

      {/* Value Proposition Badges */}
      <ValueProps
        onCustomizationClick={onOpenCustomOrder}
        onShippingClick={() => onOpenCustomerCare('shipping')}
      />

      {/* Shop by Collection */}
      <ShopByCollection
        categories={categories}
        selectedCategory={null}
        onSelectCategory={handleSelectCategory}
      />

      {/* Curated Bestsellers Catalog */}
      <div id="products-section">
        <BestSellers
          products={products}
          wishlistIds={wishlistIds}
          selectedCategory={null}
          onAddToCart={onAddToCart}
          onToggleWishlist={onToggleWishlist}
          onQuickView={onQuickView}
          onViewAll={handleShopNow}
        />
      </div>

      {/* Our Story Craftsmanship Section */}
      <OurStory onLearnMore={() => navigate('/about')} />

      {/* Instagram Gallery */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-6">
        <InstagramGrid />
      </div>
    </div>
  );
};
