-- Maryam Sparkle security hardening

-- 1) Reviews must enter moderation as pending. Existing approved rows are preserved.
alter table public.reviews alter column status set default 'pending';
drop policy if exists reviews_own_insert on public.reviews;
create policy reviews_own_insert on public.reviews
  for insert to authenticated
  with check (user_id = auth.uid() and status = 'pending');

-- 2) Guest tracking: throttle repeated attempts and return only tracking-safe data.
create table if not exists public.guest_tracking_attempts (
  bucket_key text primary key,
  window_started_at timestamptz not null default date_trunc('minute', now()),
  attempt_count integer not null default 0 check (attempt_count >= 0)
);
alter table public.guest_tracking_attempts enable row level security;
revoke all on public.guest_tracking_attempts from anon, authenticated;

create or replace function public.track_guest_order(
  p_order_number text,
  p_email text default null,
  p_phone text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $function$
declare
  v_order jsonb;
  v_email text := lower(trim(coalesce(p_email, '')));
  v_phone text := regexp_replace(coalesce(p_phone, ''), '\D', '', 'g');
  v_identifier text;
  v_key text;
  v_count integer;
begin
  if trim(coalesce(p_order_number, '')) = '' or (v_email = '' and v_phone = '') then
    return null;
  end if;

  v_identifier := case when v_email <> '' then 'email:' || v_email else 'phone:' || v_phone end;
  v_key := encode(digest(v_identifier, 'sha256'), 'hex');

  insert into public.guest_tracking_attempts(bucket_key, window_started_at, attempt_count)
  values (v_key, date_trunc('minute', now()), 1)
  on conflict (bucket_key) do update
    set attempt_count = case
      when public.guest_tracking_attempts.window_started_at < now() - interval '15 minutes' then 1
      else public.guest_tracking_attempts.attempt_count + 1
    end,
    window_started_at = case
      when public.guest_tracking_attempts.window_started_at < now() - interval '15 minutes' then date_trunc('minute', now())
      else public.guest_tracking_attempts.window_started_at
    end
  returning attempt_count into v_count;

  if v_count > 12 then
    return null;
  end if;

  select jsonb_build_object(
    'order', jsonb_build_object(
      'order_number', o.order_number,
      'customer_name', o.customer_name,
      'status', o.status,
      'payment_status', o.payment_status,
      'payment_method', o.payment_method,
      'subtotal', o.subtotal,
      'shipping_fee', o.shipping_fee,
      'discount', o.discount,
      'total', o.total,
      'delivery_method', o.delivery_method,
      'courier_name', o.courier_name,
      'tracking_number', o.tracking_number,
      'estimated_delivery', o.estimated_delivery,
      'created_at', o.created_at,
      'updated_at', o.updated_at
    ),
    'order_items', coalesce((
      select jsonb_agg(jsonb_build_object(
        'product_name', oi.product_name,
        'product_slug', oi.product_slug,
        'product_image', oi.product_image,
        'quantity', oi.quantity,
        'unit_price', oi.unit_price,
        'subtotal', oi.subtotal,
        'size', oi.size,
        'finish', oi.finish
      ) order by oi.created_at)
      from public.order_items oi
      where oi.order_id = o.id
    ), '[]'::jsonb)
  )
  into v_order
  from public.orders o
  where lower(o.order_number) = lower(trim(p_order_number))
    and o.user_id is null
    and (
      (v_email <> '' and lower(o.customer_email) = v_email)
      or (v_phone <> '' and regexp_replace(o.customer_phone, '\D', '', 'g') = v_phone)
    )
  limit 1;

  return v_order;
end;
$function$;

-- 3) Storage hardening: enforce server-side MIME/size limits.
update storage.buckets
set file_size_limit = 5242880,
    allowed_mime_types = array['image/jpeg','image/png','image/webp']
where id in ('products','payment-proofs','custom-orders');

-- Private uploads must be attributable to the authenticated user.
drop policy if exists "Anyone can upload payment proof during checkout" on storage.objects;
create policy "Authenticated users upload own payment proofs"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'payment-proofs'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
);

drop policy if exists "Anyone can upload custom order reference images" on storage.objects;
create policy "Authenticated users upload own custom order images"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'custom-orders'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
);

-- 4) Least-privilege grants: policies decide rows; grants decide which operations are even possible.
revoke all on public.addresses, public.cart_items, public.carts, public.categories, public.contact_messages,
  public.coupons, public.custom_order_images, public.custom_orders, public.inventory, public.newsletter_subscribers,
  public.order_items, public.orders, public.payments, public.product_attributes, public.product_images,
  public.products, public.profiles, public.reviews, public.store_settings, public.wishlists
from anon, authenticated;

-- Public/catalog reads.
grant select on public.categories, public.coupons, public.product_attributes, public.product_images,
  public.products, public.reviews, public.store_settings to anon, authenticated;

-- Anonymous writes intentionally exposed by the app.
grant insert on public.contact_messages, public.newsletter_subscribers, public.custom_orders to anon;

-- Authenticated customer/admin operations.
grant select, insert, update, delete on public.addresses, public.cart_items, public.carts, public.wishlists to authenticated;
grant select, insert, update, delete on public.categories, public.coupons to authenticated;
grant select, insert, update, delete on public.contact_messages to authenticated;
grant select, insert, update, delete on public.custom_order_images, public.custom_orders to authenticated;
grant select, insert, update, delete on public.inventory to authenticated;
grant select, insert, update, delete on public.newsletter_subscribers to authenticated;
grant select, insert, update, delete on public.order_items, public.orders, public.payments to authenticated;
grant select, insert, update, delete on public.product_attributes, public.product_images, public.products to authenticated;
grant select, insert, update, delete on public.profiles to authenticated;
grant select, insert, update, delete on public.reviews to authenticated;
grant select, insert, update, delete on public.store_settings to authenticated;

-- Keep RPC entry points callable through the Data API.
grant execute on function public.is_admin() to anon, authenticated;
grant execute on function public.place_order(jsonb) to anon, authenticated;
grant execute on function public.track_guest_order(text,text,text) to anon, authenticated;
