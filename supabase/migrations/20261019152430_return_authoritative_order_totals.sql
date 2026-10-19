DO $migration$
DECLARE
  v_definition TEXT;
  v_old_return TEXT := $old$RETURN jsonb_build_object('success', true, 'order_id', v_order_id, 'order_number', v_order_number);$old$;
  v_new_return TEXT := $new$RETURN jsonb_build_object(
    'success', true,
    'order_id', v_order_id,
    'order_number', v_order_number,
    'subtotal', v_subtotal,
    'shipping_fee', v_shipping,
    'discount', v_discount,
    'total', v_total
  );$new$;
BEGIN
  SELECT pg_get_functiondef('public.place_order(jsonb)'::regprocedure) INTO v_definition;
  IF position(v_old_return IN v_definition) = 0 THEN
    RAISE EXCEPTION 'place_order return payload differs from expected version; refusing to patch it automatically';
  END IF;
  EXECUTE replace(v_definition, v_old_return, v_new_return);
END
$migration$;
