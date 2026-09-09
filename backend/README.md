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

## 8. Planned API Modules (Phase 2+)

The following modules will be incrementally introduced in subsequent phases:

| Endpoint Prefix | Module Description |
| :--- | :--- |
| `/api/v1/auth` | User registration, login, logout, password resets, session/JWT validation |
| `/api/v1/users` | Profile management, shipping addresses, customer management |
| `/api/v1/categories` | Jewelry collection taxonomy (Rings, Necklaces, Bracelets, Earrings) |
| `/api/v1/products` | Catalog browsing, inventory tracking, specifications, price tiers |
| `/api/v1/cart` | Persistent and guest cart management |
| `/api/v1/orders` | Checkout, order creation, order status history, customer receipts |
| `/api/v1/custom-orders` | Bespoke jewelry inquiries, customer specifications, quotation lifecycle |
| `/api/v1/media` | Image and reference uploads, asset management |
