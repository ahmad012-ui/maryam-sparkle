import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, ShoppingBag, Sparkles } from 'lucide-react';
import { Product } from '../types';
import { SEO } from '../components/SEO';
import { ProductCard3D } from '../components/ProductCard3D';

interface WishlistPageProps {
  wishlist: Product[];
  onMoveToBag: (product: Product) => void;
  onRemoveFromWishlist: (product: Product) => void;
  onMoveAllToCart: () => void;
}

export const WishlistPage: React.FC<WishlistPageProps> = ({
  wishlist,
  onMoveToBag,
  onRemoveFromWishlist,
  onMoveAllToCart
}) => {
  const navigate = useNavigate();

  if (wishlist.length === 0) {
    return (
      <div className="min-h-[70vh] bg-[#efe8dc] flex flex-col items-center justify-center px-6 py-20 text-center">
        <SEO
          title="Saved Studio Favorites"
          description="Review your saved handmade bead jewelry, bracelets, and necklaces in your Maryam Sparkle studio wishlist."
          canonical="/wishlist"
        />
        <div className="w-24 h-24 bg-[#fdfaf5] rounded-full flex items-center justify-center mb-6 shadow-sm border border-[#e0d8c8]">
          <Heart className="w-10 h-10 text-[#2d5a61]/60" />
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl text-[#333333] mb-3">Your Wishlist is Empty</h1>
        <p className="text-[#666666] max-w-md mb-8 text-sm sm:text-base leading-relaxed">
          Save your favorite handmade necklaces, bead bracelets, and delicate anklets here by tapping the heart icon on any piece.
        </p>
        <Link
          to="/shop"
          className="bg-[#2d5a61] text-white px-8 py-3.5 rounded-full text-sm font-medium hover:bg-[#1e3c41] transition-all shadow-sm"
        >
          Explore the Collection
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#efe8dc] py-12 px-6 md:px-12">
      <SEO
        title="Saved Studio Favorites"
        description="Review your saved handmade bead jewelry, bracelets, and necklaces in your Maryam Sparkle studio wishlist."
        canonical="/wishlist"
      />
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="font-serif text-3xl sm:text-4xl text-[#333333]">Saved Favorites</h1>
            <p className="text-xs sm:text-sm text-[#666666] mt-1">
              {wishlist.length} {wishlist.length === 1 ? 'piece' : 'pieces'} waiting in your private curation.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onMoveAllToCart}
              className="bg-[#2d5a61] text-white px-5 py-2.5 rounded-full text-xs font-semibold hover:bg-[#1e3c41] transition-colors shadow-2xs flex items-center gap-1.5 cursor-pointer"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Move All to Bag</span>
            </button>
            <button
              onClick={() => navigate('/shop')}
              className="border border-[#e0d8c8] bg-white text-[#333333] px-5 py-2.5 rounded-full text-xs font-medium hover:border-[#2d5a61] hover:text-[#2d5a61] transition-colors cursor-pointer"
            >
              Continue Exploring
            </button>
          </div>
        </div>

        {/* Product Cards Grid with 3D Depth */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {wishlist.map((product) => (
            <ProductCard3D
              key={product.id}
              product={product}
              isWishlisted={true}
              onAddToCart={onMoveToBag}
              onToggleWishlist={onRemoveFromWishlist}
              onQuickView={(p) => navigate(`/product/${p.slug}`)}
              variant="standard"
            />
          ))}
        </div>
      </div>
    </div>
  );
};
