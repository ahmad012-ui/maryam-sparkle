-- Production hotfix: restore auth profile creation and secure guest order tracking.
-- Orders/order_items/payments are never directly readable by anon.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, first_name, last_name, phone, role, status)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(COALESCE(NEW.email, ''), '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'first_name', split_part(COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''), ' ', 1)),
    COALESCE(NEW.raw_user_meta_data->>'last_name', split_part(COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''), ' ', 2)),
    NEW.raw_user_meta_data->>'phone',
    'customer',
    'active'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, public.profiles.full_name),
    phone = COALESCE(EXCLUDED.phone, public.profiles.phone),
    updated_at = now();
  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO postgres, service_role;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

INSERT INTO public.profiles (id, email, full_name, first_name, last_name, phone, role, status)
SELECT
  u.id,
  u.email,
  COALESCE(u.raw_user_meta_data->>'full_name', u.raw_user_meta_data->>'name', split_part(COALESCE(u.email, ''), '@', 1)),
  split_part(COALESCE(u.raw_user_meta_data->>'full_name', u.raw_user_meta_data->>'name', ''), ' ', 1),
  NULLIF(split_part(COALESCE(u.raw_user_meta_data->>'full_name', u.raw_user_meta_data->>'name', ''), ' ', 2), ''),
  u.raw_user_meta_data->>'phone',
  'customer',
  'active'
FROM auth.users u
WHERE NOT EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = u.id);

CREATE OR REPLACE FUNCTION public.track_guest_order(
  p_order_number TEXT,
  p_email TEXT DEFAULT NULL,
  p_phone TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_order JSONB;
  v_email TEXT := lower(trim(coalesce(p_email, '')));
  v_phone TEXT := regexp_replace(coalesce(p_phone, ''), '\\D', '', 'g');
BEGIN
  IF trim(coalesce(p_order_number, '')) = '' OR (v_email = '' AND v_phone = '') THEN
    RETURN NULL;
  END IF;

  SELECT jsonb_build_object(
    'order', to_jsonb(o),
    'order_items', COALESCE((SELECT jsonb_agg(to_jsonb(oi) ORDER BY oi.created_at) FROM public.order_items oi WHERE oi.order_id = o.id), '[]'::jsonb),
    'payments', COALESCE((SELECT jsonb_agg(to_jsonb(p) ORDER BY p.created_at) FROM public.payments p WHERE p.order_id = o.id), '[]'::jsonb)
  )
  INTO v_order
  FROM public.orders o
  WHERE lower(o.order_number) = lower(trim(p_order_number))
    AND o.user_id IS NULL
    AND (
      (v_email <> '' AND lower(o.customer_email) = v_email)
      OR (v_phone <> '' AND regexp_replace(o.customer_phone, '\\D', '', 'g') = v_phone)
    )
  LIMIT 1;

  RETURN v_order;
END;
$$;

REVOKE ALL ON FUNCTION public.track_guest_order(TEXT, TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.track_guest_order(TEXT, TEXT, TEXT) TO anon, authenticated;

DROP POLICY IF EXISTS "Users can view their own orders or track order" ON public.orders;
DROP POLICY IF EXISTS "orders_own_read" ON public.orders;
CREATE POLICY "orders_own_read" ON public.orders
FOR SELECT USING ((user_id = auth.uid()) OR public.is_admin());

-- Checkout must use the trusted place_order RPC. These tables remain admin-write only.
DROP POLICY IF EXISTS "order_items_admin_insert" ON public.order_items;
CREATE POLICY "order_items_admin_insert" ON public.order_items FOR INSERT WITH CHECK (public.is_admin());
DROP POLICY IF EXISTS "payments_admin_insert" ON public.payments;
CREATE POLICY "payments_admin_insert" ON public.payments FOR INSERT WITH CHECK (public.is_admin());
