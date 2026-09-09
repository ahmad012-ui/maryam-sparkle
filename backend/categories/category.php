<?php
declare(strict_types=1);

/**
 * Category Model / Data Access Layer
 *
 * Handles database operations for categories using pure PDO prepared statements.
 */
class Category {
    private PDO $pdo;

    public function __construct(PDO $pdo) {
        $this->pdo = $pdo;
    }

    /**
     * Format category record with appropriate data types
     */
    public static function format(array $row): array {
        return [
            'id'          => (int) $row['id'],
            'name'        => (string) $row['name'],
            'slug'        => (string) $row['slug'],
            'description' => $row['description'] !== null ? (string) $row['description'] : null,
            'image'       => $row['image'] !== null ? (string) $row['image'] : null,
            'status'      => (string) $row['status'],
            'created_at'  => (string) $row['created_at'],
            'updated_at'  => (string) $row['updated_at'],
        ];
    }

    /**
     * Retrieve all categories (defaults to active only)
     *
     * @param bool $onlyActive
     * @return array
     */
    public function getAll(bool $onlyActive = true): array {
        $sql = 'SELECT id, name, slug, description, image, status, created_at, updated_at FROM categories';
        if ($onlyActive) {
            $sql .= " WHERE status = 'active'";
        }
        $sql .= ' ORDER BY name ASC';

        $stmt = $this->pdo->prepare($sql);
        $stmt->execute();
        $rows = $stmt->fetchAll();

        return array_map([self::class, 'format'], $rows);
    }

    /**
     * Retrieve a single category by primary ID
     *
     * @param int $id
     * @return array|null
     */
    public function getById(int $id): ?array {
        $stmt = $this->pdo->prepare(
            'SELECT id, name, slug, description, image, status, created_at, updated_at FROM categories WHERE id = :id LIMIT 1'
        );
        $stmt->bindValue(':id', $id, PDO::PARAM_INT);
        $stmt->execute();
        $row = $stmt->fetch();

        return $row ? self::format($row) : null;
    }

    /**
     * Retrieve a single category by slug
     *
     * @param string $slug
     * @return array|null
     */
    public function getBySlug(string $slug): ?array {
        $stmt = $this->pdo->prepare(
            'SELECT id, name, slug, description, image, status, created_at, updated_at FROM categories WHERE slug = :slug LIMIT 1'
        );
        $stmt->bindValue(':slug', $slug, PDO::PARAM_STR);
        $stmt->execute();
        $row = $stmt->fetch();

        return $row ? self::format($row) : null;
    }

    /**
     * Check if a slug is already in use, optionally excluding a category ID (for updates)
     *
     * @param string $slug
     * @param int|null $excludeId
     * @return bool
     */
    public function slugExists(string $slug, ?int $excludeId = null): bool {
        if ($excludeId !== null) {
            $stmt = $this->pdo->prepare('SELECT COUNT(*) FROM categories WHERE slug = :slug AND id != :exclude_id');
            $stmt->bindValue(':slug', $slug, PDO::PARAM_STR);
            $stmt->bindValue(':exclude_id', $excludeId, PDO::PARAM_INT);
        } else {
            $stmt = $this->pdo->prepare('SELECT COUNT(*) FROM categories WHERE slug = :slug');
            $stmt->bindValue(':slug', $slug, PDO::PARAM_STR);
        }
        $stmt->execute();
        return (int) $stmt->fetchColumn() > 0;
    }

    /**
     * Count products currently associated with a category
     *
     * @param int $categoryId
     * @return int
     */
    public function countProducts(int $categoryId): int {
        $stmt = $this->pdo->prepare('SELECT COUNT(*) FROM products WHERE category_id = :category_id');
        $stmt->bindValue(':category_id', $categoryId, PDO::PARAM_INT);
        $stmt->execute();
        return (int) $stmt->fetchColumn();
    }

    /**
     * Create a new category
     *
     * @param array $data
     * @return array
     */
    public function create(array $data): array {
        $stmt = $this->pdo->prepare(
            'INSERT INTO categories (name, slug, description, image, status)
             VALUES (:name, :slug, :description, :image, :status)'
        );

        $stmt->bindValue(':name', $data['name'], PDO::PARAM_STR);
        $stmt->bindValue(':slug', $data['slug'], PDO::PARAM_STR);
        $stmt->bindValue(':description', $data['description'] ?? null, $data['description'] !== null ? PDO::PARAM_STR : PDO::PARAM_NULL);
        $stmt->bindValue(':image', $data['image'] ?? null, $data['image'] !== null ? PDO::PARAM_STR : PDO::PARAM_NULL);
        $stmt->bindValue(':status', $data['status'] ?? 'active', PDO::PARAM_STR);

        $stmt->execute();
        $id = (int) $this->pdo->lastInsertId();

        return $this->getById($id) ?? [];
    }

    /**
     * Update an existing category
     *
     * @param int $id
     * @param array $data
     * @return array|null
     */
    public function update(int $id, array $data): ?array {
        $stmt = $this->pdo->prepare(
            'UPDATE categories
             SET name = :name,
                 slug = :slug,
                 description = :description,
                 image = :image,
                 status = :status
             WHERE id = :id'
        );

        $stmt->bindValue(':id', $id, PDO::PARAM_INT);
        $stmt->bindValue(':name', $data['name'], PDO::PARAM_STR);
        $stmt->bindValue(':slug', $data['slug'], PDO::PARAM_STR);
        $stmt->bindValue(':description', $data['description'] ?? null, $data['description'] !== null ? PDO::PARAM_STR : PDO::PARAM_NULL);
        $stmt->bindValue(':image', $data['image'] ?? null, $data['image'] !== null ? PDO::PARAM_STR : PDO::PARAM_NULL);
        $stmt->bindValue(':status', $data['status'] ?? 'active', PDO::PARAM_STR);

        $stmt->execute();

        return $this->getById($id);
    }

    /**
     * Delete a category by ID
     *
     * @param int $id
     * @return bool
     */
    public function delete(int $id): bool {
        $stmt = $this->pdo->prepare('DELETE FROM categories WHERE id = :id');
        $stmt->bindValue(':id', $id, PDO::PARAM_INT);
        return $stmt->execute();
    }
}
