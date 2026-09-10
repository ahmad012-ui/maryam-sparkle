<?php
declare(strict_types=1);

/**
 * Media API Controller (Phase 7B)
 *
 * Implements POST /api/v1/media/upload
 * Accepts multipart/form-data with 'file' and 'folder' fields.
 * Validates extension (.jpg, .jpeg, .png, .webp) and max 10MB.
 *
 * Authorization rules:
 * - folder='products': Requires administrator privileges (requireAdmin).
 * - folder='payment-proofs': Allows unauthenticated requests for guest checkout.
 */

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../helpers/response.php';
require_once __DIR__ . '/../helpers/session.php';
require_once __DIR__ . '/../middleware/auth.php';
require_once __DIR__ . '/../middleware/admin.php';

// Database connection for auth checking
$pdo = null;
try {
    $pdo = Database::getConnection();
} catch (Throwable $e) {
    error_log('Database connection error in media controller: ' . $e->getMessage());
}

startSecureSession();

$method = strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET');
$subPath = $routeSubPath ?? '';

if ($method === 'OPTIONS') {
    http_response_code(204);
    exit;
}

if ($method !== 'POST') {
    sendError('Method not allowed', [
        'method'          => $method,
        'allowed_methods' => ['POST'],
    ], 405);
}

// -----------------------------------------------------------------------------
// POST /api/v1/media/upload
// -----------------------------------------------------------------------------
if ($subPath !== '' && $subPath !== 'upload') {
    sendError('Route not found', [
        'path' => '/api/v1/media/' . $subPath,
    ], 404);
}

// 1. Resolve and validate target folder
$rawFolder = isset($_POST['folder']) ? strtolower(trim((string)$_POST['folder'])) : 'products';
$folder = preg_replace('/[^a-z0-9_\-]/', '', $rawFolder);

if ($folder === '') {
    $folder = 'products';
}

$allowedFolders = ['products', 'payment-proofs', 'general'];
if (!in_array($folder, $allowedFolders, true)) {
    sendError('Validation failed', [
        'folder' => 'Invalid folder destination. Allowed folders: ' . implode(', ', $allowedFolders),
    ], 422);
}

// 2. Authorization check based on destination folder
if ($folder === 'products') {
    // Requires authenticated administrator
    requireAdmin($pdo);
} elseif ($folder === 'payment-proofs') {
    // Unauthenticated guest uploads are explicitly permitted for checkout proof-of-payment
} else {
    // All other folders require administrator
    requireAdmin($pdo);
}

// 3. Validate uploaded file presence
if (!isset($_FILES['file']) || !is_array($_FILES['file'])) {
    sendError('Validation failed', [
        'file' => 'No file was submitted in the \'file\' field.',
    ], 422);
}

$file = $_FILES['file'];

if (!isset($file['error']) || $file['error'] !== UPLOAD_ERR_OK) {
    $errorCode = $file['error'] ?? UPLOAD_ERR_NO_FILE;
    $errorMessage = match ($errorCode) {
        UPLOAD_ERR_INI_SIZE, UPLOAD_ERR_FORM_SIZE => 'File size exceeds maximum permitted server limit.',
        UPLOAD_ERR_PARTIAL                        => 'The file was only partially uploaded. Please try again.',
        UPLOAD_ERR_NO_FILE                        => 'No file was uploaded.',
        default                                   => 'An error occurred during file upload (code ' . $errorCode . ').',
    };

    sendError('Upload failed', ['file' => $errorMessage], 422);
}

// 4. Validate file size (10MB maximum limit)
$maxSizeBytes = 10 * 1024 * 1024; // 10MB
$fileSize = (int) ($file['size'] ?? 0);

if ($fileSize <= 0 || $fileSize > $maxSizeBytes) {
    sendError('Validation failed', [
        'file' => 'File size exceeds the 10MB limit. Please upload an image smaller than 10MB.',
    ], 422);
}

// 5. Validate file extension and MIME type
$originalName = (string) ($file['name'] ?? '');
$extension = strtolower(pathinfo($originalName, PATHINFO_EXTENSION));

$allowedExtensions = ['jpg', 'jpeg', 'png', 'webp'];
if (!in_array($extension, $allowedExtensions, true)) {
    sendError('Validation failed', [
        'file' => 'Invalid file extension (.' . $extension . '). Only .jpg, .jpeg, .png, and .webp images are allowed.',
    ], 422);
}

$tmpPath = (string) ($file['tmp_name'] ?? '');
if (!is_uploaded_file($tmpPath)) {
    sendError('Validation failed', [
        'file' => 'Uploaded file verification failed.',
    ], 422);
}

// Strict MIME type validation
$allowedMimes = ['image/jpeg', 'image/png', 'image/webp'];
if (function_exists('finfo_open')) {
    $finfo = finfo_open(FILEINFO_MIME_TYPE);
    if ($finfo !== false) {
        $detectedMime = finfo_file($finfo, $tmpPath);
        finfo_close($finfo);

        if ($detectedMime && !in_array(strtolower($detectedMime), $allowedMimes, true)) {
            sendError('Validation failed', [
                'file' => 'Invalid image MIME type (' . $detectedMime . '). Only JPEG, PNG, and WEBP formats are accepted.',
            ], 422);
        }
    }
}

// 6. Generate collision-safe filename (never trust client filename)
$uniqueId = bin2hex(random_bytes(16));
$safeFilename = $uniqueId . '_' . time() . '.' . $extension;

// 7. Store on disk under public /uploads path
$baseUploadDir = dirname(__DIR__, 2) . '/uploads';
$targetDir = $baseUploadDir . '/' . $folder;

if (!is_dir($targetDir)) {
    if (!@mkdir($targetDir, 0755, true) && !is_dir($targetDir)) {
        error_log("Failed to create media upload directory: {$targetDir}");
        sendError('Failed to prepare upload destination directory.', null, 500);
    }
}

$targetFilePath = $targetDir . '/' . $safeFilename;

if (!move_uploaded_file($tmpPath, $targetFilePath)) {
    error_log("Failed to move uploaded file from {$tmpPath} to {$targetFilePath}");
    sendError('Failed to save uploaded file to storage.', null, 500);
}

// 8. Return standardized JSON response with public URL
// Format: { "success": true, "message": "...", "data": { "url": "..." } }
$publicUrl = '/uploads/' . $folder . '/' . $safeFilename;

sendSuccess('File uploaded successfully', [
    'url' => $publicUrl,
], 200);
