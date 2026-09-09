<?php
declare(strict_types=1);

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../helpers/response.php';
require_once __DIR__ . '/../helpers/validation.php';
require_once __DIR__ . '/product.php';

try {
    $pdo = Database::getConnection();
} catch (Throwable $e) {
    error_log('Database connection error in products: ' . $e->getMessage());
    sendError('Database connection unavailable', null, 503);
}

$productModel = new Product($pdo);
$method = strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET');

// Route sub-path resolution
$subPath = '';
if (isset($routeSubPath)) {
    $subPath = trim($routeSubPath, '/');
} else {
    $uriPath = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH);
    $parts = explode('/products', $uriPath);
    if (isset($parts[1])) {
        $sub = trim($parts[1], '/');
        $sub = preg_replace('#^index\.php/?#', '', $sub);
        $subPath = trim((string) $sub, '/');
    }
}

$slug = null;
$id = null;

if (str_starts_with($subPath, 'slug/')) {
    $slug = trim(substr($subPath, strlen('slug/')), '/');
} elseif (is_numeric($subPath)) {
    $id = (int) $subPath;
} elseif (isset($_GET['id']) && is_numeric($_GET['id'])) {
    $id = (int) $_GET['id'];
} elseif (isset($_GET['slug']) && trim((string) $_GET['slug']) !== '') {
    $slug = trim((string) $_GET['slug']);
}

// -----------------------------------------------------------------------------
// 1. GET /api/v1/products, GET /api/v1/products/{id}, GET /api/v1/products/slug/{slug}
// -----------------------------------------------------------------------------
if ($method === 'GET') {
    // 1A. Get Single Product by Slug
    if ($slug !== null && $slug !== '') {
        $product = $productModel->getBySlug($slug);
        if (!$product) {
            sendError('Product not found', null, 404);
        }
        sendSuccess('Product retrieved successfully', $product, 200);
    }

    // 1B. Get Single Product by ID
    if ($id !== null) {
        $product = $productModel->getById($id);
        if (!$product) {
            sendError('Product not found', null, 404);
        }
        sendSuccess('Product retrieved successfully', $product, 200);
    }

    // 1C. List Products with dynamic filtering, sorting, and pagination
    $page = isset($_GET['page']) && is_numeric($_GET['page']) && (int) $_GET['page'] > 0 ? (int) $_GET['page'] : 1;
    $rawLimit = isset($_GET['limit']) && is_numeric($_GET['limit']) && (int) $_GET['limit'] > 0 ? (int) $_GET['limit'] : 12;
    $limit = min(50, max(1, $rawLimit));

    $filters = [];

    // Status filter
    if (isset($_GET['status'])) {
        $statusVal = strtolower(trim((string) $_GET['status']));
        if (in_array($statusVal, ['active', 'inactive', 'all'], true)) {
            $filters['status'] = $statusVal;
        } else {
            sendError('Invalid status filter', ['status' => 'Status must be active, inactive, or all'], 422);
        }
    } else {
        $filters['status'] = 'active';
    }

    // Category filter
    if (!empty($_GET['category'])) {
        $filters['category'] = trim((string) $_GET['category']);
    }

    // Boolean filters
    if (isset($_GET['featured'])) {
        $filters['featured'] = toBool($_GET['featured']);
    }
    if (isset($_GET['best_seller'])) {
        $filters['best_seller'] = toBool($_GET['best_seller']);
    }
    if (isset($_GET['new'])) {
        $filters['new'] = toBool($_GET['new']);
    }

    // Price filters
    if (isset($_GET['min_price'])) {
        if (!is_numeric($_GET['min_price']) || (float) $_GET['min_price'] < 0) {
            sendError('Invalid min_price filter', ['min_price' => 'min_price must be a non-negative number'], 422);
        }
        $filters['min_price'] = (float) $_GET['min_price'];
    }
    if (isset($_GET['max_price'])) {
        if (!is_numeric($_GET['max_price']) || (float) $_GET['max_price'] < 0) {
            sendError('Invalid max_price filter', ['max_price' => 'max_price must be a non-negative number'], 422);
        }
        $filters['max_price'] = (float) $_GET['max_price'];
    }

    // Full-text search
    if (!empty($_GET['search'])) {
        $filters['search'] = trim((string) $_GET['search']);
    }

    // Sorting
    $sort = 'newest';
    if (!empty($_GET['sort'])) {
        $requestedSort = strtolower(trim((string) $_GET['sort']));
        $allowedSorts = ['price_asc', 'price_desc', 'newest', 'name_asc', 'name_desc'];
        if (!in_array($requestedSort, $allowedSorts, true)) {
            sendError('Invalid sort parameter', [
                'sort'         => "Sort must be one of: " . implode(', ', $allowedSorts),
                'provided'     => $requestedSort,
            ], 422);
        }
        $sort = $requestedSort;
    }

    $result = $productModel->getAll($filters, $sort, $page, $limit);

    sendSuccess('Products retrieved successfully', $result['data'], 200, $result['meta']);
}

// -----------------------------------------------------------------------------
// 2. POST /api/v1/products (Create Product)
// -----------------------------------------------------------------------------
if ($method === 'POST') {
    if ($id !== null || $slug !== null) {
        sendError('Method not allowed on specific resource path', null, 405);
    }

    $input = getJsonInput();

    $validator = new Validator($input);
    $validator->required('name', 'Product Name')
              ->string('name', 1, 255, 'Product Name')
              ->required('slug', 'Slug')
              ->slug('slug', 255, 'Slug')
              ->required('sku', 'SKU')
              ->string('sku', 1, 100, 'SKU')
              ->required('price', 'Price')
              ->numeric('price', 0, null, 'Price')
              ->numeric('compare_at_price', 0, null, 'Compare at Price')
              ->integer('stock', 0, null, 'Stock')
              ->boolean('is_featured', 'Is Featured')
              ->boolean('is_best_seller', 'Is Best Seller')
              ->boolean('is_new', 'Is New')
              ->in('status', ['active', 'inactive'], 'Status');

    $validator->validateOrExit();

    // Validate category existence if provided
    $categoryId = null;
    if (isset($input['category_id']) && $input['category_id'] !== null && $input['category_id'] !== '') {
        if (!is_numeric($input['category_id']) || (int) $input['category_id'] <= 0) {
            sendError('Validation failed', ['category_id' => 'Category ID must be a valid positive integer'], 422);
        }
        $categoryId = (int) $input['category_id'];
        if (!$productModel->categoryExists($categoryId)) {
            sendError('Validation failed', ['category_id' => "Category with ID {$categoryId} does not exist"], 422);
        }
    }

    $productSlug = strtolower(trim((string) $input['slug']));
    $sku = trim((string) $input['sku']);

    // Check slug uniqueness
    if ($productModel->slugExists($productSlug)) {
        sendError('Product slug already exists', [
            'slug' => "The slug '{$productSlug}' is already in use by another product."
        ], 409);
    }

    // Check SKU uniqueness
    if ($productModel->skuExists($sku)) {
        sendError('Product SKU already exists', [
            'sku' => "The SKU '{$sku}' is already in use by another product."
        ], 409);
    }

    try {
        $created = $productModel->create([
            'category_id'       => $categoryId,
            'name'              => trim((string) $input['name']),
            'slug'              => $productSlug,
            'description'       => isset($input['description']) && trim((string) $input['description']) !== '' ? trim((string) $input['description']) : null,
            'short_description' => isset($input['short_description']) && trim((string) $input['short_description']) !== '' ? trim((string) $input['short_description']) : null,
            'price'             => (float) $input['price'],
            'compare_at_price'  => isset($input['compare_at_price']) && $input['compare_at_price'] !== null && $input['compare_at_price'] !== '' ? (float) $input['compare_at_price'] : null,
            'sku'               => $sku,
            'stock'             => isset($input['stock']) ? (int) $input['stock'] : 0,
            'is_featured'       => isset($input['is_featured']) ? toBool($input['is_featured']) : false,
            'is_best_seller'    => isset($input['is_best_seller']) ? toBool($input['is_best_seller']) : false,
            'is_new'            => isset($input['is_new']) ? toBool($input['is_new']) : false,
            'status'            => $input['status'] ?? 'active',
        ]);

        sendSuccess('Product created successfully', $created, 201);
    } catch (Throwable $e) {
        error_log('Failed to create product: ' . $e->getMessage());
        sendError('Failed to create product', null, 500);
    }
}

// -----------------------------------------------------------------------------
// 3. PUT /api/v1/products/{id} (Update Product)
// -----------------------------------------------------------------------------
if ($method === 'PUT') {
    if ($id === null) {
        sendError('Product ID is required for update', ['id' => 'Missing product ID in URL path'], 400);
    }

    $existing = $productModel->getById($id);
    if (!$existing) {
        sendError('Product not found', null, 404);
    }

    $input = getJsonInput();

    $validator = new Validator($input);
    $validator->required('name', 'Product Name')
              ->string('name', 1, 255, 'Product Name')
              ->required('slug', 'Slug')
              ->slug('slug', 255, 'Slug')
              ->required('sku', 'SKU')
              ->string('sku', 1, 100, 'SKU')
              ->required('price', 'Price')
              ->numeric('price', 0, null, 'Price')
              ->numeric('compare_at_price', 0, null, 'Compare at Price')
              ->integer('stock', 0, null, 'Stock')
              ->boolean('is_featured', 'Is Featured')
              ->boolean('is_best_seller', 'Is Best Seller')
              ->boolean('is_new', 'Is New')
              ->in('status', ['active', 'inactive'], 'Status');

    $validator->validateOrExit();

    // Validate category existence if provided
    $categoryId = null;
    if (isset($input['category_id']) && $input['category_id'] !== null && $input['category_id'] !== '') {
        if (!is_numeric($input['category_id']) || (int) $input['category_id'] <= 0) {
            sendError('Validation failed', ['category_id' => 'Category ID must be a valid positive integer'], 422);
        }
        $categoryId = (int) $input['category_id'];
        if (!$productModel->categoryExists($categoryId)) {
            sendError('Validation failed', ['category_id' => "Category with ID {$categoryId} does not exist"], 422);
        }
    }

    $productSlug = strtolower(trim((string) $input['slug']));
    $sku = trim((string) $input['sku']);

    // Check slug uniqueness excluding this product
    if ($productModel->slugExists($productSlug, $id)) {
        sendError('Product slug already exists', [
            'slug' => "The slug '{$productSlug}' is already in use by another product."
        ], 409);
    }

    // Check SKU uniqueness excluding this product
    if ($productModel->skuExists($sku, $id)) {
        sendError('Product SKU already exists', [
            'sku' => "The SKU '{$sku}' is already in use by another product."
        ], 409);
    }

    try {
        $updated = $productModel->update($id, [
            'category_id'       => $categoryId,
            'name'              => trim((string) $input['name']),
            'slug'              => $productSlug,
            'description'       => isset($input['description']) && trim((string) $input['description']) !== '' ? trim((string) $input['description']) : null,
            'short_description' => isset($input['short_description']) && trim((string) $input['short_description']) !== '' ? trim((string) $input['short_description']) : null,
            'price'             => (float) $input['price'],
            'compare_at_price'  => isset($input['compare_at_price']) && $input['compare_at_price'] !== null && $input['compare_at_price'] !== '' ? (float) $input['compare_at_price'] : null,
            'sku'               => $sku,
            'stock'             => isset($input['stock']) ? (int) $input['stock'] : 0,
            'is_featured'       => isset($input['is_featured']) ? toBool($input['is_featured']) : false,
            'is_best_seller'    => isset($input['is_best_seller']) ? toBool($input['is_best_seller']) : false,
            'is_new'            => isset($input['is_new']) ? toBool($input['is_new']) : false,
            'status'            => $input['status'] ?? 'active',
        ]);

        sendSuccess('Product updated successfully', $updated, 200);
    } catch (Throwable $e) {
        error_log('Failed to update product: ' . $e->getMessage());
        sendError('Failed to update product', null, 500);
    }
}

// -----------------------------------------------------------------------------
// 4. DELETE /api/v1/products/{id} (Deactivate Product)
// -----------------------------------------------------------------------------
if ($method === 'DELETE') {
    if ($id === null) {
        sendError('Product ID is required for deletion', ['id' => 'Missing product ID in URL path'], 400);
    }

    $existing = $productModel->getById($id);
    if (!$existing) {
        sendError('Product not found', null, 404);
    }

    try {
        // Soft-deactivate product to preserve historical order integrity
        $productModel->deactivate($id);
        sendSuccess('Product deactivated successfully', null, 200);
    } catch (Throwable $e) {
        error_log('Failed to deactivate product: ' . $e->getMessage());
        sendError('Failed to deactivate product', null, 500);
    }
}

// Unsupported HTTP method
sendError('Method not allowed', [
    'method'          => $method,
    'allowed_methods' => ['GET', 'POST', 'PUT', 'DELETE'],
], 405);
