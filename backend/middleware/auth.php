<?php
declare(strict_types=1);

/**
 * Authentication Middleware for Maryam Sparkle REST API
 *
 * Verifies that the incoming request is backed by an active, authenticated
 * server-side PHP session. Validates that the account still exists in the
 * database and remains active.
 */

require_once __DIR__ . '/../helpers/session.php';
require_once __DIR__ . '/../helpers/response.php';
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../auth/user.php';

if (!function_exists('requireAuth')) {
    /**
     * Enforce authentication for protected routes.
     *
     * Validates the server-side session. If unauthenticated, inactive, or not found,
     * terminates execution immediately with an HTTP 401 JSON response.
     *
     * @param PDO|null $pdo Optional existing PDO instance
     * @return array Safe authenticated user record ['id', 'first_name', 'last_name', 'email', 'phone', 'role', 'status', ...]
     */
    function requireAuth(?PDO $pdo = null): array {
        startSecureSession();

        $userId = getAuthUserId();
        if ($userId === null) {
            sendError('Authentication required', null, 401);
        }

        $pdo = $pdo ?? Database::getConnection();
        $userModel = new User($pdo);
        $user = $userModel->findById($userId);

        // Account was deleted from database
        if ($user === null) {
            destroySession();
            sendError('Authentication required', null, 401);
        }

        // Account was disabled or marked inactive
        if ($user['status'] !== 'active') {
            destroySession();
            sendError('Account is inactive', null, 401);
        }

        return $user;
    }
}

if (!function_exists('getAuthenticatedUser')) {
    /**
     * Retrieve the authenticated user if session exists and user is active,
     * without halting execution if unauthenticated.
     *
     * @param PDO|null $pdo Optional existing PDO instance
     * @return array|null Safe authenticated user record or null
     */
    function getAuthenticatedUser(?PDO $pdo = null): ?array {
        startSecureSession();

        $userId = getAuthUserId();
        if ($userId === null) {
            return null;
        }

        try {
            $pdo = $pdo ?? Database::getConnection();
            $userModel = new User($pdo);
            $user = $userModel->findById($userId);

            if ($user === null || $user['status'] !== 'active') {
                destroySession();
                return null;
            }

            return $user;
        } catch (Throwable $e) {
            error_log('Error checking authenticated user: ' . $e->getMessage());
            return null;
        }
    }
}
