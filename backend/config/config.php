<?php
declare(strict_types=1);

/**
 * Centralized Application Configuration
 *
 * Handles environment variable loading, timezone initialization, runtime error
 * reporting settings, and returns application-wide configuration arrays.
 */

// 1. Lightweight .env parser for vanilla PHP (no external package dependency)
$envFilePath = dirname(__DIR__) . '/.env';
if (file_exists($envFilePath) && is_readable($envFilePath)) {
    $lines = file($envFilePath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    if ($lines !== false) {
        foreach ($lines as $line) {
            $line = trim($line);
            // Skip empty lines or comment lines
            if ($line === '' || str_starts_with($line, '#')) {
                continue;
            }

            if (str_contains($line, '=')) {
                [$key, $value] = explode('=', $line, 2);
                $key = trim($key);
                $value = trim($value);

                // Strip surrounding quotes if present
                if (
                    (str_starts_with($value, '"') && str_ends_with($value, '"')) ||
                    (str_starts_with($value, "'") && str_ends_with($value, "'"))
                ) {
                    $value = substr($value, 1, -1);
                }

                // Register in environment if not already defined
                if (getenv($key) === false) {
                    putenv("{$key}={$value}");
                    $_ENV[$key] = $value;
                    $_SERVER[$key] = $value;
                }
            }
        }
    }
}

// 2. Safe environment variable retrieval helper
if (!function_exists('env')) {
    function env(string $key, mixed $default = null): mixed {
        $val = getenv($key);
        if ($val === false) {
            $val = $_ENV[$key] ?? $_SERVER[$key] ?? $default;
        }

        if (is_string($val)) {
            $lower = strtolower($val);
            if ($lower === 'true' || $lower === '(true)') return true;
            if ($lower === 'false' || $lower === '(false)') return false;
            if ($lower === 'null' || $lower === '(null)') return null;
            if ($lower === 'empty' || $lower === '(empty)') return '';
        }

        return $val;
    }
}

// 3. Timezone and Runtime Error Settings
$timezone = (string) env('APP_TIMEZONE', 'Asia/Karachi');
date_default_timezone_set($timezone);

$appEnv = (string) env('APP_ENV', 'development');
$appDebug = (bool) env('APP_DEBUG', true);

// Suppress raw HTML error display to avoid corrupting JSON output
ini_set('display_errors', '0');
ini_set('log_errors', '1');
error_reporting(E_ALL);

// 4. Return Structured Config Array
return [
    'app' => [
        'name'     => (string) env('APP_NAME', 'Maryam Sparkle API'),
        'version'  => 'v1',
        'env'      => $appEnv,
        'debug'    => $appDebug,
        'timezone' => $timezone,
    ],
    'cors' => [
        'allowed_origins' => array_values(array_filter(array_map('trim', explode(',', (string) env(
            'CORS_ALLOWED_ORIGINS',
            'http://localhost:5173,http://localhost:3000'
        ))))),
        'allowed_methods' => ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        'allowed_headers' => ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
    ],
    'db' => [
        'host'    => (string) env('DB_HOST', '127.0.0.1'),
        'port'    => (string) env('DB_PORT', '3306'),
        'name'    => (string) env('DB_NAME', 'maryam_sparkle'),
        'user'    => (string) env('DB_USER', 'root'),
        'pass'    => (string) env('DB_PASSWORD', ''),
        'charset' => (string) env('DB_CHARSET', 'utf8mb4'),
    ],
];
