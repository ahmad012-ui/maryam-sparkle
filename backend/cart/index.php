<?php
declare(strict_types=1);

/**
 * Shopping Cart API Controller
 *
 * Handles endpoints:
 * - GET    /api/v1/cart
 * - POST   /api/v1/cart/items
 * - PUT    /api/v1/cart/items/{product_id}
 * - DELETE /api/v1/cart/items/{product_id}
 * - DELETE /api/v1/cart
 */

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../helpers/response.php';
require_once __DIR__ . '/../helpers/validation.php';
require_once __DIR__ . '/../helpers/session.php';
require_once __DIR__ . '/cart.php';

try {
    $pdo = Database::getConnection();
} catch (Throwable $e) {
    error_log('Database connection error in cart controller: ' . $e->getMessage());
    sendError('Database connection unavailable', null, 503);
}

$cartModel = new Cart($pdo);

// Initialize secure session to identify logged-in users
startSecureSession();
$userId = getAuthUserId();
$guestToken = !empty($_COOKIE['guest_token']) ? trim((string)$_COOKIE['guest_token']) : null;

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
$subPath = $routeSubPath ?? '';

// -----------------------------------------------------------------------------
// 1. GET /api/v1/cart (View Current Cart)
// -----------------------------------------------------------------------------
if ($method === 'GET' && $subPath === '') {
    $cart = $cartModel->resolveCurrentCart($userId, $guestToken, false);

    if (!$cart) {
        sendSuccess('Cart retrieved successfully', Cart::formatEmptyCart(), 200);
    }

    $cartDetails = $cartModel->getCartDetails((int) $cart['id']);
    sendSuccess('Cart retrieved successfully', $cartDetails, 200);
}

// -----------------------------------------------------------------------------
// 2. POST /api/v1/cart/items (Add Item to Cart)
// -----------------------------------------------------------------------------
if ($method === 'POST' && $subPath === 'items') {
    $input = getJsonInput();

    $validator = new Validator($input);
    $validator->required('product_id', 'Product ID');
    $validator->validateOrExit();

    $productId = filter_var($input['product_id'], FILTER_VALIDATE_INT);
    if ($productId === false || $productId <= 0) {
        sendError('Validation failed', ['product_id' => 'Product ID must be a positive integer'], 422);
    }

    $quantity = 1;
    if (isset($input['quantity'])) {
        $parsedQty = filter_var($input['quantity'], FILTER_VALIDATE_INT);
        if ($parsedQty === false || $parsedQty <= 0) {
            sendError('Validation failed', ['quantity' => 'Quantity must be a positive integer'], 422);
        }
        $quantity = (int) $parsedQty;
    }

    // Resolve existing cart or instantiate new cart container (with cookie if guest)
    $cart = $cartModel->resolveCurrentCart($userId, $guestToken, true);
    if (!$cart) {
        sendError('Failed to initialize cart session', null, 500);
    }

    try {
        $cartDetails = $cartModel->addItem((int) $cart['id'], (int) $productId, $quantity);
        sendSuccess('Item added to cart', $cartDetails, 201);
    } catch (RuntimeException $e) {
        $status = $e->getCode() >= 400 && $e->getCode() <= 499 ? $e->getCode() : 400;
        $errors = $status === 409 ? ['stock' => $e->getMessage()] : ($status === 404 ? null : ['quantity' => $e->getMessage()]);
        sendError($e->getMessage(), $errors, $status);
    }
}

// -----------------------------------------------------------------------------
// 3. PUT /api/v1/cart/items/{product_id} (Update Item Quantity)
// -----------------------------------------------------------------------------
if ($method === 'PUT' && preg_match('#^items/(\d+)$#', $subPath, $matches)) {
    $productId = (int) $matches[1];

    $input = getJsonInput();
    if (!isset($input['quantity'])) {
        sendError('Validation failed', ['quantity' => 'Quantity is required'], 422);
    }

    $quantity = filter_var($input['quantity'], FILTER_VALIDATE_INT);
    if ($quantity === false || $quantity <= 0) {
        sendError(
            'Validation failed',
            ['quantity' => 'Quantity must be a positive integer. Use DELETE /api/v1/cart/items/{id} to remove.'],
            422
        );
    }

    $cart = $cartModel->resolveCurrentCart($userId, $guestToken, false);
    if (!$cart) {
        sendError('Cart is empty or not found', null, 404);
    }

    try {
        $cartDetails = $cartModel->updateItemQuantity((int) $cart['id'], $productId, (int) $quantity);
        sendSuccess('Cart updated successfully', $cartDetails, 200);
    } catch (RuntimeException $e) {
        $status = $e->getCode() >= 400 && $e->getCode() <= 499 ? $e->getCode() : 400;
        $errorKey = $status === 409 ? 'stock' : 'item';
        sendError($e->getMessage(), [$errorKey => $e->getMessage()], $status);
    }
}

// -----------------------------------------------------------------------------
// 4. DELETE /api/v1/cart/items/{product_id} (Remove Item from Cart)
// -----------------------------------------------------------------------------
if ($method === 'DELETE' && preg_match('#^items/(\d+)$#', $subPath, $matches)) {
    $productId = (int) $matches[1];

    $cart = $cartModel->resolveCurrentCart($userId, $guestToken, false);
    if (!$cart) {
        sendError('Cart is empty or not found', null, 404);
    }

    try {
        $cartDetails = $cartModel->removeItem((int) $cart['id'], $productId);
        sendSuccess('Item removed from cart', $cartDetails, 200);
    } catch (RuntimeException $e) {
        $status = $e->getCode() >= 400 && $e->getCode() <= 499 ? $e->getCode() : 404;
        sendError($e->getMessage(), null, $status);
    }
}

// -----------------------------------------------------------------------------
// 5. DELETE /api/v1/cart (Clear Entire Cart)
// -----------------------------------------------------------------------------
if ($method === 'DELETE' && $subPath === '') {
    $cart = $cartModel->resolveCurrentCart($userId, $guestToken, false);

    if (!$cart) {
        sendSuccess('Cart cleared successfully', Cart::formatEmptyCart(), 200);
    }

    $cartDetails = $cartModel->clearCart((int) $cart['id']);
    sendSuccess('Cart cleared successfully', $cartDetails, 200);
}

// -----------------------------------------------------------------------------
// Unmatched Sub-route / Method
// -----------------------------------------------------------------------------
sendError('Endpoint not found on cart resource', [
    'subpath' => $subPath,
    'method'  => $method,
], 404);
