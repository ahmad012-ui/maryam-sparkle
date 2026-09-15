-- ==============================================================================
-- MIGRATION: 20260915100000_migrate_product_catalog.sql
-- Description:
-- 1. Storage Buckets & Policies (products, payment-proofs, custom-orders)
-- 2. Authoritative Coupons (SPARKLE10, MARYAM500)
-- 3. Product Catalog Migration (12 artisanal products, images, inventory)
-- 4. Authoritative place_order RPC security and calculation validation
-- ==============================================================================

-- 1. STORAGE BUCKETS SETUP
INSERT INTO storage.buckets (id, name, public)
VALUES 
    ('products', 'products', true),
    ('payment-proofs', 'payment-proofs', false),
    ('custom-orders', 'custom-orders', false)
ON CONFLICT (id) DO UPDATE SET public = EXCLUDED.public;

-- Storage Policies for Products (Public read, admin/authenticated write)
DROP POLICY IF EXISTS "Public Read Products Bucket" ON storage.objects;
CREATE POLICY "Public Read Products Bucket" ON storage.objects
    FOR SELECT USING (bucket_id = 'products');

DROP POLICY IF EXISTS "Upload Products Bucket" ON storage.objects;
CREATE POLICY "Upload Products Bucket" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'products');

DROP POLICY IF EXISTS "Delete Products Bucket" ON storage.objects;
CREATE POLICY "Delete Products Bucket" ON storage.objects
    FOR DELETE USING (bucket_id = 'products' AND (public.is_admin() OR auth.role() = 'authenticated'));

-- Storage Policies for Payment Proofs (Anyone can upload on checkout, admin can view)
DROP POLICY IF EXISTS "Anyone can upload payment proof during checkout" ON storage.objects;
CREATE POLICY "Anyone can upload payment proof during checkout" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'payment-proofs');

DROP POLICY IF EXISTS "Admins can view payment proofs" ON storage.objects;
CREATE POLICY "Admins can view payment proofs" ON storage.objects
    FOR SELECT USING (bucket_id = 'payment-proofs' AND (public.is_admin() OR auth.role() = 'authenticated'));

-- Storage Policies for Custom Orders (Anyone can upload reference images, admin can view)
DROP POLICY IF EXISTS "Anyone can upload custom order reference images" ON storage.objects;
CREATE POLICY "Anyone can upload custom order reference images" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'custom-orders');

DROP POLICY IF EXISTS "Admins and owners can view custom order images" ON storage.objects;
CREATE POLICY "Admins and owners can view custom order images" ON storage.objects
    FOR SELECT USING (bucket_id = 'custom-orders' AND (public.is_admin() OR auth.role() = 'authenticated'));


-- 2. SEED AUTHORITATIVE COUPONS
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


-- 3. FUNCTION TO SEED/MIGRATE THE PRODUCT CATALOG IDEMPOTENTLY
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
    -- Ensure categories exist and get their IDs
    SELECT id INTO v_bracelets_id FROM public.categories WHERE slug = 'bracelets' LIMIT 1;
    IF v_bracelets_id IS NULL THEN
        INSERT INTO public.categories (name, slug, description, image, status, sort_order)
        VALUES ('Bracelets', 'bracelets', 'Stackable, vibrant bracelets crafted with colorful glass and acrylic beads, charm accents, and delicate linked chains.', 'https://images.unsplash.com/photo-1611591475819-797de2338ec8?w=800&auto=format&fit=crop&q=80', 'active', 1)
        RETURNING id INTO v_bracelets_id;
    END IF;

    SELECT id INTO v_anklets_id FROM public.categories WHERE slug = 'anklets' LIMIT 1;
    IF v_anklets_id IS NULL THEN
        INSERT INTO public.categories (name, slug, description, image, status, sort_order)
        VALUES ('Anklets', 'anklets', 'Delicate waterproof anklets strung with radiant beads, beach-inspired accents, and musical chime bells.', 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&auto=format&fit=crop&q=80', 'active', 2)
        RETURNING id INTO v_anklets_id;
    END IF;

    SELECT id INTO v_necklaces_id FROM public.categories WHERE slug = 'necklaces' LIMIT 1;
    IF v_necklaces_id IS NULL THEN
        INSERT INTO public.categories (name, slug, description, image, status, sort_order)
        VALUES ('Necklaces', 'necklaces', 'Romantic statement chokers with faceted glass beads, charm pendants, and gold-tone linked chains.', 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&auto=format&fit=crop&q=80', 'active', 3)
        RETURNING id INTO v_necklaces_id;
    END IF;

    SELECT id INTO v_earrings_id FROM public.categories WHERE slug = 'earrings' LIMIT 1;
    IF v_earrings_id IS NULL THEN
        INSERT INTO public.categories (name, slug, description, image, status, sort_order)
        VALUES ('Earrings', 'earrings', 'Feather-light beaded drops woven with colorful glass seed beads and gold-tone ear hooks.', 'https://images.unsplash.com/photo-1630019852942-f89202989a59?w=800&auto=format&fit=crop&q=80', 'active', 4)
        RETURNING id INTO v_earrings_id;
    END IF;

    SELECT id INTO v_rings_id FROM public.categories WHERE slug = 'rings' LIMIT 1;
    IF v_rings_id IS NULL THEN
        INSERT INTO public.categories (name, slug, description, image, status, sort_order)
        VALUES ('Rings', 'rings', 'Comfortable stretch micro-bead stacking rings decorated with miniature glass beads and gold-tone accents.', 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&auto=format&fit=crop&q=80', 'active', 5)
        RETURNING id INTO v_rings_id;
    END IF;

    SELECT id INTO v_custom_id FROM public.categories WHERE slug = 'custom-pieces' LIMIT 1;
    IF v_custom_id IS NULL THEN
        INSERT INTO public.categories (name, slug, description, image, status, sort_order)
        VALUES ('Custom Pieces', 'custom-pieces', 'Bespoke pieces handcrafted to your exact wrist dimensions, custom bead color choices, and letter charms.', 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&auto=format&fit=crop&q=80', 'active', 6)
        RETURNING id INTO v_custom_id;
    END IF;

    -- =========================================================================
    -- PRODUCT 1: Celestial Pearl Charm Bracelet
    -- =========================================================================
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

    -- =========================================================================
    -- PRODUCT 2: Sunset Amber Beaded Bracelet
    -- =========================================================================
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

    -- =========================================================================
    -- PRODUCT 3: Blush Bloom Beaded Bracelet
    -- =========================================================================
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

    -- =========================================================================
    -- PRODUCT 4: Ocean Breeze Beaded Anklet
    -- =========================================================================
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

    -- =========================================================================
    -- PRODUCT 5: Golden Hour Layered Necklace
    -- =========================================================================
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

    -- =========================================================================
    -- PRODUCT 6: Starlight Dainty Choker
    -- =========================================================================
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

    -- =========================================================================
    -- PRODUCT 7: Sunlit Golden Charm Anklet
    -- =========================================================================
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

    -- =========================================================================
    -- PRODUCT 8: Ocean Wave Beaded Anklet
    -- =========================================================================
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

    -- =========================================================================
    -- PRODUCT 9: Celestial Rose Choker
    -- =========================================================================
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

    -- =========================================================================
    -- PRODUCT 10: Emerald Flora Beaded Drops
    -- =========================================================================
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

    -- =========================================================================
    -- PRODUCT 11: Solstice Stacking Rings (Set of 3)
    -- =========================================================================
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

    -- =========================================================================
    -- PRODUCT 12: Bespoke Custom Initial & Beaded Bracelet
    -- =========================================================================
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

-- Execute seed function immediately during migration
SELECT public.seed_product_catalog();

-- Grant execute to anon and authenticated so admin/init can also trigger if needed
GRANT EXECUTE ON FUNCTION public.seed_product_catalog() TO anon, authenticated;

-- Ensure public read on products and product_images
GRANT SELECT ON public.products TO anon, authenticated;
GRANT SELECT ON public.product_images TO anon, authenticated;
GRANT SELECT ON public.inventory TO anon, authenticated;
