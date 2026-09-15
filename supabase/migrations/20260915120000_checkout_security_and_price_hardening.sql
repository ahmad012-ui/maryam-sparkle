-- Migration: 20260915120000_checkout_security_and_price_hardening.sql
-- Purpose:
-- 1. Eliminate order/payment RLS bypasses and leaks. Prevent direct client INSERT/UPDATE/DELETE on orders, order_items, and payments.
-- 2. Audit and harden place_order RPC to strictly enforce database prices, stock levels, coupon rules, and prevent any price/total manipulation.

-- ==============================================================================
-- 1. ROW LEVEL SECURITY AUDIT FOR ORDERS, ORDER_ITEMS, PAYMENTS
-- ==============================================================================

-- Drop any loose insert policies
DROP POLICY IF EXISTS "Anyone can place an order" ON public.orders;
DROP POLICY IF EXISTS "Users can create orders" ON public.orders;
DROP POLICY IF EXISTS "Users can view their own orders or track order" ON public.orders;
DROP POLICY IF EXISTS "orders_own_read" ON public.orders;
DROP POLICY IF EXISTS "orders_admin_insert" ON public.orders;
DROP POLICY IF EXISTS "orders_admin_update" ON public.orders;
DROP POLICY IF EXISTS "orders_admin_delete" ON public.orders;

-- Orders SELECT: Authenticated users can view their own; Admins can view all.
-- Guest orders cannot be dumped via SELECT * FROM orders; guest tracking is handled via track_guest_order RPC.
CREATE POLICY "orders_own_read" ON public.orders
FOR SELECT USING (
  (user_id IS NOT NULL AND user_id = auth.uid())
  OR public.is_admin()
);

-- Orders INSERT: Only admins or SECURITY DEFINER RPCs (place_order) can insert.
CREATE POLICY "orders_admin_insert" ON public.orders
FOR INSERT WITH CHECK (public.is_admin());

-- Orders UPDATE: Only admins can update order statuses, tracking info, etc.
CREATE POLICY "orders_admin_update" ON public.orders
FOR UPDATE USING (public.is_admin());

-- Orders DELETE: Only admins can delete orders.
CREATE POLICY "orders_admin_delete" ON public.orders
FOR DELETE USING (public.is_admin());

-- Order Items Policies
DROP POLICY IF EXISTS "Order items readable" ON public.order_items;
DROP POLICY IF EXISTS "order_items_own_read" ON public.order_items;
DROP POLICY IF EXISTS "order_items_admin_insert" ON public.order_items;
DROP POLICY IF EXISTS "order_items_admin_update" ON public.order_items;
DROP POLICY IF EXISTS "order_items_admin_delete" ON public.order_items;

CREATE POLICY "order_items_own_read" ON public.order_items
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.orders o
    WHERE o.id = order_items.order_id
      AND ((o.user_id IS NOT NULL AND o.user_id = auth.uid()) OR public.is_admin())
  )
);

CREATE POLICY "order_items_admin_insert" ON public.order_items
FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY "order_items_admin_update" ON public.order_items
FOR UPDATE USING (public.is_admin());

CREATE POLICY "order_items_admin_delete" ON public.order_items
FOR DELETE USING (public.is_admin());

-- Payments Policies
DROP POLICY IF EXISTS "Payments readable by order owner or admin" ON public.payments;
DROP POLICY IF EXISTS "payments_own_read" ON public.payments;
DROP POLICY IF EXISTS "payments_admin_insert" ON public.payments;
DROP POLICY IF EXISTS "payments_admin_update" ON public.payments;
DROP POLICY IF EXISTS "payments_admin_delete" ON public.payments;

CREATE POLICY "payments_own_read" ON public.payments
FOR SELECT USING (
  public.is_admin()
  OR EXISTS (
    SELECT 1 FROM public.orders o
    WHERE o.id = payments.order_id
      AND (o.user_id IS NOT NULL AND o.user_id = auth.uid())
  )
);

CREATE POLICY "payments_admin_insert" ON public.payments
FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY "payments_admin_update" ON public.payments
FOR UPDATE USING (public.is_admin());

CREATE POLICY "payments_admin_delete" ON public.payments
FOR DELETE USING (public.is_admin());

-- ==============================================================================
-- 2. SECURE SERVER-SIDE ORDER CREATION FUNCTION (RPC)
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
