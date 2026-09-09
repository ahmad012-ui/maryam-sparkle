<?php
declare(strict_types=1);

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../helpers/response.php';
require_once __DIR__ . '/../helpers/validation.php';
require_once __DIR__ . '/../middleware/admin.php';
require_once __DIR__ . '/category.php';

try {
    $pdo = Database::getConnection();
} catch (Throwable $e) {
    error_log('Database connection error in categories: ' . $e->getMessage());
    sendError('Database connection unavailable', null, 503);
}

$categoryModel = new Category($pdo);
$method = strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET');

// Extract category ID if passed via routing or request URI
$id = null;
if (isset($routeSubPath)) {
    $segments = explode('/', trim($routeSubPath, '/'));
    if (!empty($segments[0]) && is_numeric($segments[0])) {
        $id = (int) $segments[0];
    }
} elseif (isset($_GET['id']) && is_numeric($_GET['id'])) {
    $id = (int) $_GET['id'];
} else {
    $uriPath = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH);
    if (preg_match('#categories/([0-9]+)#', $uriPath, $matches)) {
        $id = (int) $matches[1];
    }
}

// -----------------------------------------------------------------------------
// 1. GET /api/v1/categories or GET /api/v1/categories/{id}
// -----------------------------------------------------------------------------
if ($method === 'GET') {
    if ($id !== null) {
        $category = $categoryModel->getById($id);
        if (!$category) {
            sendError('Category not found', null, 404);
        }
        sendSuccess('Category retrieved successfully', $category, 200);
    }

    $categories = $categoryModel->getAll(true);
    sendSuccess('Categories retrieved successfully', $categories, 200);
}

// -----------------------------------------------------------------------------
// 2. POST /api/v1/categories (Create Category)
// -----------------------------------------------------------------------------
if ($method === 'POST') {
    requireAdmin($pdo);

    if ($id !== null) {
        sendError('Method not allowed on specific resource ID', null, 405);
    }

    $input = getJsonInput();

    $validator = new Validator($input);
    $validator->required('name', 'Category Name')
              ->string('name', 1, 150, 'Category Name')
              ->required('slug', 'Slug')
              ->slug('slug', 150, 'Slug')
              ->string('description', 0, 5000, 'Description')
              ->string('image', 0, 500, 'Image URL')
              ->in('status', ['active', 'inactive'], 'Status');

    $validator->validateOrExit();

    $slug = strtolower(trim((string) $input['slug']));

    // Check slug uniqueness
    if ($categoryModel->slugExists($slug)) {
        sendError('Category slug already exists', [
            'slug' => "The slug '{$slug}' is already in use by another category."
        ], 409);
    }

    try {
        $created = $categoryModel->create([
            'name'        => trim((string) $input['name']),
            'slug'        => $slug,
            'description' => isset($input['description']) && trim((string) $input['description']) !== '' ? trim((string) $input['description']) : null,
            'image'       => isset($input['image']) && trim((string) $input['image']) !== '' ? trim((string) $input['image']) : null,
            'status'      => $input['status'] ?? 'active',
        ]);

        sendSuccess('Category created successfully', $created, 201);
    } catch (Throwable $e) {
        error_log('Failed to create category: ' . $e->getMessage());
        sendError('Failed to create category', null, 500);
    }
}

// -----------------------------------------------------------------------------
// 3. PUT /api/v1/categories/{id} (Update Category)
// -----------------------------------------------------------------------------
if ($method === 'PUT') {
    requireAdmin($pdo);

    if ($id === null) {
        sendError('Category ID is required for update', ['id' => 'Missing category ID in URL path'], 400);
    }

    $existing = $categoryModel->getById($id);
    if (!$existing) {
        sendError('Category not found', null, 404);
    }

    $input = getJsonInput();

    $validator = new Validator($input);
    $validator->required('name', 'Category Name')
              ->string('name', 1, 150, 'Category Name')
              ->required('slug', 'Slug')
              ->slug('slug', 150, 'Slug')
              ->string('description', 0, 5000, 'Description')
              ->string('image', 0, 500, 'Image URL')
              ->in('status', ['active', 'inactive'], 'Status');

    $validator->validateOrExit();

    $slug = strtolower(trim((string) $input['slug']));

    // Check if new slug conflicts with another category
    if ($categoryModel->slugExists($slug, $id)) {
        sendError('Category slug already exists', [
            'slug' => "The slug '{$slug}' is already in use by another category."
        ], 409);
    }

    try {
        $updated = $categoryModel->update($id, [
            'name'        => trim((string) $input['name']),
            'slug'        => $slug,
            'description' => isset($input['description']) && trim((string) $input['description']) !== '' ? trim((string) $input['description']) : null,
            'image'       => isset($input['image']) && trim((string) $input['image']) !== '' ? trim((string) $input['image']) : null,
            'status'      => $input['status'] ?? 'active',
        ]);

        sendSuccess('Category updated successfully', $updated, 200);
    } catch (Throwable $e) {
        error_log('Failed to update category: ' . $e->getMessage());
        sendError('Failed to update category', null, 500);
    }
}

// -----------------------------------------------------------------------------
// 4. DELETE /api/v1/categories/{id} (Delete Category)
// -----------------------------------------------------------------------------
if ($method === 'DELETE') {
    requireAdmin($pdo);

    if ($id === null) {
        sendError('Category ID is required for deletion', ['id' => 'Missing category ID in URL path'], 400);
    }

    $existing = $categoryModel->getById($id);
    if (!$existing) {
        sendError('Category not found', null, 404);
    }

    // Safety check: do NOT delete category if products reference it
    $dependentProductCount = $categoryModel->countProducts($id);
    if ($dependentProductCount > 0) {
        sendError(
            "Cannot delete category: {$dependentProductCount} product(s) are associated with this category. Please reassign or remove dependent products first.",
            [
                'dependent_products' => $dependentProductCount,
                'suggestion'         => 'Set category status to inactive instead of deleting.'
            ],
            409
        );
    }

    try {
        $categoryModel->delete($id);
        sendSuccess('Category deleted successfully', null, 200);
    } catch (Throwable $e) {
        error_log('Failed to delete category: ' . $e->getMessage());
        sendError('Failed to delete category', null, 500);
    }
}

// Unsupported HTTP method
sendError('Method not allowed', [
    'method'          => $method,
    'allowed_methods' => ['GET', 'POST', 'PUT', 'DELETE'],
], 405);
