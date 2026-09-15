-- ==============================================================================
-- Maryam Sparkle - Complete Supabase PostgreSQL Schema & Migration
-- Architecture: React / Vite + Supabase Auth + PostgreSQL + Storage
-- Tables: profiles, categories, products, product_images, product_attributes,
--         inventory, addresses, carts, cart_items, orders, order_items,
--         payments, wishlists, reviews, coupons, custom_orders,
--         custom_order_images, contact_messages.
-- ==============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 1. PROFILES TABLE (Linked to Supabase auth.users)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    first_name TEXT,
    last_name TEXT,
    full_name TEXT,
    phone TEXT,
    role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

-- Profile trigger on Auth sign-up: NEVER trusts client raw_user_meta_data.role for admin privilege
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.profiles (
        id,
        email,
        full_name,
        first_name,
        last_name,
        phone,
        role,
        status
    )
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data->>'first_name', split_part(COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''), ' ', 1)),
        COALESCE(NEW.raw_user_meta_data->>'last_name', split_part(COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''), ' ', 2)),
        NEW.raw_user_meta_data->>'phone',
        'customer', -- Security: All client sign-ups are strictly customers. Admin must be granted via database
        'active'
    )
    ON CONFLICT (id) DO UPDATE
    SET
        email = EXCLUDED.email,
        full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
        updated_at = timezone('utc'::text, now());

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Secure Helper Function to check if calling user is an admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    );
$$;

-- Ensure calling users (authenticated and anonymous) can execute is_admin() in RLS policies
GRANT EXECUTE ON FUNCTION public.is_admin() TO anon, authenticated, service_role;

-- ==============================================================================
-- 2. CATEGORIES TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    image TEXT,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_categories_slug ON public.categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_status ON public.categories(status);

-- ==============================================================================
-- 3. PRODUCTS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    category_slug TEXT,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT NOT NULL DEFAULT '',
    short_description TEXT,
    price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
    compare_at_price NUMERIC(10, 2) CHECK (compare_at_price IS NULL OR compare_at_price >= 0),
    sku TEXT NOT NULL UNIQUE,
    stock INT NOT NULL DEFAULT 0 CHECK (stock >= 0),
    materials TEXT[] DEFAULT ARRAY[]::TEXT[],
    colors TEXT[] DEFAULT ARRAY[]::TEXT[],
    finish TEXT DEFAULT '18K Gold Plated',
    available_finishes TEXT[] DEFAULT ARRAY['18K Gold Plated', 'Silver', 'Rose Gold']::TEXT[],
    is_featured BOOLEAN NOT NULL DEFAULT false,
    is_best_seller BOOLEAN NOT NULL DEFAULT false,
    is_new BOOLEAN NOT NULL DEFAULT false,
    in_stock BOOLEAN NOT NULL DEFAULT true,
    care_instructions TEXT,
    tags TEXT[] DEFAULT ARRAY[]::TEXT[],
    rating NUMERIC(3, 2) DEFAULT 5.00,
    reviews_count INT NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'draft', 'archived')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_slug ON public.products(slug);
CREATE INDEX IF NOT EXISTS idx_products_status ON public.products(status);
CREATE INDEX IF NOT EXISTS idx_products_featured ON public.products(is_featured);
CREATE INDEX IF NOT EXISTS idx_products_best_seller ON public.products(is_best_seller);

-- ==============================================================================
-- 4. PRODUCT IMAGES TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.product_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    storage_path TEXT,
    sort_order INT NOT NULL DEFAULT 0,
    is_primary BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_product_images_product ON public.product_images(product_id);

-- ==============================================================================
-- 5. PRODUCT ATTRIBUTES TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.product_attributes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    attribute_name TEXT NOT NULL,
    attribute_value TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_product_attributes_product ON public.product_attributes(product_id);

-- ==============================================================================
-- 6. INVENTORY TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.inventory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL UNIQUE REFERENCES public.products(id) ON DELETE CASCADE,
    quantity INT NOT NULL DEFAULT 0 CHECK (quantity >= 0),
    low_stock_threshold INT NOT NULL DEFAULT 5,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ==============================================================================
-- 7. ADDRESSES TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.addresses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    label TEXT DEFAULT 'Home',
    full_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    address_line_1 TEXT NOT NULL,
    address_line_2 TEXT,
    city TEXT NOT NULL,
    state TEXT,
    postal_code TEXT,
    country TEXT NOT NULL DEFAULT 'Pakistan',
    is_default BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_addresses_user ON public.addresses(user_id);

-- ==============================================================================
-- 8. CARTS & CART ITEMS TABLES
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.carts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    guest_token TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_carts_user ON public.carts(user_id);
CREATE INDEX IF NOT EXISTS idx_carts_guest ON public.carts(guest_token);

CREATE TABLE IF NOT EXISTS public.cart_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cart_id UUID NOT NULL REFERENCES public.carts(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    quantity INT NOT NULL DEFAULT 1 CHECK (quantity > 0),
    size TEXT,
    finish TEXT,
    custom_note TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    UNIQUE(cart_id, product_id, size, finish)
);

CREATE INDEX IF NOT EXISTS idx_cart_items_cart ON public.cart_items(cart_id);

-- ==============================================================================
-- 9. ORDERS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number TEXT NOT NULL UNIQUE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    subtotal NUMERIC(10, 2) NOT NULL CHECK (subtotal >= 0),
    shipping_fee NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (shipping_fee >= 0),
    discount NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (discount >= 0),
    coupon_code TEXT,
    total NUMERIC(10, 2) NOT NULL CHECK (total >= 0),
    status TEXT NOT NULL DEFAULT 'placed' CHECK (status IN ('placed', 'confirmed', 'processing', 'shipped', 'out_for_delivery', 'delivered', 'cancelled')),
    payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
    payment_method TEXT NOT NULL DEFAULT 'cod' CHECK (payment_method IN ('cod', 'easypaisa', 'jazzcash', 'bank_transfer')),
    shipping_address JSONB NOT NULL DEFAULT '{}'::jsonb,
    delivery_method TEXT NOT NULL DEFAULT 'standard' CHECK (delivery_method IN ('standard', 'express', 'overnight', 'international')),
    courier_name TEXT DEFAULT 'Trax Logistics',
    tracking_number TEXT,
    estimated_delivery TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_orders_number ON public.orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_user ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON public.orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at);

-- ==============================================================================
-- 10. ORDER ITEMS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    product_name TEXT NOT NULL,
    product_slug TEXT,
    product_image TEXT,
    sku TEXT,
    quantity INT NOT NULL CHECK (quantity > 0),
    unit_price NUMERIC(10, 2) NOT NULL CHECK (unit_price >= 0),
    subtotal NUMERIC(10, 2) NOT NULL CHECK (subtotal >= 0),
    size TEXT,
    finish TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_order_items_order ON public.order_items(order_id);

-- ==============================================================================
-- 11. PAYMENTS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    transaction_reference TEXT,
    proof_of_payment_path TEXT,
    proof_of_payment_url TEXT,
    amount NUMERIC(10, 2) NOT NULL CHECK (amount >= 0),
    method TEXT NOT NULL CHECK (method IN ('cod', 'easypaisa', 'jazzcash', 'bank_transfer')),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'failed', 'refunded')),
    paid_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_payments_order ON public.payments(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_txn ON public.payments(transaction_reference);

-- ==============================================================================
-- 12. WISHLISTS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.wishlists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    UNIQUE(user_id, product_id)
);

CREATE INDEX IF NOT EXISTS idx_wishlists_user ON public.wishlists(user_id);

-- ==============================================================================
-- 13. REVIEWS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    user_name TEXT NOT NULL,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title TEXT,
    comment TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'approved' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_reviews_product ON public.reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_status ON public.reviews(status);

-- ==============================================================================
-- 14. COUPONS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.coupons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT NOT NULL UNIQUE,
    description TEXT,
    discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
    discount_value NUMERIC(10, 2) NOT NULL CHECK (discount_value >= 0),
    minimum_order_amount NUMERIC(10, 2) DEFAULT 0,
    maximum_discount NUMERIC(10, 2),
    starts_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    usage_limit INT,
    used_count INT NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_coupons_code ON public.coupons(code);

-- ==============================================================================
-- 15. CUSTOM ORDERS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.custom_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    customer_name TEXT NOT NULL,
    customer_email TEXT,
    customer_phone TEXT NOT NULL,
    jewelry_type TEXT NOT NULL,
    wrist_size TEXT,
    metal_finish TEXT,
    preferred_stones TEXT[] DEFAULT ARRAY[]::TEXT[],
    initials_or_word TEXT,
    budget_range TEXT,
    special_notes TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewing', 'quoted', 'approved', 'in_progress', 'completed', 'cancelled')),
    quote_amount NUMERIC(10, 2),
    admin_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_custom_orders_user ON public.custom_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_custom_orders_status ON public.custom_orders(status);

-- ==============================================================================
-- 16. CUSTOM ORDER IMAGES TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.custom_order_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    custom_order_id UUID NOT NULL REFERENCES public.custom_orders(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    storage_path TEXT,
    original_filename TEXT,
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_custom_order_images_order ON public.custom_order_images(custom_order_id);

-- ==============================================================================
-- 17. CONTACT MESSAGES TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.contact_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    subject TEXT,
    message TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'unread' CHECK (status IN ('unread', 'read', 'replied', 'archived')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_contact_messages_status ON public.contact_messages(status);

-- ==============================================================================
-- 18. STORE SETTINGS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.store_settings (
    id TEXT PRIMARY KEY DEFAULT 'default',
    settings JSONB NOT NULL DEFAULT '{}'::jsonb,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ==============================================================================
-- SECURE SERVER-SIDE ORDER CREATION FUNCTION (RPC)
-- Prevents price manipulation, stock race conditions, and partial orders.
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.place_order(payload JSONB)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_order_id UUID;
    v_order_number TEXT;
    v_user_id UUID;
    v_customer_name TEXT;
    v_customer_email TEXT;
    v_customer_phone TEXT;
    v_delivery_method TEXT;
    v_payment_method TEXT;
    v_txn_ref TEXT;
    v_proof_path TEXT;
    v_notes TEXT;
    v_coupon_code TEXT;
    v_shipping_fee NUMERIC(10, 2) := 200.00;
    v_discount NUMERIC(10, 2) := 0.00;
    v_subtotal NUMERIC(10, 2) := 0.00;
    v_total NUMERIC(10, 2) := 0.00;
    v_item JSONB;
    v_product RECORD;
    v_coupon RECORD;
    v_item_qty INT;
    v_item_price NUMERIC(10, 2);
    v_item_subtotal NUMERIC(10, 2);
BEGIN
    -- 1. Extract and sanitize inputs
    v_customer_name := TRIM(COALESCE(payload->'customer'->>'fullName', payload->'customer'->>'name', 'Valued Patron'));
    v_customer_email := LOWER(TRIM(COALESCE(payload->'customer'->>'email', '')));
    v_customer_phone := REGEXP_REPLACE(COALESCE(payload->'customer'->>'phone', ''), '\\s+', '', 'g');
    v_delivery_method := COALESCE(payload->>'deliveryMethod', payload->'deliveryMethod'->>'id', 'standard');
    v_payment_method := COALESCE(payload->>'paymentMethod', payload->'paymentMethod'->>'id', 'cod');
    v_txn_ref := NULLIF(TRIM(COALESCE(payload->>'transactionReference', '')), '');
    v_proof_path := NULLIF(TRIM(COALESCE(payload->>'proofOfPaymentUrl', payload->>'proofOfPaymentPath', '')), '');
    v_notes := NULLIF(TRIM(COALESCE(payload->>'notes', '')), '');
    v_coupon_code := NULLIF(UPPER(TRIM(COALESCE(payload->>'couponCode', ''))), '');

    -- Enforce authentic user ID from auth context (cannot be spoofed by client payload)
    v_user_id := auth.uid();

    -- Validate items array
    IF payload->'items' IS NULL OR jsonb_array_length(payload->'items') = 0 THEN
        RAISE EXCEPTION 'Your order must contain at least one item.';
    END IF;

    -- Validate non-COD payments require transaction reference & proof
    IF v_payment_method IN ('easypaisa', 'jazzcash', 'bank_transfer') THEN
        IF v_txn_ref IS NULL THEN
            RAISE EXCEPTION 'Transaction reference is required for digital payments.';
        END IF;
    END IF;

    -- Generate unique order number (MS-XXXX)
    v_order_number := 'MS-' || FLOOR(1000 + RANDOM() * 9000)::INT::TEXT;

    -- 2. Validate products, prices, and stock from authoritative database records
    FOR v_item IN SELECT * FROM jsonb_array_elements(payload->'items')
    LOOP
        v_item_qty := COALESCE((v_item->>'quantity')::INT, 1);
        IF v_item_qty <= 0 THEN
            RAISE EXCEPTION 'Item quantity must be greater than zero.';
        END IF;

        -- Look up product strictly in public.products table
        SELECT * INTO v_product FROM public.products
        WHERE id::TEXT = (v_item->'product'->>'id')
           OR id::TEXT = (v_item->>'productId')
           OR slug = (v_item->'product'->>'slug')
           OR slug = (v_item->>'productSlug')
        LIMIT 1;

        IF NOT FOUND THEN
            RAISE EXCEPTION 'Product % is not available in our catalog.', COALESCE(v_item->'product'->>'name', v_item->>'productName', v_item->>'productSlug', 'Item');
        END IF;

        IF NOT v_product.is_active THEN
            RAISE EXCEPTION 'Product "%" is currently unavailable.', v_product.name;
        END IF;

        IF v_product.stock < v_item_qty THEN
            RAISE EXCEPTION 'Insufficient stock for "%". Requested: %, in stock: %.', v_product.name, v_item_qty, v_product.stock;
        END IF;

        -- Authoritative price strictly from database record
        v_item_price := v_product.price;

        -- Decrement stock and update inventory atomically
        UPDATE public.products
        SET stock = GREATEST(0, stock - v_item_qty),
            in_stock = (stock - v_item_qty > 0)
        WHERE id = v_product.id;

        UPDATE public.inventory
        SET quantity = GREATEST(0, quantity - v_item_qty)
        WHERE product_id = v_product.id;

        v_item_subtotal := v_item_price * v_item_qty;
        v_subtotal := v_subtotal + v_item_subtotal;
    END LOOP;

    -- 3. Calculate authoritative shipping fee
    IF v_delivery_method = 'express' THEN
        v_shipping_fee := 350.00;
    ELSIF v_subtotal >= 3000.00 THEN
        v_shipping_fee := 0.00;
    ELSE
        v_shipping_fee := 200.00;
    END IF;

    -- 4. Calculate authoritative coupon discount if provided
    IF v_coupon_code IS NOT NULL THEN
        SELECT * INTO v_coupon FROM public.coupons
        WHERE UPPER(code) = v_coupon_code AND status = 'active'
        LIMIT 1;

        IF NOT FOUND THEN
            RAISE EXCEPTION 'Invalid or inactive coupon code: %', v_coupon_code;
        END IF;

        IF v_coupon.starts_at IS NOT NULL AND v_coupon.starts_at > now() THEN
            RAISE EXCEPTION 'Coupon code % is not active yet.', v_coupon_code;
        END IF;

        IF v_coupon.expires_at IS NOT NULL AND v_coupon.expires_at < now() THEN
            RAISE EXCEPTION 'Coupon code % has expired.', v_coupon_code;
        END IF;

        IF v_coupon.usage_limit IS NOT NULL AND v_coupon.used_count >= v_coupon.usage_limit THEN
            RAISE EXCEPTION 'Coupon code % has reached its maximum usage limit.', v_coupon_code;
        END IF;

        IF v_coupon.minimum_order_amount IS NOT NULL AND v_subtotal < v_coupon.minimum_order_amount THEN
            RAISE EXCEPTION 'Coupon code % requires a minimum order amount of Rs. %.', v_coupon_code, v_coupon.minimum_order_amount;
        END IF;

        IF v_coupon.discount_type = 'percentage' THEN
            v_discount := ROUND((v_subtotal * (v_coupon.discount_value / 100.0)), 2);
            IF v_coupon.maximum_discount IS NOT NULL AND v_discount > v_coupon.maximum_discount THEN
                v_discount := v_coupon.maximum_discount;
            END IF;
        ELSE
            v_discount := LEAST(v_subtotal, v_coupon.discount_value);
        END IF;

        -- Atomically increment coupon usage
        UPDATE public.coupons
        SET used_count = used_count + 1
        WHERE id = v_coupon.id;
    END IF;

    -- 5. Authoritatively calculate verified total
    v_total := GREATEST(0, (v_subtotal - v_discount) + v_shipping_fee);

    -- 6. Insert Order record
    INSERT INTO public.orders (
        order_number,
        user_id,
        customer_name,
        customer_email,
        customer_phone,
        subtotal,
        shipping_fee,
        discount,
        coupon_code,
        total,
        status,
        payment_status,
        payment_method,
        shipping_address,
        delivery_method,
        notes
    )
    VALUES (
        v_order_number,
        v_user_id,
        v_customer_name,
        v_customer_email,
        v_customer_phone,
        v_subtotal,
        v_shipping_fee,
        v_discount,
        v_coupon_code,
        v_total,
        'placed',
        'pending',
        v_payment_method,
        COALESCE(payload->'shippingAddress', '{}'::jsonb),
        v_delivery_method,
        v_notes
    )
    RETURNING id INTO v_order_id;

    -- 7. Insert Order Items records with authoritative values
    FOR v_item IN SELECT * FROM jsonb_array_elements(payload->'items')
    LOOP
        v_item_qty := COALESCE((v_item->>'quantity')::INT, 1);
        IF v_item_qty <= 0 THEN v_item_qty := 1; END IF;

        SELECT * INTO v_product FROM public.products
        WHERE id::TEXT = (v_item->'product'->>'id')
           OR id::TEXT = (v_item->>'productId')
           OR slug = (v_item->'product'->>'slug')
           OR slug = (v_item->>'productSlug')
        LIMIT 1;

        v_item_price := v_product.price;

        INSERT INTO public.order_items (
            order_id,
            product_id,
            product_name,
            product_slug,
            product_image,
            sku,
            quantity,
            unit_price,
            subtotal,
            size,
            finish
        )
        VALUES (
            v_order_id,
            v_product.id,
            v_product.name,
            v_product.slug,
            COALESCE(v_item->'product'->>'image', v_item->>'image', ''),
            COALESCE(v_product.sku, 'MS-ARTISAN'),
            v_item_qty,
            v_item_price,
            v_item_price * v_item_qty,
            COALESCE(v_item->>'selectedSize', v_item->>'size', 'Medium (6.5")'),
            COALESCE(v_item->>'selectedFinish', v_item->>'finish', '18K Gold Plated')
        );
    END LOOP;

    -- 8. Insert Payment Record
    INSERT INTO public.payments (
        order_id,
        transaction_reference,
        proof_of_payment_path,
        proof_of_payment_url,
        amount,
        method,
        status
    )
    VALUES (
        v_order_id,
        v_txn_ref,
        v_proof_path,
        v_proof_path,
        v_total,
        v_payment_method,
        'pending'
    );

    -- 9. Return synthesized result with complete authoritative order details
    RETURN jsonb_build_object(
        'success', true,
        'order_id', v_order_id,
        'order_number', v_order_number,
        'subtotal', v_subtotal,
        'shipping_fee', v_shipping_fee,
        'discount', v_discount,
        'total', v_total,
        'status', 'placed',
        'payment_status', 'pending',
        'created_at', timezone('utc'::text, now()),
        'order', jsonb_build_object(
            'id', v_order_id,
            'order_number', v_order_number,
            'customer_name', v_customer_name,
            'customer_email', v_customer_email,
            'customer_phone', v_customer_phone,
            'subtotal', v_subtotal,
            'shipping_fee', v_shipping_fee,
            'discount', v_discount,
            'coupon_code', v_coupon_code,
            'total', v_total,
            'status', 'placed',
            'payment_status', 'pending',
            'payment_method', v_payment_method,
            'shipping_address', COALESCE(payload->'shippingAddress', '{}'::jsonb),
            'delivery_method', v_delivery_method,
            'notes', v_notes,
            'created_at', timezone('utc'::text, now())
        )
    );
END;
$$;

REVOKE ALL ON FUNCTION public.place_order(JSONB) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.place_order(JSONB) TO anon, authenticated, service_role;

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- Enable RLS on all 18 tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_attributes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_order_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

-- 1. Profiles Policies
DROP POLICY IF EXISTS "Profiles are readable by authenticated users or admin" ON public.profiles;
CREATE POLICY "Profiles are readable by owner or admin"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id OR public.is_admin());

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile"
    ON public.profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id OR public.is_admin())
    WITH CHECK (
        -- Regular customers cannot escalate their role to admin
        (public.is_admin()) OR (auth.uid() = id AND role = 'customer')
    );

-- 2. Categories Policies (Public Read, Admin Write)
DROP POLICY IF EXISTS "Categories are readable by everyone" ON public.categories;
CREATE POLICY "Categories are readable by everyone"
    ON public.categories FOR SELECT
    USING (status = 'active' OR public.is_admin());

DROP POLICY IF EXISTS "Admins can manage categories" ON public.categories;
CREATE POLICY "Admins can manage categories"
    ON public.categories FOR ALL
    USING (public.is_admin());

-- 3. Products & Images & Attributes Policies (Public Read, Admin Write)
DROP POLICY IF EXISTS "Active products are readable by everyone" ON public.products;
CREATE POLICY "Active products are readable by everyone"
    ON public.products FOR SELECT
    USING (status = 'active' OR public.is_admin());

DROP POLICY IF EXISTS "Admins can manage products" ON public.products;
CREATE POLICY "Admins can manage products"
    ON public.products FOR ALL
    USING (public.is_admin());

DROP POLICY IF EXISTS "Product images are readable by everyone" ON public.product_images;
CREATE POLICY "Product images are readable by everyone"
    ON public.product_images FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Admins can manage product images" ON public.product_images;
CREATE POLICY "Admins can manage product images"
    ON public.product_images FOR ALL
    USING (public.is_admin());

DROP POLICY IF EXISTS "Product attributes are readable by everyone" ON public.product_attributes;
CREATE POLICY "Product attributes are readable by everyone"
    ON public.product_attributes FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Admins can manage product attributes" ON public.product_attributes;
CREATE POLICY "Admins can manage product attributes"
    ON public.product_attributes FOR ALL
    USING (public.is_admin());

DROP POLICY IF EXISTS "Inventory is readable by everyone" ON public.inventory;
CREATE POLICY "Inventory is readable by everyone"
    ON public.inventory FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Admins can manage inventory" ON public.inventory;
CREATE POLICY "Admins can manage inventory"
    ON public.inventory FOR ALL
    USING (public.is_admin());

-- 4. Addresses Policies (Customer own, Guest checkout insert, Admin manage)
DROP POLICY IF EXISTS "Users can manage their own addresses" ON public.addresses;
CREATE POLICY "Users can manage their own addresses"
    ON public.addresses FOR SELECT
    USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "Allow guest and user address inserts" ON public.addresses;
CREATE POLICY "Allow guest and user address inserts"
    ON public.addresses FOR INSERT
    WITH CHECK (user_id IS NULL OR auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "Users can update their own addresses" ON public.addresses;
CREATE POLICY "Users can update their own addresses"
    ON public.addresses FOR UPDATE
    USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "Users can delete their own addresses" ON public.addresses;
CREATE POLICY "Users can delete their own addresses"
    ON public.addresses FOR DELETE
    USING (auth.uid() = user_id OR public.is_admin());

-- 5. Carts Policies (User & Guest cart management)
DROP POLICY IF EXISTS "Users and guests can read their cart" ON public.carts;
CREATE POLICY "Users and guests can read their cart"
    ON public.carts FOR SELECT
    USING (auth.uid() = user_id OR guest_token IS NOT NULL OR public.is_admin());

DROP POLICY IF EXISTS "Users and guests can insert cart" ON public.carts;
CREATE POLICY "Users and guests can insert cart"
    ON public.carts FOR INSERT
    WITH CHECK (auth.uid() = user_id OR guest_token IS NOT NULL OR public.is_admin());

DROP POLICY IF EXISTS "Users and guests can update cart" ON public.carts;
CREATE POLICY "Users and guests can update cart"
    ON public.carts FOR UPDATE
    USING (auth.uid() = user_id OR guest_token IS NOT NULL OR public.is_admin());

DROP POLICY IF EXISTS "Cart items manage" ON public.cart_items;
CREATE POLICY "Cart items manage"
    ON public.cart_items FOR ALL
    USING (true);

-- 6. Orders & Order Items Policies (Customers see own, Admins see all; Guest tracking via track_guest_order RPC; Creation via place_order RPC)
DROP POLICY IF EXISTS "Users can view their own orders or track order" ON public.orders;
DROP POLICY IF EXISTS "orders_own_read" ON public.orders;
CREATE POLICY "orders_own_read"
    ON public.orders FOR SELECT
    USING (
        (user_id IS NOT NULL AND auth.uid() = user_id)
        OR public.is_admin()
    );

DROP POLICY IF EXISTS "Anyone can place an order" ON public.orders;
DROP POLICY IF EXISTS "orders_admin_insert" ON public.orders;
CREATE POLICY "orders_admin_insert"
    ON public.orders FOR INSERT
    WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can update orders" ON public.orders;
DROP POLICY IF EXISTS "orders_admin_update" ON public.orders;
CREATE POLICY "orders_admin_update"
    ON public.orders FOR UPDATE
    USING (public.is_admin());

DROP POLICY IF EXISTS "orders_admin_delete" ON public.orders;
CREATE POLICY "orders_admin_delete"
    ON public.orders FOR DELETE
    USING (public.is_admin());

DROP POLICY IF EXISTS "Order items readable" ON public.order_items;
DROP POLICY IF EXISTS "order_items_own_read" ON public.order_items;
CREATE POLICY "order_items_own_read"
    ON public.order_items FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.orders o
            WHERE o.id = order_items.order_id
            AND ((o.user_id IS NOT NULL AND o.user_id = auth.uid()) OR public.is_admin())
        )
    );

DROP POLICY IF EXISTS "Order items insertable" ON public.order_items;
DROP POLICY IF EXISTS "order_items_admin_insert" ON public.order_items;
CREATE POLICY "order_items_admin_insert"
    ON public.order_items FOR INSERT
    WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "order_items_admin_update" ON public.order_items;
CREATE POLICY "order_items_admin_update"
    ON public.order_items FOR UPDATE
    USING (public.is_admin());

DROP POLICY IF EXISTS "order_items_admin_delete" ON public.order_items;
CREATE POLICY "order_items_admin_delete"
    ON public.order_items FOR DELETE
    USING (public.is_admin());

-- 7. Payments Policies (Secure, Non-public)
DROP POLICY IF EXISTS "Payments readable by order owner or admin" ON public.payments;
DROP POLICY IF EXISTS "payments_own_read" ON public.payments;
CREATE POLICY "payments_own_read"
    ON public.payments FOR SELECT
    USING (
        public.is_admin()
        OR EXISTS (
            SELECT 1 FROM public.orders o
            WHERE o.id = payments.order_id
            AND (o.user_id IS NOT NULL AND o.user_id = auth.uid())
        )
    );

DROP POLICY IF EXISTS "Anyone can create payment record on checkout" ON public.payments;
DROP POLICY IF EXISTS "payments_admin_insert" ON public.payments;
CREATE POLICY "payments_admin_insert"
    ON public.payments FOR INSERT
    WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can update payment status" ON public.payments;
DROP POLICY IF EXISTS "payments_admin_update" ON public.payments;
CREATE POLICY "payments_admin_update"
    ON public.payments FOR UPDATE
    USING (public.is_admin());

DROP POLICY IF EXISTS "payments_admin_delete" ON public.payments;
CREATE POLICY "payments_admin_delete"
    ON public.payments FOR DELETE
    USING (public.is_admin());

-- 8. Wishlists Policies
DROP POLICY IF EXISTS "Users can manage their wishlist" ON public.wishlists;
CREATE POLICY "Users can manage their wishlist"
    ON public.wishlists FOR ALL
    USING (auth.uid() = user_id);

-- 9. Reviews Policies (Approved reviews public, customers create, admin manage)
DROP POLICY IF EXISTS "Approved reviews are readable by everyone" ON public.reviews;
CREATE POLICY "Approved reviews are readable by everyone"
    ON public.reviews FOR SELECT
    USING (status = 'approved' OR public.is_admin() OR auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create reviews" ON public.reviews;
CREATE POLICY "Users can create reviews"
    ON public.reviews FOR INSERT
    WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can update reviews" ON public.reviews;
CREATE POLICY "Admins can update reviews"
    ON public.reviews FOR UPDATE
    USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can delete reviews" ON public.reviews;
CREATE POLICY "Admins can delete reviews"
    ON public.reviews FOR DELETE
    USING (public.is_admin());

-- 10. Coupons Policies (Active public, admin manage)
DROP POLICY IF EXISTS "Active coupons are readable by everyone" ON public.coupons;
CREATE POLICY "Active coupons are readable by everyone"
    ON public.coupons FOR SELECT
    USING (status = 'active' OR public.is_admin());

DROP POLICY IF EXISTS "Admins can manage coupons" ON public.coupons;
CREATE POLICY "Admins can manage coupons"
    ON public.coupons FOR ALL
    USING (public.is_admin());

-- 11. Custom Orders Policies
DROP POLICY IF EXISTS "Anyone can submit custom orders" ON public.custom_orders;
CREATE POLICY "Anyone can submit custom orders"
    ON public.custom_orders FOR INSERT
    WITH CHECK (true);

DROP POLICY IF EXISTS "Users can view their custom orders or admin can view all" ON public.custom_orders;
CREATE POLICY "Users can view their custom orders or admin can view all"
    ON public.custom_orders FOR SELECT
    USING (auth.uid() = user_id OR user_id IS NULL OR public.is_admin());

DROP POLICY IF EXISTS "Admins can manage custom orders" ON public.custom_orders;
CREATE POLICY "Admins can manage custom orders"
    ON public.custom_orders FOR UPDATE
    USING (public.is_admin());

DROP POLICY IF EXISTS "Custom order images insertable" ON public.custom_order_images;
CREATE POLICY "Custom order images insertable"
    ON public.custom_order_images FOR INSERT
    WITH CHECK (true);

DROP POLICY IF EXISTS "Custom order images readable" ON public.custom_order_images;
CREATE POLICY "Custom order images readable"
    ON public.custom_order_images FOR SELECT
    USING (
        public.is_admin()
        OR EXISTS (
            SELECT 1 FROM public.custom_orders co
            WHERE co.id = custom_order_images.custom_order_id
            AND (co.user_id = auth.uid() OR co.user_id IS NULL)
        )
    );

-- 12. Contact Messages Policies
DROP POLICY IF EXISTS "Anyone can submit contact messages" ON public.contact_messages;
CREATE POLICY "Anyone can submit contact messages"
    ON public.contact_messages FOR INSERT
    WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can view and manage contact messages" ON public.contact_messages;
CREATE POLICY "Admins can view and manage contact messages"
    ON public.contact_messages FOR ALL
    USING (public.is_admin());

-- 13. Store Settings Policies (Public readable, Admins manage)
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Store settings are readable by everyone" ON public.store_settings;
CREATE POLICY "Store settings are readable by everyone"
    ON public.store_settings FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Admins can update store settings" ON public.store_settings;
CREATE POLICY "Admins can update store settings"
    ON public.store_settings FOR ALL
    USING (public.is_admin());

-- ==============================================================================
-- SUPABASE STORAGE BUCKETS SETUP & SECURITY
-- ==============================================================================

-- 1. Create Buckets: products (public), payment-proofs (private), custom-orders (private)
INSERT INTO storage.buckets (id, name, public)
VALUES 
    ('products', 'products', true),
    ('payment-proofs', 'payment-proofs', false),
    ('custom-orders', 'custom-orders', false)
ON CONFLICT (id) DO UPDATE SET 
    public = EXCLUDED.public;

-- 2. Storage Policies: Products Bucket (Public View, Admin Write)
DROP POLICY IF EXISTS "Public Read Products Bucket" ON storage.objects;
CREATE POLICY "Public Read Products Bucket"
ON storage.objects FOR SELECT
USING (bucket_id = 'products');

DROP POLICY IF EXISTS "Admins can upload to products bucket" ON storage.objects;
CREATE POLICY "Admins can upload to products bucket"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'products' AND (public.is_admin() OR auth.role() = 'authenticated'));

DROP POLICY IF EXISTS "Admins can delete products storage objects" ON storage.objects;
CREATE POLICY "Admins can delete products storage objects"
ON storage.objects FOR DELETE
USING (bucket_id = 'products' AND public.is_admin());

-- 3. Storage Policies: Payment Proofs Bucket (Private, Checkout Upload, Admin View)
DROP POLICY IF EXISTS "Anyone can upload payment proof during checkout" ON storage.objects;
CREATE POLICY "Anyone can upload payment proof during checkout"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'payment-proofs');

DROP POLICY IF EXISTS "Admins can view payment proofs" ON storage.objects;
CREATE POLICY "Admins can view payment proofs"
ON storage.objects FOR SELECT
USING (bucket_id = 'payment-proofs' AND (public.is_admin() OR auth.role() = 'authenticated'));

DROP POLICY IF EXISTS "Admins can delete payment proofs" ON storage.objects;
CREATE POLICY "Admins can delete payment proofs"
ON storage.objects FOR DELETE
USING (bucket_id = 'payment-proofs' AND public.is_admin());

-- 4. Storage Policies: Custom Orders Bucket (Private, User Upload, Admin View)
DROP POLICY IF EXISTS "Anyone can upload custom order reference images" ON storage.objects;
CREATE POLICY "Anyone can upload custom order reference images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'custom-orders');

DROP POLICY IF EXISTS "Admins and owners can view custom order images" ON storage.objects;
CREATE POLICY "Admins and owners can view custom order images"
ON storage.objects FOR SELECT
USING (bucket_id = 'custom-orders' AND (public.is_admin() OR auth.role() = 'authenticated'));

DROP POLICY IF EXISTS "Admins can delete custom order storage objects" ON storage.objects;
CREATE POLICY "Admins can delete custom order storage objects"
ON storage.objects FOR DELETE
USING (bucket_id = 'custom-orders' AND public.is_admin());

-- ==============================================================================
-- INITIAL CATALOG SEED DATA (Maryam Sparkle)
-- ==============================================================================

-- Categories Seed
INSERT INTO public.categories (id, name, slug, description, image, status, sort_order)
VALUES
    ('c1111111-1111-1111-1111-111111111111', 'Bracelets', 'bracelets', 'Handcrafted beaded bracelets, gemstone stretch stacks, and charm wristlets.', 'https://images.unsplash.com/photo-1611591475819-797de2338ec8?w=800&auto=format&fit=crop&q=80', 'active', 1),
    ('c2222222-2222-2222-2222-222222222222', 'Necklaces', 'necklaces', 'Delicate beaded chokers, freshwater pearl necklaces, and layered statement chains.', 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&auto=format&fit=crop&q=80', 'active', 2),
    ('c3333333-3333-3333-3333-333333333333', 'Anklets', 'anklets', 'Waterproof cord and beaded summer anklets with golden charms and bells.', 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&auto=format&fit=crop&q=80', 'active', 3),
    ('c4444444-4444-4444-4444-444444444444', 'Rings', 'rings', 'Stretch beaded gemstone rings and delicate gold-tone wire wrapped bands.', 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&auto=format&fit=crop&q=80', 'active', 4),
    ('c5555555-5555-5555-5555-555555555555', 'Earrings', 'earrings', 'Lightweight beaded drops, freshwater pearl studs, and colorful artisan hoops.', 'https://images.unsplash.com/photo-1630019852942-f89202989a59?w=800&auto=format&fit=crop&q=80', 'active', 5),
    ('c6666666-6666-6666-6666-666666666666', 'Custom Pieces', 'custom-pieces', 'Personalized name initials, birthstone charms, and bespoke handcrafted designs.', 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&auto=format&fit=crop&q=80', 'active', 6)
ON CONFLICT (slug) DO UPDATE
SET name = EXCLUDED.name, description = EXCLUDED.description, image = EXCLUDED.image;

-- Coupons Seed
INSERT INTO public.coupons (code, description, discount_type, discount_value, minimum_order_amount, maximum_discount, status, usage_limit, used_count)
VALUES
    ('SPARKLE10', '10% off on your handcrafted jewelry order (minimum Rs. 1,500)', 'percentage', 10.00, 1500.00, 1000.00, 'active', 500, 0),
    ('MARYAM500', 'Rs. 500 flat discount on orders over Rs. 4,000', 'fixed', 500.00, 4000.00, NULL, 'active', 500, 0)
ON CONFLICT (code) DO UPDATE
SET description = EXCLUDED.description,
    discount_type = EXCLUDED.discount_type,
    discount_value = EXCLUDED.discount_value,
    minimum_order_amount = EXCLUDED.minimum_order_amount,
    maximum_discount = EXCLUDED.maximum_discount,
    status = EXCLUDED.status;

-- Grant SELECT on coupons to anon & authenticated
GRANT SELECT ON public.coupons TO anon, authenticated;

-- Function to seed/migrate the product catalog idempotently
CREATE OR REPLACE FUNCTION public.seed_product_catalog()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_bracelets_id UUID;
    v_anklets_id UUID;
    v_necklaces_id UUID;
    v_earrings_id UUID;
    v_rings_id UUID;
    v_custom_id UUID;
    v_prod_id UUID;
BEGIN
    SELECT id INTO v_bracelets_id FROM public.categories WHERE slug = 'bracelets' LIMIT 1;
    SELECT id INTO v_anklets_id FROM public.categories WHERE slug = 'anklets' LIMIT 1;
    SELECT id INTO v_necklaces_id FROM public.categories WHERE slug = 'necklaces' LIMIT 1;
    SELECT id INTO v_earrings_id FROM public.categories WHERE slug = 'earrings' LIMIT 1;
    SELECT id INTO v_rings_id FROM public.categories WHERE slug = 'rings' LIMIT 1;
    SELECT id INTO v_custom_id FROM public.categories WHERE slug = 'custom-pieces' LIMIT 1;

    -- 1. Celestial Pearl Charm Bracelet
    INSERT INTO public.products (
        slug, category_id, category_slug, name, sku, description, short_description,
        price, compare_at_price, stock, materials, colors, finish, available_finishes,
        is_featured, is_best_seller, is_new, in_stock, rating, reviews_count, tags,
        care_instructions, status
    ) VALUES (
        'celestial-pearl-charm-bracelet', v_bracelets_id, 'bracelets',
        'Celestial Pearl Charm Bracelet', 'MS-BR-001',
        'A dreamy handcrafted bracelet featuring luminous imitation freshwater pearls, iridescent glass seed beads, and dainty gold-tone star and moon charms. Fitted with a secure lobster clasp and extension chain for a comfortable fit.',
        'Imitation freshwater pearls with gold-tone celestial star charms and adjustable chain.',
        1850.00, 2200.00, 12,
        ARRAY['Beads', 'Charms', 'Gold-Tone Hardware', 'Chain'],
        ARRAY['Pearl White', 'Gold'],
        'Gold-Tone', ARRAY['Gold-Tone', 'Silver-Tone'],
        true, true, false, true, 4.9, 38,
        ARRAY['Bestseller', 'Pearl', 'Celestial', 'Bracelet', 'Handmade', 'Beaded Bracelet'],
        'Avoid direct contact with perfumes, lotions, and water. Store in the provided pouch.',
        'active'
    )
    ON CONFLICT (slug) DO UPDATE SET
        name = EXCLUDED.name, price = EXCLUDED.price, compare_at_price = EXCLUDED.compare_at_price,
        stock = EXCLUDED.stock, in_stock = EXCLUDED.in_stock, description = EXCLUDED.description,
        short_description = EXCLUDED.short_description, category_id = EXCLUDED.category_id,
        category_slug = EXCLUDED.category_slug
    RETURNING id INTO v_prod_id;

    DELETE FROM public.product_images WHERE product_id = v_prod_id;
    INSERT INTO public.product_images (product_id, image_url, is_primary, sort_order) VALUES
        (v_prod_id, 'https://lh3.googleusercontent.com/aida-public/AB6AXuDmeq-VwhiU435DetS1X3uFs7ftPFTXuoNQPezkt-FDdS5fVi-fWgAQ_3PvJaDU9x4xRw9sw7ru1NTVm_zs5SnnAjgi_E2wg681wIyMw8JV9vSVAfWYzcpF2UkfNK-BMxse2gjK2A1h8e3yxiOCNiD2WAJBuG3Iw-g3MZVUEn1s8s125YRifRsnzPAXqmvTSBCjOEOnUJwZJOSA8TQuT8SgzakSJP9LOMTUZ0VMg55dfVKNyPJBWwEe', true, 0),
        (v_prod_id, 'https://lh3.googleusercontent.com/aida-public/AB6AXuCym3c_VwqfMRpy3_4MFdu0SCPKfw5QcUU-EbMuf55Oi94gxmhoTK6DvIC9NqkyPrnut8FPQBvd9WbDwUMsdZ9daYCP0CEBw5n33CNNUg9Vf6Fewmrujse_GE-rIRWzfZCFbyHwSHJtFNsGE_sSprb1cpDADr9k1-_yCfeDaJG-ama0UAUP6afCNEvDh6unWvuAdhVdPq_tf06BMovavShLoOA0P9QvacYnLf7NQ8S0oIx-JbomFEdZ', false, 1);

    INSERT INTO public.inventory (product_id, sku, quantity, reserved_quantity, low_stock_threshold)
    VALUES (v_prod_id, 'MS-BR-001', 12, 0, 3)
    ON CONFLICT (product_id) DO UPDATE SET quantity = EXCLUDED.quantity;

    -- 2. Sunset Amber Beaded Bracelet
    INSERT INTO public.products (
        slug, category_id, category_slug, name, sku, description, short_description,
        price, compare_at_price, stock, materials, colors, finish, available_finishes,
        is_featured, is_best_seller, is_new, in_stock, rating, reviews_count, tags,
        care_instructions, status
    ) VALUES (
        'sunset-amber-beaded-bracelet', v_bracelets_id, 'bracelets',
        'Sunset Amber Beaded Bracelet', 'MS-BR-002',
        'Rich warm tones inspired by golden hour skies. Features faceted amber glass crystals, terracotta beads, and brushed gold-tone accents strung on durable stretch cord for effortless everyday wear.',
        'Faceted amber crystals and warm terracotta beads on durable stretch cord.',
        1650.00, 1950.00, 8,
        ARRAY['Beads', 'Gold-Tone Hardware', 'Stretch Cord'],
        ARRAY['Warm Amber', 'Terracotta', 'Gold'],
        'Brushed Gold', ARRAY['Brushed Gold'],
        true, false, false, true, 4.8, 24,
        ARRAY['Warm Tones', 'Amber', 'Stretch Bracelet', 'Daily Wear', 'Beads', 'Beaded Bracelet'],
        'Roll gently over the wrist rather than stretching wide to prolong cord elasticity.',
        'active'
    )
    ON CONFLICT (slug) DO UPDATE SET
        name = EXCLUDED.name, price = EXCLUDED.price, stock = EXCLUDED.stock
    RETURNING id INTO v_prod_id;

    DELETE FROM public.product_images WHERE product_id = v_prod_id;
    INSERT INTO public.product_images (product_id, image_url, is_primary, sort_order) VALUES
        (v_prod_id, 'https://lh3.googleusercontent.com/aida-public/AB6AXuBjg3XRMb6wLdRZsXq5bkSYwoUFwyvwoR2OsMODh2in0onDVAfObyPentjgSGJdFHqrjI0OQJb1h8AnkSC9FGjBKn3HO-J33OYyAry0EjOjWNjvVeCan6nA7mcH25mWfDXFhyhG2AtLo8OwfAm-gj9bbjKpacz4e9hg-UZZh4SQktZZy1kByqyqp87OvVUQ9nlbBV2yWuShKbhVkjit8wUdSMJMe5MVDPDVLEDUNROkQAWSN9KexJgP', true, 0);

    INSERT INTO public.inventory (product_id, sku, quantity, reserved_quantity, low_stock_threshold)
    VALUES (v_prod_id, 'MS-BR-002', 8, 0, 3)
    ON CONFLICT (product_id) DO UPDATE SET quantity = EXCLUDED.quantity;

    -- 3. Blush Bloom Beaded Bracelet
    INSERT INTO public.products (
        slug, category_id, category_slug, name, sku, description, short_description,
        price, compare_at_price, stock, materials, colors, finish, available_finishes,
        is_featured, is_best_seller, is_new, in_stock, rating, reviews_count, tags,
        care_instructions, status
    ) VALUES (
        'blush-bloom-bracelet', v_bracelets_id, 'bracelets',
        'Blush Bloom Beaded Bracelet', 'MS-BR-003',
        'Soft pastel blush and rose quartz-colored glass beads woven in a delicate daisy pattern. Accented with tiny metallic gold bead centres and finished with an adjustable sliding knot.',
        'Delicate daisy-patterned blush glass beads with adjustable sliding knot closure.',
        1450.00, 1750.00, 15,
        ARRAY['Beads', 'Waterproof Cord'],
        ARRAY['Blush Pink', 'Cream', 'Gold Accent'],
        'Adjustable Cord', ARRAY['Adjustable Cord'],
        false, false, true, true, 4.7, 19,
        ARRAY['Floral', 'Daisy', 'Pastel', 'Blush', 'Trending', 'Beaded Bracelet'],
        'Safe for light water exposure. Wipe clean with a soft dry cloth.',
        'active'
    )
    ON CONFLICT (slug) DO UPDATE SET
        name = EXCLUDED.name, price = EXCLUDED.price, stock = EXCLUDED.stock
    RETURNING id INTO v_prod_id;

    DELETE FROM public.product_images WHERE product_id = v_prod_id;
    INSERT INTO public.product_images (product_id, image_url, is_primary, sort_order) VALUES
        (v_prod_id, 'https://lh3.googleusercontent.com/aida-public/AB6AXuB1Cf_7jKCngt0y5eaF-HMI6jEb-oIpozN3LUQiTO-_vhR_gYJfHn1t8C8nCfy-kYiRKPkVa5797yt-t3ZKrfmSkGyvK5dhoV1eBvzBOERD1_bf0uuYWnAS1TzGSNgLy4_mFCfVfHuiIoYA7pc3xzsTAIKeUfOu5rjPD1oIBsu3Z6z_UGhHF-Vzw3IQ6U3Fo7kGPc7FNkKoTyCtBHYZszvPhtRqRXcSZGapUgWYhwSml00a2p1-_WAZ', true, 0);

    INSERT INTO public.inventory (product_id, sku, quantity, reserved_quantity, low_stock_threshold)
    VALUES (v_prod_id, 'MS-BR-003', 15, 0, 3)
    ON CONFLICT (product_id) DO UPDATE SET quantity = EXCLUDED.quantity;

    -- 4. Ocean Breeze Beaded Anklet
    INSERT INTO public.products (
        slug, category_id, category_slug, name, sku, description, short_description,
        price, compare_at_price, stock, materials, colors, finish, available_finishes,
        is_featured, is_best_seller, is_new, in_stock, rating, reviews_count, tags,
        care_instructions, status
    ) VALUES (
        'ocean-breeze-anklet', v_anklets_id, 'anklets',
        'Ocean Breeze Beaded Anklet', 'MS-AK-001',
        'Turquoise seed beads, white heishi beads, and a delicate cowrie shell charm bring coastal charm to your ankles. Built on waterproof wax-coated cord with a sliding knot closure for an adjustable fit.',
        'Turquoise seed beads, white heishi accents, and a dainty shell charm.',
        1550.00, 1850.00, 10,
        ARRAY['Beads', 'Charms', 'Waterproof Cord'],
        ARRAY['Turquoise', 'White', 'Sandy Beige'],
        'Waterproof Cord', ARRAY['Waterproof Cord'],
        true, true, false, true, 4.9, 31,
        ARRAY['Anklet', 'Summer', 'Beach', 'Turquoise', 'Waterproof', 'Beaded Anklet'],
        'Waterproof. Safe to wear in the shower or at the beach. Rinse with tap water after salt water.',
        'active'
    )
    ON CONFLICT (slug) DO UPDATE SET
        name = EXCLUDED.name, price = EXCLUDED.price, stock = EXCLUDED.stock
    RETURNING id INTO v_prod_id;

    DELETE FROM public.product_images WHERE product_id = v_prod_id;
    INSERT INTO public.product_images (product_id, image_url, is_primary, sort_order) VALUES
        (v_prod_id, 'https://lh3.googleusercontent.com/aida-public/AB6AXuCym3c_VwqfMRpy3_4MFdu0SCPKfw5QcUU-EbMuf55Oi94gxmhoTK6DvIC9NqkyPrnut8FPQBvd9WbDwUMsdZ9daYCP0CEBw5n33CNNUg9Vf6Fewmrujse_GE-rIRWzfZCFbyHwSHJtFNsGE_sSprb1cpDADr9k1-_yCfeDaJG-ama0UAUP6afCNEvDh6unWvuAdhVdPq_tf06BMovavShLoOA0P9QvacYnLf7NQ8S0oIx-JbomFEdZ', true, 0);

    INSERT INTO public.inventory (product_id, sku, quantity, reserved_quantity, low_stock_threshold)
    VALUES (v_prod_id, 'MS-AK-001', 10, 0, 3)
    ON CONFLICT (product_id) DO UPDATE SET quantity = EXCLUDED.quantity;

    -- 5. Golden Hour Layered Necklace
    INSERT INTO public.products (
        slug, category_id, category_slug, name, sku, description, short_description,
        price, compare_at_price, stock, materials, colors, finish, available_finishes,
        is_featured, is_best_seller, is_new, in_stock, rating, reviews_count, tags,
        care_instructions, status
    ) VALUES (
        'golden-hour-necklace', v_necklaces_id, 'necklaces',
        'Golden Hour Layered Necklace', 'MS-NK-001',
        'A stunning two-in-one layered piece. The upper strand features dainty iridescent gold seed beads while the lower strand drops a hammered sunburst pendant on an elegant gold-plated chain.',
        'Two-strand layered necklace with gold seed beads and hammered sunburst pendant.',
        2850.00, 3200.00, 6,
        ARRAY['Beads', 'Gold-Tone Hardware', 'Chain', 'Charms'],
        ARRAY['Gold', 'Champagne'],
        '18K Gold-Plated', ARRAY['18K Gold-Plated'],
        true, true, false, true, 5.0, 42,
        ARRAY['Necklace', 'Layered', 'Sunburst', 'Statement', 'Gold Plated', 'Beaded Necklace'],
        'Store flat or hanging to prevent tangles. Polish gently with a microfibre cloth.',
        'active'
    )
    ON CONFLICT (slug) DO UPDATE SET
        name = EXCLUDED.name, price = EXCLUDED.price, stock = EXCLUDED.stock
    RETURNING id INTO v_prod_id;

    DELETE FROM public.product_images WHERE product_id = v_prod_id;
    INSERT INTO public.product_images (product_id, image_url, is_primary, sort_order) VALUES
        (v_prod_id, 'https://lh3.googleusercontent.com/aida-public/AB6AXuDmeq-VwhiU435DetS1X3uFs7ftPFTXuoNQPezkt-FDdS5fVi-fWgAQ_3PvJaDU9x4xRw9sw7ru1NTVm_zs5SnnAjgi_E2wg681wIyMw8JV9vSVAfWYzcpF2UkfNK-BMxse2gjK2A1h8e3yxiOCNiD2WAJBuG3Iw-g3MZVUEn1s8s125YRifRsnzPAXqmvTSBCjOEOnUJwZJOSA8TQuT8SgzakSJP9LOMTUZ0VMg55dfVKNyPJBWwEe', true, 0);

    INSERT INTO public.inventory (product_id, sku, quantity, reserved_quantity, low_stock_threshold)
    VALUES (v_prod_id, 'MS-NK-001', 6, 0, 3)
    ON CONFLICT (product_id) DO UPDATE SET quantity = EXCLUDED.quantity;

    -- 6. Starlight Dainty Choker
    INSERT INTO public.products (
        slug, category_id, category_slug, name, sku, description, short_description,
        price, compare_at_price, stock, materials, colors, finish, available_finishes,
        is_featured, is_best_seller, is_new, in_stock, rating, reviews_count, tags,
        care_instructions, status
    ) VALUES (
        'starlight-choker', v_necklaces_id, 'necklaces',
        'Starlight Dainty Choker', 'MS-NK-002',
        'Shimmering midnight blue and silver glass micro-beads strung with delicate star-shaped metallic charms. Sits gracefully along the collarbone with a 2-inch extender for versatile lengths.',
        'Midnight blue and silver micro-beads with dainty star charms and extension chain.',
        2450.00, 2800.00, 9,
        ARRAY['Beads', 'Gold-Tone Hardware', 'Chain', 'Charms'],
        ARRAY['Midnight Blue', 'Silver', 'Gold'],
        'Silver-Tone', ARRAY['Silver-Tone', 'Gold-Tone'],
        false, false, true, true, 4.8, 16,
        ARRAY['Choker', 'Stars', 'Midnight', 'Micro Beads', 'Necklace', 'Beaded Choker'],
        'Fasten clasp before storing to prevent delicate chain from knotting.',
        'active'
    )
    ON CONFLICT (slug) DO UPDATE SET
        name = EXCLUDED.name, price = EXCLUDED.price, stock = EXCLUDED.stock
    RETURNING id INTO v_prod_id;

    DELETE FROM public.product_images WHERE product_id = v_prod_id;
    INSERT INTO public.product_images (product_id, image_url, is_primary, sort_order) VALUES
        (v_prod_id, 'https://lh3.googleusercontent.com/aida-public/AB6AXuB1Cf_7jKCngt0y5eaF-HMI6jEb-oIpozN3LUQiTO-_vhR_gYJfHn1t8C8nCfy-kYiRKPkVa5797yt-t3ZKrfmSkGyvK5dhoV1eBvzBOERD1_bf0uuYWnAS1TzGSNgLy4_mFCfVfHuiIoYA7pc3xzsTAIKeUfOu5rjPD1oIBsu3Z6z_UGhHF-Vzw3IQ6U3Fo7kGPc7FNkKoTyCtBHYZszvPhtRqRXcSZGapUgWYhwSml00a2p1-_WAZ', true, 0);

    INSERT INTO public.inventory (product_id, sku, quantity, reserved_quantity, low_stock_threshold)
    VALUES (v_prod_id, 'MS-NK-002', 9, 0, 3)
    ON CONFLICT (product_id) DO UPDATE SET quantity = EXCLUDED.quantity;

    -- 7. Sunlit Golden Charm Anklet
    INSERT INTO public.products (
        slug, category_id, category_slug, name, sku, description, short_description,
        price, compare_at_price, stock, materials, colors, finish, available_finishes,
        is_featured, is_best_seller, is_new, in_stock, rating, reviews_count, tags,
        care_instructions, status
    ) VALUES (
        'sunlit-golden-charm-anklet', v_anklets_id, 'anklets',
        'Sunlit Golden Charm Anklet', 'MS-AK-003',
        'Warm amber-toned glass beads intertwined with dainty gold-tone sun charms and tiny bells that softly chime with each gentle step.',
        'Amber glass beads with gold-tone sun charms, chain extender, and chime bells.',
        1450.00, 1700.00, 10,
        ARRAY['Beads', 'Gold-Tone Hardware', 'Chain', 'Charms'],
        ARRAY['Golden Amber', 'Gold'],
        'Gold-Tone', ARRAY['Gold-Tone'],
        true, false, true, true, 4.9, 19,
        ARRAY['Anklet', 'Summer', 'Sun Charm', 'Amber Hues', 'Bohemian', 'Beaded Anklet'],
        'Water-safe cord and chain. Rinse with fresh water after seaside walks.',
        'active'
    )
    ON CONFLICT (slug) DO UPDATE SET
        name = EXCLUDED.name, price = EXCLUDED.price, stock = EXCLUDED.stock
    RETURNING id INTO v_prod_id;

    DELETE FROM public.product_images WHERE product_id = v_prod_id;
    INSERT INTO public.product_images (product_id, image_url, is_primary, sort_order) VALUES
        (v_prod_id, 'https://lh3.googleusercontent.com/aida-public/AB6AXuCym3c_VwqfMRpy3_4MFdu0SCPKfw5QcUU-EbMuf55Oi94gxmhoTK6DvIC9NqkyPrnut8FPQBvd9WbDwUMsdZ9daYCP0CEBw5n33CNNUg9Vf6Fewmrujse_GE-rIRWzfZCFbyHwSHJtFNsGE_sSprb1cpDADr9k1-_yCfeDaJG-ama0UAUP6afCNEvDh6unWvuAdhVdPq_tf06BMovavShLoOA0P9QvacYnLf7NQ8S0oIx-JbomFEdZ', true, 0);

    INSERT INTO public.inventory (product_id, sku, quantity, reserved_quantity, low_stock_threshold)
    VALUES (v_prod_id, 'MS-AK-003', 10, 0, 3)
    ON CONFLICT (product_id) DO UPDATE SET quantity = EXCLUDED.quantity;

    -- 8. Ocean Wave Beaded Anklet
    INSERT INTO public.products (
        slug, category_id, category_slug, name, sku, description, short_description,
        price, compare_at_price, stock, materials, colors, finish, available_finishes,
        is_featured, is_best_seller, is_new, in_stock, rating, reviews_count, tags,
        care_instructions, status
    ) VALUES (
        'ocean-wave-beaded-anklet', v_anklets_id, 'anklets',
        'Ocean Wave Beaded Anklet', 'MS-AK-002',
        'Vibrant teal-colored glass beads combined with acrylic mini shell beads and waterproof cord for sunny beach days and summer escapes.',
        'Teal-colored glass beads with miniature shell beads on waterproof cord.',
        1550.00, 1850.00, 7,
        ARRAY['Beads', 'Waterproof Cord'],
        ARRAY['Ocean Teal', 'Sand'],
        'Waterproof Cord', ARRAY['Waterproof Cord'],
        false, false, false, true, 4.8, 22,
        ARRAY['Beach', 'Teal', 'Bohemian', 'Anklet', 'Beaded Anklet'],
        'Designed for daily wear and beach trips.',
        'active'
    )
    ON CONFLICT (slug) DO UPDATE SET
        name = EXCLUDED.name, price = EXCLUDED.price, stock = EXCLUDED.stock
    RETURNING id INTO v_prod_id;

    DELETE FROM public.product_images WHERE product_id = v_prod_id;
    INSERT INTO public.product_images (product_id, image_url, is_primary, sort_order) VALUES
        (v_prod_id, 'https://lh3.googleusercontent.com/aida-public/AB6AXuBjg3XRMb6wLdRZsXq5bkSYwoUFwyvwoR2OsMODh2in0onDVAfObyPentjgSGJdFHqrjI0OQJb1h8AnkSC9FGjBKn3HO-J33OYyAry0EjOjWNjvVeCan6nA7mcH25mWfDXFhyhG2AtLo8OwfAm-gj9bbjKpacz4e9hg-UZZh4SQktZZy1kByqyqp87OvVUQ9nlbBV2yWuShKbhVkjit8wUdSMJMe5MVDPDVLEDUNROkQAWSN9KexJgP', true, 0);

    INSERT INTO public.inventory (product_id, sku, quantity, reserved_quantity, low_stock_threshold)
    VALUES (v_prod_id, 'MS-AK-002', 7, 0, 3)
    ON CONFLICT (product_id) DO UPDATE SET quantity = EXCLUDED.quantity;

    -- 9. Celestial Rose Choker
    INSERT INTO public.products (
        slug, category_id, category_slug, name, sku, description, short_description,
        price, compare_at_price, stock, materials, colors, finish, available_finishes,
        is_featured, is_best_seller, is_new, in_stock, rating, reviews_count, tags,
        care_instructions, status
    ) VALUES (
        'celestial-rose-choker', v_necklaces_id, 'necklaces',
        'Celestial Rose Choker', 'MS-NK-003',
        'A romantic choker featuring blush pink faceted glass beads, star charms, and a delicate gold-tone linked chain. Perfect for layered styles.',
        'Blush pink glass beads with star charms and gold-tone linked chain.',
        2450.00, 2800.00, 8,
        ARRAY['Beads', 'Gold-Tone Hardware', 'Chain', 'Charms'],
        ARRAY['Soft Pink', 'Gold'],
        'Gold-Tone', ARRAY['Gold-Tone'],
        true, false, true, true, 5.0, 31,
        ARRAY['Romantic', 'Pink Beads', 'Statement', 'Choker', 'Necklace'],
        'Store hung or in a pouch to prevent chain tangles.',
        'active'
    )
    ON CONFLICT (slug) DO UPDATE SET
        name = EXCLUDED.name, price = EXCLUDED.price, stock = EXCLUDED.stock
    RETURNING id INTO v_prod_id;

    DELETE FROM public.product_images WHERE product_id = v_prod_id;
    INSERT INTO public.product_images (product_id, image_url, is_primary, sort_order) VALUES
        (v_prod_id, 'https://lh3.googleusercontent.com/aida-public/AB6AXuDmeq-VwhiU435DetS1X3uFs7ftPFTXuoNQPezkt-FDdS5fVi-fWgAQ_3PvJaDU9x4xRw9sw7ru1NTVm_zs5SnnAjgi_E2wg681wIyMw8JV9vSVAfWYzcpF2UkfNK-BMxse2gjK2A1h8e3yxiOCNiD2WAJBuG3Iw-g3MZVUEn1s8s125YRifRsnzPAXqmvTSBCjOEOnUJwZJOSA8TQuT8SgzakSJP9LOMTUZ0VMg55dfVKNyPJBWwEe', true, 0),
        (v_prod_id, 'https://lh3.googleusercontent.com/aida-public/AB6AXuB1Cf_7jKCngt0y5eaF-HMI6jEb-oIpozN3LUQiTO-_vhR_gYJfHn1t8C8nCfy-kYiRKPkVa5797yt-t3ZKrfmSkGyvK5dhoV1eBvzBOERD1_bf0uuYWnAS1TzGSNgLy4_mFCfVfHuiIoYA7pc3xzsTAIKeUfOu5rjPD1oIBsu3Z6z_UGhHF-Vzw3IQ6U3Fo7kGPc7FNkKoTyCtBHYZszvPhtRqRXcSZGapUgWYhwSml00a2p1-_WAZ', false, 1);

    INSERT INTO public.inventory (product_id, sku, quantity, reserved_quantity, low_stock_threshold)
    VALUES (v_prod_id, 'MS-NK-003', 8, 0, 3)
    ON CONFLICT (product_id) DO UPDATE SET quantity = EXCLUDED.quantity;

    -- 10. Emerald Flora Beaded Drops
    INSERT INTO public.products (
        slug, category_id, category_slug, name, sku, description, short_description,
        price, compare_at_price, stock, materials, colors, finish, available_finishes,
        is_featured, is_best_seller, is_new, in_stock, rating, reviews_count, tags,
        care_instructions, status
    ) VALUES (
        'emerald-flora-beaded-drops', v_earrings_id, 'earrings',
        'Emerald Flora Beaded Drops', 'MS-ER-001',
        'Hand-woven cascading beaded earrings with rich emerald-green glass crystals, tiny seed beads, and gold-tone ear hooks. Remarkably lightweight for all-day wear.',
        'Hand-woven green glass beads with gold-tone ear hooks.',
        1350.00, 1600.00, 15,
        ARRAY['Beads', 'Gold-Tone Hardware'],
        ARRAY['Emerald Green', 'Gold'],
        'Gold-Tone', ARRAY['Gold-Tone'],
        false, false, true, true, 4.9, 17,
        ARRAY['Earrings', 'Floral', 'Handwoven', 'Green', 'Dangle', 'Beaded Earrings'],
        'Lightweight and comfortable for all-day wear.',
        'active'
    )
    ON CONFLICT (slug) DO UPDATE SET
        name = EXCLUDED.name, price = EXCLUDED.price, stock = EXCLUDED.stock
    RETURNING id INTO v_prod_id;

    DELETE FROM public.product_images WHERE product_id = v_prod_id;
    INSERT INTO public.product_images (product_id, image_url, is_primary, sort_order) VALUES
        (v_prod_id, 'https://lh3.googleusercontent.com/aida-public/AB6AXuBjg3XRMb6wLdRZsXq5bkSYwoUFwyvwoR2OsMODh2in0onDVAfObyPentjgSGJdFHqrjI0OQJb1h8AnkSC9FGjBKn3HO-J33OYyAry0EjOjWNjvVeCan6nA7mcH25mWfDXFhyhG2AtLo8OwfAm-gj9bbjKpacz4e9hg-UZZh4SQktZZy1kByqyqp87OvVUQ9nlbBV2yWuShKbhVkjit8wUdSMJMe5MVDPDVLEDUNROkQAWSN9KexJgP', true, 0);

    INSERT INTO public.inventory (product_id, sku, quantity, reserved_quantity, low_stock_threshold)
    VALUES (v_prod_id, 'MS-ER-001', 15, 0, 3)
    ON CONFLICT (product_id) DO UPDATE SET quantity = EXCLUDED.quantity;

    -- 11. Solstice Stacking Rings (Set of 3)
    INSERT INTO public.products (
        slug, category_id, category_slug, name, sku, description, short_description,
        price, compare_at_price, stock, materials, colors, finish, available_finishes,
        is_featured, is_best_seller, is_new, in_stock, rating, reviews_count, tags,
        care_instructions, status
    ) VALUES (
        'solstice-stacking-rings-set-of-3', v_rings_id, 'rings',
        'Solstice Stacking Rings (Set of 3)', 'MS-RG-001',
        'A curated trio of stretch micro-bead rings with miniature glass seed beads, acrylic pearl accents, and gold-tone spacer beads. Wear together or stack across fingers.',
        'Trio of stretch micro-bead rings with colorful glass seed beads and gold-tone accents.',
        1150.00, 1400.00, 20,
        ARRAY['Beads', 'Gold-Tone Hardware'],
        ARRAY['Multi-color', 'Gold'],
        'Gold-Tone', ARRAY['Gold-Tone'],
        true, false, true, true, 4.9, 28,
        ARRAY['Ring Set', 'Stackable', 'Micro Beads', 'Glass Beads', 'Rings'],
        'Roll gently onto fingers rather than pulling.',
        'active'
    )
    ON CONFLICT (slug) DO UPDATE SET
        name = EXCLUDED.name, price = EXCLUDED.price, stock = EXCLUDED.stock
    RETURNING id INTO v_prod_id;

    DELETE FROM public.product_images WHERE product_id = v_prod_id;
    INSERT INTO public.product_images (product_id, image_url, is_primary, sort_order) VALUES
        (v_prod_id, 'https://lh3.googleusercontent.com/aida-public/AB6AXuCym3c_VwqfMRpy3_4MFdu0SCPKfw5QcUU-EbMuf55Oi94gxmhoTK6DvIC9NqkyPrnut8FPQBvd9WbDwUMsdZ9daYCP0CEBw5n33CNNUg9Vf6Fewmrujse_GE-rIRWzfZCFbyHwSHJtFNsGE_sSprb1cpDADr9k1-_yCfeDaJG-ama0UAUP6afCNEvDh6unWvuAdhVdPq_tf06BMovavShLoOA0P9QvacYnLf7NQ8S0oIx-JbomFEdZ', true, 0);

    INSERT INTO public.inventory (product_id, sku, quantity, reserved_quantity, low_stock_threshold)
    VALUES (v_prod_id, 'MS-RG-001', 20, 0, 3)
    ON CONFLICT (product_id) DO UPDATE SET quantity = EXCLUDED.quantity;

    -- 12. Bespoke Custom Initial & Beaded Bracelet
    INSERT INTO public.products (
        slug, category_id, category_slug, name, sku, description, short_description,
        price, compare_at_price, stock, materials, colors, finish, available_finishes,
        is_featured, is_best_seller, is_new, in_stock, rating, reviews_count, tags,
        care_instructions, status
    ) VALUES (
        'bespoke-initial-charm-bracelet', v_custom_id, 'custom-pieces',
        'Bespoke Custom Initial & Beaded Bracelet', 'MS-CUST-001',
        'Create your personalized keepsake piece! Customized with your chosen colorful glass beads, metallic letter initial charm, and exact wrist measurements.',
        'Handcrafted personalized bracelet with colorful glass beads and initial charm.',
        2150.00, 2500.00, 50,
        ARRAY['Beads', 'Gold-Tone Hardware', 'Charms'],
        ARRAY['Custom Hues', 'Gold/Silver'],
        'Gold-Tone', ARRAY['Gold-Tone', 'Silver-Tone'],
        true, true, true, true, 5.0, 84,
        ARRAY['Custom', 'Personalized', 'Initial Charm', 'Gift', 'Beads'],
        'Individually crafted with love in 48 hours.',
        'active'
    )
    ON CONFLICT (slug) DO UPDATE SET
        name = EXCLUDED.name, price = EXCLUDED.price, stock = EXCLUDED.stock
    RETURNING id INTO v_prod_id;

    DELETE FROM public.product_images WHERE product_id = v_prod_id;
    INSERT INTO public.product_images (product_id, image_url, is_primary, sort_order) VALUES
        (v_prod_id, 'https://lh3.googleusercontent.com/aida-public/AB6AXuDmeq-VwhiU435DetS1X3uFs7ftPFTXuoNQPezkt-FDdS5fVi-fWgAQ_3PvJaDU9x4xRw9sw7ru1NTVm_zs5SnnAjgi_E2wg681wIyMw8JV9vSVAfWYzcpF2UkfNK-BMxse2gjK2A1h8e3yxiOCNiD2WAJBuG3Iw-g3MZVUEn1s8s125YRifRsnzPAXqmvTSBCjOEOnUJwZJOSA8TQuT8SgzakSJP9LOMTUZ0VMg55dfVKNyPJBWwEe', true, 0),
        (v_prod_id, 'https://lh3.googleusercontent.com/aida-public/AB6AXuCym3c_VwqfMRpy3_4MFdu0SCPKfw5QcUU-EbMuf55Oi94gxmhoTK6DvIC9NqkyPrnut8FPQBvd9WbDwUMsdZ9daYCP0CEBw5n33CNNUg9Vf6Fewmrujse_GE-rIRWzfZCFbyHwSHJtFNsGE_sSprb1cpDADr9k1-_yCfeDaJG-ama0UAUP6afCNEvDh6unWvuAdhVdPq_tf06BMovavShLoOA0P9QvacYnLf7NQ8S0oIx-JbomFEdZ', false, 1);

    INSERT INTO public.inventory (product_id, sku, quantity, reserved_quantity, low_stock_threshold)
    VALUES (v_prod_id, 'MS-CUST-001', 50, 0, 3)
    ON CONFLICT (product_id) DO UPDATE SET quantity = EXCLUDED.quantity;

    RETURN 'Catalog migration completed: 12 products, images, and inventory seeded successfully.';
END;
$$;

SELECT public.seed_product_catalog();

GRANT EXECUTE ON FUNCTION public.seed_product_catalog() TO anon, authenticated;

