-- Safepay hosted checkout support.
-- Keep payment status pending until a verified Safepay webhook confirms capture.
DO $$
DECLARE c RECORD;
BEGIN
  FOR c IN
    SELECT conname FROM pg_constraint
    WHERE conrelid = 'public.orders'::regclass
      AND contype = 'c'
      AND pg_get_constraintdef(oid) ILIKE '%payment_method%'
  LOOP
    EXECUTE format('ALTER TABLE public.orders DROP CONSTRAINT %I', c.conname);
  END LOOP;

  FOR c IN
    SELECT conname FROM pg_constraint
    WHERE conrelid = 'public.payments'::regclass
      AND contype = 'c'
      AND pg_get_constraintdef(oid) ILIKE '%method%'
  LOOP
    EXECUTE format('ALTER TABLE public.payments DROP CONSTRAINT %I', c.conname);
  END LOOP;
END $$;

ALTER TABLE public.orders
  ADD CONSTRAINT orders_payment_method_check
  CHECK (payment_method IN ('cod', 'easypaisa', 'jazzcash', 'bank_transfer', 'safepay'));

ALTER TABLE public.payments
  ADD CONSTRAINT payments_method_check
  CHECK (method IN ('cod', 'easypaisa', 'jazzcash', 'bank_transfer', 'safepay'));

COMMENT ON COLUMN public.orders.payment_method IS 'Payment method selected at checkout; Safepay orders remain pending until verified webhook confirmation.';
