<?php
declare(strict_types=1);

/**
 * Orders & Checkout API Controller
 *
 * Handles:
 * - POST /api/v1/orders        (Checkout & Order Creation - Authenticated & Guest)
 * - GET  /api/v1/orders        (List Authenticated Customer's Orders with Pagination)
 * - GET  /api/v1/orders/track  (Guest Order Tracking by Order Number + Email/Phone)
 * - GET  /api/v1/orders/{id}   (View Specific Customer Order by ID)
 */

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../helpers/response.php';
require_once __DIR__ . '/../helpers/validation.php';
require_once __DIR__ . '/../helpers/session.php';
require_once __DIR__ . '/../middleware/auth.php';
require_once __DIR__ . '/../cart/cart.php';
require_once __DIR__ . '/order.php';

try {
    $pdo = Database::getConnection();
} catch (Throwable $e) {
    error_log('Database connection error in orders controller: ' . $e->getMessage());
    sendError('Database connection unavailable', null, 503);
}

$orderModel = new Order($pdo);
$cartModel = new Cart($pdo);

// Initialize secure session to identify logged-in users
startSecureSession();
$userId = getAuthUserId();
$guestToken = !empty($_COOKIE['guest_token']) ? trim((string)$_COOKIE['guest_token']) : null;

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
$subPath = $routeSubPath ?? '';

// -----------------------------------------------------------------------------
// 1. POST /api/v1/orders (Checkout & Create Order)
// -----------------------------------------------------------------------------
if ($method === 'POST' && $subPath === '') {
    $input = getJsonInput();

    // 1. Validate payment method
    $allowedPaymentMethods = ['cod', 'easypaisa', 'jazzcash', 'bank_transfer'];
    $paymentMethod = isset($input['payment_method']) ? strtolower(trim((string)$input['payment_method'])) : '';

    if ($paymentMethod === '' || !in_array($paymentMethod, $allowedPaymentMethods, true)) {
        sendError('Validation failed', [
            'payment_method' => 'Payment method is required and must be one of: ' . implode(', ', $allowedPaymentMethods),
        ], 422);
    }

    // 2. Resolve existing cart
    $cart = $cartModel->resolveCurrentCart($userId, $guestToken, false);
    if (!$cart) {
        sendError('Cart is empty. Please add items to your cart before checking out.', [
            'cart' => 'Cart not found or empty',
        ], 400);
    }

    $cartId = (int) $cart['id'];

    // Verify cart actually contains items
    $countStmt = $pdo->prepare('SELECT COUNT(*) FROM cart_items WHERE cart_id = :cart_id');
    $countStmt->bindValue(':cart_id', $cartId, PDO::PARAM_INT);
    $countStmt->execute();
    if ((int) $countStmt->fetchColumn() === 0) {
        sendError('Cart is empty. Please add items to your cart before checking out.', [
            'cart' => 'No items in cart',
        ], 400);
    }

    // 3. Resolve Customer Information
    $customerData = [];

    if ($userId !== null) {
        // Authenticated customer: fetch profile as authoritative defaults
        $userStmt = $pdo->prepare('SELECT id, first_name, last_name, email, phone FROM users WHERE id = :id LIMIT 1');
        $userStmt->bindValue(':id', $userId, PDO::PARAM_INT);
        $userStmt->execute();
        $authUserProfile = $userStmt->fetch();

        $defaultName = $authUserProfile ? trim($authUserProfile['first_name'] . ' ' . $authUserProfile['last_name']) : 'Customer';
        $defaultEmail = $authUserProfile ? (string)$authUserProfile['email'] : '';
        $defaultPhone = $authUserProfile && $authUserProfile['phone'] ? (string)$authUserProfile['phone'] : '';

        // Allow overrides from request customer object if provided, else use profile
        $customerObj = is_array($input['customer'] ?? null) ? $input['customer'] : [];
        $customerName = trim((string)($customerObj['name'] ?? $input['customer_name'] ?? $defaultName));
        $customerEmail = trim((string)($customerObj['email'] ?? $input['customer_email'] ?? $defaultEmail));
        $customerPhone = trim((string)($customerObj['phone'] ?? $input['customer_phone'] ?? $defaultPhone));

        if ($customerName === '' || mb_strlen($customerName) < 2) {
            sendError('Validation failed', ['customer.name' => 'Customer name must be at least 2 characters'], 422);
        }
        if ($customerEmail === '' || !filter_var($customerEmail, FILTER_VALIDATE_EMAIL)) {
            sendError('Validation failed', ['customer.email' => 'A valid customer email address is required'], 422);
        }
        if ($customerPhone === '' || mb_strlen($customerPhone) < 7) {
            sendError('Validation failed', ['customer.phone' => 'A valid customer phone number is required (min 7 digits)'], 422);
        }

        $customerData = [
            'name'  => $customerName,
            'email' => $customerEmail,
            'phone' => $customerPhone,
        ];
    } else {
        // Guest customer: must supply customer details explicitly
        $customerObj = is_array($input['customer'] ?? null) ? $input['customer'] : [];
        $customerName = trim((string)($customerObj['name'] ?? $input['customer_name'] ?? ''));
        $customerEmail = trim((string)($customerObj['email'] ?? $input['customer_email'] ?? ''));
        $customerPhone = trim((string)($customerObj['phone'] ?? $input['customer_phone'] ?? ''));

        $val = new Validator([
            'name'  => $customerName,
            'email' => $customerEmail,
            'phone' => $customerPhone,
        ]);
        $val->required('name', 'Customer name')->string('name', 2, 150, 'Customer name');
        $val->required('email', 'Customer email')->email('email', 'Customer email');
        $val->required('phone', 'Customer phone')->string('phone', 7, 30, 'Customer phone');
        $val->validateOrExit();

        $customerData = [
            'name'  => $customerName,
            'email' => $customerEmail,
            'phone' => $customerPhone,
        ];
    }

    // 4. Resolve Shipping Address
    $addressId = null;
    $newAddressData = null;

    if ($userId !== null && !empty($input['address_id'])) {
        // Authenticated customer supplied saved address ID
        $candidateAddrId = filter_var($input['address_id'], FILTER_VALIDATE_INT);
        if ($candidateAddrId === false || $candidateAddrId <= 0) {
            sendError('Validation failed', ['address_id' => 'Address ID must be a positive integer'], 422);
        }
        $addressId = (int) $candidateAddrId;
    } else {
        // New shipping address provided (required for guests, or authenticated users providing address directly)
        $rawAddr = is_array($input['shipping_address'] ?? null) 
            ? $input['shipping_address'] 
            : (is_array($input['address'] ?? null) ? $input['address'] : []);

        $valAddr = new Validator($rawAddr);
        $valAddr->required('address_line_1', 'Address line 1')->string('address_line_1', 3, 255, 'Address line 1');
        $valAddr->required('city', 'City')->string('city', 2, 100, 'City');
        $valAddr->string('state', 0, 100, 'State');
        $valAddr->string('postal_code', 0, 20, 'Postal code');
        $valAddr->string('address_line_2', 0, 255, 'Address line 2');
        $valAddr->validateOrExit();

        $fullName = trim((string)($rawAddr['full_name'] ?? $customerData['name']));
        $phone = trim((string)($rawAddr['phone'] ?? $customerData['phone']));

        if ($fullName === '') {
            $fullName = $customerData['name'];
        }
        if ($phone === '') {
            $phone = $customerData['phone'];
        }

        $country = trim((string)($rawAddr['country'] ?? 'Pakistan'));
        if ($country === '') {
            $country = 'Pakistan';
        }

        $newAddressData = [
            'full_name'      => $fullName,
            'phone'          => $phone,
            'address_line_1' => trim((string)$rawAddr['address_line_1']),
            'address_line_2' => !empty($rawAddr['address_line_2']) ? trim((string)$rawAddr['address_line_2']) : null,
            'city'           => trim((string)$rawAddr['city']),
            'state'          => !empty($rawAddr['state']) ? trim((string)$rawAddr['state']) : null,
            'postal_code'    => !empty($rawAddr['postal_code']) ? trim((string)$rawAddr['postal_code']) : null,
            'country'        => $country,
        ];
    }

    // 5. Create Order via Atomic Transaction
    try {
        $createdOrder = $orderModel->createOrder(
            $cartId,
            $userId,
            $customerData,
            $addressId,
            $newAddressData,
            $paymentMethod
        );

        sendSuccess('Order created successfully', [
            'order' => [
                'id'             => $createdOrder['id'],
                'order_number'   => $createdOrder['order_number'],
                'status'         => $createdOrder['status'],
                'payment_status' => $createdOrder['payment_status'],
                'payment_method' => $createdOrder['payment_method'],
                'subtotal'       => $createdOrder['subtotal'],
                'shipping_fee'   => $createdOrder['shipping_fee'],
                'discount'       => $createdOrder['discount'],
                'total'          => $createdOrder['total'],
                'item_count'     => $createdOrder['item_count'],
                'created_at'     => $createdOrder['created_at'],
            ],
        ], 201);
    } catch (RuntimeException $e) {
        $code = (int) $e->getCode();
        $statusCode = ($code >= 400 && $code <= 503) ? $code : 400;
        $errorKey = $statusCode === 409 ? 'stock' : ($statusCode === 403 ? 'address' : 'order');
        sendError($e->getMessage(), [$errorKey => $e->getMessage()], $statusCode);
    } catch (Throwable $e) {
        error_log('Unexpected error during order creation: ' . $e->getMessage());
        sendError('Failed to complete checkout due to an unexpected server error.', null, 500);
    }
}

// -----------------------------------------------------------------------------
// 2. GET /api/v1/orders/track (Guest & Public Order Tracking)
// -----------------------------------------------------------------------------
if ($method === 'GET' && $subPath === 'track') {
    $orderNumber = trim((string)($_GET['order_number'] ?? ''));
    $email = trim((string)($_GET['email'] ?? ''));
    $phone = isset($_GET['phone']) ? trim((string)$_GET['phone']) : null;

    $errors = [];
    if ($orderNumber === '') {
        $errors['order_number'] = 'Order number is required for tracking';
    }

    if ($email === '') {
        $errors['email'] = 'Customer email is required for tracking verification';
    } elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $errors['email'] = 'A valid customer email address is required';
    }

    if (!empty($errors)) {
        sendError('Validation failed', $errors, 422);
    }

    $trackedOrder = $orderModel->trackGuestOrder(
        $orderNumber,
        $email,
        $phone !== null && $phone !== '' ? $phone : null
    );

    if (!$trackedOrder) {
        sendError('Order not found with the provided details', null, 404);
    }

    sendSuccess('Order tracking details retrieved successfully', [
        'order' => $trackedOrder,
    ], 200);
}

// -----------------------------------------------------------------------------
// 3. GET /api/v1/orders (List Authenticated Customer's Orders)
// -----------------------------------------------------------------------------
if ($method === 'GET' && $subPath === '') {
    $authUser = requireAuth($pdo);
    $authUserId = (int) $authUser['id'];

    $page = max(1, (int)($_GET['page'] ?? 1));
    $limit = min(50, max(1, (int)($_GET['limit'] ?? 10)));

    $result = $orderModel->getUserOrders($authUserId, $page, $limit);

    sendSuccess('Orders retrieved successfully', [
        'orders' => $result['orders'],
    ], 200, $result['pagination']);
}

// -----------------------------------------------------------------------------
// 4. GET /api/v1/orders/{id} (View Specific Order Details)
// -----------------------------------------------------------------------------
if ($method === 'GET' && preg_match('#^(\d+)$#', $subPath, $matches)) {
    $orderId = (int) $matches[1];

    $authUser = requireAuth($pdo);
    $authUserId = (int) $authUser['id'];
    $isAdmin = ($authUser['role'] ?? '') === 'admin';

    $order = $orderModel->getOrderById($orderId, $authUserId, $isAdmin);

    if (!$order) {
        sendError('Order not found', null, 404);
    }

    sendSuccess('Order details retrieved successfully', [
        'order' => $order,
    ], 200);
}

// -----------------------------------------------------------------------------
// Unmatched Sub-route / Method on Orders Resource
// -----------------------------------------------------------------------------
sendError('Endpoint not found on orders resource', [
    'subpath' => $subPath,
    'method'  => $method,
], 404);
