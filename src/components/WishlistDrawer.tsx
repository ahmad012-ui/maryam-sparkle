import React from 'react';
import { X, Heart, ShoppingBag, Trash2 } from 'lucide-react';
import { Product } from '../types';

interface WishlistDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  wishlistProducts: Product[];
  onRemoveFromWishlist: (product: Product) => void;
  onMoveToBag: (product: Product) => void;
}

export const WishlistDrawer: React.FC<WishlistDrawerProps> = ({
  isOpen,
  onClose,
  wishlistProducts,
  onRemoveFromWishlist,
  onMoveToBag,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/45 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="relative w-full max-w-md bg-[#efe8dc] h-full shadow-2xl flex flex-col z-10 border-l border-[#e0d8c8] overflow-hidden">
        {/* Header */}
        <div className="p-6 bg-[#fdfaf5] border-b border-[#e0d8c8] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-red-500 fill-red-500" />
            <h3 className="font-serif text-xl text-[#333333]">Saved Favorites</h3>
            <span className="text-xs bg-[#efe8dc] text-[#2d5a61] px-2 py-0.5 rounded-full font-bold">
              {wishlistProducts.length}
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-[#efe8dc] text-[#666666] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {wishlistProducts.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-4">
              <div className="w-14 h-14 rounded-full bg-[#fdfaf5] border border-[#e0d8c8] flex items-center justify-center mb-4 text-[#888888]">
                <Heart className="w-6 h-6" />
              </div>
              <h4 className="font-serif text-lg text-[#333333] mb-1">No saved pieces yet</h4>
              <p className="text-xs text-[#666666] mb-6 max-w-xs">
                Tap the heart icon on any jewelry piece you love to save it to your wishlist.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {wishlistProducts.map((product) => (
                <div
                  key={product.id}
                  className="flex gap-3.5 bg-[#fdfaf5] p-3.5 rounded-2xl border border-[#e0d8c8] shadow-2xs items-center"
                >
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-18 h-18 object-cover rounded-xl border border-[#e0d8c8]/50"
                  />

                  <div className="flex-1 min-w-0">
                    <h4 className="font-serif text-sm font-semibold text-[#333333] truncate">
                      {product.name}
                    </h4>
                    <p className="text-xs text-[#2d5a61] font-bold mt-0.5">
                      Rs. {product.price.toLocaleString()}
                    </p>

                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => onMoveToBag(product)}
                        className="bg-[#2d5a61] hover:bg-[#1e3c41] text-white text-xs px-3 py-1.5 rounded-full font-medium flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                      >
                        <ShoppingBag className="w-3 h-3" />
                        <span>Move to Bag</span>
                      </button>

                      <button
                        onClick={() => onRemoveFromWishlist(product)}
                        className="text-[#888888] hover:text-red-500 p-1.5 transition-colors"
                        aria-label="Remove from wishlist"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
