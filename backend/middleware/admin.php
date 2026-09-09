<?php
declare(strict_types=1);

/**
 * Authorization / Administrator Middleware for Maryam Sparkle REST API
 *
 * Ensures that the authenticated user possesses administrator privileges ('admin').
 * Strictly relies on server-side session and database role validation.
 */

require_once __DIR__ . '/auth.php';
require_once __DIR__ . '/../helpers/response.php';

if (!function_exists('requireAdmin')) {
    /**
     * Enforce administrator-only access.
     *
     * 1. Requires valid authentication (HTTP 401 if unauthenticated/inactive).
     * 2. Checks if the verified user role is 'admin'.
     * 3. Rejects non-admin users with HTTP 403 Forbidden.
     *
     * @param PDO|null $pdo Optional existing PDO instance
     * @return array Safe authenticated admin user record
     */
    function requireAdmin(?PDO $pdo = null): array {
        // First verify authentication
        $user = requireAuth($pdo);

        // Verify role authorization
        if (($user['role'] ?? '') !== 'admin') {
            sendError('Administrator access required', null, 403);
        }

        return $user;
    }
}
