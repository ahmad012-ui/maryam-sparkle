<?php
declare(strict_types=1);

/**
 * Shopping Cart Model & Data Access Layer
 *
 * Handles persistent shopping carts for authenticated users and cookie-backed guest sessions,
 * live stock and pricing joins, and guest-to-user cart merging upon login.
 */
class Cart {
    private PDO $pdo;

    public function __construct(PDO $pdo) {
        $this->pdo = $pdo;
    }

    /**
     * Generate a cryptographically secure 64-hex-character guest token (32 random bytes)
     */
    public static function generateGuestToken(): string {
        return bin2hex(random_bytes(32));
    }

    /**
     * Issue or renew the HttpOnly, SameSite=Lax guest_token cookie matching session security standards
     */
    public static function setGuestTokenCookie(string $token): void {
        $isSecure = (
            (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ||
            (isset($_SERVER['SERVER_PORT']) && (int)($_SERVER['SERVER_PORT'] ?? 0) === 443) ||
            (!empty($_SERVER['HTTP_X_FORWARDED_PROTO']) && strtolower((string)$_SERVER['HTTP_X_FORWARDED_PROTO']) === 'https')
        );

        $cookieLifetime = 86400 * 30; // 30 days

        setcookie('guest_token', $token, [
            'expires'  => time() + $cookieLifetime,
            'path'     => '/',
            'domain'   => '',
            'secure'   => $isSecure,
            'httponly' => true,
            'samesite' => 'Lax',
        ]);

        $_COOKIE['guest_token'] = $token;
    }

    /**
     * Clear and expire the guest_token cookie
     */
    public static function clearGuestTokenCookie(): void {
        $isSecure = (
            (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ||
            (isset($_SERVER['SERVER_PORT']) && (int)($_SERVER['SERVER_PORT'] ?? 0) === 443) ||
            (!empty($_SERVER['HTTP_X_FORWARDED_PROTO']) && strtolower((string)$_SERVER['HTTP_X_FORWARDED_PROTO']) === 'https')
        );

        setcookie('guest_token', '', [
            'expires'  => time() - 86400,
            'path'     => '/',
            'domain'   => '',
            'secure'   => $isSecure,
            'httponly' => true,
            'samesite' => 'Lax',
        ]);

        unset($_COOKIE['guest_token']);
    }

    /**
     * Standard empty cart structure returned when no cart exists or an active cart has no items
     */
    public static function formatEmptyCart(): array {
        return [
            'id'          => null,
            'user_id'     => null,
            'guest_token' => null,
            'items'       => [],
            'item_count'  => 0,
            'total'       => 0.00,
        ];
    }

    /**
     * Fetch a raw cart database record by its primary ID
     */
    public function getCartById(int $cartId): ?array {
        $stmt = $this->pdo->prepare('SELECT * FROM carts WHERE id = :id LIMIT 1');
        $stmt->bindValue(':id', $cartId, PDO::PARAM_INT);
        $stmt->execute();
        $row = $stmt->fetch();
        return $row ?: null;
    }

    /**
     * Resolve or instantiate the current cart container for a logged-in user or guest session
     *
     * @param int|null $userId Authenticated user ID (from session)
     * @param string|null $guestToken Guest token (from cookie)
     * @param bool $createIfMissing Whether to create a new cart row and cookie if none found
     * @return array|null Cart database row or null
     */
    public function resolveCurrentCart(?int $userId, ?string $guestToken, bool $createIfMissing = false): ?array {
        // 1. Authenticated User Cart
        if ($userId !== null && $userId > 0) {
            $stmt = $this->pdo->prepare('SELECT * FROM carts WHERE user_id = :user_id LIMIT 1');
            $stmt->bindValue(':user_id', $userId, PDO::PARAM_INT);
            $stmt->execute();
            $cart = $stmt->fetch();

            if ($cart) {
                return $cart;
            }

            if ($createIfMissing) {
                $ins = $this->pdo->prepare('INSERT INTO carts (user_id, guest_token) VALUES (:user_id, NULL)');
                $ins->bindValue(':user_id', $userId, PDO::PARAM_INT);
                $ins->execute();
                $cartId = (int) $this->pdo->lastInsertId();
                return $this->getCartById($cartId);
            }

            return null;
        }

        // 2. Guest User Cart
        $token = $guestToken !== null ? trim($guestToken) : '';
        if ($token !== '' && strlen($token) >= 32) {
            $stmt = $this->pdo->prepare('SELECT * FROM carts WHERE guest_token = :guest_token AND user_id IS NULL LIMIT 1');
            $stmt->bindValue(':guest_token', $token, PDO::PARAM_STR);
            $stmt->execute();
            $cart = $stmt->fetch();

            if ($cart) {
                return $cart;
            }
        }

        if ($createIfMissing) {
            $newToken = self::generateGuestToken();
            $ins = $this->pdo->prepare('INSERT INTO carts (user_id, guest_token) VALUES (NULL, :guest_token)');
            $ins->bindValue(':guest_token', $newToken, PDO::PARAM_STR);
            $ins->execute();
            $cartId = (int) $this->pdo->lastInsertId();

            self::setGuestTokenCookie($newToken);
            return $this->getCartById($cartId);
        }

        return null;
    }

    /**
     * Query live product information and stock level joined with inventory table
     */
    public function getLiveProduct(int $productId): ?array {
        $stmt = $this->pdo->prepare(
            'SELECT p.id, p.name, p.slug, p.price, p.sku, p.status,
                    COALESCE(i.quantity, p.stock, 0) AS live_stock,
                    (SELECT pi.image_url 
                     FROM product_images pi 
                     WHERE pi.product_id = p.id 
                     ORDER BY pi.is_primary DESC, pi.sort_order ASC, pi.id ASC 
                     LIMIT 1) AS primary_image
             FROM products p
             LEFT JOIN inventory i ON i.product_id = p.id
             WHERE p.id = :product_id
             LIMIT 1'
        );
        $stmt->bindValue(':product_id', $productId, PDO::PARAM_INT);
        $stmt->execute();
        $row = $stmt->fetch();

        if (!$row) {
            return null;
        }

        return [
            'id'            => (int) $row['id'],
            'name'          => (string) $row['name'],
            'slug'          => (string) $row['slug'],
            'price'         => (float) $row['price'],
            'sku'           => $row['sku'] !== null ? (string) $row['sku'] : null,
            'status'        => (string) $row['status'],
            'live_stock'    => (int) $row['live_stock'],
            'primary_image' => $row['primary_image'] !== null ? (string) $row['primary_image'] : null,
        ];
    }

    /**
     * Retrieve complete cart details with fresh product joins, live stock, item subtotals, and total
     */
    public function getCartDetails(int $cartId): array {
        $cart = $this->getCartById($cartId);
        if (!$cart) {
            return self::formatEmptyCart();
        }

        $itemsStmt = $this->pdo->prepare(
            'SELECT ci.id AS item_id,
                    ci.product_id,
                    ci.quantity,
                    ci.created_at,
                    ci.updated_at,
                    p.name AS product_name,
                    p.slug AS product_slug,
                    p.price AS live_price,
                    p.status AS product_status,
                    COALESCE(i.quantity, p.stock, 0) AS live_stock,
                    (SELECT pi.image_url 
                     FROM product_images pi 
                     WHERE pi.product_id = p.id 
                     ORDER BY pi.is_primary DESC, pi.sort_order ASC, pi.id ASC 
                     LIMIT 1) AS primary_image
             FROM cart_items ci
             JOIN products p ON ci.product_id = p.id
             LEFT JOIN inventory i ON i.product_id = p.id
             WHERE ci.cart_id = :cart_id
             ORDER BY ci.created_at ASC, ci.id ASC'
        );
        $itemsStmt->bindValue(':cart_id', $cartId, PDO::PARAM_INT);
        $itemsStmt->execute();
        $rows = $itemsStmt->fetchAll();

        $items = [];
        $total = 0.0;
        $itemCount = 0;

        foreach ($rows as $row) {
            $qty = (int) $row['quantity'];
            $price = (float) $row['live_price'];
            $subtotal = round($price * $qty, 2);
            $total += $subtotal;
            $itemCount += $qty;

            $items[] = [
                'id'         => (int) $row['item_id'],
                'product_id' => (int) $row['product_id'],
                'name'       => (string) $row['product_name'],
                'slug'       => (string) $row['product_slug'],
                'price'      => $price,
                'image'      => $row['primary_image'] !== null ? (string) $row['primary_image'] : null,
                'quantity'   => $qty,
                'stock'      => (int) $row['live_stock'],
                'subtotal'   => $subtotal,
                'status'     => (string) $row['product_status'],
                'created_at' => (string) $row['created_at'],
                'updated_at' => (string) $row['updated_at'],
            ];
        }

        return [
            'id'          => (int) $cart['id'],
            'user_id'     => $cart['user_id'] !== null ? (int) $cart['user_id'] : null,
            'guest_token' => $cart['guest_token'] !== null ? (string) $cart['guest_token'] : null,
            'items'       => $items,
            'item_count'  => $itemCount,
            'total'       => round($total, 2),
            'created_at'  => (string) $cart['created_at'],
            'updated_at'  => (string) $cart['updated_at'],
        ];
    }

    /**
     * Add a product to the cart or increment quantity if already present
     *
     * @throws RuntimeException with HTTP status code for validation/stock failures
     */
    public function addItem(int $cartId, int $productId, int $quantity): array {
        if ($quantity <= 0) {
            throw new RuntimeException('Quantity must be a positive integer', 422);
        }

        $product = $this->getLiveProduct($productId);
        if (!$product || $product['status'] !== 'active') {
            throw new RuntimeException('Product not found or unavailable', 404);
        }

        $availableStock = $product['live_stock'];
        if ($availableStock <= 0) {
            throw new RuntimeException('Product is currently out of stock', 409);
        }

        // Check for existing cart item
        $checkStmt = $this->pdo->prepare(
            'SELECT id, quantity FROM cart_items WHERE cart_id = :cart_id AND product_id = :product_id LIMIT 1'
        );
        $checkStmt->bindValue(':cart_id', $cartId, PDO::PARAM_INT);
        $checkStmt->bindValue(':product_id', $productId, PDO::PARAM_INT);
        $checkStmt->execute();
        $existing = $checkStmt->fetch();

        if ($existing) {
            $newQuantity = (int) $existing['quantity'] + $quantity;
            if ($newQuantity > $availableStock) {
                throw new RuntimeException("Requested quantity ({$newQuantity}) exceeds available stock ({$availableStock})", 409);
            }

            $updateStmt = $this->pdo->prepare(
                'UPDATE cart_items SET quantity = :quantity, updated_at = CURRENT_TIMESTAMP WHERE id = :id'
            );
            $updateStmt->bindValue(':quantity', $newQuantity, PDO::PARAM_INT);
            $updateStmt->bindValue(':id', (int) $existing['id'], PDO::PARAM_INT);
            $updateStmt->execute();
        } else {
            if ($quantity > $availableStock) {
                throw new RuntimeException("Requested quantity ({$quantity}) exceeds available stock ({$availableStock})", 409);
            }

            $insertStmt = $this->pdo->prepare(
                'INSERT INTO cart_items (cart_id, product_id, quantity) VALUES (:cart_id, :product_id, :quantity)'
            );
            $insertStmt->bindValue(':cart_id', $cartId, PDO::PARAM_INT);
            $insertStmt->bindValue(':product_id', $productId, PDO::PARAM_INT);
            $insertStmt->bindValue(':quantity', $quantity, PDO::PARAM_INT);
            $insertStmt->execute();
        }

        $this->touchCart($cartId);

        return $this->getCartDetails($cartId);
    }

    /**
     * Update quantity for an existing cart item
     *
     * @throws RuntimeException with HTTP status code for missing item or stock exceedance
     */
    public function updateItemQuantity(int $cartId, int $productId, int $quantity): array {
        if ($quantity <= 0) {
            throw new RuntimeException('Quantity must be greater than 0. Use DELETE to remove an item.', 422);
        }

        $checkStmt = $this->pdo->prepare(
            'SELECT id, quantity FROM cart_items WHERE cart_id = :cart_id AND product_id = :product_id LIMIT 1'
        );
        $checkStmt->bindValue(':cart_id', $cartId, PDO::PARAM_INT);
        $checkStmt->bindValue(':product_id', $productId, PDO::PARAM_INT);
        $checkStmt->execute();
        $existing = $checkStmt->fetch();

        if (!$existing) {
            throw new RuntimeException('Item not found in cart', 404);
        }

        $product = $this->getLiveProduct($productId);
        if (!$product || $product['status'] !== 'active') {
            throw new RuntimeException('Product not found or unavailable', 404);
        }

        $availableStock = $product['live_stock'];
        if ($quantity > $availableStock) {
            throw new RuntimeException("Requested quantity ({$quantity}) exceeds available stock ({$availableStock})", 409);
        }

        $updateStmt = $this->pdo->prepare(
            'UPDATE cart_items SET quantity = :quantity, updated_at = CURRENT_TIMESTAMP WHERE id = :id'
        );
        $updateStmt->bindValue(':quantity', $quantity, PDO::PARAM_INT);
        $updateStmt->bindValue(':id', (int) $existing['id'], PDO::PARAM_INT);
        $updateStmt->execute();

        $this->touchCart($cartId);

        return $this->getCartDetails($cartId);
    }

    /**
     * Remove a single item from the cart
     *
     * @throws RuntimeException if item is not present in cart
     */
    public function removeItem(int $cartId, int $productId): array {
        $checkStmt = $this->pdo->prepare(
            'SELECT id FROM cart_items WHERE cart_id = :cart_id AND product_id = :product_id LIMIT 1'
        );
        $checkStmt->bindValue(':cart_id', $cartId, PDO::PARAM_INT);
        $checkStmt->bindValue(':product_id', $productId, PDO::PARAM_INT);
        $checkStmt->execute();
        $existing = $checkStmt->fetch();

        if (!$existing) {
            throw new RuntimeException('Item not found in cart', 404);
        }

        $deleteStmt = $this->pdo->prepare(
            'DELETE FROM cart_items WHERE cart_id = :cart_id AND product_id = :product_id'
        );
        $deleteStmt->bindValue(':cart_id', $cartId, PDO::PARAM_INT);
        $deleteStmt->bindValue(':product_id', $productId, PDO::PARAM_INT);
        $deleteStmt->execute();

        $this->touchCart($cartId);

        return $this->getCartDetails($cartId);
    }

    /**
     * Remove all items from the current cart (keeps the cart container row)
     */
    public function clearCart(int $cartId): array {
        $clearStmt = $this->pdo->prepare('DELETE FROM cart_items WHERE cart_id = :cart_id');
        $clearStmt->bindValue(':cart_id', $cartId, PDO::PARAM_INT);
        $clearStmt->execute();

        $this->touchCart($cartId);

        return $this->getCartDetails($cartId);
    }

    /**
     * Update the cart record's updated_at timestamp
     */
    private function touchCart(int $cartId): void {
        $stmt = $this->pdo->prepare('UPDATE carts SET updated_at = CURRENT_TIMESTAMP WHERE id = :id');
        $stmt->bindValue(':id', $cartId, PDO::PARAM_INT);
        $stmt->execute();
    }

    /**
     * Merge guest cart into user cart upon login
     *
     * 1. Locate guest cart by guest_token cookie. If none exists, clear cookie and return.
     * 2. Locate user cart by user_id.
     * 3. If user has no cart: reassign guest cart's user_id = $userId, set guest_token = NULL.
     * 4. If user already has a cart:
     *    - Within a transaction, iterate guest cart items.
     *    - If product already in user cart: combine quantities (capped at live inventory).
     *    - If product not in user cart: insert into user cart (capped at live inventory).
     *    - Delete all items from guest cart, delete guest cart row.
     * 5. Expire and clear the guest_token cookie.
     */
    public function mergeGuestCart(int $userId, string $guestToken): void {
        $token = trim($guestToken);
        if ($token === '') {
            self::clearGuestTokenCookie();
            return;
        }

        // Find guest cart
        $guestStmt = $this->pdo->prepare('SELECT * FROM carts WHERE guest_token = :guest_token AND user_id IS NULL LIMIT 1');
        $guestStmt->bindValue(':guest_token', $token, PDO::PARAM_STR);
        $guestStmt->execute();
        $guestCart = $guestStmt->fetch();

        if (!$guestCart) {
            self::clearGuestTokenCookie();
            return;
        }

        $guestCartId = (int) $guestCart['id'];

        // Find existing user cart
        $userStmt = $this->pdo->prepare('SELECT * FROM carts WHERE user_id = :user_id LIMIT 1');
        $userStmt->bindValue(':user_id', $userId, PDO::PARAM_INT);
        $userStmt->execute();
        $userCart = $userStmt->fetch();

        // SCENARIO A: User has NO existing cart
        if (!$userCart) {
            $assignStmt = $this->pdo->prepare(
                'UPDATE carts SET user_id = :user_id, guest_token = NULL, updated_at = CURRENT_TIMESTAMP WHERE id = :id'
            );
            $assignStmt->bindValue(':user_id', $userId, PDO::PARAM_INT);
            $assignStmt->bindValue(':id', $guestCartId, PDO::PARAM_INT);
            $assignStmt->execute();

            self::clearGuestTokenCookie();
            return;
        }

        $userCartId = (int) $userCart['id'];

        if ($userCartId === $guestCartId) {
            self::clearGuestTokenCookie();
            return;
        }

        // SCENARIO B: User already has a cart -> merge items transactionally
        try {
            $this->pdo->beginTransaction();

            // Fetch guest items
            $gItemsStmt = $this->pdo->prepare('SELECT * FROM cart_items WHERE cart_id = :cart_id');
            $gItemsStmt->bindValue(':cart_id', $guestCartId, PDO::PARAM_INT);
            $gItemsStmt->execute();
            $guestItems = $gItemsStmt->fetchAll();

            if (!empty($guestItems)) {
                // Fetch existing user items indexed by product_id
                $uItemsStmt = $this->pdo->prepare('SELECT * FROM cart_items WHERE cart_id = :cart_id');
                $uItemsStmt->bindValue(':cart_id', $userCartId, PDO::PARAM_INT);
                $uItemsStmt->execute();
                $userItemsRaw = $uItemsStmt->fetchAll();

                $userItemsByProduct = [];
                foreach ($userItemsRaw as $uItem) {
                    $userItemsByProduct[(int) $uItem['product_id']] = $uItem;
                }

                foreach ($guestItems as $gItem) {
                    $productId = (int) $gItem['product_id'];
                    $guestQty = (int) $gItem['quantity'];

                    // Check live stock
                    $product = $this->getLiveProduct($productId);
                    if (!$product || $product['status'] !== 'active') {
                        continue; // Skip inactive/missing items during merge
                    }

                    $liveStock = $product['live_stock'];
                    if ($liveStock <= 0) {
                        continue; // Skip out-of-stock items
                    }

                    if (isset($userItemsByProduct[$productId])) {
                        // Combine quantities
                        $userItemId = (int) $userItemsByProduct[$productId]['id'];
                        $combinedQty = (int) $userItemsByProduct[$productId]['quantity'] + $guestQty;
                        if ($combinedQty > $liveStock) {
                            $combinedQty = $liveStock;
                        }

                        $updStmt = $this->pdo->prepare(
                            'UPDATE cart_items SET quantity = :quantity, updated_at = CURRENT_TIMESTAMP WHERE id = :id'
                        );
                        $updStmt->bindValue(':quantity', $combinedQty, PDO::PARAM_INT);
                        $updStmt->bindValue(':id', $userItemId, PDO::PARAM_INT);
                        $updStmt->execute();
                    } else {
                        // Insert new item for user cart
                        $qtyToInsert = $guestQty > $liveStock ? $liveStock : $guestQty;

                        $insStmt = $this->pdo->prepare(
                            'INSERT INTO cart_items (cart_id, product_id, quantity) VALUES (:cart_id, :product_id, :quantity)'
                        );
                        $insStmt->bindValue(':cart_id', $userCartId, PDO::PARAM_INT);
                        $insStmt->bindValue(':product_id', $productId, PDO::PARAM_INT);
                        $insStmt->bindValue(':quantity', $qtyToInsert, PDO::PARAM_INT);
                        $insStmt->execute();
                    }
                }

                // Delete guest items
                $delItemsStmt = $this->pdo->prepare('DELETE FROM cart_items WHERE cart_id = :cart_id');
                $delItemsStmt->bindValue(':cart_id', $guestCartId, PDO::PARAM_INT);
                $delItemsStmt->execute();
            }

            // Delete guest cart container
            $delCartStmt = $this->pdo->prepare('DELETE FROM carts WHERE id = :id');
            $delCartStmt->bindValue(':id', $guestCartId, PDO::PARAM_INT);
            $delCartStmt->execute();

            $this->touchCart($userCartId);

            $this->pdo->commit();
        } catch (Throwable $e) {
            if ($this->pdo->inTransaction()) {
                $this->pdo->rollBack();
            }
            error_log('Cart merge failure: ' . $e->getMessage());
        }

        self::clearGuestTokenCookie();
    }
}
