<?php
declare(strict_types=1);

require_once __DIR__ . '/response.php';

/**
 * Reusable Validation Helper for Maryam Sparkle REST API
 */
class Validator {
    private array $data;
    private array $errors = [];

    public function __construct(array $data) {
        $this->data = $data;
    }

    /**
     * Retrieve collected errors
     */
    public function getErrors(): array {
        return $this->errors;
    }

    /**
     * Check if validation encountered errors
     */
    public function hasErrors(): bool {
        return !empty($this->errors);
    }

    /**
     * Manually append an error
     */
    public function addError(string $field, string $message): self {
        if (!isset($this->errors[$field])) {
            $this->errors[$field] = $message;
        }
        return $this;
    }

    /**
     * Validate that a field is present and not empty
     */
    public function required(string $field, string $label = ''): self {
        $label = $label ?: ucfirst(str_replace('_', ' ', $field));
        if (!array_key_exists($field, $this->data) || $this->data[$field] === null || trim((string)$this->data[$field]) === '') {
            $this->addError($field, "{$label} is required");
        }
        return $this;
    }

    /**
     * Validate string length
     */
    public function string(string $field, int $min = 0, int $max = 255, string $label = ''): self {
        if (!isset($this->data[$field]) || $this->data[$field] === null) {
            return $this;
        }
        $label = $label ?: ucfirst(str_replace('_', ' ', $field));
        $val = trim((string)$this->data[$field]);
        $len = mb_strlen($val);
        if ($min > 0 && $len < $min) {
            $this->addError($field, "{$label} must be at least {$min} characters");
        }
        if ($max > 0 && $len > $max) {
            $this->addError($field, "{$label} must not exceed {$max} characters");
        }
        return $this;
    }

    /**
     * Validate URL-friendly slug
     */
    public function slug(string $field, int $max = 150, string $label = 'Slug'): self {
        if (!isset($this->data[$field]) || $this->data[$field] === null || trim((string)$this->data[$field]) === '') {
            return $this;
        }
        $val = trim((string)$this->data[$field]);
        if (!preg_match('/^[a-z0-9]+(?:-[a-z0-9]+)*$/', $val)) {
            $this->addError($field, "{$label} must be URL-friendly (lowercase alphanumeric characters separated by single hyphens, e.g. 'beaded-bracelets')");
        } elseif (mb_strlen($val) > $max) {
            $this->addError($field, "{$label} must not exceed {$max} characters");
        }
        return $this;
    }

    /**
     * Validate numeric value with optional range bounds
     */
    public function numeric(string $field, ?float $min = null, ?float $max = null, string $label = ''): self {
        if (!isset($this->data[$field]) || $this->data[$field] === null || $this->data[$field] === '') {
            return $this;
        }
        $label = $label ?: ucfirst(str_replace('_', ' ', $field));
        if (!is_numeric($this->data[$field])) {
            $this->addError($field, "{$label} must be a valid number");
            return $this;
        }
        $num = (float)$this->data[$field];
        if ($min !== null && $num < $min) {
            $this->addError($field, "{$label} must be greater than or equal to {$min}");
        }
        if ($max !== null && $num > $max) {
            $this->addError($field, "{$label} must not exceed {$max}");
        }
        return $this;
    }

    /**
     * Validate integer value with optional range bounds
     */
    public function integer(string $field, ?int $min = null, ?int $max = null, string $label = ''): self {
        if (!isset($this->data[$field]) || $this->data[$field] === null || $this->data[$field] === '') {
            return $this;
        }
        $label = $label ?: ucfirst(str_replace('_', ' ', $field));
        if (filter_var($this->data[$field], FILTER_VALIDATE_INT) === false) {
            $this->addError($field, "{$label} must be an integer");
            return $this;
        }
        $val = (int)$this->data[$field];
        if ($min !== null && $val < $min) {
            $this->addError($field, "{$label} must be at least {$min}");
        }
        if ($max !== null && $val > $max) {
            $this->addError($field, "{$label} must not exceed {$max}");
        }
        return $this;
    }

    /**
     * Validate enum / whitelist membership
     */
    public function in(string $field, array $allowed, string $label = ''): self {
        if (!isset($this->data[$field]) || $this->data[$field] === null || $this->data[$field] === '') {
            return $this;
        }
        $label = $label ?: ucfirst(str_replace('_', ' ', $field));
        if (!in_array($this->data[$field], $allowed, true)) {
            $this->addError($field, "{$label} must be one of: " . implode(', ', $allowed));
        }
        return $this;
    }

    /**
     * Validate boolean values (bool, 0, 1, '0', '1', 'true', 'false')
     */
    public function boolean(string $field, string $label = ''): self {
        if (!isset($this->data[$field]) || $this->data[$field] === null || $this->data[$field] === '') {
            return $this;
        }
        $label = $label ?: ucfirst(str_replace('_', ' ', $field));
        $val = $this->data[$field];
        if (!is_bool($val) && $val !== 0 && $val !== 1 && $val !== '0' && $val !== '1' && $val !== 'true' && $val !== 'false') {
            $this->addError($field, "{$label} must be a valid boolean");
        }
        return $this;
    }

    /**
     * Validate email address
     */
    public function email(string $field, string $label = 'Email'): self {
        if (!isset($this->data[$field]) || $this->data[$field] === null || $this->data[$field] === '') {
            return $this;
        }
        if (!filter_var($this->data[$field], FILTER_VALIDATE_EMAIL)) {
            $this->addError($field, "{$label} must be a valid email address");
        }
        return $this;
    }

    /**
     * Halts execution with HTTP 422 JSON response if errors exist
     */
    public function validateOrExit(): void {
        if ($this->hasErrors()) {
            sendError('Validation failed', $this->getErrors(), 422);
        }
    }
}

if (!function_exists('validateId')) {
    /**
     * Validate route or query ID as a positive integer
     */
    function validateId(mixed $id, string $label = 'ID'): int {
        if (!is_numeric($id) || (int)$id <= 0 || (string)(int)$id !== (string)$id) {
            sendError("Invalid {$label}", [$label => "{$label} must be a positive integer"], 400);
        }
        return (int)$id;
    }
}

if (!function_exists('toBool')) {
    /**
     * Normalize mixed value to standard boolean
     */
    function toBool(mixed $val, bool $default = false): bool {
        if ($val === null) return $default;
        if (is_bool($val)) return $val;
        if ($val === 1 || $val === '1' || strtolower((string)$val) === 'true') return true;
        if ($val === 0 || $val === '0' || strtolower((string)$val) === 'false') return false;
        return $default;
    }
}
