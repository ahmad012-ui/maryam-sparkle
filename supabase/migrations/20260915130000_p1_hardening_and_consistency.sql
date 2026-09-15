-- ==============================================================================
-- P1: FUNCTIONALITY, CONSISTENCY & SECURITY HARDENING
-- Migration: 20260915130000_p1_hardening_and_consistency.sql
-- ==============================================================================

-- 1. ADDRESS DEFAULT INTEGRITY TRIGGER & RPC
-- Ensure only ONE default address exists per user at the database level.
CREATE OR REPLACE FUNCTION public.handle_address_default()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.is_default IS TRUE AND NEW.user_id IS NOT NULL THEN
    UPDATE public.addresses
    SET is_default = false
    WHERE user_id = NEW.user_id 
      AND id <> NEW.id 
      AND is_default IS TRUE;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_address_default ON public.addresses;
CREATE TRIGGER trg_address_default
BEFORE INSERT OR UPDATE OF is_default
ON public.addresses
FOR EACH ROW
WHEN (NEW.is_default IS TRUE)
EXECUTE FUNCTION public.handle_address_default();

-- Explicit RPC to safely set an address as default for the authenticated caller
CREATE OR REPLACE FUNCTION public.set_default_address(p_address_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.addresses 
    WHERE id = p_address_id AND user_id = v_user_id
  ) THEN
    RAISE EXCEPTION 'Address not found or unauthorized';
  END IF;

  UPDATE public.addresses
  SET is_default = (id = p_address_id),
      updated_at = timezone('utc'::text, now())
  WHERE user_id = v_user_id;
END;
$$;

REVOKE ALL ON FUNCTION public.set_default_address(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.set_default_address(UUID) TO authenticated;

-- 2. REVIEWS RATING RECALCULATION TRIGGER
-- Recalculate products.rating and reviews_count automatically on review mutations
CREATE OR REPLACE FUNCTION public.handle_review_rating_update()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_product_id UUID;
  v_avg_rating NUMERIC(3, 2);
  v_count INT;
BEGIN
  v_product_id := COALESCE(NEW.product_id, OLD.product_id);

  SELECT 
    ROUND(COALESCE(AVG(rating), 5.00)::numeric, 2),
    COUNT(*)
  INTO v_avg_rating, v_count
  FROM public.reviews
  WHERE product_id = v_product_id
    AND status = 'approved';

  UPDATE public.products
  SET 
    rating = COALESCE(v_avg_rating, 5.00),
    reviews_count = COALESCE(v_count, 0),
    updated_at = timezone('utc'::text, now())
  WHERE id = v_product_id;

  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS trg_update_product_rating ON public.reviews;
CREATE TRIGGER trg_update_product_rating
AFTER INSERT OR UPDATE OF rating, status OR DELETE
ON public.reviews
FOR EACH ROW
EXECUTE FUNCTION public.handle_review_rating_update();

-- 3. STORE SETTINGS DEFAULTS & PERSISTENCE
INSERT INTO public.store_settings (id, settings)
VALUES (
  'default',
  '{
    "storeSettings": {
      "storeName": "Maryam Sparkle",
      "tagline": "Handcrafted Artistry & Delicate Jewelry",
      "currency": "PKR",
      "adminName": "Maryam Rehman",
      "adminEmail": "artisan@maryamsparkle.com",
      "adminPhone": "+92 300 1234567",
      "whatsappNumber": "+92 300 1234567",
      "standardShippingFee": 200,
      "freeShippingThreshold": 3000,
      "expressShippingFee": 350,
      "city": "Karachi",
      "country": "Pakistan",
      "courierPartners": ["Trax Logistics", "TCS Express", "Leopards Courier", "Call Courier"]
    },
    "theme": {
      "sidebarColor": "teal",
      "sidenavType": "white",
      "darkMode": false,
      "navbarFixed": true
    }
  }'::jsonb
)
ON CONFLICT (id) DO NOTHING;

-- 4. HARDEN PLACE_ORDER TO DYNAMICALLY USE STORE_SETTINGS
CREATE OR REPLACE FUNCTION public.place_order(payload JSONB)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_order_id UUID := gen_random_uuid();
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
    v_free_threshold NUMERIC(10, 2) := 3000.00;
    v_std_shipping NUMERIC(10, 2) := 200.00;
    v_exp_shipping NUMERIC(10, 2) := 350.00;
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
    -- Read dynamic shipping settings from store_settings
    SELECT 
      COALESCE((settings->'storeSettings'->>'freeShippingThreshold')::numeric, 3000.00),
      COALESCE((settings->'storeSettings'->>'standardShippingFee')::numeric, 200.00),
      COALESCE((settings->'storeSettings'->>'expressShippingFee')::numeric, 350.00)
    INTO v_free_threshold, v_std_shipping, v_exp_shipping
    FROM public.store_settings
    WHERE id = 'default';

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

    -- Enforce authentic user ID from auth context
    v_user_id := auth.uid();

    -- Validate items array
    IF payload->'items' IS NULL OR jsonb_array_length(payload->'items') = 0 THEN
        RAISE EXCEPTION 'Your order must contain at least one item.';
    END IF;

    -- Validate non-COD payments require transaction reference & proof
    IF v_payment_method IN ('easypaisa', 'jazzcash', 'bank_transfer') THEN
        IF v_txn_ref IS NULL THEN
            RAISE EXCEPTION 'Transaction reference ID is required for non-COD payment.';
        END IF;
        IF v_proof_path IS NULL THEN
            RAISE EXCEPTION 'Payment proof screenshot or document is required for non-COD payment.';
        END IF;
    END IF;

    -- Generate unique human-readable order number
    v_order_number := 'MS-' || UPPER(SUBSTRING(gen_random_uuid()::text FROM 1 FOR 4)) || '-' || TO_CHAR(NOW(), 'YYYYMMDD');

    -- 2. Verify all items against database prices and stock
    FOR v_item IN SELECT * FROM jsonb_array_elements(payload->'items')
    LOOP
        v_item_qty := COALESCE((v_item->>'quantity')::int, 1);
        IF v_item_qty <= 0 THEN
            RAISE EXCEPTION 'Invalid item quantity: %', v_item_qty;
        END IF;

        -- Look up authoritative product by UUID or slug
        SELECT * INTO v_product FROM public.products
        WHERE id::text = (v_item->>'productId') OR slug = (v_item->>'productSlug')
        LIMIT 1;

        IF NOT FOUND THEN
            RAISE EXCEPTION 'Product with ID "%" or slug "%" could not be found.',
                v_item->>'productId', v_item->>'productSlug';
        END IF;

        IF v_product.status <> 'active' THEN
            RAISE EXCEPTION 'Product "%" is currently unavailable.', v_product.name;
        END IF;

        -- Authoritative price directly from database
        v_item_price := v_product.price;

        -- Check stock availability
        IF v_product.stock < v_item_qty THEN
            RAISE EXCEPTION 'Insufficient stock for "%". Only % available.', v_product.name, v_product.stock;
        END IF;

        -- Atomically decrement stock in products and inventory
        UPDATE public.products
        SET stock = stock - v_item_qty,
            in_stock = (stock - v_item_qty > 0)
        WHERE id = v_product.id;

        UPDATE public.inventory
        SET quantity = GREATEST(0, quantity - v_item_qty)
        WHERE product_id = v_product.id;

        v_item_subtotal := v_item_price * v_item_qty;
        v_subtotal := v_subtotal + v_item_subtotal;
    END LOOP;

    -- 3. Calculate dynamic authoritative shipping fee
    IF v_delivery_method = 'express' THEN
        v_shipping_fee := v_exp_shipping;
    ELSIF v_subtotal >= v_free_threshold THEN
        v_shipping_fee := 0.00;
    ELSE
        v_shipping_fee := v_std_shipping;
    END IF;

    -- 4. Calculate authoritative coupon discount if provided
    IF v_coupon_code IS NOT NULL THEN
        SELECT * INTO v_coupon FROM public.coupons
        WHERE UPPER(code) = v_coupon_code AND status = 'active'
        LIMIT 1;

        IF NOT FOUND THEN
            RAISE EXCEPTION 'Invalid or inactive coupon code: %', v_coupon_code;
        END IF;

        IF v_coupon.starts_at IS NOT NULL AND v_coupon.starts_at > timezone('utc'::text, now()) THEN
            RAISE EXCEPTION 'Coupon code % is not active yet.', v_coupon_code;
        END IF;

        IF v_coupon.expires_at IS NOT NULL AND v_coupon.expires_at < timezone('utc'::text, now()) THEN
            RAISE EXCEPTION 'Coupon code % has expired.', v_coupon_code;
        END IF;

        IF v_coupon.usage_limit IS NOT NULL AND v_coupon.used_count >= v_coupon.usage_limit THEN
            RAISE EXCEPTION 'Coupon code % has reached its usage limit.', v_coupon_code;
        END IF;

        IF v_subtotal < COALESCE(v_coupon.minimum_order_amount, 0) THEN
            RAISE EXCEPTION 'Minimum order amount of Rs. % required for coupon %.',
                v_coupon.minimum_order_amount, v_coupon_code;
        END IF;

        IF v_coupon.discount_type = 'percentage' THEN
            v_discount := ROUND((v_subtotal * (v_coupon.discount_value / 100.0)), 2);
            IF v_coupon.maximum_discount IS NOT NULL AND v_discount > v_coupon.maximum_discount THEN
                v_discount := v_coupon.maximum_discount;
            END IF;
        ELSE
            v_discount := LEAST(v_subtotal, v_coupon.discount_value);
        END IF;

        UPDATE public.coupons
        SET used_count = used_count + 1
        WHERE id = v_coupon.id;
    END IF;

    -- 5. Calculate verified total
    v_total := GREATEST(0, (v_subtotal - v_discount) + v_shipping_fee);

    -- 6. Insert Order record
    INSERT INTO public.orders (
        id,
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
        v_order_id,
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
    );

    -- 7. Insert verified Order Items
    FOR v_item IN SELECT * FROM jsonb_array_elements(payload->'items')
    LOOP
        v_item_qty := COALESCE((v_item->>'quantity')::int, 1);

        SELECT * INTO v_product FROM public.products
        WHERE id::text = (v_item->>'productId') OR slug = (v_item->>'productSlug')
        LIMIT 1;

        INSERT INTO public.order_items (
            order_id,
            product_id,
            product_name,
            product_image,
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
            COALESCE(v_item->>'productImage', v_product.image_url),
            v_item_qty,
            v_product.price,
            v_product.price * v_item_qty,
            v_item->>'selectedSize',
            v_item->>'selectedFinish'
        );
    END LOOP;

    -- 8. Insert Payment record
    INSERT INTO public.payments (
        order_id,
        amount,
        method,
        transaction_reference,
        proof_of_payment_url,
        payment_gateway,
        status
    )
    VALUES (
        v_order_id,
        v_total,
        v_payment_method,
        v_txn_ref,
        v_proof_path,
        v_payment_method,
        'pending'
    );

    -- 9. Return synthesized result
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

-- 5. PERFORMANCE INDEXES
CREATE INDEX IF NOT EXISTS idx_addresses_user_default ON public.addresses(user_id, is_default);
CREATE INDEX IF NOT EXISTS idx_reviews_product_status ON public.reviews(product_id, status);
CREATE INDEX IF NOT EXISTS idx_wishlists_user_product ON public.wishlists(user_id, product_id);
CREATE INDEX IF NOT EXISTS idx_orders_user_created ON public.orders(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON public.orders(order_number);
CREATE INDEX IF NOT EXISTS idx_products_category_status ON public.products(category_slug, status);
