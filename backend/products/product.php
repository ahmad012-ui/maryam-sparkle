<?php
declare(strict_types=1);

require_once __DIR__ . '/attribute.php';

/**
 * Product Model / Data Access Layer
 *
 * Handles database operations for products, images, inventory, and flexible attributes using pure PDO prepared statements.
 */
class Product {
    private PDO $pdo;
    private ProductAttribute $attributeModel;

    public function __construct(PDO $pdo) {
        $this->pdo = $pdo;
        $this->attributeModel = new ProductAttribute($pdo);
    }

    /**
     * Format an image database row
     */
    public static function formatImage(array $row): array {
        return [
            'id'         => (int) $row['id'],
            'product_id' => (int) $row['product_id'],
            'image_url'  => (string) $row['image_url'],
            'sort_order' => (int) $row['sort_order'],
            'is_primary' => (bool) $row['is_primary'],
            'created_at' => (string) $row['created_at'],
        ];
    }

    /**
     * Format a product database row with its attached images, category details, inventory, and grouped attributes
     */
    public static function format(array $row, array $images = [], ?array $inventory = null, array $attributes = []): array {
        $formatted = [
            'id'                => (int) $row['id'],
            'category_id'       => $row['category_id'] !== null ? (int) $row['category_id'] : null,
            'category'          => $row['category_id'] !== null ? [
                'id'   => (int) $row['category_id'],
                'name' => (string) ($row['category_name'] ?? ''),
                'slug' => (string) ($row['category_slug'] ?? ''),
            ] : null,
            'name'              => (string) $row['name'],
            'slug'              => (string) $row['slug'],
            'description'       => $row['description'] !== null ? (string) $row['description'] : null,
            'short_description' => $row['short_description'] !== null ? (string) $row['short_description'] : null,
            'price'             => (float) $row['price'],
            'compare_at_price'  => $row['compare_at_price'] !== null ? (float) $row['compare_at_price'] : null,
            'sku'               => (string) $row['sku'],
            'stock'             => (int) $row['stock'],
            'is_featured'       => (bool) $row['is_featured'],
            'is_best_seller'    => (bool) $row['is_best_seller'],
            'is_new'            => (bool) $row['is_new'],
            'status'            => (string) $row['status'],
            'images'            => array_map([self::class, 'formatImage'], $images),
            'attributes'        => !empty($attributes) ? $attributes : (object)[],
            'created_at'        => (string) $row['created_at'],
            'updated_at'        => (string) $row['updated_at'],
        ];

        if ($inventory !== null) {
            $formatted['inventory'] = [
                'quantity'            => (int) $inventory['quantity'],
                'low_stock_threshold' => (int) $inventory['low_stock_threshold'],
                'updated_at'          => (string) $inventory['updated_at'],
            ];
        }

        return $formatted;
    }

    /**
     * Retrieve products with dynamic safe filtering, sorting, and pagination.
     * Prevents N+1 queries by fetching images in a single batch query.
     *
     * @param array $filters
     * @param string $sort
     * @param int $page
     * @param int $limit
     * @return array ['data' => array, 'meta' => array]
     */
    public function getAll(
        array $filters = [],
        string $sort = 'newest',
        int $page = 1,
        int $limit = 12
    ): array {
        $whereClauses = [];
        $params = [];

        // 1. Status Filter (defaults to 'active' unless explicitly requested)
        $status = $filters['status'] ?? 'active';
        if ($status !== 'all') {
            $whereClauses[] = 'p.status = :status';
            $params[':status'] = $status;
        }

        // 2. Category Filter (by slug or integer ID)
        if (!empty($filters['category'])) {
            $catFilter = trim((string) $filters['category']);
            if (is_numeric($catFilter)) {
                $whereClauses[] = '(p.category_id = :cat_id OR c.slug = :cat_slug)';
                $params[':cat_id'] = (int) $catFilter;
                $params[':cat_slug'] = $catFilter;
            } else {
                $whereClauses[] = 'c.slug = :cat_slug';
                $params[':cat_slug'] = $catFilter;
            }
        }

        // 3. Featured Filter
        if (isset($filters['featured'])) {
            $whereClauses[] = 'p.is_featured = :featured';
            $params[':featured'] = $filters['featured'] ? 1 : 0;
        }

        // 4. Best Seller Filter
        if (isset($filters['best_seller'])) {
            $whereClauses[] = 'p.is_best_seller = :best_seller';
            $params[':best_seller'] = $filters['best_seller'] ? 1 : 0;
        }

        // 5. New Filter
        if (isset($filters['new'])) {
            $whereClauses[] = 'p.is_new = :is_new';
            $params[':is_new'] = $filters['new'] ? 1 : 0;
        }

        // 6. Price Range Filters
        if (isset($filters['min_price']) && is_numeric($filters['min_price'])) {
            $whereClauses[] = 'p.price >= :min_price';
            $params[':min_price'] = (float) $filters['min_price'];
        }
        if (isset($filters['max_price']) && is_numeric($filters['max_price'])) {
            $whereClauses[] = 'p.price <= :max_price';
            $params[':max_price'] = (float) $filters['max_price'];
        }

        // 7. Full-text Search Filter (name, sku, description, short_description)
        if (!empty($filters['search'])) {
            $whereClauses[] = '(p.name LIKE :search_name OR p.sku LIKE :search_sku OR p.short_description LIKE :search_sdesc OR p.description LIKE :search_desc)';
            $searchPattern = '%' . trim((string) $filters['search']) . '%';
            $params[':search_name']  = $searchPattern;
            $params[':search_sku']   = $searchPattern;
            $params[':search_sdesc'] = $searchPattern;
            $params[':search_desc']  = $searchPattern;
        }

        $whereSql = !empty($whereClauses) ? ' WHERE ' . implode(' AND ', $whereClauses) : '';

        // Count Total Matching Records
        $countSql = "SELECT COUNT(*) FROM products p LEFT JOIN categories c ON p.category_id = c.id{$whereSql}";
        $countStmt = $this->pdo->prepare($countSql);
        foreach ($params as $key => $val) {
            $countStmt->bindValue($key, $val);
        }
        $countStmt->execute();
        $total = (int) $countStmt->fetchColumn();

        $totalPages = $total > 0 ? (int) ceil($total / $limit) : 0;
        $offset = ($page - 1) * $limit;

        // Sorting Whitelist
        $sortWhitelist = [
            'price_asc'  => 'p.price ASC, p.id ASC',
            'price_desc' => 'p.price DESC, p.id DESC',
            'newest'     => 'p.created_at DESC, p.id DESC',
            'name_asc'   => 'p.name ASC',
            'name_desc'  => 'p.name DESC',
        ];
        $orderBy = $sortWhitelist[$sort] ?? 'p.created_at DESC, p.id DESC';

        // Main Data Query
        $dataSql = "SELECT p.*, c.name AS category_name, c.slug AS category_slug
                    FROM products p
                    LEFT JOIN categories c ON p.category_id = c.id
                    {$whereSql}
                    ORDER BY {$orderBy}
                    LIMIT :limit OFFSET :offset";

        $dataStmt = $this->pdo->prepare($dataSql);
        foreach ($params as $key => $val) {
            $dataStmt->bindValue($key, $val);
        }
        $dataStmt->bindValue(':limit', $limit, PDO::PARAM_INT);
        $dataStmt->bindValue(':offset', $offset, PDO::PARAM_INT);
        $dataStmt->execute();
        $rows = $dataStmt->fetchAll();

        if (empty($rows)) {
            return [
                'data' => [],
                'meta' => [
                    'page'        => $page,
                    'limit'       => $limit,
                    'total'       => $total,
                    'total_pages' => $totalPages,
                ],
            ];
        }

        // Batch Fetch Images and Attributes for all retrieved products (avoids N+1 query problem)
        $productIds = array_map(fn($r) => (int) $r['id'], $rows);
        $imagesByProduct = $this->getBatchImages($productIds);
        $attributesByProduct = $this->attributeModel->getBatchAttributes($productIds);

        $data = [];
        foreach ($rows as $row) {
            $pid = (int) $row['id'];
            $productImages = $imagesByProduct[$pid] ?? [];
            $productAttributes = $attributesByProduct[$pid] ?? [];
            $data[] = self::format($row, $productImages, null, $productAttributes);
        }

        return [
            'data' => $data,
            'meta' => [
                'page'        => $page,
                'limit'       => $limit,
                'total'       => $total,
                'total_pages' => $totalPages,
            ],
        ];
    }

    /**
     * Batch fetch images for multiple products in a single prepared query
     */
    private function getBatchImages(array $productIds): array {
        if (empty($productIds)) {
            return [];
        }

        $placeholders = implode(',', array_fill(0, count($productIds), '?'));
        $stmt = $this->pdo->prepare(
            "SELECT * FROM product_images WHERE product_id IN ({$placeholders}) ORDER BY sort_order ASC, id ASC"
        );
        $stmt->execute($productIds);
        $rows = $stmt->fetchAll();

        $grouped = [];
        foreach ($rows as $row) {
            $pid = (int) $row['product_id'];
            if (!isset($grouped[$pid])) {
                $grouped[$pid] = [];
            }
            $grouped[$pid][] = $row;
        }

        return $grouped;
    }

    /**
     * Retrieve a single product by primary ID with attached images and inventory
     */
    public function getById(int $id): ?array {
        $stmt = $this->pdo->prepare(
            'SELECT p.*, c.name AS category_name, c.slug AS category_slug
             FROM products p
             LEFT JOIN categories c ON p.category_id = c.id
             WHERE p.id = :id
             LIMIT 1'
        );
        $stmt->bindValue(':id', $id, PDO::PARAM_INT);
        $stmt->execute();
        $row = $stmt->fetch();

        if (!$row) {
            return null;
        }

        $images = $this->getImagesForProduct($id);
        $inventory = $this->getInventoryForProduct($id);
        $attributes = $this->attributeModel->getAttributesForProduct($id);

        return self::format($row, $images, $inventory, $attributes);
    }

    /**
     * Retrieve a single product by slug with attached images and inventory
     */
    public function getBySlug(string $slug): ?array {
        $stmt = $this->pdo->prepare(
            'SELECT p.*, c.name AS category_name, c.slug AS category_slug
             FROM products p
             LEFT JOIN categories c ON p.category_id = c.id
             WHERE p.slug = :slug
             LIMIT 1'
        );
        $stmt->bindValue(':slug', $slug, PDO::PARAM_STR);
        $stmt->execute();
        $row = $stmt->fetch();

        if (!$row) {
            return null;
        }

        $id = (int) $row['id'];
        $images = $this->getImagesForProduct($id);
        $inventory = $this->getInventoryForProduct($id);
        $attributes = $this->attributeModel->getAttributesForProduct($id);

        return self::format($row, $images, $inventory, $attributes);
    }

    /**
     * Fetch all images for a specific product ID
     */
    public function getImagesForProduct(int $productId): array {
        $stmt = $this->pdo->prepare(
            'SELECT * FROM product_images WHERE product_id = :product_id ORDER BY sort_order ASC, id ASC'
        );
        $stmt->bindValue(':product_id', $productId, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetchAll();
    }

    /**
     * Fetch inventory record for a specific product ID
     */
    public function getInventoryForProduct(int $productId): ?array {
        $stmt = $this->pdo->prepare(
            'SELECT * FROM inventory WHERE product_id = :product_id LIMIT 1'
        );
        $stmt->bindValue(':product_id', $productId, PDO::PARAM_INT);
        $stmt->execute();
        $row = $stmt->fetch();
        return $row ?: null;
    }

    /**
     * Check if a product slug already exists
     */
    public function slugExists(string $slug, ?int $excludeId = null): bool {
        if ($excludeId !== null) {
            $stmt = $this->pdo->prepare('SELECT COUNT(*) FROM products WHERE slug = :slug AND id != :exclude_id');
            $stmt->bindValue(':slug', $slug, PDO::PARAM_STR);
            $stmt->bindValue(':exclude_id', $excludeId, PDO::PARAM_INT);
        } else {
            $stmt = $this->pdo->prepare('SELECT COUNT(*) FROM products WHERE slug = :slug');
            $stmt->bindValue(':slug', $slug, PDO::PARAM_STR);
        }
        $stmt->execute();
        return (int) $stmt->fetchColumn() > 0;
    }

    /**
     * Check if a SKU already exists
     */
    public function skuExists(string $sku, ?int $excludeId = null): bool {
        if ($excludeId !== null) {
            $stmt = $this->pdo->prepare('SELECT COUNT(*) FROM products WHERE sku = :sku AND id != :exclude_id');
            $stmt->bindValue(':sku', $sku, PDO::PARAM_STR);
            $stmt->bindValue(':exclude_id', $excludeId, PDO::PARAM_INT);
        } else {
            $stmt = $this->pdo->prepare('SELECT COUNT(*) FROM products WHERE sku = :sku');
            $stmt->bindValue(':sku', $sku, PDO::PARAM_STR);
        }
        $stmt->execute();
        return (int) $stmt->fetchColumn() > 0;
    }

    /**
     * Check if a category exists in the categories table
     */
    public function categoryExists(int $categoryId): bool {
        $stmt = $this->pdo->prepare('SELECT COUNT(*) FROM categories WHERE id = :id');
        $stmt->bindValue(':id', $categoryId, PDO::PARAM_INT);
        $stmt->execute();
        return (int) $stmt->fetchColumn() > 0;
    }

    /**
     * Create a new product and its initial 1:1 inventory record within an ACID transaction
     */
    public function create(array $data): array {
        $this->pdo->beginTransaction();

        try {
            $stmt = $this->pdo->prepare(
                'INSERT INTO products (
                    category_id, name, slug, description, short_description,
                    price, compare_at_price, sku, stock,
                    is_featured, is_best_seller, is_new, status
                ) VALUES (
                    :category_id, :name, :slug, :description, :short_description,
                    :price, :compare_at_price, :sku, :stock,
                    :is_featured, :is_best_seller, :is_new, :status
                )'
            );

            $stmt->bindValue(':category_id', $data['category_id'] ?? null, isset($data['category_id']) ? PDO::PARAM_INT : PDO::PARAM_NULL);
            $stmt->bindValue(':name', $data['name'], PDO::PARAM_STR);
            $stmt->bindValue(':slug', $data['slug'], PDO::PARAM_STR);
            $stmt->bindValue(':description', $data['description'] ?? null, isset($data['description']) ? PDO::PARAM_STR : PDO::PARAM_NULL);
            $stmt->bindValue(':short_description', $data['short_description'] ?? null, isset($data['short_description']) ? PDO::PARAM_STR : PDO::PARAM_NULL);
            $stmt->bindValue(':price', $data['price']);
            $stmt->bindValue(':compare_at_price', $data['compare_at_price'] ?? null, isset($data['compare_at_price']) ? PDO::PARAM_STR : PDO::PARAM_NULL);
            $stmt->bindValue(':sku', $data['sku'], PDO::PARAM_STR);
            $stmt->bindValue(':stock', $data['stock'] ?? 0, PDO::PARAM_INT);
            $stmt->bindValue(':is_featured', !empty($data['is_featured']) ? 1 : 0, PDO::PARAM_INT);
            $stmt->bindValue(':is_best_seller', !empty($data['is_best_seller']) ? 1 : 0, PDO::PARAM_INT);
            $stmt->bindValue(':is_new', !empty($data['is_new']) ? 1 : 0, PDO::PARAM_INT);
            $stmt->bindValue(':status', $data['status'] ?? 'active', PDO::PARAM_STR);

            $stmt->execute();
            $productId = (int) $this->pdo->lastInsertId();

            // Create initial 1:1 inventory record
            $invStmt = $this->pdo->prepare(
                'INSERT INTO inventory (product_id, quantity, low_stock_threshold) VALUES (:product_id, :quantity, :low_stock_threshold)'
            );
            $invStmt->bindValue(':product_id', $productId, PDO::PARAM_INT);
            $invStmt->bindValue(':quantity', $data['stock'] ?? 0, PDO::PARAM_INT);
            $invStmt->bindValue(':low_stock_threshold', 5, PDO::PARAM_INT);
            $invStmt->execute();

            // Save attributes if provided
            if (isset($data['attributes']) && is_array($data['attributes'])) {
                $this->attributeModel->setAttributesForProduct($productId, $data['attributes']);
            }

            $this->pdo->commit();

            return $this->getById($productId) ?? [];
        } catch (Throwable $e) {
            $this->pdo->rollBack();
            throw $e;
        }
    }

    /**
     * Update an existing product and synchronize inventory stock in a transaction
     */
    public function update(int $id, array $data): ?array {
        $this->pdo->beginTransaction();

        try {
            $stmt = $this->pdo->prepare(
                'UPDATE products
                 SET category_id = :category_id,
                     name = :name,
                     slug = :slug,
                     description = :description,
                     short_description = :short_description,
                     price = :price,
                     compare_at_price = :compare_at_price,
                     sku = :sku,
                     stock = :stock,
                     is_featured = :is_featured,
                     is_best_seller = :is_best_seller,
                     is_new = :is_new,
                     status = :status
                 WHERE id = :id'
            );

            $stmt->bindValue(':id', $id, PDO::PARAM_INT);
            $stmt->bindValue(':category_id', $data['category_id'] ?? null, isset($data['category_id']) ? PDO::PARAM_INT : PDO::PARAM_NULL);
            $stmt->bindValue(':name', $data['name'], PDO::PARAM_STR);
            $stmt->bindValue(':slug', $data['slug'], PDO::PARAM_STR);
            $stmt->bindValue(':description', $data['description'] ?? null, isset($data['description']) ? PDO::PARAM_STR : PDO::PARAM_NULL);
            $stmt->bindValue(':short_description', $data['short_description'] ?? null, isset($data['short_description']) ? PDO::PARAM_STR : PDO::PARAM_NULL);
            $stmt->bindValue(':price', $data['price']);
            $stmt->bindValue(':compare_at_price', $data['compare_at_price'] ?? null, isset($data['compare_at_price']) ? PDO::PARAM_STR : PDO::PARAM_NULL);
            $stmt->bindValue(':sku', $data['sku'], PDO::PARAM_STR);
            $stmt->bindValue(':stock', $data['stock'] ?? 0, PDO::PARAM_INT);
            $stmt->bindValue(':is_featured', !empty($data['is_featured']) ? 1 : 0, PDO::PARAM_INT);
            $stmt->bindValue(':is_best_seller', !empty($data['is_best_seller']) ? 1 : 0, PDO::PARAM_INT);
            $stmt->bindValue(':is_new', !empty($data['is_new']) ? 1 : 0, PDO::PARAM_INT);
            $stmt->bindValue(':status', $data['status'] ?? 'active', PDO::PARAM_STR);

            $stmt->execute();

            // Synchronize inventory quantity
            $invStmt = $this->pdo->prepare(
                'INSERT INTO inventory (product_id, quantity, low_stock_threshold)
                 VALUES (:product_id, :quantity, 5)
                 ON DUPLICATE KEY UPDATE quantity = :update_quantity'
            );
            $invStmt->bindValue(':product_id', $id, PDO::PARAM_INT);
            $invStmt->bindValue(':quantity', $data['stock'] ?? 0, PDO::PARAM_INT);
            $invStmt->bindValue(':update_quantity', $data['stock'] ?? 0, PDO::PARAM_INT);
            $invStmt->execute();

            // Save attributes if provided
            if (isset($data['attributes']) && is_array($data['attributes'])) {
                $this->attributeModel->setAttributesForProduct($id, $data['attributes']);
            }

            $this->pdo->commit();

            return $this->getById($id);
        } catch (Throwable $e) {
            $this->pdo->rollBack();
            throw $e;
        }
    }

    /**
     * Retrieve all attribute rows for a product, grouped by attribute_name.
     */
    public function getAttributesForProduct(int $productId): array {
        return $this->attributeModel->getAttributesForProduct($productId);
    }

    /**
     * Replace a product's attributes inside a database transaction.
     */
    public function setAttributesForProduct(int $productId, array $attributes): void {
        $this->attributeModel->setAttributesForProduct($productId, $attributes);
    }

    /**
     * Soft-delete a product by updating its status to inactive (preserves historical order items)
     */
    public function deactivate(int $id): bool {
        $stmt = $this->pdo->prepare("UPDATE products SET status = 'inactive' WHERE id = :id");
        $stmt->bindValue(':id', $id, PDO::PARAM_INT);
        return $stmt->execute();
    }
}
