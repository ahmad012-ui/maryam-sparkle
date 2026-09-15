import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Sparkles, ArrowLeft, ChevronRight, ShoppingBag, Heart, Eye, ArrowRight } from 'lucide-react';
import { Product } from '../types';
import { productService } from '../services/productService';
import { recentActivityService } from '../services/recentActivityService';
import { analyticsService } from '../services/analyticsService';
import { SEO } from '../components/SEO';
import { ProductModal } from '../components/ProductModal';
import { RecentlyViewedSection } from '../components/RecentlyViewedSection';

interface ProductDetailPageProps {
  wishlistIds: string[];
  onAddToCart: (product: Product, quantity?: number, selectedSize?: string, selectedFinish?: string, customNote?: string) => void;
  onToggleWishlist: (product: Product) => void;
  onQuickView: (product: Product) => void;
}

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({
  wishlistIds,
  onAddToCart,
  onToggleWishlist,
  onQuickView,
}) => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadProduct() {
      if (!slug) return;
      setLoading(true);
      try {
        const found = await productService.getProductBySlug(slug);
        if (!isMounted) return;

        if (found) {
          setProduct(found);
          setIsModalOpen(true);

          // Record product view in recentActivityService
          recentActivityService.recordProductView(found.id);

          // Track analytics event
          analyticsService.trackProductView({
            id: found.id,
            name: found.name,
            category: found.category,
            price: found.price,
            sku: found.sku,
          });

          // Fetch related pieces
          const related = await productService.getRelatedProducts(found.id, 4);
          if (isMounted) {
            setRelatedProducts(related);
          }
        } else {
          setProduct(null);
        }
      } catch (err) {
        console.warn('Error loading product by slug:', err);
        if (isMounted) setProduct(null);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadProduct();
    return () => {
      isMounted = false;
    };
  }, [slug]);

  const handleCloseModal = () => {
    setIsModalOpen(false);
    navigate('/shop');
  };

  const handleAddToCartFromModal = (
    p: Product,
    size: string,
    finish: string,
    customNote: string
  ) => {
    onAddToCart(p, 1, size, finish, customNote);
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center bg-[#efe8dc] px-4 py-16">
        <Sparkles className="w-8 h-8 text-[#2d5a61] animate-spin mb-4" />
        <p className="font-serif text-lg text-[#333333]">Unveiling handcrafted details...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-[60vh] max-w-2xl mx-auto px-6 py-20 text-center bg-[#efe8dc]">
        <h2 className="font-serif text-3xl text-[#333333] mb-4">Piece Not Found</h2>
        <p className="text-[#666666] mb-8 leading-relaxed">
          The jewelry piece you are looking for might have moved or been crafted as a limited edition.
        </p>
        <Link
          to="/shop"
          className="inline-flex items-center gap-2 bg-[#2d5a61] text-white px-8 py-3.5 rounded-full text-sm font-medium hover:bg-[#1e3c41] transition-colors shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Browse All Jewelry</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-[#efe8dc] min-h-screen">
      {/* Rich SEO Metadata */}
      <SEO
        title={product.name}
        description={product.shortDescription || product.description}
        ogType="product"
        ogImage={product.images?.[0] || product.image}
        canonical={`/product/${product.slug}`}
        productPrice={product.price}
        productCurrency="PKR"
        productAvailability={product.inStock ? 'in stock' : 'out of stock'}
        productSku={product.sku || product.id}
        ratingValue={product.rating || 4.9}
        reviewCount={product.reviewsCount || 42}
        keywords={`${product.name}, ${product.category}, Maryam Sparkle, handmade jewelry Pakistan, ${product.materials?.join(', ') || ''}`}
      />

      {/* Canonical Product Detail Experience (ProductModal) */}
      <ProductModal
        product={product}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onAddToCart={handleAddToCartFromModal}
        isWishlisted={wishlistIds.includes(product.id)}
        onToggleWishlist={onToggleWishlist}
      />

      {/* Page Content & Background context */}
      <div className="max-w-7xl mx-auto px-6 md:px-10 pt-8 pb-16">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs text-[#888888] mb-8 overflow-x-auto whitespace-nowrap py-2">
          <Link to="/" className="hover:text-[#2d5a61] transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-[#bbb]" />
          <Link to="/shop" className="hover:text-[#2d5a61] transition-colors">
            Shop
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-[#bbb]" />
          <Link to={`/shop?category=${encodeURIComponent(product.category)}`} className="hover:text-[#2d5a61] transition-colors">
            {product.category}
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-[#bbb]" />
          <span className="text-[#333333] font-medium truncate max-w-[200px] sm:max-w-none">
            {product.name}
          </span>
        </nav>

        {/* Quick Back to Collection Banner */}
        <div className="bg-[#fdfaf5] border border-[#e0d8c8] rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-4 mb-12 shadow-2xs">
          <div>
            <h1 className="font-serif text-2xl sm:text-3xl text-[#333333] font-normal mb-1">
              {product.name}
            </h1>
            <p className="text-xs sm:text-sm text-[#666666]">
              Handcrafted in {product.category} • Rs. {product.price.toLocaleString()}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-[#2d5a61] text-white px-6 py-2.5 rounded-full text-xs font-semibold hover:bg-[#1e3c41] transition-colors shadow-2xs cursor-pointer"
            >
              Open Piece Details
            </button>
            <Link
              to="/shop"
              className="border border-[#e0d8c8] bg-white text-[#333333] px-5 py-2.5 rounded-full text-xs font-medium hover:border-[#2d5a61] hover:text-[#2d5a61] transition-colors"
            >
              Back to Shop
            </Link>
          </div>
        </div>

        {/* Related Pieces */}
        {relatedProducts.length > 0 && (
          <div className="mb-14">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-serif text-xl sm:text-2xl text-[#333333] font-medium">
                  Complementary Creations
                </h3>
                <p className="text-xs text-[#666666] mt-0.5">
                  Artisan pieces frequently styled with this creation.
                </p>
              </div>
              <Link
                to={`/shop?category=${encodeURIComponent(product.category)}`}
                className="text-xs font-semibold text-[#2d5a61] hover:text-[#1e3c41] flex items-center gap-1 group"
              >
                <span>View More</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6">
              {relatedProducts.map((relProduct) => {
                const isWish = wishlistIds.includes(relProduct.id);
                return (
                  <div
                    key={relProduct.id}
                    className="bg-[#fdfaf5] rounded-2xl p-4 border border-[#e0d8c8] shadow-2xs flex flex-col justify-between hover:shadow-md transition-all group"
                  >
                    <div>
                      <div className="aspect-square rounded-xl overflow-hidden mb-3 relative bg-[#efe8dc]">
                        <img
                          src={relProduct.images?.[0] || relProduct.image}
                          alt={relProduct.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 cursor-pointer"
                          onClick={() => onQuickView(relProduct)}
                        />
                        <button
                          onClick={() => onToggleWishlist(relProduct)}
                          className={`absolute top-2.5 right-2.5 p-1.5 rounded-full shadow-xs transition-all ${
                            isWish ? 'bg-red-50 text-red-500' : 'bg-white/80 text-[#666666] hover:text-red-500'
                          }`}
                          aria-label={isWish ? 'Remove from wishlist' : 'Add to wishlist'}
                        >
                          <Heart className="w-4 h-4" fill={isWish ? 'currentColor' : 'none'} />
                        </button>
                        <button
                          onClick={() => onQuickView(relProduct)}
                          className="absolute inset-x-2.5 bottom-2.5 py-1.5 bg-white/95 text-[#2d5a61] text-xs font-semibold rounded-lg shadow-sm opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 hover:bg-[#2d5a61] hover:text-white"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Quick View</span>
                        </button>
                      </div>

                      <h4
                        onClick={() => onQuickView(relProduct)}
                        className="font-serif text-sm text-[#333333] hover:text-[#2d5a61] cursor-pointer truncate mb-1"
                      >
                        {relProduct.name}
                      </h4>
                      <p className="font-semibold text-xs text-[#333333] mb-3">
                        Rs. {relProduct.price.toLocaleString()}
                      </p>
                    </div>

                    <button
                      onClick={() => onAddToCart(relProduct, 1)}
                      className="w-full border border-[#e0d8c8] py-2 rounded-full text-xs font-medium text-[#333333] hover:bg-[#2d5a61] hover:text-white hover:border-[#2d5a61] transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>Add to Bag</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Recently Viewed Products Section */}
        <RecentlyViewedSection
          currentProductId={product.id}
          currentProductSlug={product.slug}
          wishlistIds={wishlistIds}
          onAddToCart={(p) => onAddToCart(p, 1)}
          onToggleWishlist={onToggleWishlist}
          onQuickView={onQuickView}
        />
      </div>
    </div>
  );
};
