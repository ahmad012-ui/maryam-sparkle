<?php
declare(strict_types=1);

/**
 * Authentication Controller for Maryam Sparkle REST API
 *
 * Handles customer registration, credential verification & login,
 * secure session termination (logout), current user profile (/me),
 * and authentication state verification (/check).
 */

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../helpers/response.php';
require_once __DIR__ . '/../helpers/validation.php';
require_once __DIR__ . '/../helpers/session.php';
require_once __DIR__ . '/../middleware/auth.php';
require_once __DIR__ . '/../cart/cart.php';
require_once __DIR__ . '/user.php';

try {
    $pdo = Database::getConnection();
} catch (Throwable $e) {
    error_log('Database connection error in auth controller: ' . $e->getMessage());
    sendError('Database connection unavailable', null, 503);
}

$userModel = new User($pdo);
$method = strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET');

// Extract action from routing subpath or request URI
$action = '';
if (isset($routeSubPath) && $routeSubPath !== '') {
    $segments = explode('/', trim($routeSubPath, '/'));
    $action = $segments[0] ?? '';
} else {
    $uriPath = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?? '';
    if (preg_match('#auth/([a-zA-Z0-9_-]+)#', $uriPath, $matches)) {
        $action = $matches[1];
    }
}
$action = strtolower(trim($action));

// -----------------------------------------------------------------------------
// 1. POST /api/v1/auth/register
// -----------------------------------------------------------------------------
if ($action === 'register') {
    if ($method !== 'POST') {
        sendError('Method not allowed', ['allowed_methods' => ['POST']], 405);
    }

    $input = getJsonInput();

    // Input Validation
    $validator = new Validator($input);
    $validator->required('first_name', 'First name')
              ->string('first_name', 1, 100, 'First name')
              ->required('last_name', 'Last name')
              ->string('last_name', 1, 100, 'Last name')
              ->required('email', 'Email')
              ->string('email', 3, 255, 'Email')
              ->email('email', 'Email')
              ->required('password', 'Password')
              ->string('password', 8, 255, 'Password');

    if (isset($input['phone']) && trim((string)$input['phone']) !== '') {
        $validator->string('phone', 1, 30, 'Phone');
    }

    $validator->validateOrExit();

    $normalizedEmail = strtolower(trim((string)$input['email']));

    // Check duplicate email
    if ($userModel->emailExists($normalizedEmail)) {
        sendError('Email already registered', [
            'email' => 'An account with this email address already exists.'
        ], 409);
    }

    // Create user (strictly enforces customer role and active status server-side)
    try {
        $newUser = $userModel->create([
            'first_name' => trim((string)$input['first_name']),
            'last_name'  => trim((string)$input['last_name']),
            'email'      => $normalizedEmail,
            'password'   => (string)$input['password'],
            'phone'      => isset($input['phone']) ? trim((string)$input['phone']) : null,
        ]);

        sendSuccess('Registration successful', [
            'user' => $newUser
        ], 201);
    } catch (Throwable $e) {
        error_log('User registration error: ' . $e->getMessage());
        sendError('Failed to register user', null, 500);
    }
}

// -----------------------------------------------------------------------------
// 2. POST /api/v1/auth/login
// -----------------------------------------------------------------------------
if ($action === 'login') {
    if ($method !== 'POST') {
        sendError('Method not allowed', ['allowed_methods' => ['POST']], 405);
    }

    $input = getJsonInput();

    // Input Validation
    $validator = new Validator($input);
    $validator->required('email', 'Email')
              ->email('email', 'Email')
              ->required('password', 'Password');
    $validator->validateOrExit();

    $normalizedEmail = strtolower(trim((string)$input['email']));
    $password = (string) $input['password'];

    // Locate user record by email
    $rawUser = $userModel->findByEmail($normalizedEmail);

    // Generic error message to prevent account enumeration
    if (!$rawUser || empty($rawUser['password_hash']) || !password_verify($password, $rawUser['password_hash'])) {
        sendError('Invalid email or password', null, 401);
    }

    // Account status validation
    if (($rawUser['status'] ?? '') !== 'active') {
        sendError('Account is inactive', null, 401);
    }

    // Establish secure session with ID regeneration
    setAuthSession((int) $rawUser['id'], (string) $rawUser['role']);

    // Merge guest shopping cart into authenticated user cart if guest_token exists
    if (!empty($_COOKIE['guest_token'])) {
        $cartModel = new Cart($pdo);
        $cartModel->mergeGuestCart((int) $rawUser['id'], (string) $_COOKIE['guest_token']);
    }

    $safeUser = User::formatSafeUser($rawUser);

    sendSuccess('Login successful', [
        'user' => $safeUser
    ], 200);
}

// -----------------------------------------------------------------------------
// 3. POST /api/v1/auth/logout
// -----------------------------------------------------------------------------
if ($action === 'logout') {
    if ($method !== 'POST') {
        sendError('Method not allowed', ['allowed_methods' => ['POST']], 405);
    }

    // Safely destroy session and clear cookies (idempotent, safe if already logged out)
    destroySession();

    sendSuccess('Logout successful', null, 200);
}

// -----------------------------------------------------------------------------
// 4. GET /api/v1/auth/me (Protected Route)
// -----------------------------------------------------------------------------
if ($action === 'me') {
    if ($method !== 'GET') {
        sendError('Method not allowed', ['allowed_methods' => ['GET']], 405);
    }

    // Requires active authentication; returns 401 if unauthenticated or inactive
    $user = requireAuth($pdo);

    sendSuccess('User profile retrieved successfully', [
        'user' => $user
    ], 200);
}

// -----------------------------------------------------------------------------
// 5. GET /api/v1/auth/check (Auth Status)
// -----------------------------------------------------------------------------
if ($action === 'check') {
    if ($method !== 'GET') {
        sendError('Method not allowed', ['allowed_methods' => ['GET']], 405);
    }

    // Retrieve active authenticated user or null without throwing
    $user = getAuthenticatedUser($pdo);

    if ($user === null) {
        sendSuccess('Auth status checked', [
            'authenticated' => false
        ], 200);
    }

    sendSuccess('Auth status checked', [
        'authenticated' => true,
        'user' => [
            'id'   => $user['id'],
            'role' => $user['role'],
        ]
    ], 200);
}

// -----------------------------------------------------------------------------
// Fallback for unknown auth actions
// -----------------------------------------------------------------------------
sendError('Auth route not found', [
    'action' => $action,
    'method' => $method,
], 404);
