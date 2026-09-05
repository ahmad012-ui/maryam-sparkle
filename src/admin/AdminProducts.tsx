import React, { useState } from 'react';
import {
  Gem,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  X,
  Sparkles,
  ArrowUpDown,
  ExternalLink,
  Images,
  Image as ImageIcon,
} from 'lucide-react';
import { AdminProduct } from './types';
import { MultiImageUpload } from './MultiImageUpload';

interface AdminProductsProps {
  products: AdminProduct[];
  onSaveProducts: (products: AdminProduct[]) => void;
  isAddModalOpen?: boolean;
  onCloseAddModal?: () => void;
}

export const CATEGORY_SKU_PREFIX: Record<string, string> = {
  Bracelets: 'MS-BRC',
  Anklets: 'MS-ANK',
  Necklaces: 'MS-NCK',
  Earrings: 'MS-EAR',
  Rings: 'MS-RNG',
  'Custom Pieces': 'MS-CST',
};

export const generateCategorySku = (
  category: string = 'Bracelets',
  currentProducts: AdminProduct[] = []
): string => {
  const prefix =
    CATEGORY_SKU_PREFIX[category] ||
    `MS-${category.replace(/[^a-zA-Z]/g, '').slice(0, 3).toUpperCase()}`;

  let maxNum = 0;
  const regex = new RegExp(`^${prefix}-(\\d+)`, 'i');

  currentProducts.forEach((p) => {
    if (p.sku) {
      const match = p.sku.match(regex);
      if (match) {
        const parsed = parseInt(match[1], 10);
        if (!isNaN(parsed) && parsed > maxNum) {
          maxNum = parsed;
        }
      }
    }
  });

  if (maxNum === 0) {
    const inCat = currentProducts.filter((p) => p.category === category).length;
    maxNum = inCat;
  }

  const nextSeq = maxNum + 1;
  return `${prefix}-${String(nextSeq).padStart(3, '0')}`;
};

const EMPTY_PRODUCT_FORM: Partial<AdminProduct> = {
  name: '',
  category: 'Bracelets',
  sku: '',
  price: 0,
  compareAtPrice: undefined,
  stock: 0,
  image: '',
  images: [],
  materials: [],
  finish: '',
  description: '',
  isFeatured: false,
  isBestSeller: false,
  inStock: false,
};

export const AdminProducts: React.FC<AdminProductsProps> = ({
  products,
  onSaveProducts,
  isAddModalOpen = false,
  onCloseAddModal,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [stockFilter, setStockFilter] = useState<'All' | 'InStock' | 'LowStock' | 'OutOfStock'>('All');

  // Modal states
  const [showModal, setShowModal] = useState(isAddModalOpen);
  const [editingProduct, setEditingProduct] = useState<AdminProduct | null>(null);
  const [deleteCandidate, setDeleteCandidate] = useState<AdminProduct | null>(null);

  // Form state for add / edit - starts completely clean with neutral defaults
  const [formData, setFormData] = useState<Partial<AdminProduct>>(EMPTY_PRODUCT_FORM);

  const categories = ['All', 'Bracelets', 'Anklets', 'Necklaces', 'Earrings', 'Rings', 'Custom Pieces'];

  // Filter products
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    const matchesStock =
      stockFilter === 'All' ||
      (stockFilter === 'InStock' && p.stock > 5) ||
      (stockFilter === 'LowStock' && p.stock > 0 && p.stock <= 5) ||
      (stockFilter === 'OutOfStock' && p.stock === 0);

    return matchesSearch && matchesCategory && matchesStock;
  });

  // Calculate catalog stats
  const totalCatalogValue = products.reduce((sum, p) => sum + p.price * p.stock, 0);
  const lowStockCount = products.filter((p) => p.stock > 0 && p.stock <= 5).length;
  const outOfStockCount = products.filter((p) => p.stock === 0).length;

  const handleOpenAdd = () => {
    setEditingProduct(null);
    const defaultCat: AdminProduct['category'] = 'Bracelets';
    const initialSku = generateCategorySku(defaultCat, products);
    setFormData({
      ...EMPTY_PRODUCT_FORM,
      category: defaultCat,
      sku: initialSku,
    });
    setShowModal(true);
  };

  const handleOpenEdit = (prod: AdminProduct) => {
    setEditingProduct(prod);
    const prodImages =
      prod.images && prod.images.length > 0
        ? prod.images
        : [prod.image].filter(Boolean);
    setFormData({
      ...prod,
      images: prodImages,
      image: prodImages[0] || prod.image || '',
    });
    setShowModal(true);
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim()) return;

    const finalImages =
      formData.images && formData.images.length > 0
        ? formData.images
        : formData.image
        ? [formData.image]
        : [];
    const primaryImage = finalImages[0] || '';

    if (editingProduct) {
      // Update existing
      const updated = products.map((p) =>
        p.id === editingProduct.id
          ? ({
              ...p,
              ...formData,
              name: formData.name?.trim() || p.name,
              image: primaryImage,
              images: finalImages,
              inStock: (formData.stock ?? 0) > 0,
            } as AdminProduct)
          : p
      );
      onSaveProducts(updated);
    } else {
      // Create new
      const newProd: AdminProduct = {
        id: `prod-${Date.now()}`,
        sku: formData.sku?.trim() || `MS-${Date.now().toString().slice(-4)}`,
        name: formData.name.trim(),
        category: (formData.category as AdminProduct['category']) || 'Bracelets',
        price: Number(formData.price) || 0,
        compareAtPrice: formData.compareAtPrice ? Number(formData.compareAtPrice) : undefined,
        stock: Number(formData.stock) || 0,
        image: primaryImage,
        images: finalImages,
        materials: Array.isArray(formData.materials) && formData.materials.length > 0
          ? formData.materials
          : [],
        finish: formData.finish?.trim() || '',
        description: formData.description?.trim() || '',
        isFeatured: formData.isFeatured || false,
        isBestSeller: formData.isBestSeller || false,
        inStock: (Number(formData.stock) || 0) > 0,
        createdAt: new Date().toISOString().split('T')[0],
      };
      onSaveProducts([newProd, ...products]);
    }

    setShowModal(false);
    if (onCloseAddModal) onCloseAddModal();
  };

  const handleConfirmDelete = () => {
    if (!deleteCandidate) return;
    const updated = products.filter((p) => p.id !== deleteCandidate.id);
    onSaveProducts(updated);
    setDeleteCandidate(null);
  };

  const handleAdjustStock = (prodId: string, delta: number) => {
    const updated = products.map((p) => {
      if (p.id === prodId) {
        const newStock = Math.max(0, p.stock + delta);
        return {
          ...p,
          stock: newStock,
          inStock: newStock > 0,
        };
      }
      return p;
    });
    onSaveProducts(updated);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white dark:bg-[#1a1e24] p-4 sm:p-6 rounded-2xl border border-gray-200/80 dark:border-gray-800 shadow-2xs">
        <div>
          <h2 className="font-serif text-xl sm:text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Gem className="w-5 h-5 text-[#2d5a61] dark:text-teal-400 shrink-0" />
            <span>Jewelry Inventory & Catalog</span>
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manage handcrafted pieces, stock quantities, pricing (PKR), and product details.
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-semibold bg-[#2d5a61] text-white hover:bg-[#1e3c41] transition-colors flex items-center justify-center gap-2 shadow-xs shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Product</span>
        </button>
      </div>

      {/* Catalog KPI Metrics Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        <div className="bg-white dark:bg-[#1a1e24] p-3.5 sm:p-4 rounded-xl border border-gray-200/80 dark:border-gray-800">
          <p className="text-[10px] sm:text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Total Designs</p>
          <p className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mt-1">{products.length} SKUs</p>
        </div>
        <div className="bg-white dark:bg-[#1a1e24] p-3.5 sm:p-4 rounded-xl border border-gray-200/80 dark:border-gray-800">
          <p className="text-[10px] sm:text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Inventory Value</p>
          <p className="text-lg sm:text-xl font-bold text-[#2d5a61] dark:text-teal-400 mt-1 truncate">
            PKR {totalCatalogValue.toLocaleString()}
          </p>
        </div>
        <div className="bg-white dark:bg-[#1a1e24] p-3.5 sm:p-4 rounded-xl border border-gray-200/80 dark:border-gray-800">
          <p className="text-[10px] sm:text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Low Stock (≤5)</p>
          <p className="text-lg sm:text-xl font-bold text-amber-600 dark:text-amber-400 mt-1">{lowStockCount} items</p>
        </div>
        <div className="bg-white dark:bg-[#1a1e24] p-3.5 sm:p-4 rounded-xl border border-gray-200/80 dark:border-gray-800">
          <p className="text-[10px] sm:text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Out of Stock</p>
          <p className="text-lg sm:text-xl font-bold text-rose-600 dark:text-rose-400 mt-1">{outOfStockCount} items</p>
        </div>
      </div>

      {/* Filters and Search Bar */}
      <div className="bg-white dark:bg-[#1a1e24] p-3.5 sm:p-5 rounded-2xl border border-gray-200/80 dark:border-gray-800 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          {/* Search Box */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name, SKU, or tag..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9.5 pr-4 py-2.5 md:py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#2d5a61]/30 focus:border-[#2d5a61]"
            />
          </div>

          {/* Stock Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
            {(['All', 'InStock', 'LowStock', 'OutOfStock'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setStockFilter(mode)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-colors shrink-0 ${
                  stockFilter === mode
                    ? 'bg-[#2d5a61] text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                {mode === 'InStock'
                  ? 'In Stock (>5)'
                  : mode === 'LowStock'
                  ? 'Low Stock (≤5)'
                  : mode === 'OutOfStock'
                  ? 'Out of Stock'
                  : 'All Stock'}
              </button>
            ))}
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pt-2 border-t border-gray-100 dark:border-gray-800 pb-1 scrollbar-none">
          <span className="text-xs text-gray-400 font-medium whitespace-nowrap mr-1 shrink-0">Category:</span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-colors shrink-0 ${
                selectedCategory === cat
                  ? 'bg-[#c59d5f] text-white shadow-2xs'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Products Table & Mobile Cards */}
      <div className="bg-white dark:bg-[#1a1e24] rounded-2xl border border-gray-200/80 dark:border-gray-800 shadow-2xs overflow-hidden">
        {/* Mobile View: Touch-Friendly Product Cards */}
        <div className="block md:hidden divide-y divide-gray-100 dark:divide-gray-800">
          {filteredProducts.length === 0 ? (
            <div className="py-12 text-center text-xs text-gray-400">
              No products match the selected filters.
            </div>
          ) : (
            filteredProducts.map((p) => {
              const isLow = p.stock > 0 && p.stock <= 5;
              const isOut = p.stock === 0;

              return (
                <div key={p.id} className="p-4 space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="relative shrink-0">
                      {p.image ? (
                        <img
                          src={p.image}
                          alt={p.name}
                          className="w-14 h-14 rounded-xl object-cover border border-gray-200 dark:border-gray-700"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-xl bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-400">
                          <ImageIcon className="w-6 h-6" />
                        </div>
                      )}
                      {p.images && p.images.length > 1 && (
                        <span className="absolute -bottom-1 -right-1 bg-gray-900/85 text-white text-[8px] font-bold px-1.5 py-0.2 rounded-md flex items-center gap-0.5 shadow-2xs">
                          <Images className="w-2.5 h-2.5 text-[#c59d5f]" />
                          <span>{p.images.length}</span>
                        </span>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 font-medium">
                          {p.category}
                        </span>
                        <span className="font-mono text-[10px] text-gray-400">
                          {p.sku}
                        </span>
                        {p.isBestSeller && (
                          <span className="text-[9px] bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 px-1.5 py-0.2 rounded font-semibold">
                            Best Seller
                          </span>
                        )}
                      </div>
                      <p className="font-semibold text-xs text-gray-900 dark:text-white mt-1 line-clamp-1">
                        {p.name}
                      </p>
                      {p.finish && (
                        <p className="text-[10px] text-gray-400 mt-0.5">{p.finish}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-gray-50 dark:border-gray-800/60">
                    <div>
                      <span className="font-bold text-xs text-gray-900 dark:text-white">
                        PKR {p.price.toLocaleString()}
                      </span>
                      {p.compareAtPrice && (
                        <span className="ml-1.5 text-[10px] text-gray-400 line-through">
                          PKR {p.compareAtPrice.toLocaleString()}
                        </span>
                      )}
                    </div>

                    <div>
                      {isOut ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/30 dark:text-rose-400">
                          Sold Out
                        </span>
                      ) : isLow ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/30 dark:text-amber-400">
                          Low ({p.stock})
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400">
                          In Stock ({p.stock})
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Mobile Stock & Actions Toolbar */}
                  <div className="flex items-center justify-between gap-2 pt-1">
                    <div className="flex items-center gap-1.5 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-xl">
                      <span className="text-[10px] text-gray-400 font-medium mr-1">Stock:</span>
                      <button
                        onClick={() => handleAdjustStock(p.id, -1)}
                        className="w-6 h-6 rounded-lg bg-white dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-bold flex items-center justify-center shadow-2xs"
                        title="Decrease stock"
                      >
                        -
                      </button>
                      <span className="font-semibold text-xs min-w-[20px] text-center text-gray-800 dark:text-gray-200">
                        {p.stock}
                      </span>
                      <button
                        onClick={() => handleAdjustStock(p.id, 1)}
                        className="w-6 h-6 rounded-lg bg-white dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-bold flex items-center justify-center shadow-2xs"
                        title="Increase stock"
                      >
                        +
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenEdit(p)}
                        className="px-3 py-1.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-xs font-semibold flex items-center gap-1 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => setDeleteCandidate(p)}
                        className="p-1.5 rounded-xl text-gray-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                        title="Delete product"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Desktop View: Full Data Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[700px]">
            <thead className="bg-gray-50/70 dark:bg-gray-800/50 text-[11px] uppercase tracking-wider text-gray-400 border-b border-gray-200 dark:border-gray-800">
              <tr>
                <th className="py-3.5 px-4 font-semibold">Jewelry Item</th>
                <th className="py-3.5 px-3 font-semibold">Category</th>
                <th className="py-3.5 px-3 font-semibold">SKU</th>
                <th className="py-3.5 px-3 font-semibold text-right">Price (PKR)</th>
                <th className="py-3.5 px-3 font-semibold text-center">Stock Level</th>
                <th className="py-3.5 px-3 font-semibold text-center">Status</th>
                <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-400">
                    No products match the selected filters.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                  const isLow = p.stock > 0 && p.stock <= 5;
                  const isOut = p.stock === 0;

                  return (
                    <tr
                      key={p.id}
                      className="hover:bg-gray-50/60 dark:hover:bg-gray-800/30 transition-colors"
                    >
                      {/* Product Thumbnail & Name */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="relative shrink-0">
                            {p.image ? (
                              <img
                                src={p.image}
                                alt={p.name}
                                className="w-11 h-11 rounded-lg object-cover border border-gray-200 dark:border-gray-700"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).style.display = 'none';
                                }}
                              />
                            ) : (
                              <div className="w-11 h-11 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-400">
                                <ImageIcon className="w-5 h-5" />
                              </div>
                            )}
                            {p.images && p.images.length > 1 && (
                              <span
                                className="absolute -bottom-1 -right-1 bg-gray-900/85 text-white text-[8px] font-bold px-1 py-0.2 rounded-md flex items-center gap-0.5 shadow-2xs border border-white/20"
                                title={`${p.images.length} gallery photos`}
                              >
                                <Images className="w-2.5 h-2.5 text-[#c59d5f]" />
                                <span>{p.images.length}</span>
                              </span>
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 dark:text-white line-clamp-1">
                              {p.name}
                            </p>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              {p.isBestSeller && (
                                <span className="text-[9px] bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 px-1.5 py-0.2 rounded font-semibold">
                                  Best Seller
                                </span>
                              )}
                              <span className="text-[10px] text-gray-400">{p.finish}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-3 text-gray-600 dark:text-gray-300">{p.category}</td>
                      <td className="py-3 px-3 font-mono text-[11px] text-gray-500 dark:text-gray-400">
                        {p.sku}
                      </td>

                      {/* Price */}
                      <td className="py-3 px-3 text-right">
                        <span className="font-bold text-gray-900 dark:text-white">
                          PKR {p.price.toLocaleString()}
                        </span>
                        {p.compareAtPrice && (
                          <span className="block text-[10px] text-gray-400 line-through">
                            PKR {p.compareAtPrice.toLocaleString()}
                          </span>
                        )}
                      </td>

                      {/* Stock Adjustment Controls */}
                      <td className="py-3 px-3 text-center">
                        <div className="inline-flex items-center gap-1.5 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-lg">
                          <button
                            onClick={() => handleAdjustStock(p.id, -1)}
                            className="w-5 h-5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 font-bold"
                            title="Decrease stock"
                          >
                            -
                          </button>
                          <span
                            className={`font-semibold min-w-[24px] text-center ${
                              isOut
                                ? 'text-rose-600'
                                : isLow
                                ? 'text-amber-600'
                                : 'text-gray-800 dark:text-gray-200'
                            }`}
                          >
                            {p.stock}
                          </span>
                          <button
                            onClick={() => handleAdjustStock(p.id, 1)}
                            className="w-5 h-5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 font-bold"
                            title="Increase stock"
                          >
                            +
                          </button>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-3 text-center">
                        {isOut ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/30 dark:text-rose-400">
                            Sold Out
                          </span>
                        ) : isLow ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/30 dark:text-amber-400">
                            Low ({p.stock})
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400">
                            In Stock
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEdit(p)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-[#2d5a61] hover:bg-teal-50 dark:hover:bg-teal-950/40 transition-colors"
                            title="Edit product"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteCandidate(p)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                            title="Delete product"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Product Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/50 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#1a1e24] rounded-2xl border border-gray-200 dark:border-gray-800 max-w-xl w-full p-4 sm:p-6 shadow-2xl max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-800">
              <h3 className="font-serif text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#c59d5f]" />
                {editingProduct ? 'Edit Jewelry Item' : 'Add New Jewelry Design'}
              </h3>
              <button
                onClick={() => {
                  setShowModal(false);
                  if (onCloseAddModal) onCloseAddModal();
                }}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveForm} className="space-y-4 pt-4 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 dark:text-gray-200 mb-1">
                  Product Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Celestial Moonstone Pendant Choker"
                  className="w-full px-3.5 py-2.5 sm:py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#2d5a61]/30 focus:border-[#2d5a61]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 dark:text-gray-200 mb-1">
                    Category *
                  </label>
                  <select
                    id="admin-product-category-select"
                    value={formData.category || 'Bracelets'}
                    onChange={(e) => {
                      const newCategory = e.target.value as AdminProduct['category'];
                      const autoSku = generateCategorySku(newCategory, products);
                      setFormData((prev) => ({
                        ...prev,
                        category: newCategory,
                        sku: autoSku,
                      }));
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#2d5a61]/30 focus:border-[#2d5a61] transition-all cursor-pointer font-medium text-xs"
                  >
                    <option value="Bracelets">Bracelets</option>
                    <option value="Anklets">Anklets</option>
                    <option value="Necklaces">Necklaces</option>
                    <option value="Earrings">Earrings</option>
                    <option value="Rings">Rings</option>
                    <option value="Custom Pieces">Custom Pieces</option>
                  </select>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block font-semibold text-gray-700 dark:text-gray-200">
                      SKU Code
                    </label>
                    <span className="text-[10px] text-gray-400">
                      Auto by category
                    </span>
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      value={formData.sku || ''}
                      onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                      placeholder="e.g. MS-BRC-001"
                      className="w-full pl-3.5 pr-16 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800 text-gray-900 dark:text-white font-mono text-xs focus:outline-hidden focus:ring-2 focus:ring-[#2d5a61]/30 focus:border-[#2d5a61]"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const autoSku = generateCategorySku(formData.category || 'Bracelets', products);
                        setFormData((prev) => ({ ...prev, sku: autoSku }));
                      }}
                      className="absolute right-1.5 top-1/2 -translate-y-1/2 px-2 py-1 bg-gray-200/80 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-[10px] font-semibold text-gray-700 dark:text-gray-200 rounded-lg flex items-center gap-1 transition-colors"
                      title="Regenerate SKU for selected category"
                    >
                      <Sparkles className="w-2.5 h-2.5 text-[#c59d5f]" />
                      <span>Auto</span>
                    </button>
                  </div>
                  <p className="text-[10px] text-gray-400 mt-1">
                    Prefix: <span className="font-mono text-gray-600 dark:text-gray-300">{CATEGORY_SKU_PREFIX[formData.category || 'Bracelets'] || 'MS-PRD'}</span> (auto-assigned, editable)
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 dark:text-gray-200 mb-1">
                    Price (PKR) *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    placeholder="0"
                    value={formData.price !== undefined && formData.price > 0 ? formData.price : ''}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value === '' ? 0 : Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 sm:py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#2d5a61]/30 focus:border-[#2d5a61]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 dark:text-gray-200 mb-1">
                    Compare Price (PKR)
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="Optional"
                    value={formData.compareAtPrice || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, compareAtPrice: e.target.value === '' ? undefined : Number(e.target.value) })
                    }
                    className="w-full px-3.5 py-2.5 sm:py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#2d5a61]/30 focus:border-[#2d5a61]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 dark:text-gray-200 mb-1">
                    Stock Quantity *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    placeholder="0"
                    value={formData.stock !== undefined && formData.stock > 0 ? formData.stock : ''}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value === '' ? 0 : Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 sm:py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#2d5a61]/30 focus:border-[#2d5a61]"
                  />
                </div>
              </div>

              {/* Multiple Image Upload Component */}
              <div>
                <MultiImageUpload
                  images={
                    formData.images && formData.images.length > 0
                      ? formData.images
                      : formData.image
                      ? [formData.image]
                      : []
                  }
                  onChange={(newImages) =>
                    setFormData({
                      ...formData,
                      images: newImages,
                      image: newImages[0] || '',
                    })
                  }
                  maxImages={10}
                  label="Jewelry Photography & Gallery (Multiple Upload)"
                  description="Upload high-resolution product photos. The first image will be used as the primary storefront cover."
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 dark:text-gray-200 mb-1">
                    Metal Finish
                  </label>
                  <input
                    type="text"
                    value={formData.finish || ''}
                    onChange={(e) => setFormData({ ...formData, finish: e.target.value })}
                    placeholder="18K Gold Plated / Rose Gold"
                    className="w-full px-3.5 py-2.5 sm:py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#2d5a61]/30 focus:border-[#2d5a61]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 dark:text-gray-200 mb-1">
                    Materials (comma separated)
                  </label>
                  <input
                    type="text"
                    value={Array.isArray(formData.materials) ? formData.materials.join(', ') : ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        materials: e.target.value ? e.target.value.split(',').map((s) => s.trim()).filter(Boolean) : [],
                      })
                    }
                    placeholder="Glass beads, Pearls, Wire"
                    className="w-full px-3.5 py-2.5 sm:py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#2d5a61]/30 focus:border-[#2d5a61]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 dark:text-gray-200 mb-1">
                  Product Description
                </label>
                <textarea
                  rows={3}
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe the artisan beadwork and aesthetic details..."
                  className="w-full px-3.5 py-2.5 sm:py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#2d5a61]/30 focus:border-[#2d5a61]"
                />
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isBestSeller || false}
                    onChange={(e) =>
                      setFormData({ ...formData, isBestSeller: e.target.checked })
                    }
                    className="rounded text-[#2d5a61] focus:ring-[#2d5a61] w-4 h-4"
                  />
                  <span className="text-gray-700 dark:text-gray-300 font-medium">Best Seller Badge</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isFeatured || false}
                    onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                    className="rounded text-[#2d5a61] focus:ring-[#2d5a61] w-4 h-4"
                  />
                  <span className="text-gray-700 dark:text-gray-300 font-medium">Feature on Homepage</span>
                </label>
              </div>

              <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-end gap-2.5 sm:gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    if (onCloseAddModal) onCloseAddModal();
                  }}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 font-medium text-center justify-center transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#2d5a61] text-white font-semibold hover:bg-[#1e3c41] shadow-xs text-center justify-center transition-colors"
                >
                  {editingProduct ? 'Save Changes' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#1a1e24] rounded-2xl border border-gray-200 dark:border-gray-800 max-w-sm w-full p-5 sm:p-6 text-center shadow-xl">
            <div className="w-12 h-12 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-600 mx-auto flex items-center justify-center mb-3">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-lg font-bold text-gray-900 dark:text-white">
              Delete Product?
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 mb-5">
              Are you sure you want to remove <b>"{deleteCandidate.name}"</b>? This action will remove it from the store catalog.
            </p>
            <div className="flex flex-col-reverse sm:flex-row items-center justify-center gap-2 sm:gap-3">
              <button
                onClick={() => setDeleteCandidate(null)}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                Keep Product
              </button>
              <button
                onClick={handleConfirmDelete}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-rose-600 text-white text-xs font-semibold hover:bg-rose-700 shadow-xs transition-colors"
              >
                Delete SKU
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
