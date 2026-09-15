-- Migration: 20260915140000_p3_marketing_retention_and_reviews.sql
-- Description: P3 extensions for marketing (newsletter), verified reviews, customer retention, and indexes.

-- 1. Newsletter subscribers table
CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL UNIQUE,
    source TEXT DEFAULT 'footer_signup',
    status TEXT DEFAULT 'subscribed' CHECK (status IN ('subscribed', 'unsubscribed')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for newsletter_subscribers
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Allow public anonymous / authenticated insertion with basic email check
DROP POLICY IF EXISTS "Public can subscribe to newsletter" ON public.newsletter_subscribers;
CREATE POLICY "Public can subscribe to newsletter"
    ON public.newsletter_subscribers
    FOR INSERT
    TO public
    WITH CHECK (email IS NOT NULL AND position('@' in email) > 1);

-- Only admins can read subscribers
DROP POLICY IF EXISTS "Admins can view newsletter subscribers" ON public.newsletter_subscribers;
CREATE POLICY "Admins can view newsletter subscribers"
    ON public.newsletter_subscribers
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- Only admins can update subscribers
DROP POLICY IF EXISTS "Admins can update newsletter subscribers" ON public.newsletter_subscribers;
CREATE POLICY "Admins can update newsletter subscribers"
    ON public.newsletter_subscribers
    FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- 2. Add is_verified_purchase column to reviews if not present
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'reviews' 
        AND column_name = 'is_verified_purchase'
    ) THEN
        ALTER TABLE public.reviews ADD COLUMN is_verified_purchase BOOLEAN DEFAULT FALSE;
    END IF;
END $$;

-- 3. Function to check if a user is a verified buyer of a product
CREATE OR REPLACE FUNCTION public.check_verified_purchase(p_user_id UUID, p_product_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_has_purchased BOOLEAN;
BEGIN
    IF p_user_id IS NULL OR p_product_id IS NULL THEN
        RETURN FALSE;
    END IF;

    SELECT EXISTS (
        SELECT 1
        FROM public.orders o
        JOIN public.order_items oi ON o.id = oi.order_id
        WHERE o.user_id = p_user_id
        AND oi.product_id = p_product_id
        AND o.status IN ('placed', 'confirmed', 'processing', 'shipped', 'out_for_delivery', 'delivered')
    ) INTO v_has_purchased;

    RETURN COALESCE(v_has_purchased, FALSE);
END;
$$;

GRANT EXECUTE ON FUNCTION public.check_verified_purchase(UUID, UUID) TO authenticated, anon;

-- 4. Helpful performance indexes
CREATE INDEX IF NOT EXISTS idx_reviews_product_status ON public.reviews(product_id, status);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON public.reviews(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_user_created ON public.orders(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_order_items_product ON public.order_items(product_id);
CREATE INDEX IF NOT EXISTS idx_products_category_status ON public.products(category_slug, status);
CREATE INDEX IF NOT EXISTS idx_newsletter_email ON public.newsletter_subscribers(email);
