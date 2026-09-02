import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, ShoppingBag, Trash2, ArrowRight, Sparkles } from 'lucide-react';
import { Product } from '../types';

interface WishlistPageProps {
  wishlist: Product[];
  onAddToCart: (product: Product) => void;
  onRemoveFromWishlist: (product: Product) => void;
  onMoveAllToCart: () => void;
}

export const WishlistPage: React.FC<WishlistPageProps> = ({
  wishlist,
  onAddToCart,
  onRemoveFromWishlist,
  onMoveAllToCart
}) => {
  const navigate = useNavigate();

  if (wishlist.length === 0) {
    return (
      <div className="min-h-[70vh] bg-[#efe8dc] flex flex-col items-center justify-center px-6 py-20 text-center">
        <div className="w-24 h-24 bg-[#fdfaf5] rounded-full flex items-center justify-center mb-6 shadow-sm border border-[#e0d8c8]">
          <Heart className="w-10 h-10 text-[#2d5a61]/60" />
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl text-[#333333] mb-3">Your Wishlist is Empty</h1>
        <p className="text-[#666666] max-w-md mb-8 text-sm sm:text-base leading-relaxed">
          Save your favorite handmade necklaces, crystal bracelets, and delicate anklets here by tapping the heart icon on any piece.
        </p>
        <Link
          to="/shop"
          className="inline-flex items-center gap-2 bg-[#2d5a61] text-white px-8 py-4 rounded-full font-medium text-sm hover:bg-[#1e3c41] transition-all shadow-sm"
        >
          <span>Discover Studio Pieces</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#efe8dc] py-12 md:py-16">
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-[#e0d8c8] mb-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold uppercase tracking-widest text-[#2d5a61]">
                Saved Treasures
              </span>
              <Sparkles className="w-3.5 h-3.5 text-[#D4B982]" />
            </div>
            <h1 className="font-serif text-3xl md:text-4xl text-[#333333]">My Studio Wishlist</h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onMoveAllToCart}
              className="bg-[#2d5a61] text-white px-5 py-2.5 rounded-full text-xs font-medium hover:bg-[#1e3c41] transition-colors flex items-center gap-2 shadow-xs cursor-pointer"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Add All to Bag</span>
            </button>
          </div>
        </div>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {wishlist.map((product) => (
            <div
              key={product.id}
              className="bg-[#fdfaf5] rounded-3xl p-5 border border-[#e0d8c8] shadow-xs flex flex-col justify-between hover:shadow-md transition-all group"
            >
              <div>
                <div className="aspect-square rounded-2xl overflow-hidden mb-4 relative bg-[#efe8dc]">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 cursor-pointer"
                    onClick={() => navigate(`/product/${product.slug}`)}
                  />

                  {/* Remove button */}
                  <button
                    onClick={() => onRemoveFromWishlist(product)}
                    className="absolute top-3 right-3 p-2 bg-white/90 text-red-500 hover:bg-red-50 rounded-full transition-colors shadow-xs cursor-pointer"
                    title="Remove from wishlist"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <span className="absolute bottom-3 left-3 bg-[#efe8dc]/90 backdrop-blur-xs text-[#2d5a61] text-[10px] font-bold px-2.5 py-1 rounded-full">
                    {product.category}
                  </span>
                </div>

                <h3
                  onClick={() => navigate(`/product/${product.slug}`)}
                  className="font-serif text-base text-[#333333] hover:text-[#2d5a61] cursor-pointer mb-1 truncate"
                >
                  {product.name}
                </h3>

                <p className="font-semibold text-sm text-[#333333] mb-4">
                  Rs. {product.price.toLocaleString()}
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => onAddToCart(product)}
                  className="flex-1 bg-[#2d5a61] text-white py-2.5 rounded-full text-xs font-medium flex items-center justify-center gap-2 hover:bg-[#1e3c41] transition-colors cursor-pointer shadow-2xs"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Move to Bag</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
