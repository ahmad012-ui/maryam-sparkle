<?php
declare(strict_types=1);

/**
 * Standardized JSON API Response Helpers
 *
 * Provides consistent, structured JSON responses across all endpoints.
 * Success: { "success": true, "message": string, "data": mixed }
 * Error:   { "success": false, "message": string, "errors": mixed }
 */

if (!function_exists('sendResponse')) {
    /**
     * Send a standardized JSON response and exit
     *
     * @param bool $success Whether the operation succeeded
     * @param string $message Descriptive status message
     * @param mixed $data Payload for successful responses
     * @param mixed $errors Error details/validation messages
     * @param int $statusCode HTTP status code (default: 200)
     * @return void
     */
    function sendResponse(
        bool $success,
        string $message,
        mixed $data = null,
        mixed $errors = null,
        int $statusCode = 200
    ): void {
        http_response_code($statusCode);

        if (!headers_sent()) {
            header('Content-Type: application/json; charset=UTF-8');
        }

        $response = [
            'success' => $success,
            'message' => $message,
        ];

        if ($success) {
            if ($data !== null) {
                $response['data'] = $data;
            }
        } else {
            if ($errors !== null) {
                $response['errors'] = $errors;
            }
        }

        $json = json_encode($response, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);

        if ($json === false) {
            http_response_code(500);
            echo '{"success":false,"message":"Internal Server Error: JSON Encoding Failed","errors":null}';
            exit;
        }

        echo $json;
        exit;
    }
}

if (!function_exists('sendSuccess')) {
    /**
     * Send a successful JSON response
     *
     * @param string $message Success message
     * @param mixed $data Associated response payload
     * @param int $statusCode HTTP status code (default: 200)
     * @return void
     */
    function sendSuccess(string $message, mixed $data = null, int $statusCode = 200): void {
        sendResponse(true, $message, $data, null, $statusCode);
    }
}

if (!function_exists('sendError')) {
    /**
     * Send an error JSON response
     *
     * @param string $message Error summary message
     * @param mixed $errors Specific validation or error details
     * @param int $statusCode HTTP status code (default: 400)
     * @return void
     */
    function sendError(string $message, mixed $errors = null, int $statusCode = 400): void {
        sendResponse(false, $message, null, $errors, $statusCode);
    }
}
