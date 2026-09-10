<?php
declare(strict_types=1);

/**
 * Maryam Sparkle REST API - Entry Point (Phase 1)
 *
 * Handles HTTP requests, enforces strict JSON responses, configures CORS,
 * intercepts OPTIONS preflights, catches uncaught errors safely, and provides
 * a health verification endpoint.
 */

// 1. Load configuration and helper modules
$config = require __DIR__ . '/config/config.php';
require_once __DIR__ . '/helpers/response.php';

// 2. Register global exception handler to guarantee strict JSON output
set_exception_handler(function (Throwable $e) use ($config): void {
    error_log(sprintf(
        "Unhandled API Exception [%s]: %s in %s on line %d",
        get_class($e),
        $e->getMessage(),
        $e->getFile(),
        $e->getLine()
    ));

    $isDebug = (bool) ($config['app']['debug'] ?? false);
    $errorDetails = $isDebug ? [
        'exception' => get_class($e),
        'message'   => $e->getMessage(),
        'file'      => basename($e->getFile()),
        'line'      => $e->getLine(),
    ] : null;

    sendError('Internal Server Error', $errorDetails, 500);
});

// 3. Register global error handler (convert warnings/notices to exceptions in debug mode)
set_error_handler(function (int $severity, string $message, string $file, int $line): bool {
    if (!(error_reporting() & $severity)) {
        return false;
    }
    throw new ErrorException($message, 0, $severity, $file, $line);
});

// 4. Default JSON Content-Type header
header('Content-Type: application/json; charset=UTF-8');

// 5. Safe CORS Configuration
$requestOrigin = $_SERVER['HTTP_ORIGIN'] ?? '';
$allowedOrigins = $config['cors']['allowed_origins'] ?? [];

if ($requestOrigin !== '') {
    if (in_array($requestOrigin, $allowedOrigins, true)) {
        header("Access-Control-Allow-Origin: {$requestOrigin}");
        header('Access-Control-Allow-Credentials: true');
        header('Vary: Origin');
    } elseif (in_array('*', $allowedOrigins, true)) {
        header('Access-Control-Allow-Origin: *');
    }
}

header('Access-Control-Allow-Methods: ' . implode(', ', $config['cors']['allowed_methods'] ?? ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']));
header('Access-Control-Allow-Headers: ' . implode(', ', $config['cors']['allowed_headers'] ?? ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']));
header('Access-Control-Max-Age: 86400');

// 6. Detect HTTP Request Method
$method = strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET');

// 7. Handle CORS pre-flight OPTIONS request
if ($method === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// 8. Resolve URI Path
$requestUri = $_SERVER['REQUEST_URI'] ?? '/';
$parsedPath = parse_url($requestUri, PHP_URL_PATH) ?? '/';

// Clean out script directory/filename if hosted in a subdirectory
$scriptName = $_SERVER['SCRIPT_NAME'] ?? '';
$scriptDir = dirname($scriptName);

if ($scriptName !== '' && str_starts_with($parsedPath, $scriptName)) {
    $routePath = substr($parsedPath, strlen($scriptName));
} elseif ($scriptDir !== '' && $scriptDir !== '/' && str_starts_with($parsedPath, $scriptDir)) {
    $routePath = substr($parsedPath, strlen($scriptDir));
} else {
    $routePath = $parsedPath;
}

$routePath = trim($routePath, '/');

// Allow query parameter fallback: ?route=api/v1/health/db
if (($routePath === '' || $routePath === 'index.php') && !empty($_GET['route'])) {
    $routePath = trim((string) $_GET['route'], '/');
}

// 9. API Health Check Endpoint: GET /backend/index.php or / or /health or /api/v1/health
$isHealthRoute = (
    $routePath === '' ||
    $routePath === 'index.php' ||
    $routePath === 'health' ||
    $routePath === 'api/v1/health'
);

if ($isHealthRoute) {
    if ($method !== 'GET') {
        sendError('Method not allowed', [
            'method'          => $method,
            'allowed_methods' => ['GET'],
        ], 405);
    }

    sendSuccess('Maryam Sparkle API is running', [
        'version' => (string) ($config['app']['version'] ?? 'v1'),
    ], 200);
}

// 10. Database Health Check Endpoint: GET /api/v1/health/db or /health/db
$isDbHealthRoute = (
    $routePath === 'api/v1/health/db' ||
    $routePath === 'health/db'
);

if ($isDbHealthRoute) {
    if ($method !== 'GET') {
        sendError('Method not allowed', [
            'method'          => $method,
            'allowed_methods' => ['GET'],
        ], 405);
    }

    require_once __DIR__ . '/config/database.php';

    try {
        $pdo = Database::getConnection();
        $stmt = $pdo->query('SELECT 1');
        $stmt->fetch();

        sendSuccess('Database connection successful', null, 200);
    } catch (Throwable $e) {
        // Log technical failure internally without leaking credentials or details to client
        error_log('Database health check failure: ' . $e->getMessage());
        sendError('Database connection failed', null, 503);
    }
}

// 11. Categories API Endpoints: /api/v1/categories[/{id}]
$normalizedPath = $routePath;
if (str_starts_with($normalizedPath, 'api/v1/')) {
    $normalizedPath = substr($normalizedPath, strlen('api/v1/'));
} elseif (str_starts_with($normalizedPath, 'v1/')) {
    $normalizedPath = substr($normalizedPath, strlen('v1/'));
}
$normalizedPath = trim($normalizedPath, '/');

if ($normalizedPath === 'categories' || str_starts_with($normalizedPath, 'categories/')) {
    $routeSubPath = substr($normalizedPath, strlen('categories'));
    $routeSubPath = trim($routeSubPath, '/');
    require __DIR__ . '/categories/index.php';
    exit;
}

// 12. Products API Endpoints: /api/v1/products[/{id}|/slug/{slug}]
if ($normalizedPath === 'products' || str_starts_with($normalizedPath, 'products/')) {
    $routeSubPath = substr($normalizedPath, strlen('products'));
    $routeSubPath = trim($routeSubPath, '/');
    require __DIR__ . '/products/index.php';
    exit;
}

// 13. Authentication & Authorization API Endpoints: /api/v1/auth/...
if ($normalizedPath === 'auth' || str_starts_with($normalizedPath, 'auth/')) {
    $routeSubPath = substr($normalizedPath, strlen('auth'));
    $routeSubPath = trim($routeSubPath, '/');
    require __DIR__ . '/auth/index.php';
    exit;
}

// 14. Shopping Cart API Endpoints: /api/v1/cart/...
if ($normalizedPath === 'cart' || str_starts_with($normalizedPath, 'cart/')) {
    $routeSubPath = substr($normalizedPath, strlen('cart'));
    $routeSubPath = trim($routeSubPath, '/');
    require __DIR__ . '/cart/index.php';
    exit;
}

// 15. Orders & Checkout API Endpoints: /api/v1/orders/...
if ($normalizedPath === 'orders' || str_starts_with($normalizedPath, 'orders/')) {
    $routeSubPath = substr($normalizedPath, strlen('orders'));
    $routeSubPath = trim($routeSubPath, '/');
    require __DIR__ . '/orders/index.php';
    exit;
}

// 16. Media API Endpoints: /api/v1/media/...
if ($normalizedPath === 'media' || str_starts_with($normalizedPath, 'media/')) {
    $routeSubPath = substr($normalizedPath, strlen('media'));
    $routeSubPath = trim($routeSubPath, '/');
    require __DIR__ . '/media/index.php';
    exit;
}

// 17. Route Foundation for Planned Modules (Phase 8+)
// Planned modules:
// - /api/v1/users
// - /api/v1/custom-orders
//
// In Phase 7B, any unhandled route returns a standardized 404 JSON response.
sendError('Route not found', [
    'path'   => '/' . $routePath,
    'method' => $method,
], 404);
