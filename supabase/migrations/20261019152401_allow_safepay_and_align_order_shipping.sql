DO $migration$
DECLARE
  v_definition TEXT;
  v_old_declaration TEXT := $old$  v_address JSONB;$old$;
  v_new_declaration TEXT := $new$  v_address JSONB;
  v_shipping_settings JSONB;$new$;
  v_old_payment TEXT := $old$IF v_payment_method NOT IN ('cod','easypaisa','jazzcash','bank_transfer') THEN$old$;
  v_new_payment TEXT := $new$IF v_payment_method NOT IN ('cod','easypaisa','jazzcash','bank_transfer','safepay') THEN$new$;
  v_old_shipping TEXT := $old$v_shipping := CASE WHEN v_delivery_method = 'express' THEN 300 ELSE 0 END;$old$;
  v_new_shipping TEXT := $new$SELECT settings INTO v_shipping_settings
  FROM public.store_settings
  ORDER BY updated_at DESC
  LIMIT 1;

  IF v_delivery_method = 'express' THEN
    v_shipping := COALESCE(NULLIF(v_shipping_settings->>'expressShippingFee', '')::NUMERIC, 450);
  ELSIF v_subtotal >= COALESCE(NULLIF(v_shipping_settings->>'freeShippingThreshold', '')::NUMERIC, 3500)
     OR v_subtotal = 0 THEN
    v_shipping := 0;
  ELSE
    v_shipping := COALESCE(NULLIF(v_shipping_settings->>'standardShippingFee', '')::NUMERIC, 250);
  END IF;$new$;
BEGIN
  SELECT pg_get_functiondef('public.place_order(jsonb)'::regprocedure) INTO v_definition;

  IF position(v_old_declaration IN v_definition) = 0
     OR position(v_old_payment IN v_definition) = 0
     OR position(v_old_shipping IN v_definition) = 0 THEN
    RAISE EXCEPTION 'place_order definition differs from the expected version; refusing to patch it automatically';
  END IF;

  v_definition := replace(v_definition, v_old_declaration, v_new_declaration);
  v_definition := replace(v_definition, v_old_payment, v_new_payment);
  v_definition := replace(v_definition, v_old_shipping, v_new_shipping);
  EXECUTE v_definition;
END
$migration$;
