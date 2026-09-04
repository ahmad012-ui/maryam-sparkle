import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Heart,
  ShoppingBag,
  Sparkles,
  ShieldCheck,
  Truck,
  RotateCcw,
  Check,
  ChevronRight,
  Share2,
  Star,
  Info,
  Layers,
  ArrowLeft
} from 'lucide-react';
import { Product } from '../types';
import { productService } from '../services/productService';
import { SEO } from '../components/SEO';

interface ProductDetailPageProps {
  wishlistIds: string[];
  onAddToCart: (product: Product, quantity?: number, selectedSize?: string, selectedFinish?: string) => void;
  onToggleWishlist: (product: Product) => void;
  onQuickView: (product: Product) => void;
}

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({
  wishlistIds,
  onAddToCart,
  onToggleWishlist,
  onQuickView
}) => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState<string>('Medium (6.5")');
  const [selectedFinish, setSelectedFinish] = useState<string>('18K Gold Plated');
  const [activeTab, setActiveTab] = useState<'description' | 'materials' | 'sizing' | 'care' | 'shipping'>('description');
  const [addedToast, setAddedToast] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    async function loadProduct() {
      if (!slug) return;
      setLoading(true);
      const found = await productService.getProductBySlug(slug);
      if (found) {
        setProduct(found);
        setSelectedImage(found.images?.[0] || found.image);
        const initialFinish = found.finish || found.availableFinishes?.[0] || '18K Gold Plated';
        setSelectedFinish(initialFinish);
        const related = await productService.getRelatedProducts(found.id, 4);
        setRelatedProducts(related);
      }
      setLoading(false);
      window.scrollTo(0, 0);
    }
    loadProduct();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center bg-[#efe8dc] px-4">
        <Sparkles className="w-8 h-8 text-[#2d5a61] animate-spin mb-4" />
        <p className="font-serif text-lg text-[#333333]">Unveiling handcrafted details...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-[60vh] max-w-2xl mx-auto px-6 py-20 text-center bg-[#efe8dc]">
        <h2 className="font-serif text-3xl text-[#333333] mb-4">Piece Not Found</h2>
        <p className="text-[#666666] mb-8">
          The jewelry piece you are looking for might have moved or been crafted as a limited edition.
        </p>
        <Link
          to="/shop"
          className="inline-flex items-center gap-2 bg-[#2d5a61] text-white px-8 py-3.5 rounded-full text-sm font-medium hover:bg-[#1e3c41] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Browse All Jewelry</span>
        </Link>
      </div>
    );
  }

  const isWishlisted = wishlistIds.includes(product.id);
  const images = product.images && product.images.length > 0 ? product.images : [product.image];

  const handleAddToCart = () => {
    onAddToCart(product, quantity, selectedSize, selectedFinish);
    setAddedToast(true);
    setTimeout(() => setAddedToast(false), 3000);
  };

  const handleBuyNow = () => {
    onAddToCart(product, quantity, selectedSize, selectedFinish);
    navigate('/checkout');
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: product.shortDescription || product.description,
        url: window.location.href
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  return (
    <div className="min-h-screen bg-[#efe8dc] pb-24">
      <SEO
        title={product.name}
        description={product.shortDescription || product.description}
        ogType="product"
        ogImage={images[0] || product.image}
        canonical={`/product/${product.slug}`}
        productPrice={product.price}
        productCurrency="PKR"
        productAvailability={product.inStock ? 'in stock' : 'out of stock'}
        keywords={`${product.name}, ${product.category}, Maryam Sparkle, handmade jewelry Pakistan, ${product.materials.join(', ')}`}
      />

      {/* Added to Bag Toast Notification */}
      {addedToast && (
        <div className="fixed top-24 right-6 z-50 bg-[#2d5a61] text-white px-5 py-3.5 rounded-2xl shadow-xl flex items-center gap-3 border border-white/20 animate-fade-in">
          <Check className="w-5 h-5 text-[#D4B982]" />
          <div>
            <p className="text-sm font-medium">Added to Bag</p>
            <p className="text-xs text-white/80">{product.name} ({quantity}x)</p>
          </div>
        </div>
      )}

      {/* Breadcrumbs Navigation */}
      <div className="max-w-7xl mx-auto px-6 md:px-10 py-5">
        <nav className="flex items-center gap-2 text-xs text-[#666666] font-medium overflow-x-auto whitespace-nowrap">
          <Link to="/" className="hover:text-[#2d5a61] transition-colors">Home</Link>
          <ChevronRight className="w-3.5 h-3.5 text-[#888888]" />
          <Link to="/shop" className="hover:text-[#2d5a61] transition-colors">Shop</Link>
          <ChevronRight className="w-3.5 h-3.5 text-[#888888]" />
          <Link to={`/shop/${product.category.toLowerCase().replace(/\s+/g, '-')}`} className="hover:text-[#2d5a61] transition-colors">
            {product.category}
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-[#888888]" />
          <span className="text-[#333333] font-semibold truncate max-w-[200px]">{product.name}</span>
        </nav>
      </div>

      {/* Main Product Container */}
      <div className="max-w-7xl mx-auto px-6 md:px-10 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
        {/* Left Column: Image Gallery (7 cols on lg) */}
        <div className="lg:col-span-7 flex flex-col-reverse md:flex-row gap-4">
          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="flex md:flex-col gap-3 overflow-x-auto md:overflow-y-auto max-h-[540px] pb-2 md:pb-0 scrollbar-thin">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(img)}
                  className={`w-18 h-18 sm:w-20 sm:h-20 rounded-xl overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                    selectedImage === img
                      ? 'border-[#2d5a61] ring-2 ring-[#2d5a61]/20 shadow-md scale-105'
                      : 'border-[#e0d8c8] hover:border-[#2d5a61]/50 opacity-80 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt={`${product.name} preview ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Main Visual Display */}
          <div className="flex-1 bg-[#fdfaf5] rounded-3xl overflow-hidden border border-[#e0d8c8] shadow-sm relative group">
            <div className="aspect-square w-full relative overflow-hidden bg-[#efe8dc]/50">
              <img
                src={selectedImage || product.image}
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />

              {/* Floating badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-1.5">
                {product.isNew && (
                  <span className="bg-[#2d5a61] text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
                    New In Studio
                  </span>
                )}
                {product.isBestSeller && (
                  <span className="bg-[#B08A5A] text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
                    Artisan Bestseller
                  </span>
                )}
              </div>

              {/* Wishlist button */}
              <button
                onClick={() => onToggleWishlist(product)}
                className={`absolute top-4 right-4 p-2.5 rounded-full transition-all duration-300 shadow-md ${
                  isWishlisted
                    ? 'bg-red-50 text-red-500 scale-110'
                    : 'bg-white/90 text-[#555555] hover:bg-white hover:text-red-500'
                }`}
                aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
              >
                <Heart className="w-5 h-5" fill={isWishlisted ? 'currentColor' : 'none'} strokeWidth={1.75} />
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Product Info & Actions (5 cols on lg) */}
        <div className="lg:col-span-5 flex flex-col">
          {/* Header info */}
          <div className="border-b border-[#e0d8c8] pb-6 mb-6">
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-xs uppercase tracking-widest font-semibold text-[#2d5a61]">
                {product.category}
              </span>
              <button
                onClick={handleShare}
                className="text-xs text-[#666666] hover:text-[#2d5a61] flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>{copiedLink ? 'Link Copied!' : 'Share'}</span>
              </button>
            </div>

            <h1 className="font-serif text-3xl sm:text-4xl text-[#333333] mb-3 leading-tight">
              {product.name}
            </h1>

            {/* Rating & Reviews */}
            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center text-[#D4B982]">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
              </div>
              <span className="text-xs text-[#555555] font-medium">
                {product.rating || 4.9} ({product.reviewsCount || 48} verified studio reviews)
              </span>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3 mb-2">
              <span className="text-2xl sm:text-3xl font-bold text-[#333333]">
                Rs. {product.price.toLocaleString()}
              </span>
              {product.compareAtPrice && (
                <span className="text-base text-[#888888] line-through">
                  Rs. {product.compareAtPrice.toLocaleString()}
                </span>
              )}
              {product.compareAtPrice && (
                <span className="text-xs font-semibold text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded-full">
                  Save {Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)}%
                </span>
              )}
            </div>

            <p className="text-xs text-[#666666]">
              Inclusive of handcrafted studio packaging. Free delivery on orders above Rs. 3,000.
            </p>
          </div>

          {/* Sizing & Customization Options */}
          <div className="space-y-5 mb-8">
            {/* Size selection */}
            <div>
              <div className="flex justify-between items-center text-xs font-medium text-[#333333] mb-2">
                <span>Select Wrist / Fit Size:</span>
                <Link to="/jewelry-care" className="text-[#2d5a61] hover:underline flex items-center gap-1">
                  <Info className="w-3 h-3" />
                  <span>Size Guide</span>
                </Link>
              </div>
              <div className="grid grid-cols-3 gap-2.5">
                {['Small (6.0")', 'Medium (6.5")', 'Large (7.0")'].map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setSelectedSize(size)}
                    className={`py-2 px-3 text-xs font-medium rounded-xl border transition-all text-center cursor-pointer ${
                      selectedSize === size
                        ? 'border-[#2d5a61] bg-[#2d5a61] text-white shadow-xs'
                        : 'border-[#e0d8c8] bg-[#fdfaf5] text-[#444444] hover:border-[#2d5a61]/50'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Metal Finish selection */}
            {product.availableFinishes && product.availableFinishes.length > 1 ? (
              <div>
                <span className="text-xs font-medium text-[#333333] mb-2 block">
                  Select Metal Charm Finish:
                </span>
                <div className="flex gap-3">
                  {product.availableFinishes.map((finish) => (
                    <button
                      key={finish}
                      type="button"
                      onClick={() => setSelectedFinish(finish)}
                      className={`py-2 px-3 text-xs font-medium rounded-xl border transition-all cursor-pointer ${
                        selectedFinish === finish
                          ? 'border-[#2d5a61] bg-[#fdfaf5] text-[#2d5a61] ring-2 ring-[#2d5a61]/20 font-semibold'
                          : 'border-[#e0d8c8] bg-[#fdfaf5] text-[#555555] hover:border-[#2d5a61]/40'
                      }`}
                    >
                      {finish}
                    </button>
                  ))}
                </div>
              </div>
            ) : product.finish ? (
              <div>
                <span className="text-xs font-medium text-[#333333] mb-1.5 block">
                  Hardware & Metal Finish:
                </span>
                <span className="inline-block py-1.5 px-3.5 text-xs font-semibold rounded-xl border border-[#e0d8c8] bg-[#fdfaf5] text-[#2d5a61]">
                  {product.finish}
                </span>
              </div>
            ) : null}

            {/* Quantity Selector */}
            <div className="flex items-center gap-4">
              <span className="text-xs font-medium text-[#333333]">Quantity:</span>
              <div className="flex items-center bg-[#fdfaf5] border border-[#e0d8c8] rounded-xl overflow-hidden shadow-2xs">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="px-3.5 py-1.5 text-sm font-semibold text-[#444444] hover:bg-[#efe8dc] transition-colors cursor-pointer"
                  disabled={quantity <= 1}
                >
                  -
                </button>
                <span className="px-4 py-1.5 text-xs font-bold text-[#333333] min-w-[2.5rem] text-center">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity((q) => Math.min(product.stock || 10, q + 1))}
                  className="px-3.5 py-1.5 text-sm font-semibold text-[#444444] hover:bg-[#efe8dc] transition-colors cursor-pointer"
                  disabled={quantity >= (product.stock || 10)}
                >
                  +
                </button>
              </div>
              <span className="text-xs text-[#286B73] font-medium">
                {product.stock > 0 ? `${product.stock} pieces in studio stock` : 'Made to order'}
              </span>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row gap-3.5 mb-8">
            <button
              onClick={handleAddToCart}
              className="flex-1 bg-[#2d5a61] text-white py-4 px-6 rounded-2xl font-medium text-sm flex items-center justify-center gap-2 hover:bg-[#1e3c41] transition-all duration-300 shadow-sm hover:shadow-md cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Add to Bag</span>
            </button>

            <button
              onClick={handleBuyNow}
              className="flex-1 bg-[#A96745] text-white py-4 px-6 rounded-2xl font-medium text-sm flex items-center justify-center gap-2 hover:bg-[#8e5233] transition-all duration-300 shadow-sm hover:shadow-md cursor-pointer"
            >
              <span>Buy Now</span>
            </button>
          </div>

          {/* Value Props Guarantee list */}
          <div className="bg-[#fdfaf5] border border-[#e0d8c8] rounded-2xl p-4.5 space-y-3 mb-8">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-[#efe8dc] text-[#2d5a61] shrink-0">
                <Truck className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-[#333333]">Fast Tracked Nationwide Delivery</h4>
                <p className="text-[11px] text-[#666666]">Dispatched within 24-48 hours via TCS Tracked Courier.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-[#efe8dc] text-[#2d5a61] shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-[#333333]">100% Genuine Gemstones & Craftsmanship</h4>
                <p className="text-[11px] text-[#666666]">Individually hand-threaded with durable tensile stretch cord.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-[#efe8dc] text-[#2d5a61] shrink-0">
                <RotateCcw className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-[#333333]">7-Day Hassle-Free Exchange Policy</h4>
                <p className="text-[11px] text-[#666666]">Free resizing and adjustments if it doesn't fit like a dream.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Structured Details Tabs Section */}
      <div className="max-w-7xl mx-auto px-6 md:px-10 mt-12">
        <div className="bg-[#fdfaf5] rounded-3xl border border-[#e0d8c8] p-6 md:p-10 shadow-sm">
          {/* Tab buttons */}
          <div className="flex flex-wrap gap-2 md:gap-4 border-b border-[#e0d8c8] pb-4 mb-6">
            {[
              { id: 'description', label: 'Artisan Story & Description' },
              { id: 'materials', label: 'Gemstones & Materials' },
              { id: 'sizing', label: 'Dimensions & Sizing' },
              { id: 'care', label: 'Jewelry Care & Longevity' },
              { id: 'shipping', label: 'Shipping & Returns' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-2 px-4 rounded-xl text-xs md:text-sm font-medium transition-all cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-[#2d5a61] text-white shadow-xs'
                    : 'text-[#666666] hover:bg-[#efe8dc] hover:text-[#333333]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab content bodies */}
          <div className="text-sm text-[#444444] leading-relaxed max-w-3xl">
            {activeTab === 'description' && (
              <div className="space-y-4">
                <p>{product.description}</p>
                <div className="pt-2">
                  <h5 className="font-semibold text-[#333333] mb-2">Studio Highlights:</h5>
                  <ul className="list-disc pl-5 space-y-1 text-xs md:text-sm text-[#555555]">
                    <li>Every bead is individually inspected for color harmony and crystal clarity.</li>
                    <li>Comes packed in our signature linen dust bag and embossed keepsake box.</li>
                    <li>Handcrafted by Maryam and her studio artisans in Karachi.</li>
                  </ul>
                </div>
              </div>
            )}

            {activeTab === 'materials' && (
              <div className="space-y-4">
                <p>
                  We source natural crystals, cultured freshwater pearls, and tarnish-resistant findings to ensure every piece shines through seasons of daily wear.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  {product.materials.map((mat, i) => (
                    <div key={i} className="flex items-center gap-2.5 p-3 rounded-xl bg-[#efe8dc]/60 border border-[#e0d8c8]">
                      <Sparkles className="w-4 h-4 text-[#B08A5A] shrink-0" />
                      <span className="text-xs font-semibold text-[#333333]">{mat}</span>
                    </div>
                  ))}
                </div>
                <div className="pt-3 border-t border-[#e0d8c8]/70 flex flex-wrap items-center gap-2 text-xs text-[#666666]">
                  <span className="font-semibold text-[#333333]">Available Hardware Finishes:</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-[#fdfaf5] border border-[#e0d8c8] text-[#2d5a61] font-medium">
                    18K Gold Plated
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-[#fdfaf5] border border-[#e0d8c8] text-[#2d5a61] font-medium">
                    Sterling Silver Hue
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-[#fdfaf5] border border-[#e0d8c8] text-[#666666]">
                    Antique Brass
                  </span>
                </div>
              </div>
            )}

            {activeTab === 'sizing' && (
              <div className="space-y-4">
                <p className="font-medium text-[#333333]">{product.dimensions || 'Standard adjustable fit.'}</p>
                <p className="text-xs text-[#666666]">
                  Need a bespoke size for a child, wider wrist, or special ankle measurement? We customize every piece without any alteration surcharge!
                </p>
              </div>
            )}

            {activeTab === 'care' && (
              <div className="space-y-4">
                <p>{product.careInstructions || 'Keep away from direct water, alcohol, perfumes and chlorine pools.'}</p>
                <ul className="list-disc pl-5 space-y-1.5 text-xs md:text-sm text-[#555555]">
                  <li>Store separately in the provided soft microfiber pouch.</li>
                  <li><strong>For 18K Gold Plated pieces:</strong> Wipe gently with a soft dry cotton cloth after wearing to maintain radiant luster.</li>
                  <li><strong>For Sterling Silver & Silver Finishes:</strong> Store dry in an airtight pouch to prevent natural oxidation; gently polish with a silver cloth as needed.</li>
                  <li>Roll bracelets on and off gently rather than pulling on elastic cords.</li>
                </ul>
              </div>
            )}

            {activeTab === 'shipping' && (
              <div className="space-y-3">
                <p>
                  <strong>Domestic Delivery:</strong> 2 to 4 business days across Pakistan via TCS or Leopards Courier with live tracking SMS updates.
                </p>
                <p>
                  <strong>Free Delivery:</strong> Applied automatically on any order of Rs. 3,000 or more.
                </p>
                <p>
                  <strong>Returns & Exchange:</strong> 7 days hassle-free exchange window. Contact our studio WhatsApp at +92 300 1234567.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Related Products Recommendation section */}
      {relatedProducts.length > 0 && (
        <div className="max-w-7xl mx-auto px-6 md:px-10 mt-20">
          <div className="flex items-center justify-between mb-8">
            <div>
              <span className="text-xs font-semibold uppercase tracking-widest text-[#2d5a61]">Complete Your Stack</span>
              <h2 className="font-serif text-2xl md:text-3xl text-[#333333]">You May Also Like</h2>
            </div>
            <Link to="/shop" className="text-xs md:text-sm font-medium text-[#2d5a61] hover:underline">
              View Collection &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {relatedProducts.map((rel) => {
              const isRelWishlisted = wishlistIds.includes(rel.id);
              return (
                <div
                  key={rel.id}
                  className="bg-[#fdfaf5] rounded-2xl p-4 border border-[#e0d8c8] hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="aspect-square rounded-xl overflow-hidden mb-3 relative bg-[#efe8dc]">
                      <img
                        src={rel.image}
                        alt={rel.name}
                        className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform duration-500"
                        onClick={() => navigate(`/product/${rel.slug}`)}
                      />
                      <button
                        onClick={() => onToggleWishlist(rel)}
                        className={`absolute top-2.5 right-2.5 p-1.5 rounded-full transition-all shadow-xs ${
                          isRelWishlisted ? 'bg-red-50 text-red-500' : 'bg-white/80 text-[#666666] hover:text-red-500'
                        }`}
                      >
                        <Heart className="w-3.5 h-3.5" fill={isRelWishlisted ? 'currentColor' : 'none'} />
                      </button>
                    </div>
                    <h4
                      onClick={() => navigate(`/product/${rel.slug}`)}
                      className="font-serif text-xs md:text-sm text-[#333333] truncate hover:text-[#2d5a61] cursor-pointer mb-1"
                    >
                      {rel.name}
                    </h4>
                    <p className="text-xs font-semibold text-[#333333] mb-3">
                      Rs. {rel.price.toLocaleString()}
                    </p>
                  </div>

                  <button
                    onClick={() => onAddToCart(rel, 1)}
                    className="w-full border border-[#e0d8c8] py-2 rounded-full text-xs font-medium text-[#333333] hover:bg-[#2d5a61] hover:text-white hover:border-[#2d5a61] transition-colors"
                  >
                    Add to Bag
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
