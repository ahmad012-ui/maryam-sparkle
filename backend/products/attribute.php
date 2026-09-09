<?php
declare(strict_types=1);

/**
 * ProductAttribute Model / Data Access Layer
 *
 * Handles database operations for flexible product attributes using pure PDO prepared statements.
 * Supports arbitrary specifications (Material, Finish, Gemstone, Closure Type, etc.)
 * without altering the products table schema.
 */
class ProductAttribute {
    private PDO $pdo;

    public function __construct(PDO $pdo) {
        $this->pdo = $pdo;
    }

    /**
     * Retrieve all attribute rows for a product, grouped by attribute_name.
     *
     * Example output:
     * [
     *     "Material" => ["Beads", "Gold-Tone Hardware"],
     *     "Finish"   => ["Gold-Tone"]
     * ]
     *
     * @param int $productId
     * @return array<string, array<string>>
     */
    public function getAttributesForProduct(int $productId): array {
        $stmt = $this->pdo->prepare(
            'SELECT attribute_name, attribute_value
             FROM product_attributes
             WHERE product_id = :product_id
             ORDER BY attribute_name ASC, id ASC'
        );
        $stmt->bindValue(':product_id', $productId, PDO::PARAM_INT);
        $stmt->execute();
        $rows = $stmt->fetchAll();

        $grouped = [];
        foreach ($rows as $row) {
            $name = (string) $row['attribute_name'];
            $val = (string) $row['attribute_value'];
            if (!isset($grouped[$name])) {
                $grouped[$name] = [];
            }
            $grouped[$name][] = $val;
        }

        return $grouped;
    }

    /**
     * Batch fetch attributes for multiple products in a single prepared query.
     * Prevents the N+1 query problem when listing products.
     *
     * Returns: [ $productId => [ $attributeName => [ $attributeValue, ... ] ] ]
     *
     * @param array<int> $productIds
     * @return array<int, array<string, array<string>>>
     */
    public function getBatchAttributes(array $productIds): array {
        if (empty($productIds)) {
            return [];
        }

        $placeholders = implode(',', array_fill(0, count($productIds), '?'));
        $stmt = $this->pdo->prepare(
            "SELECT product_id, attribute_name, attribute_value
             FROM product_attributes
             WHERE product_id IN ({$placeholders})
             ORDER BY attribute_name ASC, id ASC"
        );
        foreach ($productIds as $idx => $pid) {
            $stmt->bindValue($idx + 1, (int) $pid, PDO::PARAM_INT);
        }
        $stmt->execute();
        $rows = $stmt->fetchAll();

        $grouped = [];
        foreach ($rows as $row) {
            $pid = (int) $row['product_id'];
            $name = (string) $row['attribute_name'];
            $val = (string) $row['attribute_value'];

            if (!isset($grouped[$pid])) {
                $grouped[$pid] = [];
            }
            if (!isset($grouped[$pid][$name])) {
                $grouped[$pid][$name] = [];
            }
            $grouped[$pid][$name][] = $val;
        }

        return $grouped;
    }

    /**
     * Replace a product's attributes (delete existing rows for that product, insert new ones)
     * inside a database transaction.
     *
     * Accepts:
     * - Grouped associative array: ['Material' => ['Beads', 'Gold-Tone Hardware'], 'Finish' => 'Gold-Tone']
     * - Or sequential row array: [['attribute_name' => 'Material', 'attribute_value' => 'Beads'], ...]
     *
     * @param int $productId
     * @param array $attributes
     * @return void
     * @throws Throwable
     */
    public function setAttributesForProduct(int $productId, array $attributes): void {
        $startedTransaction = false;
        if (!$this->pdo->inTransaction()) {
            $this->pdo->beginTransaction();
            $startedTransaction = true;
        }

        try {
            // 1. Delete existing attributes for this product
            $deleteStmt = $this->pdo->prepare(
                'DELETE FROM product_attributes WHERE product_id = :product_id'
            );
            $deleteStmt->bindValue(':product_id', $productId, PDO::PARAM_INT);
            $deleteStmt->execute();

            // 2. Flatten attributes into list of [name, value]
            $entries = [];
            foreach ($attributes as $key => $val) {
                if (is_array($val) && (isset($val['attribute_name']) || isset($val['name']))) {
                    $attrName = trim((string) ($val['attribute_name'] ?? $val['name']));
                    $attrVal = trim((string) ($val['attribute_value'] ?? $val['value']));
                    if ($attrName !== '' && $attrVal !== '') {
                        $entries[] = [$attrName, $attrVal];
                    }
                } elseif (is_string($key) && trim($key) !== '') {
                    $attrName = trim($key);
                    if (is_array($val)) {
                        foreach ($val as $subVal) {
                            $subValStr = trim((string) $subVal);
                            if ($subValStr !== '') {
                                $entries[] = [$attrName, $subValStr];
                            }
                        }
                    } else {
                        $valStr = trim((string) $val);
                        if ($valStr !== '') {
                            $entries[] = [$attrName, $valStr];
                        }
                    }
                }
            }

            // 3. Insert new attribute records using prepared statement with explicit PDO types
            if (!empty($entries)) {
                $insertStmt = $this->pdo->prepare(
                    'INSERT INTO product_attributes (product_id, attribute_name, attribute_value)
                     VALUES (:product_id, :attribute_name, :attribute_value)'
                );

                foreach ($entries as [$name, $value]) {
                    $insertStmt->bindValue(':product_id', $productId, PDO::PARAM_INT);
                    $insertStmt->bindValue(':attribute_name', $name, PDO::PARAM_STR);
                    $insertStmt->bindValue(':attribute_value', $value, PDO::PARAM_STR);
                    $insertStmt->execute();
                }
            }

            if ($startedTransaction) {
                $this->pdo->commit();
            }
        } catch (Throwable $e) {
            if ($startedTransaction && $this->pdo->inTransaction()) {
                $this->pdo->rollBack();
            }
            throw $e;
        }
    }
}
