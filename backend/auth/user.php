<?php
declare(strict_types=1);

/**
 * User Model / Data Access Layer for Maryam Sparkle REST API
 *
 * Encapsulates all database operations for the `users` table using
 * PDO prepared statements. Strictly prevents leaking sensitive fields
 * such as password hashes or external identifiers.
 */
class User {
    private PDO $pdo;

    public function __construct(PDO $pdo) {
        $this->pdo = $pdo;
    }

    /**
     * Formats a raw database row into a safe, client-facing array.
     * Strictly removes sensitive fields (password_hash, google_id).
     *
     * @param array $row
     * @return array
     */
    public static function formatSafeUser(array $row): array {
        return [
            'id'         => (int) $row['id'],
            'first_name' => (string) $row['first_name'],
            'last_name'  => (string) $row['last_name'],
            'email'      => (string) $row['email'],
            'phone'      => $row['phone'] !== null ? (string) $row['phone'] : null,
            'role'       => (string) $row['role'],
            'status'     => (string) $row['status'],
        ];
    }

    /**
     * Retrieve user by email including password_hash for internal credential verification.
     * This method must NEVER return data directly to an API response.
     *
     * @param string $email
     * @return array|null Raw user record or null if not found
     */
    public function findByEmail(string $email): ?array {
        $sql = 'SELECT id, first_name, last_name, email, phone, password_hash, role, status, created_at, updated_at
                FROM users
                WHERE email = :email
                LIMIT 1';

        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([':email' => strtolower(trim($email))]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        return $row ?: null;
    }

    /**
     * Retrieve safe user details by ID.
     *
     * @param int $id
     * @return array|null Formatted safe user record or null if not found
     */
    public function findById(int $id): ?array {
        $sql = 'SELECT id, first_name, last_name, email, phone, role, status, created_at, updated_at
                FROM users
                WHERE id = :id
                LIMIT 1';

        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([':id' => $id]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$row) {
            return null;
        }

        return self::formatSafeUser($row);
    }

    /**
     * Retrieve raw user record by ID for internal status or role inspection.
     *
     * @param int $id
     * @return array|null
     */
    public function findRawById(int $id): ?array {
        $sql = 'SELECT id, first_name, last_name, email, phone, password_hash, role, status, created_at, updated_at
                FROM users
                WHERE id = :id
                LIMIT 1';

        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([':id' => $id]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        return $row ?: null;
    }

    /**
     * Check whether an email already exists in the database.
     *
     * @param string $email
     * @param int|null $excludeId Optional user ID to exclude (for future profile updates)
     * @return bool
     */
    public function emailExists(string $email, ?int $excludeId = null): bool {
        $sql = 'SELECT COUNT(*) FROM users WHERE email = :email';
        $params = [':email' => strtolower(trim($email))];

        if ($excludeId !== null) {
            $sql .= ' AND id != :exclude_id';
            $params[':exclude_id'] = $excludeId;
        }

        $stmt = $this->pdo->prepare($sql);
        $stmt->execute($params);

        return ((int) $stmt->fetchColumn()) > 0;
    }

    /**
     * Register a new customer user.
     * Enforces:
     * - password_hash generated using password_hash(..., PASSWORD_DEFAULT)
     * - role is always forced to 'customer'
     * - status is always forced to 'active'
     * - phone is sanitized (null if empty)
     * - normalized lowercase email
     *
     * @param array $data ['first_name', 'last_name', 'email', 'password', 'phone' (optional)]
     * @return array Safe formatted user array
     */
    public function create(array $data): array {
        $firstName = trim((string) $data['first_name']);
        $lastName = trim((string) $data['last_name']);
        $email = strtolower(trim((string) $data['email']));
        $phone = isset($data['phone']) && trim((string)$data['phone']) !== '' ? trim((string)$data['phone']) : null;
        $passwordHash = password_hash((string) $data['password'], PASSWORD_DEFAULT);

        // Server-side enforcement: customers cannot assign their own role or status
        $role = 'customer';
        $status = 'active';

        $sql = 'INSERT INTO users (first_name, last_name, email, phone, password_hash, role, status)
                VALUES (:first_name, :last_name, :email, :phone, :password_hash, :role, :status)';

        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([
            ':first_name'    => $firstName,
            ':last_name'     => $lastName,
            ':email'         => $email,
            ':phone'         => $phone,
            ':password_hash' => $passwordHash,
            ':role'          => $role,
            ':status'        => $status,
        ]);

        $userId = (int) $this->pdo->lastInsertId();

        $user = $this->findById($userId);
        if (!$user) {
            throw new RuntimeException('Failed to retrieve newly registered user');
        }

        return $user;
    }
}
