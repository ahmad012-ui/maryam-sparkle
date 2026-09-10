<?php
declare(strict_types=1);

/**
 * Order Model & Checkout Business Logic
 *
 * Handles:
 * - Deterministic server-side pricing, shipping, discount, and total calculations
 * - Concurrency-safe inventory locking (SELECT ... FOR UPDATE) and stock verification
 * - Atomic order placement inside PDO transactions
 * - Order number generation with guaranteed uniqueness
 * - Historical order items snapshot (price, product name, sku)
 * - Payment record creation with pending status
 * - Order retrieval for authenticated customers
 * - Secure guest order tracking by order number + email/phone verification
 */
class Order {
    private PDO $pdo;

    // Configured server-side shipping constants
    public const STANDARD_SHIPPING_FEE = 200.00;
    public const FREE_SHIPPING_THRESHOLD = 5000.00;

    public function __construct(PDO $pdo) {
        $this->pdo = $pdo;
    }

    /**
     * Calculate shipping fee deterministically based on authoritative server subtotal.
     * The client is never allowed to dictate shipping fees.
     */
    public static function calculateShippingFee(float $subtotal): float {
        if ($subtotal >= self::FREE_SHIPPING_THRESHOLD) {
            return 0.00;
        }
        return self::STANDARD_SHIPPING_FEE;
    }

    /**
     * Check if a PDOException represents a MySQL unique key constraint violation on order_number.
     * MySQL error code 1062 is ER_DUP_ENTRY (SQLSTATE 23000).
     */
    private function isOrderNumberDuplicate(PDOException $e): bool {
        $driverCode = isset($e->errorInfo[1]) ? (int) $e->errorInfo[1] : 0;
        $sqlState = (string) ($e->errorInfo[0] ?? $e->getCode());

        if ($driverCode === 1062 || $sqlState === '23000') {
            $message = $e->getMessage();
            if (stripos($message, 'order_number') !== false || stripos($message, 'Duplicate entry') !== false) {
                return true;
            }
        }

        return false;
    }

    /**
     * Generate a unique, human-readable order number.
     * Format: MS-YYYYMMDD-XXXXXX (e.g., MS-20260909-A4C8B1)
     */
    public function generateOrderNumber(): string {
        $datePrefix = date('Ymd');
        $maxAttempts = 10;

        for ($attempt = 0; $attempt < $maxAttempts; $attempt++) {
            $randomHex = strtoupper(bin2hex(random_bytes(3))); // 6 alphanumeric characters
            $candidateNumber = "MS-{$datePrefix}-{$randomHex}";

            $stmt = $this->pdo->prepare('SELECT 1 FROM orders WHERE order_number = :order_number LIMIT 1');
            $stmt->bindValue(':order_number', $candidateNumber, PDO::PARAM_STR);
            $stmt->execute();

            if (!$stmt->fetch()) {
                return $candidateNumber;
            }
        }

        // Fallback with microsecond entropy if collisions persist
        $uniqueSuffix = strtoupper(substr(md5(uniqid((string)mt_rand(), true)), 0, 6));
        return "MS-{$datePrefix}-{$uniqueSuffix}";
    }

    /**
     * Execute atomic checkout transaction.
     *
     * 1. Locks relevant inventory and product rows with FOR UPDATE
     * 2. Re-validates live stock levels against requested quantities
     * 3. Re-calculates unit prices and subtotals authoritatively from database prices
     * 4. Persists shipping address (links saved address or stores new address)
     * 5. Inserts orders record
     * 6. Inserts historical snapshot into order_items
     * 7. Inserts initial pending payment record into payments
     * 8. Decrements inventory and products table stock
     * 9. Clears the server-side cart
     * 10. Commits the transaction
     *
     * @throws RuntimeException on stock shortages, missing items, or database failures
     */
    public function createOrder(
        int $cartId,
        ?int $userId,
        array $customerData,
        ?int $addressId,
        ?array $newAddressData,
        string $paymentMethod,
        ?string $transactionReference = null,
        ?string $proofOfPaymentPath = null
    ): array {
        // Step 0: Ensure transaction is started
        $this->pdo->beginTransaction();

        try {
            // Step 1: Retrieve cart items
            $cartItemsStmt = $this->pdo->prepare(
                'SELECT ci.id, ci.product_id, ci.quantity
                 FROM cart_items ci
                 WHERE ci.cart_id = :cart_id
                 ORDER BY ci.id ASC'
            );
            $cartItemsStmt->bindValue(':cart_id', $cartId, PDO::PARAM_INT);
            $cartItemsStmt->execute();
            $cartItems = $cartItemsStmt->fetchAll();

            if (empty($cartItems)) {
                throw new RuntimeException('Cart is empty. Cannot proceed to checkout.', 400);
            }

            // Step 2: Lock products and inventory rows with FOR UPDATE to prevent race conditions & overselling
            $lockStmt = $this->pdo->prepare(
                'SELECT p.id, p.name, p.slug, p.price, p.sku, p.stock, p.status,
                        i.id AS inventory_id, i.quantity AS inventory_quantity
                 FROM products p
                 LEFT JOIN inventory i ON i.product_id = p.id
                 WHERE p.id = :product_id
                 FOR UPDATE'
            );

            $orderItems = [];
            $subtotal = 0.00;

            foreach ($cartItems as $item) {
                $productId = (int) $item['product_id'];
                $requestedQty = (int) $item['quantity'];

                if ($requestedQty <= 0) {
                    throw new RuntimeException('Invalid item quantity in cart.', 422);
                }

                $lockStmt->bindValue(':product_id', $productId, PDO::PARAM_INT);
                $lockStmt->execute();
                $product = $lockStmt->fetch();

                if (!$product) {
                    throw new RuntimeException("Product #{$productId} is no longer available in the catalog.", 404);
                }

                if ($product['status'] !== 'active') {
                    throw new RuntimeException("Product '{$product['name']}' is no longer active.", 400);
                }

                // Developer Note: Dual Stock Source Architecture
                // 'inventory.quantity' is the intended authoritative inventory tracking value.
                // 'products.stock' currently remains for backward compatibility with the existing product catalog model.
                // Checkout validates against 'inventory.quantity' when present (falling back to 'products.stock').
                // A future cleanup phase will consolidate this into a single source of truth.
                $availableStock = $product['inventory_quantity'] !== null
                    ? (int) $product['inventory_quantity']
                    : (int) $product['stock'];

                if ($availableStock < $requestedQty) {
                    throw new RuntimeException(
                        "Requested quantity ({$requestedQty}) exceeds available stock ({$availableStock}) for '{$product['name']}'.",
                        409
                    );
                }

                // Calculate authoritative line price (never from client)
                $unitPrice = (float) $product['price'];
                $lineSubtotal = round($unitPrice * $requestedQty, 2);
                $subtotal += $lineSubtotal;

                $orderItems[] = [
                    'product_id'   => (int) $product['id'],
                    'product_name' => (string) $product['name'],
                    'sku'          => $product['sku'] !== null ? (string) $product['sku'] : null,
                    'quantity'     => $requestedQty,
                    'unit_price'   => $unitPrice,
                    'subtotal'     => $lineSubtotal,
                ];
            }

            // Step 3: Authoritative server-side financial calculations
            $shippingFee = self::calculateShippingFee($subtotal);
            $discount = 0.00; // Coupons handled in a dedicated later phase
            $total = round($subtotal + $shippingFee - $discount, 2);

            // Step 4: Handle shipping address
            $shippingAddressId = null;

            if ($addressId !== null && $userId !== null) {
                // Verify that saved address belongs to the authenticated user
                $addrCheck = $this->pdo->prepare('SELECT id FROM addresses WHERE id = :id AND user_id = :user_id LIMIT 1');
                $addrCheck->bindValue(':id', $addressId, PDO::PARAM_INT);
                $addrCheck->bindValue(':user_id', $userId, PDO::PARAM_INT);
                $addrCheck->execute();
                $existingAddr = $addrCheck->fetch();

                if (!$existingAddr) {
                    throw new RuntimeException('Selected shipping address not found or does not belong to you.', 403);
                }
                $shippingAddressId = $addressId;
            } elseif (!empty($newAddressData)) {
                // Persist new address in addresses table (user_id is NULL for guest, or int for auth user)
                $insAddr = $this->pdo->prepare(
                    'INSERT INTO addresses (
                        user_id, full_name, phone, address_line_1, address_line_2,
                        city, state, postal_code, country, is_default
                    ) VALUES (
                        :user_id, :full_name, :phone, :address_line_1, :address_line_2,
                        :city, :state, :postal_code, :country, :is_default
                    )'
                );
                $insAddr->bindValue(':user_id', $userId, $userId !== null ? PDO::PARAM_INT : PDO::PARAM_NULL);
                $insAddr->bindValue(':full_name', $newAddressData['full_name'], PDO::PARAM_STR);
                $insAddr->bindValue(':phone', $newAddressData['phone'], PDO::PARAM_STR);
                $insAddr->bindValue(':address_line_1', $newAddressData['address_line_1'], PDO::PARAM_STR);
                $insAddr->bindValue(':address_line_2', $newAddressData['address_line_2'] ?? null, PDO::PARAM_STR);
                $insAddr->bindValue(':city', $newAddressData['city'], PDO::PARAM_STR);
                $insAddr->bindValue(':state', $newAddressData['state'] ?? null, PDO::PARAM_STR);
                $insAddr->bindValue(':postal_code', $newAddressData['postal_code'] ?? null, PDO::PARAM_STR);
                $insAddr->bindValue(':country', $newAddressData['country'] ?? 'Pakistan', PDO::PARAM_STR);
                $insAddr->bindValue(':is_default', 0, PDO::PARAM_INT);
                $insAddr->execute();

                $shippingAddressId = (int) $this->pdo->lastInsertId();
            }

            // Step 5 & 6: Insert into orders table with unique order-number collision handling
            $maxOrderInsertAttempts = 5;
            $orderInserted = false;
            $orderId = 0;
            $orderNumber = '';

            $orderInsert = $this->pdo->prepare(
                'INSERT INTO orders (
                    user_id, order_number, customer_name, customer_email, customer_phone,
                    subtotal, shipping_fee, discount, total,
                    status, payment_status, payment_method, shipping_address_id
                ) VALUES (
                    :user_id, :order_number, :customer_name, :customer_email, :customer_phone,
                    :subtotal, :shipping_fee, :discount, :total,
                    :status, :payment_status, :payment_method, :shipping_address_id
                )'
            );

            for ($attempt = 1; $attempt <= $maxOrderInsertAttempts; $attempt++) {
                $orderNumber = $this->generateOrderNumber();

                try {
                    $orderInsert->bindValue(':user_id', $userId, $userId !== null ? PDO::PARAM_INT : PDO::PARAM_NULL);
                    $orderInsert->bindValue(':order_number', $orderNumber, PDO::PARAM_STR);
                    $orderInsert->bindValue(':customer_name', $customerData['name'], PDO::PARAM_STR);
                    $orderInsert->bindValue(':customer_email', $customerData['email'], PDO::PARAM_STR);
                    $orderInsert->bindValue(':customer_phone', $customerData['phone'], PDO::PARAM_STR);
                    $orderInsert->bindValue(':subtotal', $subtotal, PDO::PARAM_STR);
                    $orderInsert->bindValue(':shipping_fee', $shippingFee, PDO::PARAM_STR);
                    $orderInsert->bindValue(':discount', $discount, PDO::PARAM_STR);
                    $orderInsert->bindValue(':total', $total, PDO::PARAM_STR);
                    $orderInsert->bindValue(':status', 'Placed', PDO::PARAM_STR);
                    $orderInsert->bindValue(':payment_status', 'Pending', PDO::PARAM_STR);
                    $orderInsert->bindValue(':payment_method', $paymentMethod, PDO::PARAM_STR);
                    $orderInsert->bindValue(':shipping_address_id', $shippingAddressId, $shippingAddressId !== null ? PDO::PARAM_INT : PDO::PARAM_NULL);
                    $orderInsert->execute();

                    $orderId = (int) $this->pdo->lastInsertId();
                    $orderInserted = true;
                    break;
                } catch (PDOException $pe) {
                    if ($this->isOrderNumberDuplicate($pe)) {
                        error_log("Order number collision on '{$orderNumber}' (attempt {$attempt} of {$maxOrderInsertAttempts}). Retrying with new order number...");
                        continue;
                    }
                    // Unrelated database errors must NOT be caught as collisions; throw immediately
                    throw $pe;
                }
            }

            if (!$orderInserted || $orderId <= 0) {
                throw new RuntimeException('Unable to allocate a unique order identifier. Please try again.', 500);
            }

            // Step 7: Insert historical order items
            $itemInsert = $this->pdo->prepare(
                'INSERT INTO order_items (
                    order_id, product_id, product_name, sku, quantity, unit_price, subtotal
                ) VALUES (
                    :order_id, :product_id, :product_name, :sku, :quantity, :unit_price, :subtotal
                )'
            );

            foreach ($orderItems as $line) {
                $itemInsert->bindValue(':order_id', $orderId, PDO::PARAM_INT);
                $itemInsert->bindValue(':product_id', $line['product_id'], PDO::PARAM_INT);
                $itemInsert->bindValue(':product_name', $line['product_name'], PDO::PARAM_STR);
                $itemInsert->bindValue(':sku', $line['sku'], $line['sku'] !== null ? PDO::PARAM_STR : PDO::PARAM_NULL);
                $itemInsert->bindValue(':quantity', $line['quantity'], PDO::PARAM_INT);
                $itemInsert->bindValue(':unit_price', $line['unit_price'], PDO::PARAM_STR);
                $itemInsert->bindValue(':subtotal', $line['subtotal'], PDO::PARAM_STR);
                $itemInsert->execute();
            }

            // Step 8: Insert payment record (Pending status, no fake gateway confirmations)
            $payInsert = $this->pdo->prepare(
                'INSERT INTO payments (
                    order_id, transaction_reference, proof_of_payment_path, amount, method, status, paid_at
                ) VALUES (
                    :order_id, :transaction_reference, :proof_of_payment_path, :amount, :method, :status, NULL
                )'
            );
            $payInsert->bindValue(':order_id', $orderId, PDO::PARAM_INT);
            $payInsert->bindValue(':transaction_reference', $transactionReference !== null && $transactionReference !== '' ? $transactionReference : null, $transactionReference !== null && $transactionReference !== '' ? PDO::PARAM_STR : PDO::PARAM_NULL);
            $payInsert->bindValue(':proof_of_payment_path', $proofOfPaymentPath !== null && $proofOfPaymentPath !== '' ? $proofOfPaymentPath : null, $proofOfPaymentPath !== null && $proofOfPaymentPath !== '' ? PDO::PARAM_STR : PDO::PARAM_NULL);
            $payInsert->bindValue(':amount', $total, PDO::PARAM_STR);
            $payInsert->bindValue(':method', $paymentMethod, PDO::PARAM_STR);
            $payInsert->bindValue(':status', 'pending', PDO::PARAM_STR);
            $payInsert->execute();
            $paymentId = (int) $this->pdo->lastInsertId();

            // Step 9: Decrement inventory and product stock
            // Developer Note: Dual Stock Synchronization
            // Both 'inventory.quantity' (authoritative) and 'products.stock' (catalog compatibility)
            // are decremented within this transaction to keep both columns synchronized until
            // a future cleanup phase unifies stock storage.
            $decInvStmt = $this->pdo->prepare(
                'UPDATE inventory 
                 SET quantity = GREATEST(0, quantity - :qty), updated_at = CURRENT_TIMESTAMP 
                 WHERE product_id = :product_id'
            );
            $decProdStmt = $this->pdo->prepare(
                'UPDATE products 
                 SET stock = GREATEST(0, stock - :qty), updated_at = CURRENT_TIMESTAMP 
                 WHERE id = :product_id'
            );

            foreach ($orderItems as $line) {
                $decInvStmt->bindValue(':qty', $line['quantity'], PDO::PARAM_INT);
                $decInvStmt->bindValue(':product_id', $line['product_id'], PDO::PARAM_INT);
                $decInvStmt->execute();

                $decProdStmt->bindValue(':qty', $line['quantity'], PDO::PARAM_INT);
                $decProdStmt->bindValue(':product_id', $line['product_id'], PDO::PARAM_INT);
                $decProdStmt->execute();
            }

            // Step 10: Clear the cart contents
            $clearCartStmt = $this->pdo->prepare('DELETE FROM cart_items WHERE cart_id = :cart_id');
            $clearCartStmt->bindValue(':cart_id', $cartId, PDO::PARAM_INT);
            $clearCartStmt->execute();

            $touchCartStmt = $this->pdo->prepare('UPDATE carts SET updated_at = CURRENT_TIMESTAMP WHERE id = :cart_id');
            $touchCartStmt->bindValue(':cart_id', $cartId, PDO::PARAM_INT);
            $touchCartStmt->execute();

            // Step 11: Construct the response payload from authoritative created order data
            // (Constructed before commit so that a successfully committed order cannot fail on post-commit DB query)
            $now = date('Y-m-d H:i:s');
            $createdOrder = [
                'id'                  => $orderId,
                'user_id'             => $userId,
                'order_number'        => $orderNumber,
                'customer_name'       => $customerData['name'],
                'customer_email'      => $customerData['email'],
                'customer_phone'      => $customerData['phone'],
                'subtotal'            => (float) $subtotal,
                'shipping_fee'        => (float) $shippingFee,
                'discount'            => (float) $discount,
                'total'               => (float) $total,
                'status'              => 'Placed',
                'payment_status'      => 'Pending',
                'payment_method'      => $paymentMethod,
                'shipping_address_id' => $shippingAddressId,
                'item_count'          => count($orderItems),
                'total_quantity'      => (int) array_sum(array_column($orderItems, 'quantity')),
                'items'               => $orderItems,
                'payment'             => [
                    'id'                    => $paymentId,
                    'transaction_reference' => null,
                    'amount'                => (float) $total,
                    'method'                => $paymentMethod,
                    'status'                => 'pending',
                    'paid_at'               => null,
                    'created_at'            => $now,
                ],
                'created_at'          => $now,
                'updated_at'          => $now,
            ];

            // Step 12: Commit atomic transaction
            $this->pdo->commit();

            // Return the already-constructed order response (no post-commit DB retrieval required)
            return $createdOrder;
        } catch (Throwable $e) {
            if ($this->pdo->inTransaction()) {
                $this->pdo->rollBack();
            }
            throw $e;
        }
    }

    /**
     * Retrieve paginated orders for a specific authenticated user.
     */
    public function getUserOrders(int $userId, int $page = 1, int $limit = 10): array {
        $countStmt = $this->pdo->prepare('SELECT COUNT(*) FROM orders WHERE user_id = :user_id');
        $countStmt->bindValue(':user_id', $userId, PDO::PARAM_INT);
        $countStmt->execute();
        $totalItems = (int) $countStmt->fetchColumn();

        $totalPages = $totalItems > 0 ? (int) ceil($totalItems / $limit) : 1;
        $offset = ($page - 1) * $limit;

        $ordersStmt = $this->pdo->prepare(
            'SELECT o.id, o.order_number, o.status, o.payment_status, o.payment_method,
                    o.subtotal, o.shipping_fee, o.discount, o.total,
                    o.customer_name, o.customer_email, o.customer_phone,
                    o.created_at, o.updated_at,
                    (SELECT COUNT(*) FROM order_items oi WHERE oi.order_id = o.id) AS item_count,
                    (SELECT COALESCE(SUM(oi.quantity), 0) FROM order_items oi WHERE oi.order_id = o.id) AS total_quantity
             FROM orders o
             WHERE o.user_id = :user_id
             ORDER BY o.created_at DESC, o.id DESC
             LIMIT :limit OFFSET :offset'
        );
        $ordersStmt->bindValue(':user_id', $userId, PDO::PARAM_INT);
        $ordersStmt->bindValue(':limit', $limit, PDO::PARAM_INT);
        $ordersStmt->bindValue(':offset', $offset, PDO::PARAM_INT);
        $ordersStmt->execute();
        $rows = $ordersStmt->fetchAll();

        $orders = [];
        foreach ($rows as $row) {
            $orders[] = [
                'id'             => (int) $row['id'],
                'order_number'   => (string) $row['order_number'],
                'status'         => (string) $row['status'],
                'payment_status' => (string) $row['payment_status'],
                'payment_method' => (string) $row['payment_method'],
                'subtotal'       => (float) $row['subtotal'],
                'shipping_fee'   => (float) $row['shipping_fee'],
                'discount'       => (float) $row['discount'],
                'total'          => (float) $row['total'],
                'item_count'     => (int) $row['item_count'],
                'total_quantity' => (int) $row['total_quantity'],
                'customer_name'  => (string) $row['customer_name'],
                'customer_email' => (string) $row['customer_email'],
                'customer_phone' => (string) $row['customer_phone'],
                'created_at'     => (string) $row['created_at'],
                'updated_at'     => (string) $row['updated_at'],
            ];
        }

        return [
            'orders'     => $orders,
            'pagination' => [
                'page'        => $page,
                'limit'       => $limit,
                'total_items' => $totalItems,
                'total_pages' => $totalPages,
            ],
        ];
    }

    /**
     * Retrieve a single order with its items, shipping address, and payment record.
     * Enforces user ownership when $userId is provided.
     */
    public function getOrderById(int $orderId, ?int $userId = null, bool $isAdmin = false): ?array {
        $stmt = $this->pdo->prepare('SELECT * FROM orders WHERE id = :order_id LIMIT 1');
        $stmt->bindValue(':order_id', $orderId, PDO::PARAM_INT);
        $stmt->execute();
        $order = $stmt->fetch();

        if (!$order) {
            return null;
        }

        // Ownership enforcement: Authenticated non-admin can only access their own orders
        if ($userId !== null && !$isAdmin && (int) $order['user_id'] !== $userId) {
            return null;
        }

        // Retrieve order items with current primary images if available
        $itemsStmt = $this->pdo->prepare(
            'SELECT oi.id, oi.product_id, oi.product_name, oi.sku, oi.quantity, oi.unit_price, oi.subtotal, oi.created_at,
                    p.slug AS current_product_slug,
                    (SELECT pi.image_url 
                     FROM product_images pi 
                     WHERE pi.product_id = oi.product_id 
                     ORDER BY pi.is_primary DESC, pi.sort_order ASC, pi.id ASC 
                     LIMIT 1) AS primary_image
             FROM order_items oi
             LEFT JOIN products p ON p.id = oi.product_id
             WHERE oi.order_id = :order_id
             ORDER BY oi.id ASC'
        );
        $itemsStmt->bindValue(':order_id', $orderId, PDO::PARAM_INT);
        $itemsStmt->execute();
        $rawItems = $itemsStmt->fetchAll();

        $items = [];
        $totalQuantity = 0;
        foreach ($rawItems as $item) {
            $qty = (int) $item['quantity'];
            $totalQuantity += $qty;
            $items[] = [
                'id'                   => (int) $item['id'],
                'product_id'           => $item['product_id'] !== null ? (int) $item['product_id'] : null,
                'product_name'         => (string) $item['product_name'],
                'sku'                  => $item['sku'] !== null ? (string) $item['sku'] : null,
                'quantity'             => $qty,
                'unit_price'           => (float) $item['unit_price'],
                'subtotal'             => (float) $item['subtotal'],
                'current_product_slug' => $item['current_product_slug'] !== null ? (string) $item['current_product_slug'] : null,
                'primary_image'        => $item['primary_image'] !== null ? (string) $item['primary_image'] : null,
                'created_at'           => (string) $item['created_at'],
            ];
        }

        // Retrieve shipping address if linked
        $shippingAddress = null;
        if (!empty($order['shipping_address_id'])) {
            $addrStmt = $this->pdo->prepare('SELECT * FROM addresses WHERE id = :id LIMIT 1');
            $addrStmt->bindValue(':id', (int) $order['shipping_address_id'], PDO::PARAM_INT);
            $addrStmt->execute();
            $addrRow = $addrStmt->fetch();

            if ($addrRow) {
                $shippingAddress = [
                    'id'             => (int) $addrRow['id'],
                    'full_name'      => (string) $addrRow['full_name'],
                    'phone'          => (string) $addrRow['phone'],
                    'address_line_1' => (string) $addrRow['address_line_1'],
                    'address_line_2' => $addrRow['address_line_2'] !== null ? (string) $addrRow['address_line_2'] : null,
                    'city'           => (string) $addrRow['city'],
                    'state'          => $addrRow['state'] !== null ? (string) $addrRow['state'] : null,
                    'postal_code'    => $addrRow['postal_code'] !== null ? (string) $addrRow['postal_code'] : null,
                    'country'        => (string) $addrRow['country'],
                ];
            }
        }

        // Retrieve latest payment record
        $payStmt = $this->pdo->prepare(
            'SELECT id, transaction_reference, proof_of_payment_path, amount, method, status, paid_at, created_at
             FROM payments
             WHERE order_id = :order_id
             ORDER BY id DESC
             LIMIT 1'
        );
        $payStmt->bindValue(':order_id', $orderId, PDO::PARAM_INT);
        $payStmt->execute();
        $payRow = $payStmt->fetch();

        $payment = null;
        if ($payRow) {
            $payment = [
                'id'                    => (int) $payRow['id'],
                'transaction_reference' => $payRow['transaction_reference'] !== null ? (string) $payRow['transaction_reference'] : null,
                'proof_of_payment_path' => $payRow['proof_of_payment_path'] !== null ? (string) $payRow['proof_of_payment_path'] : null,
                'amount'                => (float) $payRow['amount'],
                'method'                => (string) $payRow['method'],
                'status'                => (string) $payRow['status'],
                'paid_at'               => $payRow['paid_at'] !== null ? (string) $payRow['paid_at'] : null,
                'created_at'            => (string) $payRow['created_at'],
            ];
        }

        return [
            'id'                  => (int) $order['id'],
            'user_id'             => $order['user_id'] !== null ? (int) $order['user_id'] : null,
            'order_number'        => (string) $order['order_number'],
            'customer_name'       => (string) $order['customer_name'],
            'customer_email'      => (string) $order['customer_email'],
            'customer_phone'      => (string) $order['customer_phone'],
            'subtotal'            => (float) $order['subtotal'],
            'shipping_fee'        => (float) $order['shipping_fee'],
            'discount'            => (float) $order['discount'],
            'total'               => (float) $order['total'],
            'status'              => (string) $order['status'],
            'payment_status'      => (string) $order['payment_status'],
            'payment_method'      => (string) $order['payment_method'],
            'shipping_address_id' => $order['shipping_address_id'] !== null ? (int) $order['shipping_address_id'] : null,
            'shipping_address'    => $shippingAddress,
            'item_count'          => count($items),
            'total_quantity'      => $totalQuantity,
            'items'               => $items,
            'payment'             => $payment,
            'created_at'          => (string) $order['created_at'],
            'updated_at'          => (string) $order['updated_at'],
        ];
    }

    /**
     * Secure guest order tracking.
     * Requires valid order_number AND email verification to prevent enumeration.
     * Strips all internal identifiers and administrative data (user_id, shipping_address_id, payment records)
     * before returning order status to guests.
     */
    public function trackGuestOrder(string $orderNumber, string $email, ?string $phone = null): ?array {
        $cleanOrderNumber = trim($orderNumber);
        $cleanEmail = strtolower(trim($email));

        if ($cleanOrderNumber === '' || $cleanEmail === '') {
            return null;
        }

        $stmt = $this->pdo->prepare('SELECT id, customer_email, customer_phone FROM orders WHERE order_number = :order_number LIMIT 1');
        $stmt->bindValue(':order_number', $cleanOrderNumber, PDO::PARAM_STR);
        $stmt->execute();
        $order = $stmt->fetch();

        if (!$order) {
            return null;
        }

        // Verify customer email matches case-insensitively
        $dbEmail = strtolower(trim((string)$order['customer_email']));
        if ($dbEmail !== $cleanEmail) {
            return null;
        }

        // If phone is also provided, verify clean phone digits match
        if ($phone !== null && trim($phone) !== '') {
            $cleanDbPhone = preg_replace('/[^0-9]/', '', (string)$order['customer_phone']);
            $cleanInputPhone = preg_replace('/[^0-9]/', '', $phone);
            if ($cleanDbPhone !== '' && $cleanDbPhone !== $cleanInputPhone) {
                return null;
            }
        }

        // Retrieve order details to populate tracking
        $fullOrder = $this->getOrderById((int)$order['id'], null, true);
        if (!$fullOrder) {
            return null;
        }

        // Sanitize item details for public tracking display
        $sanitizedItems = [];
        foreach ($fullOrder['items'] ?? [] as $item) {
            $sanitizedItems[] = [
                'product_name'         => (string) ($item['product_name'] ?? ''),
                'sku'                  => isset($item['sku']) && $item['sku'] !== null ? (string) $item['sku'] : null,
                'quantity'             => (int) ($item['quantity'] ?? 1),
                'unit_price'           => (float) ($item['unit_price'] ?? 0),
                'subtotal'             => (float) ($item['subtotal'] ?? 0),
                'current_product_slug' => $item['current_product_slug'] ?? null,
                'primary_image'        => $item['primary_image'] ?? null,
            ];
        }

        // Limited shipping destination only (city, state, country)
        // Full street address, recipient name, and phone are omitted for customer privacy
        $limitedShipping = null;
        if (!empty($fullOrder['shipping_address'])) {
            $limitedShipping = [
                'city'    => $fullOrder['shipping_address']['city'] ?? null,
                'state'   => $fullOrder['shipping_address']['state'] ?? null,
                'country' => $fullOrder['shipping_address']['country'] ?? null,
            ];
        }

        // Return strictly tracking-relevant payload without exposing sensitive customer,
        // address, internal database IDs, or payment internals:
        return [
            'order_number'     => (string) $fullOrder['order_number'],
            'status'           => (string) $fullOrder['status'],
            'payment_status'   => (string) $fullOrder['payment_status'],
            'payment_method'   => (string) $fullOrder['payment_method'],
            'subtotal'         => (float) $fullOrder['subtotal'],
            'shipping_fee'     => (float) $fullOrder['shipping_fee'],
            'discount'         => (float) $fullOrder['discount'],
            'total'            => (float) $fullOrder['total'],
            'item_count'       => (int) ($fullOrder['item_count'] ?? count($sanitizedItems)),
            'total_quantity'   => (int) ($fullOrder['total_quantity'] ?? array_sum(array_column($sanitizedItems, 'quantity'))),
            'items'            => $sanitizedItems,
            'shipping_address' => $limitedShipping,
            'created_at'       => (string) $fullOrder['created_at'],
            'updated_at'       => (string) ($fullOrder['updated_at'] ?? $fullOrder['created_at']),
        ];
    }
}
