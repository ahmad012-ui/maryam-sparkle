import { PRODUCTS as LOCAL_PRODUCTS, CATEGORIES as LOCAL_CATEGORIES } from '../data/products';
import { Product, Category } from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

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

function mapSupabaseProductToProduct(sp: Record<string, any>, images: string[] = []): Product {
  const primaryImage = images.length > 0 ? images[0] : (sp.image_url || LOCAL_PRODUCTS[0].image);
  return {
    id: sp.id,
    sku: sp.sku || `MS-${sp.name.slice(0, 3).toUpperCase()}`,
    name: sp.name,
    slug: sp.slug,
    description: sp.description || '',
    shortDescription: sp.short_description || undefined,
    price: Number(sp.price),
    compareAtPrice: sp.compare_at_price ? Number(sp.compare_at_price) : undefined,
    originalPrice: sp.compare_at_price ? Number(sp.compare_at_price) : undefined,
    category: sp.category_name || (sp.categories && sp.categories.name) || sp.category_slug || 'Bracelets',
    materials: sp.materials || ['Glass beads', 'Gold-plated wire'],
    colors: sp.colors || ['Gold', 'Multicolor'],
    finish: sp.finish || '18K Gold Plated',
    availableFinishes: sp.available_finishes || ['18K Gold Plated', 'Silver', 'Rose Gold'],
    isFeatured: Boolean(sp.is_featured),
    isBestSeller: Boolean(sp.is_best_seller),
    isNew: Boolean(sp.is_new),
    inStock: Boolean(sp.in_stock && (sp.stock === undefined || sp.stock > 0)),
    stock: sp.stock !== undefined ? sp.stock : 10,
    image: primaryImage,
    images: images.length > 0 ? images : [primaryImage],
    rating: sp.rating ? Number(sp.rating) : 5.0,
    reviewsCount: sp.reviews_count || 0,
    tags: sp.tags || [],
  };
}

export const productService = {
  /**
   * Get all products or filtered product list from Supabase with catalog fallback
   */
  async getProducts(filters?: ProductFilters): Promise<Product[]> {
    if (isSupabaseConfigured()) {
      try {
        let query = supabase
          .from('products')
          .select(`
            *,
            categories ( name, slug ),
            product_images ( image_url, is_primary, sort_order )
          `)
          .eq('status', 'active');

        if (filters?.category && filters.category !== 'all') {
          const cat = filters.category.toLowerCase();
          query = query.or(`category_slug.eq.${cat},category_slug.ilike.%${cat}%`);
        }

        if (filters?.minPrice !== undefined) {
          query = query.gte('price', filters.minPrice);
        }

        if (filters?.maxPrice !== undefined) {
          query = query.lte('price', filters.maxPrice);
        }

        if (filters?.inStockOnly) {
          query = query.eq('in_stock', true).gt('stock', 0);
        }

        const { data, error } = await query;

        if (!error && data && data.length > 0) {
          let list: Product[] = data.map((item) => {
            const sortedImages = (item.product_images || [])
              .sort((a: any, b: any) => (b.is_primary ? 1 : 0) - (a.is_primary ? 1 : 0) || a.sort_order - b.sort_order)
              .map((img: any) => img.image_url);
            return mapSupabaseProductToProduct(item, sortedImages);
          });

          // Client-side text & color search filtering
          if (filters?.searchQuery && filters.searchQuery.trim()) {
            const q = filters.searchQuery.toLowerCase().trim();
            list = list.filter(
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

          if (filters?.material) {
            const mat = filters.material.toLowerCase();
            list = list.filter((p) =>
              p.materials.some((m) => m.toLowerCase().includes(mat)) ||
              (p.finish?.toLowerCase().includes(mat) ?? false)
            );
          }

          if (filters?.color) {
            const col = filters.color.toLowerCase();
            list = list.filter((p) => p.colors?.some((c) => c.toLowerCase().includes(col)));
          }

          if (filters?.sortBy) {
            switch (filters.sortBy) {
              case 'newest':
                list.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
                break;
              case 'price-low':
                list.sort((a, b) => a.price - b.price);
                break;
              case 'price-high':
                list.sort((a, b) => b.price - a.price);
                break;
              case 'rating':
                list.sort((a, b) => (b.rating || 0) - (a.rating || 0));
                break;
              case 'featured':
              default:
                list.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
                break;
            }
          }

          return list;
        }
      } catch (err) {
        console.warn('Supabase products fetch fallback to local catalog:', err);
      }
    }

    // High performance local catalog fallback
    let result = [...LOCAL_PRODUCTS];

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
            (p.tags?.some((t) => t.toLowerCase().includes('silver') || t.toLowerCase().includes('sterling')) ?? false)
          );
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
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('products')
          .select(`
            *,
            categories ( name, slug ),
            product_images ( image_url, is_primary, sort_order )
          `)
          .or(`slug.eq.${slug},id.eq.${slug}`)
          .maybeSingle();

        if (!error && data) {
          const sortedImages = (data.product_images || [])
            .sort((a: any, b: any) => (b.is_primary ? 1 : 0) - (a.is_primary ? 1 : 0) || a.sort_order - b.sort_order)
            .map((img: any) => img.image_url);
          return mapSupabaseProductToProduct(data, sortedImages);
        }
      } catch (err) {
        console.warn('Supabase single product fetch fallback:', err);
      }
    }

    const product = LOCAL_PRODUCTS.find((p) => p.slug === slug || p.id === slug);
    return product || null;
  },

  /**
   * Get single product by ID
   */
  async getProductById(id: string): Promise<Product | null> {
    return this.getProductBySlug(id);
  },

  /**
   * Get related products based on multi-dimensional scoring (category, materials, color, price proximity, tags)
   */
  async getRelatedProducts(currentProductId: string, limit = 4): Promise<Product[]> {
    const allProducts = await this.getProducts();
    const current = allProducts.find((p) => p.id === currentProductId || p.slug === currentProductId);
    if (!current) return allProducts.slice(0, limit);

    const scored = allProducts
      .filter((p) => p.id !== current.id && p.slug !== current.slug)
      .map((item) => {
        let score = 0;

        // Same category (+5 points)
        if (item.category.toLowerCase() === current.category.toLowerCase()) {
          score += 5;
        }

        // Shared materials (+3 points each)
        const currentMats = current.materials.map((m) => m.toLowerCase());
        item.materials.forEach((m) => {
          if (currentMats.some((cm) => cm.includes(m.toLowerCase()) || m.toLowerCase().includes(cm))) {
            score += 3;
          }
        });

        // Matching finish / metals (+3 points)
        if (current.finish && item.finish && current.finish.toLowerCase() === item.finish.toLowerCase()) {
          score += 3;
        }

        // Shared colors (+2 points each)
        const currentColors = (current.colors || []).map((c) => c.toLowerCase());
        (item.colors || []).forEach((c) => {
          if (currentColors.includes(c.toLowerCase())) {
            score += 2;
          }
        });

        // Price proximity within 25% (+2 points)
        const priceDiffRatio = Math.abs(item.price - current.price) / (current.price || 1);
        if (priceDiffRatio <= 0.25) {
          score += 2;
        }

        // Shared tags (+2 points each)
        const currentTags = (current.tags || []).map((t) => t.toLowerCase());
        (item.tags || []).forEach((t) => {
          if (currentTags.includes(t.toLowerCase())) {
            score += 2;
          }
        });

        return { product: item, score };
      })
      .sort((a, b) => b.score - a.score);

    return scored.slice(0, limit).map((s) => s.product);
  },

  /**
   * Get complementary products in different categories to style or layer with (frequently paired)
   */
  async getFrequentlyPaired(product: Product, limit = 3): Promise<Product[]> {
    const allProducts = await this.getProducts();
    const otherCategories = allProducts.filter(
      (p) => p.id !== product.id && p.slug !== product.slug && p.category.toLowerCase() !== product.category.toLowerCase()
    );

    const scored = otherCategories
      .map((item) => {
        let score = 0;
        // Matching finish
        if (product.finish && item.finish && product.finish.toLowerCase() === item.finish.toLowerCase()) {
          score += 4;
        }
        // Matching gemstone/materials
        const productMats = product.materials.map((m) => m.toLowerCase());
        item.materials.forEach((m) => {
          if (productMats.some((pm) => pm.includes(m.toLowerCase()) || m.toLowerCase().includes(pm))) {
            score += 3;
          }
        });
        // High rating bonus
        if (item.rating && item.rating >= 4.8) {
          score += 1;
        }
        return { product: item, score };
      })
      .sort((a, b) => b.score - a.score);

    return scored.slice(0, limit).map((s) => s.product);
  },

  /**
   * Get products by array of IDs (preserving sequence, e.g. for recently viewed)
   */
  async getProductsByIds(ids: string[]): Promise<Product[]> {
    if (!ids || ids.length === 0) return [];
    const all = await this.getProducts();
    const idSet = new Set(ids);
    const map = new Map<string, Product>();
    all.forEach((p) => {
      if (idSet.has(p.id) || idSet.has(p.slug)) {
        map.set(p.id, p);
        map.set(p.slug, p);
      }
    });

    const ordered: Product[] = [];
    ids.forEach((id) => {
      const found = map.get(id);
      if (found && !ordered.some((p) => p.id === found.id)) {
        ordered.push(found);
      }
    });
    return ordered;
  },

  /**
   * Get search autocomplete suggestions (matching product names, categories, and gemstone materials)
   */
  async getSearchSuggestions(query: string, limit = 6): Promise<{ title: string; type: 'product' | 'category' | 'material'; slug?: string }[]> {
    const q = (query || '').trim().toLowerCase();
    if (!q || q.length < 2) return [];

    const all = await this.getProducts();
    const categories = await this.getCategories();
    const results: { title: string; type: 'product' | 'category' | 'material'; slug?: string }[] = [];
    const seen = new Set<string>();

    // 1. Matching categories
    categories.forEach((cat) => {
      if (cat.name.toLowerCase().includes(q) && !seen.has(cat.name.toLowerCase())) {
        seen.add(cat.name.toLowerCase());
        results.push({ title: cat.name, type: 'category', slug: cat.slug });
      }
    });

    // 2. Matching product titles
    all.forEach((p) => {
      if (p.name.toLowerCase().includes(q) && !seen.has(p.name.toLowerCase())) {
        seen.add(p.name.toLowerCase());
        results.push({ title: p.name, type: 'product', slug: p.slug });
      }
    });

    // 3. Matching gemstone materials
    all.forEach((p) => {
      p.materials.forEach((m) => {
        if (m.toLowerCase().includes(q) && !seen.has(m.toLowerCase())) {
          seen.add(m.toLowerCase());
          results.push({ title: m, type: 'material' });
        }
      });
    });

    return results.slice(0, limit);
  },

  /**
   * Get curated popular search keywords
   */
  getPopularSearchTerms(): string[] {
    return [
      'Ruby Star',
      'Pearl Choker',
      'Green Aventurine',
      'Turquoise Anklet',
      '18K Gold Plated',
      'Custom Letter Bracelet',
      'Rose Quartz',
      'Stackable Set',
    ];
  },

  /**
   * Get all categories with counts
   */
  async getCategories(): Promise<Category[]> {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('categories')
          .select('*')
          .eq('status', 'active')
          .order('sort_order', { ascending: true });

        if (!error && data && data.length > 0) {
          const allProducts = await this.getProducts();
          return data.map((cat) => {
            const count = allProducts.filter(
              (p) => p.category.toLowerCase() === cat.name.toLowerCase()
            ).length;
            return {
              id: cat.id,
              name: cat.name,
              slug: cat.slug,
              description: cat.description || '',
              image: cat.image || LOCAL_CATEGORIES[0].image,
              itemCount: count > 0 ? count : 6,
            };
          });
        }
      } catch (err) {
        console.warn('Supabase categories fetch fallback:', err);
      }
    }

    return LOCAL_CATEGORIES.map((cat) => {
      const count = LOCAL_PRODUCTS.filter(
        (p) => p.category.toLowerCase() === cat.name.toLowerCase()
      ).length;
      return {
        ...cat,
        itemCount: count > 0 ? count : cat.itemCount,
      };
    });
  },

  /**
   * Get all unique materials across catalog
   */
  async getUniqueMaterials(): Promise<string[]> {
    const all = await this.getProducts();
    const materialsSet = new Set<string>();
    all.forEach((p) => {
      p.materials.forEach((m) => materialsSet.add(m));
    });
    return Array.from(materialsSet);
  },
};
