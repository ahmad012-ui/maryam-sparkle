# Maryam Sparkle REST API (Backend)

The backend service for **Maryam Sparkle**, a custom handmade jewelry ecommerce platform. This API is built with **Vanilla PHP 8.1+**, **PDO (PHP Data Objects)**, and **MySQL**, adhering strictly to foundational RESTful design without heavy external frameworks.

---

## 1. Backend Purpose

This backend provides a clean, secure, and performant REST API layer to handle:
- Customer and administrator authentication
- Product catalog, categories, and inventory management
- Shopping cart, checkout, and order tracking
- Bespoke/custom jewelry requests with quotation workflows
- Media and image asset management

Phase 1 establishes the core architectural foundation: centralized configuration, PDO connection factory, standardized JSON response handlers, secure CORS handling, and routing structure.

---

## 2. Requirements

- **PHP**: `8.1` or higher
  - Required PHP extensions:
    - `pdo`
    - `pdo_mysql`
    - `json`
    - `mbstring`
- **Database**: `MySQL 8.0+` or `MariaDB 10.4+`
- **Web Server** (any of the following):
  - PHP Built-in CLI Web Server (for local development)
  - Apache with `mod_rewrite` enabled
  - Nginx with PHP-FPM

---

## 3. Directory Structure

```text
backend/
├── config/
│   ├── config.php          # Centralized application, CORS, and runtime settings
│   └── database.php        # PDO connection manager (strict error mode, prepared statements)
├── helpers/
│   └── response.php        # Standardized JSON response helpers (sendSuccess, sendError)
├── middleware/
│   └── .gitkeep            # Reserved for auth & role-based middleware (Phase 2+)
├── routes/
│   └── .gitkeep            # Reserved for modular route handlers (Phase 2+)
├── .env.example            # Template for environment variables (never commit .env)
├── index.php               # Single entry point, CORS interceptor, router dispatcher
└── README.md               # Backend documentation and setup guide
```

---

## 4. Environment Configuration

1. In the `backend/` directory, copy `.env.example` to create your local `.env`:

   ```bash
   cp backend/.env.example backend/.env
   ```

2. Open `backend/.env` and configure your local MySQL credentials and frontend URL:

   ```env
   APP_ENV=development
   APP_DEBUG=true
   APP_NAME="Maryam Sparkle API"
   APP_TIMEZONE=Asia/Karachi

   CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000

   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_NAME=maryam_sparkle
   DB_USER=your_database_user
   DB_PASSWORD=your_database_password
   DB_CHARSET=utf8mb4
   ```

> **Security Note**: Never commit `.env` containing real credentials to version control. The repository `.gitignore` automatically excludes `.env*` files except `.env.example`.

---

## 5. How to Run the API Locally

### Option A: From the Project Root

```bash
php -S localhost:8000 -t backend backend/index.php
```

### Option B: From the `backend/` Directory

```bash
cd backend
php -S localhost:8000
```

The API will now be listening on `http://localhost:8000`.

---

## 6. Health & Verification Endpoints

### A. Core API Health Check

Send a `GET` request to verify that the API entry point and JSON envelope are operating correctly:

```bash
curl -i -X GET http://localhost:8000/api/v1/health
```
*(or `curl -i -X GET http://localhost:8000/backend/index.php` or `http://localhost:8000/`)*

#### Response (`HTTP 200 OK`):
```json
{
  "success": true,
  "message": "Maryam Sparkle API is running",
  "data": {
    "version": "v1"
  }
}
```

### B. Database Health Check (Phase 2)

Send a `GET` request to verify the PDO MySQL connection (`SELECT 1`):

```bash
curl -i -X GET http://localhost:8000/api/v1/health/db
```

#### Successful Database Connection (`HTTP 200 OK`):
```json
{
  "success": true,
  "message": "Database connection successful"
}
```

#### Failed Database Connection (`HTTP 503 Service Unavailable`):
If the database server is unreachable or credentials in `.env` are invalid:
```json
{
  "success": false,
  "message": "Database connection failed"
}
```
*(Technical details and credentials are never leaked to client responses; errors are logged to the server error log).*

### Method Not Allowed (`HTTP 405`):

If an unsupported HTTP method (e.g. `POST`) is sent to the health endpoint:

```json
{
  "success": false,
  "message": "Method not allowed",
  "errors": {
    "method": "POST",
    "allowed_methods": [
      "GET"
    ]
  }
}
```

### Unknown Route (`HTTP 404`):

If an unregistered route is requested:

```json
{
  "success": false,
  "message": "Route not found",
  "errors": {
    "path": "/unknown-endpoint",
    "method": "GET"
  }
}
```

---

## 7. Standardized JSON Envelope Format

All responses from this API follow an envelope contract:

### Success Structure
```json
{
  "success": true,
  "message": "Description of outcome",
  "data": { ... }
}
```

### Error Structure
```json
{
  "success": false,
  "message": "Human-readable error description",
  "errors": { ... }
}
```

---

## 8. Categories REST API (Phase 3)

The Categories API manages jewelry taxonomy with full CRUD operations and dependency safety checks.

### A. List Active Categories
- **Path:** `GET /api/v1/categories`
- **Description:** Returns all active categories sorted alphabetically by name.

```bash
curl -X GET http://localhost:8000/api/v1/categories
```

#### Response (`HTTP 200 OK`):
```json
{
  "success": true,
  "message": "Categories retrieved successfully",
  "data": [
    {
      "id": 1,
      "name": "Necklaces",
      "slug": "necklaces",
      "description": "Handcrafted silver and gemstone necklaces",
      "image": "/images/categories/necklaces.jpg",
      "status": "active",
      "created_at": "2026-03-01 10:00:00",
      "updated_at": "2026-03-01 10:00:00"
    }
  ]
}
```

### B. Get Single Category
- **Path:** `GET /api/v1/categories/{id}`
- **Description:** Retrieves a single category by primary ID.

```bash
curl -X GET http://localhost:8000/api/v1/categories/1
```

#### Response (`HTTP 200 OK`):
```json
{
  "success": true,
  "message": "Category retrieved successfully",
  "data": {
    "id": 1,
    "name": "Necklaces",
    "slug": "necklaces",
    "description": "Handcrafted silver and gemstone necklaces",
    "image": "/images/categories/necklaces.jpg",
    "status": "active",
    "created_at": "2026-03-01 10:00:00",
    "updated_at": "2026-03-01 10:00:00"
  }
}
```

If not found (`HTTP 404 Not Found`):
```json
{
  "success": false,
  "message": "Category not found"
}
```

### C. Create Category
- **Path:** `POST /api/v1/categories`
- **Description:** Creates a new category. Validates unique slug, required name, and status.

```bash
curl -X POST http://localhost:8000/api/v1/categories \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Bracelets",
    "slug": "bracelets",
    "description": "Delicate handmade wrist jewelry",
    "image": null,
    "status": "active"
  }'
```

#### Response (`HTTP 201 Created`):
```json
{
  "success": true,
  "message": "Category created successfully",
  "data": {
    "id": 2,
    "name": "Bracelets",
    "slug": "bracelets",
    "description": "Delicate handmade wrist jewelry",
    "image": null,
    "status": "active",
    "created_at": "2026-03-09 10:30:00",
    "updated_at": "2026-03-09 10:30:00"
  }
}
```

### D. Update Category
- **Path:** `PUT /api/v1/categories/{id}`
- **Description:** Updates category attributes. Checks slug uniqueness excluding self.

```bash
curl -X PUT http://localhost:8000/api/v1/categories/2 \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Artisanal Bracelets",
    "slug": "artisanal-bracelets",
    "description": "Custom beaded and wire-wrapped bracelets",
    "image": null,
    "status": "active"
  }'
```

#### Response (`HTTP 200 OK`):
```json
{
  "success": true,
  "message": "Category updated successfully",
  "data": {
    "id": 2,
    "name": "Artisanal Bracelets",
    "slug": "artisanal-bracelets",
    "description": "Custom beaded and wire-wrapped bracelets",
    "image": null,
    "status": "active",
    "created_at": "2026-03-09 10:30:00",
    "updated_at": "2026-03-09 10:35:00"
  }
}
```

### E. Delete Category (Safe Deletion)
- **Path:** `DELETE /api/v1/categories/{id}`
- **Description:** Checks if products are associated with the category. If products exist, deletion is safely rejected with HTTP 409 to preserve data integrity.

```bash
curl -X DELETE http://localhost:8000/api/v1/categories/2
```

#### Safe Rejection (`HTTP 409 Conflict`):
```json
{
  "success": false,
  "message": "Cannot delete category: 3 product(s) are associated with this category. Please reassign or remove dependent products first.",
  "errors": {
    "dependent_products": 3,
    "suggestion": "Set category status to inactive instead of deleting."
  }
}
```

#### Success (`HTTP 200 OK`):
```json
{
  "success": true,
  "message": "Category deleted successfully"
}
```

---

## 9. Products REST API (Phase 3)

The Products API provides high-performance catalog querying, filtering, sorting, pagination, and full product lifecycle management.

### Supported Query Filters & Sorting
- `category`: Filter by category slug (`?category=necklaces`) or category ID (`?category=1`).
- `status`: `active` (default), `inactive`, or `all`.
- `featured`: `true` or `false`.
- `best_seller`: `true` or `false`.
- `new`: `true` or `false`.
- `min_price` & `max_price`: Numeric price range boundaries.
- `search`: Keyword query matching product name, SKU, short description, or full description.
- `sort`:
  - `newest` (default): newest products first
  - `price_asc`: lowest price first
  - `price_desc`: highest price first
  - `name_asc`: A to Z
  - `name_desc`: Z to A
- `page`: Page index (default: `1`).
- `limit`: Items per page (default: `12`, max: `50`).

---

### A. List & Filter Products
- **Path:** `GET /api/v1/products`

```bash
curl -X GET "http://localhost:8000/api/v1/products?category=necklaces&min_price=1000&max_price=5000&sort=price_asc&page=1&limit=12"
```

#### Response (`HTTP 200 OK`):
```json
{
  "success": true,
  "message": "Products retrieved successfully",
  "data": [
    {
      "id": 10,
      "category_id": 1,
      "category": {
        "id": 1,
        "name": "Necklaces",
        "slug": "necklaces"
      },
      "name": "Celestial Moon Pendant",
      "slug": "celestial-moon-pendant",
      "description": "Hand-forged crescent pendant embedded with natural labradorite.",
      "short_description": "Labradorite crescent pendant with sterling chain.",
      "price": 2800.0,
      "compare_at_price": 3200.0,
      "sku": "MS-NCK-001",
      "stock": 8,
      "is_featured": true,
      "is_best_seller": true,
      "is_new": false,
      "status": "active",
      "images": [
        {
          "id": 1,
          "product_id": 10,
          "image_url": "https://example.com/pendant-1.jpg",
          "sort_order": 0,
          "is_primary": true,
          "created_at": "2026-03-01 12:00:00"
        }
      ],
      "created_at": "2026-03-01 12:00:00",
      "updated_at": "2026-03-01 12:00:00"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 12,
    "total": 1,
    "total_pages": 1
  }
}
```

---

### B. Get Single Product by ID
- **Path:** `GET /api/v1/products/{id}`

```bash
curl -X GET http://localhost:8000/api/v1/products/10
```

#### Response (`HTTP 200 OK`):
Includes detailed category information, all product gallery images, and current inventory metadata:
```json
{
  "success": true,
  "message": "Product retrieved successfully",
  "data": {
    "id": 10,
    "category_id": 1,
    "category": {
      "id": 1,
      "name": "Necklaces",
      "slug": "necklaces"
    },
    "name": "Celestial Moon Pendant",
    "slug": "celestial-moon-pendant",
    "description": "Hand-forged crescent pendant embedded with natural labradorite.",
    "short_description": "Labradorite crescent pendant with sterling chain.",
    "price": 2800.0,
    "compare_at_price": 3200.0,
    "sku": "MS-NCK-001",
    "stock": 8,
    "is_featured": true,
    "is_best_seller": true,
    "is_new": false,
    "status": "active",
    "images": [
      {
        "id": 1,
        "product_id": 10,
        "image_url": "https://example.com/pendant-1.jpg",
        "sort_order": 0,
        "is_primary": true,
        "created_at": "2026-03-01 12:00:00"
      }
    ],
    "inventory": {
      "quantity": 8,
      "low_stock_threshold": 5,
      "updated_at": "2026-03-01 12:00:00"
    },
    "created_at": "2026-03-01 12:00:00",
    "updated_at": "2026-03-01 12:00:00"
  }
}
```

---

### C. Get Single Product by Slug
- **Path:** `GET /api/v1/products/slug/{slug}`

```bash
curl -X GET http://localhost:8000/api/v1/products/slug/celestial-moon-pendant
```

---

### D. Create Product
- **Path:** `POST /api/v1/products`
- **Description:** Validates all fields, creates the product, and generates the initial inventory row in an ACID transaction.

```bash
curl -X POST http://localhost:8000/api/v1/products \
  -H "Content-Type: application/json" \
  -d '{
    "category_id": 1,
    "name": "Aurora Borealis Choker",
    "slug": "aurora-borealis-choker",
    "description": "Natural iridescent beads woven on silver wire.",
    "short_description": "Iridescent beaded choker necklace.",
    "price": 3200,
    "compare_at_price": 3600,
    "sku": "MS-NCK-002",
    "stock": 15,
    "is_featured": true,
    "is_best_seller": false,
    "is_new": true,
    "status": "active"
  }'
```

#### Response (`HTTP 201 Created`):
```json
{
  "success": true,
  "message": "Product created successfully",
  "data": {
    "id": 11,
    "category_id": 1,
    "name": "Aurora Borealis Choker",
    "slug": "aurora-borealis-choker",
    "price": 3200.0,
    "sku": "MS-NCK-002",
    "stock": 15,
    "status": "active",
    "created_at": "2026-03-09 10:45:00",
    "updated_at": "2026-03-09 10:45:00"
  }
}
```

---

### E. Update Product
- **Path:** `PUT /api/v1/products/{id}`
- **Description:** Updates product specifications and synchronizes stock with the inventory table in an ACID transaction.

```bash
curl -X PUT http://localhost:8000/api/v1/products/11 \
  -H "Content-Type: application/json" \
  -d '{
    "category_id": 1,
    "name": "Aurora Borealis Choker (Updated)",
    "slug": "aurora-borealis-choker",
    "description": "Natural iridescent beads woven on oxidized silver wire.",
    "short_description": "Iridescent beaded choker necklace.",
    "price": 3100,
    "compare_at_price": 3600,
    "sku": "MS-NCK-002",
    "stock": 20,
    "is_featured": true,
    "is_best_seller": false,
    "is_new": true,
    "status": "active"
  }'
```

#### Response (`HTTP 200 OK`):
```json
{
  "success": true,
  "message": "Product updated successfully",
  "data": {
    "id": 11,
    "name": "Aurora Borealis Choker (Updated)",
    "price": 3100.0,
    "stock": 20
  }
}
```

---

### F. Deactivate Product (Soft Deletion)
- **Path:** `DELETE /api/v1/products/{id}`
- **Description:** Safely sets `status = 'inactive'` to preserve historical orders and carts while removing the item from default catalog listings.

```bash
curl -X DELETE http://localhost:8000/api/v1/products/11
```

#### Response (`HTTP 200 OK`):
```json
{
  "success": true,
  "message": "Product deactivated successfully"
}
```

---

## 10. Validation & Error Handling

All requests are validated before database execution. If validation fails, an `HTTP 422 Unprocessable Entity` response is returned with explicit field-by-field error descriptions:

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "name": "Product Name is required",
    "price": "Price must be greater than or equal to 0",
    "slug": "Slug must be URL-friendly (lowercase alphanumeric characters separated by single hyphens, e.g. 'beaded-bracelets')"
  }
}
```

### Common HTTP Status Codes:
| Code | Status | Meaning |
| :--- | :--- | :--- |
| `200` | OK | Successful retrieval, update, or soft deletion |
| `201` | Created | Resource successfully created |
| `400` | Bad Request | Malformed JSON or invalid parameter types |
| `404` | Not Found | Target category, product, or slug does not exist |
| `405` | Method Not Allowed | HTTP method is not permitted on the endpoint |
| `409` | Conflict | Duplicate slug, duplicate SKU, or dependent record conflict |
| `422` | Unprocessable Entity | Payload failed semantic validation rules |
| `500` | Internal Server Error | Unexpected server error (logged securely) |
| `503` | Service Unavailable | Database connection unavailable |

---

## 11. Planned API Modules (Phase 4+)

The following modules will be incrementally introduced in subsequent phases:

| Endpoint Prefix | Module Description |
| :--- | :--- |
| `/api/v1/auth` | User registration, login, logout, password resets, session/JWT validation |
| `/api/v1/users` | Profile management, shipping addresses, customer management |
| `/api/v1/cart` | Persistent and guest cart management |
| `/api/v1/orders` | Checkout, order creation, order status history, customer receipts |
| `/api/v1/custom-orders` | Bespoke jewelry inquiries, customer specifications, quotation lifecycle |
| `/api/v1/media` | Image and reference uploads, asset management |

