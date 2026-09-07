import { PRODUCTS, CATEGORIES } from '../data/products';
import { Product, Category } from '../types';

export interface ProductFilters {
  category?: string | null;
  searchQuery?: string;
  minPrice?: number;
  maxPrice?: number;
  inStockOnly?: boolean;
  material?: string;
  color?: string;
  sortBy?: 'featured' | 'newest' | 'price-low' | 'price-high' | 'rating';
}

export const productService = {
  /**
   * Get all products or filtered product list
   */
  async getProducts(filters?: ProductFilters): Promise<Product[]> {
    let result = [...PRODUCTS];

    if (filters?.category && filters.category !== 'all') {
      const cat = filters.category.toLowerCase();
      result = result.filter(
        (p) =>
          p.category.toLowerCase() === cat ||
          p.category.toLowerCase().replace(/\s+/g, '-') === cat ||
          (cat === 'custom-pieces' && p.category === 'Custom Pieces')
      );
    }

    if (filters?.searchQuery && filters.searchQuery.trim()) {
      const q = filters.searchQuery.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.shortDescription?.toLowerCase().includes(q) ||
          p.materials.some((m) => m.toLowerCase().includes(q)) ||
          p.colors?.some((c) => c.toLowerCase().includes(q)) ||
          p.tags?.some((t) => t.toLowerCase().includes(q)) ||
          p.category.toLowerCase().includes(q)
      );
    }

    if (filters?.minPrice !== undefined) {
      result = result.filter((p) => p.price >= (filters.minPrice ?? 0));
    }

    if (filters?.maxPrice !== undefined) {
      result = result.filter((p) => p.price <= (filters.maxPrice ?? Infinity));
    }

    if (filters?.inStockOnly) {
      result = result.filter((p) => p.inStock);
    }

    if (filters?.material) {
      const mat = filters.material.toLowerCase();
      result = result.filter((p) => {
        if (mat.includes('gold')) {
          return (
            (p.finish?.toLowerCase().includes('gold') ?? false) ||
            (p.availableFinishes?.some((f) => f.toLowerCase().includes('gold')) ?? false) ||
            p.materials.some((m) => m.toLowerCase().includes('gold')) ||
            (p.colors?.some((c) => c.toLowerCase().includes('gold')) ?? false) ||
            (p.tags?.some((t) => t.toLowerCase().includes('gold')) ?? false)
          );
        }
        if (mat.includes('silver')) {
          return (
            (p.finish?.toLowerCase().includes('silver') ?? false) ||
            (p.availableFinishes?.some((f) => f.toLowerCase().includes('silver')) ?? false) ||
            p.materials.some((m) => m.toLowerCase().includes('silver') || m.toLowerCase().includes('sterling')) ||
            (p.colors?.some((c) => c.toLowerCase().includes('silver') || c.toLowerCase().includes('sterling')) ?? false) ||
            (p.tags?.some((t) => t.toLowerCase().includes('silver') || t.toLowerCase().includes('sterling')) ?? false) ||
            (p.shortDescription?.toLowerCase().includes('silver') ?? false)
          );
        }
        if (mat.includes('brass')) {
          return (
            (p.finish?.toLowerCase().includes('brass') ?? false) ||
            p.materials.some((m) => m.toLowerCase().includes('brass'))
          );
        }
        if (mat.includes('steel')) {
          return (
            (p.finish?.toLowerCase().includes('steel') ?? false) ||
            p.materials.some((m) => m.toLowerCase().includes('steel'))
          );
        }
        if (mat.includes('pearl')) {
          return p.materials.some((m) => m.toLowerCase().includes('pearl'));
        }
        return (
          p.materials.some((m) => m.toLowerCase().includes(mat)) ||
          (p.tags?.some((t) => t.toLowerCase().includes(mat)) ?? false) ||
          (p.finish?.toLowerCase().includes(mat) ?? false)
        );
      });
    }

    if (filters?.color) {
      const col = filters.color.toLowerCase();
      result = result.filter((p) =>
        p.colors?.some((c) => c.toLowerCase().includes(col))
      );
    }

    if (filters?.sortBy) {
      switch (filters.sortBy) {
        case 'newest':
          result.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
          break;
        case 'price-low':
          result.sort((a, b) => a.price - b.price);
          break;
        case 'price-high':
          result.sort((a, b) => b.price - a.price);
          break;
        case 'rating':
          result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
          break;
        case 'featured':
        default:
          result.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
          break;
      }
    }

    return result;
  },

  /**
   * Get single product by slug or id
   */
  async getProductBySlug(slug: string): Promise<Product | null> {
    const product = PRODUCTS.find((p) => p.slug === slug || p.id === slug);
    return product || null;
  },

  /**
   * Get single product by ID
   */
  async getProductById(id: string): Promise<Product | null> {
    const product = PRODUCTS.find((p) => p.id === id);
    return product || null;
  },

  /**
   * Get related products based on category or shared tags
   */
  async getRelatedProducts(currentProductId: string, limit = 4): Promise<Product[]> {
    const current = PRODUCTS.find((p) => p.id === currentProductId);
    if (!current) return PRODUCTS.slice(0, limit);

    const related = PRODUCTS.filter(
      (p) => p.id !== currentProductId && p.category === current.category
    );

    if (related.length < limit) {
      const others = PRODUCTS.filter(
        (p) => p.id !== currentProductId && p.category !== current.category
      );
      return [...related, ...others].slice(0, limit);
    }

    return related.slice(0, limit);
  },

  /**
   * Get all categories with counts
   */
  async getCategories(): Promise<Category[]> {
    return CATEGORIES.map((cat) => {
      const count = PRODUCTS.filter(
        (p) => p.category.toLowerCase() === cat.name.toLowerCase()
      ).length;
      return {
        ...cat,
        itemCount: count > 0 ? count : cat.itemCount
      };
    });
  },

  /**
   * Get all unique materials across catalog
   */
  async getUniqueMaterials(): Promise<string[]> {
    const materialsSet = new Set<string>();
    PRODUCTS.forEach((p) => {
      p.materials.forEach((m) => materialsSet.add(m));
    });
    return Array.from(materialsSet);
  }
};
