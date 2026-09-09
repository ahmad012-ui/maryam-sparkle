<?php
declare(strict_types=1);

/**
 * Session Security Helper for Maryam Sparkle REST API
 *
 * Provides centralized session configuration, safe initialization,
 * session regeneration on authentication, and clean session destruction.
 */

if (!function_exists('startSecureSession')) {
    /**
     * Safely initialize or resume a PHP session with strict security parameters:
     * - HttpOnly to mitigate XSS cookie theft
     * - SameSite=Lax to protect against CSRF attacks
     * - Secure flag enabled when running over HTTPS
     * - Configurable cookie lifetime
     */
    function startSecureSession(): void {
        if (session_status() === PHP_SESSION_ACTIVE) {
            return;
        }

        // Determine if connection is secure (HTTPS or forwarded SSL)
        $isSecure = (
            (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ||
            (isset($_SERVER['SERVER_PORT']) && (int)$_SERVER['SERVER_PORT'] === 443) ||
            (!empty($_SERVER['HTTP_X_FORWARDED_PROTO']) && strtolower($_SERVER['HTTP_X_FORWARDED_PROTO']) === 'https')
        );

        // Session cookie lifetime (7 days)
        $cookieLifetime = 604800;

        // Apply secure session cookie configuration
        session_set_cookie_params([
            'lifetime' => $cookieLifetime,
            'path'     => '/',
            'domain'   => '',
            'secure'   => $isSecure,
            'httponly' => true,
            'samesite' => 'Lax',
        ]);

        // Enforce strict cookie mode and use only cookies for session IDs
        ini_set('session.use_only_cookies', '1');
        ini_set('session.use_strict_mode', '1');

        session_start();
    }
}

if (!function_exists('regenerateSession')) {
    /**
     * Regenerate the session ID upon authentication to prevent session fixation attacks.
     *
     * @param bool $deleteOldSession Whether to delete the old session file
     */
    function regenerateSession(bool $deleteOldSession = true): void {
        if (session_status() === PHP_SESSION_ACTIVE) {
            session_regenerate_id($deleteOldSession);
        }
    }
}

if (!function_exists('destroySession')) {
    /**
     * Completely destroy the current session and expire the session cookie.
     * Safe to invoke even if no session is active.
     */
    function destroySession(): void {
        if (session_status() !== PHP_SESSION_ACTIVE) {
            startSecureSession();
        }

        // Clear all session variables
        $_SESSION = [];

        // Expire the session cookie in the client's browser
        if (ini_get('session.use_cookies')) {
            $params = session_get_cookie_params();
            setcookie(
                session_name(),
                '',
                time() - 42000,
                $params['path'],
                $params['domain'],
                $params['secure'],
                $params['httponly']
            );
        }

        // Destroy server session storage
        if (session_status() === PHP_SESSION_ACTIVE) {
            session_destroy();
        }
    }
}

if (!function_exists('isAuthenticated')) {
    /**
     * Check if the current session contains an authenticated user ID.
     */
    function isAuthenticated(): bool {
        if (session_status() !== PHP_SESSION_ACTIVE) {
            startSecureSession();
        }
        return !empty($_SESSION['user_id']) && is_numeric($_SESSION['user_id']);
    }
}

if (!function_exists('getAuthUserId')) {
    /**
     * Retrieve the authenticated user ID from the session, or null if unauthenticated.
     */
    function getAuthUserId(): ?int {
        if (!isAuthenticated()) {
            return null;
        }
        return (int) $_SESSION['user_id'];
    }
}

if (!function_exists('getAuthUserRole')) {
    /**
     * Retrieve the authenticated user's role from the session, or null if unauthenticated.
     */
    function getAuthUserRole(): ?string {
        if (!isAuthenticated()) {
            return null;
        }
        return isset($_SESSION['role']) ? (string) $_SESSION['role'] : null;
    }
}

if (!function_exists('setAuthSession')) {
    /**
     * Store minimum authenticated user data in session and regenerate session ID.
     * Never stores passwords, tokens, or unnecessary data in session.
     *
     * @param int $userId
     * @param string $role
     */
    function setAuthSession(int $userId, string $role): void {
        if (session_status() !== PHP_SESSION_ACTIVE) {
            startSecureSession();
        }

        // Prevent session fixation by rotating session ID
        regenerateSession(true);

        $_SESSION['user_id'] = $userId;
        $_SESSION['role'] = $role;
    }
}
