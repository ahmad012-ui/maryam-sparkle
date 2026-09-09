# Maryam Sparkle - Database Documentation

Complete MySQL database schema and relational design documentation for **Maryam Sparkle**, a custom handmade jewelry ecommerce platform.

---

## 1. Database Specifications

- **Database Name**: `maryam_sparkle`
- **RDBMS**: MySQL 8.0+ / MariaDB 10.4+
- **Default Storage Engine**: `InnoDB` (ACID compliance, row-level locking, foreign key integrity)
- **Character Set**: `utf8mb4` (Full Unicode including multilingual characters and symbols)
- **Collation**: `utf8mb4_unicode_ci` (Accurate, case-insensitive linguistic sorting)

---

## 2. Required MySQL Setup & Creation

### Prerequisites
1. A running MySQL or MariaDB instance (local server, Docker container, or cloud-hosted database).
2. Administrative credentials or privileges to create databases and user permissions.

### Automated Creation via `schema.sql`
The `schema.sql` script includes creation and selection directives:

```sql
CREATE DATABASE IF NOT EXISTS maryam_sparkle
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE maryam_sparkle;
```

---

## 3. How to Execute / Import `schema.sql`

### Option A: MySQL Command Line (CLI)

```bash
# Direct import using MySQL client
mysql -u your_username -p < database/schema.sql
```

If entering the MySQL interactive console first:
```sql
SOURCE /absolute/path/to/database/schema.sql;
```

### Option B: phpMyAdmin / GUI Client (DBeaver, TablePlus, MySQL Workbench)
1. Open your GUI database tool and connect to your MySQL host.
2. Select **File → Open SQL Script** (or navigate to the **Import** tab).
3. Select `database/schema.sql` and click **Execute / Go**.

---

## 4. The 15 Database Tables

| # | Table Name | Purpose | Key Constraints & Characteristics |
|---|:---|:---|:---|
| 1 | `users` | Registered customers and store administrators | `email` (UNIQUE), `google_id` (UNIQUE for future OAuth), `role` (`customer`, `admin`), `status` (`active`, `inactive`) |
| 2 | `categories` | Jewelry collection taxonomy (Rings, Necklaces, etc.) | `slug` (UNIQUE), `status` (`active`, `inactive`) |
| 3 | `products` | Jewelry catalog items and specifications | `slug` (UNIQUE), `sku` (UNIQUE), `price >= 0`, `category_id` (FK → `categories.id` `ON DELETE SET NULL`) |
| 4 | `product_images` | Image gallery URLs per product | `product_id` (FK → `products.id` `ON DELETE CASCADE`), `is_primary` flag, `sort_order` |
| 5 | `inventory` | 1-to-1 inventory tracking and thresholds | `product_id` (UNIQUE, FK → `products.id` `ON DELETE CASCADE`), `quantity`, `low_stock_threshold` |
| 6 | `addresses` | Customer saved shipping/billing addresses | `user_id` (FK → `users.id` `ON DELETE CASCADE`), `is_default` flag |
| 7 | `orders` | Master orders table | `order_number` (UNIQUE), `user_id` (NULLABLE for guest checkout, `ON DELETE SET NULL`), statuses, totals |
| 8 | `order_items` | Historical line items for placed orders | `order_id` (FK → `orders.id` `ON DELETE CASCADE`), `product_id` (NULLABLE, `ON DELETE SET NULL`), price/name snapshot |
| 9 | `payments` | Payment transaction records | `order_id` (FK → `orders.id` `ON DELETE CASCADE`), `transaction_reference` (UNIQUE), payment status/method |
| 10 | `wishlists` | Customer saved favorite items | `UNIQUE(user_id, product_id)`, cascading deletes from user or product |
| 11 | `reviews` | Customer product ratings & reviews (1 to 5 stars) | `UNIQUE(user_id, product_id)`, rating check `1 <= rating <= 5`, moderation status (`pending`, `approved`, `rejected`) |
| 12 | `coupons` | Standalone promotional discount vouchers | `code` (UNIQUE), `discount_type` (`percentage`, `fixed`), validity dates, usage limit/count |
| 13 | `contact_messages` | Customer inquiries and contact submissions | Contact metadata, message body, status (`unread`, `read`, `replied`, `archived`) |
| 14 | `custom_orders` | Bespoke handmade jewelry inquiries | `user_id` (NULLABLE for guest inquiries), budget, status, admin notes |
| 15 | `custom_order_images`| Inspiration and reference photos for custom orders | `custom_order_id` (FK → `custom_orders.id` `ON DELETE CASCADE`), URLs and sort order |

---

## 5. Architectural Relationships

```text
users
 ├── addresses (1 : M, ON DELETE CASCADE)
 ├── orders (1 : M, ON DELETE SET NULL - preserves order history)
 │     ├── order_items (1 : M, ON DELETE CASCADE) ─── products (M : 1, ON DELETE SET NULL)
 │     └── payments (1 : M, ON DELETE CASCADE)
 ├── wishlists (1 : M, ON DELETE CASCADE) ─── products (M : 1, ON DELETE CASCADE)
 ├── reviews (1 : M, ON DELETE CASCADE) ─── products (M : 1, ON DELETE CASCADE)
 └── custom_orders (1 : M, ON DELETE SET NULL - preserves custom inquiries)
        └── custom_order_images (1 : M, ON DELETE CASCADE)

categories
 └── products (1 : M, ON DELETE SET NULL - categories can be archived without deleting items)
       ├── product_images (1 : M, ON DELETE CASCADE)
       └── inventory (1 : 1, ON DELETE CASCADE)

coupons (Standalone entity for discount definitions)

contact_messages (Standalone entity for customer communications)
```

---

## 6. Critical Domain Design Decisions

### A. Guest Checkout Support
- `orders.user_id` is explicitly **nullable**.
- `customer_name`, `customer_email`, and `customer_phone` are stored directly on the `orders` record.
- A guest customer can place an order without creating a `users` record. If a registered user deletes their account, `orders.user_id` is set to `NULL` via `ON DELETE SET NULL`, retaining complete historical sales data.
- Similarly, `custom_orders.user_id` is **nullable** to enable guest bespoke jewelry inquiries.

### B. Historical Order Integrity (Snapshotted Order Items)
- `order_items.product_id` is **nullable** with `ON DELETE SET NULL`.
- `order_items` stores historical snapshots:
  - `product_name`
  - `sku`
  - `unit_price`
  - `subtotal`
- If an admin modifies a product title, changes pricing, or deletes a discontinued item from the catalog, previous customer orders remain 100% historically accurate and mathematically immutable.

### C. Foreign Key Safety Rules
- **Non-destructive Category Archiving**: Deleting a category does NOT delete products; `products.category_id` is set to `NULL` (`ON DELETE SET NULL`).
- **Cascading Child Records**: Records that have no business meaning without their parent (`product_images`, `inventory`, `custom_order_images`, `order_items`) use `ON DELETE CASCADE`.

---

## 7. How PHP Connects Through PDO

The PHP API accesses MySQL through a singleton PDO connection class located at `backend/config/database.php`:

```php
$pdo = Database::getConnection();
```

Key PDO configurations:
1. `PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION`: All database errors throw exceptions caught cleanly by API handlers.
2. `PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC`: Results are returned directly as associative arrays matching the JSON schema.
3. `PDO::ATTR_EMULATE_PREPARES => false`: Native parameterized prepared statements are enforced, preventing SQL injection vulnerabilities.
