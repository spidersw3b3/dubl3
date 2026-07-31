-- DUBL Phase 8: RLS hardening + balance mint lockdown
-- Author: spidersw3b3

-- ---------------------------------------------------------------------------
-- Explicit privilege lockdown on money tables (belt + suspenders with RLS)
-- ---------------------------------------------------------------------------
REVOKE INSERT, UPDATE, DELETE ON public.wallets FROM anon, authenticated;
REVOKE INSERT, UPDATE, DELETE ON public.transactions FROM anon, authenticated;
REVOKE ALL ON public.idempotency_keys FROM anon, authenticated;

GRANT SELECT ON public.wallets TO authenticated;
GRANT SELECT ON public.transactions TO authenticated;

-- ---------------------------------------------------------------------------
-- Block direct wallet UPDATE unless RPC sets session flag
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.guard_wallet_direct_mutation()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF current_setting('dubl.allow_wallet_mutation', true) IS DISTINCT FROM 'true' THEN
    RAISE EXCEPTION 'Direct wallet mutation forbidden — use dubl_wallet_movement() RPC'
      USING ERRCODE = '42501';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_guard_wallet_mutation ON public.wallets;
CREATE TRIGGER trg_guard_wallet_mutation
  BEFORE UPDATE ON public.wallets
  FOR EACH ROW
  EXECUTE FUNCTION public.guard_wallet_direct_mutation();

-- Patch RPC: set session flag before any wallet UPDATE
CREATE OR REPLACE FUNCTION public.dubl_wallet_movement(
  p_user_id UUID,
  p_type public.transaction_type,
  p_amount NUMERIC,
  p_direction public.transaction_direction,
  p_reference_type TEXT DEFAULT NULL,
  p_reference_id UUID DEFAULT NULL,
  p_idempotency_key TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_wallet public.wallets%ROWTYPE;
  v_balance_before NUMERIC(18, 2);
  v_balance_after NUMERIC(18, 2);
  v_tx_id UUID;
  v_existing JSONB;
BEGIN
  IF p_amount IS NULL OR p_amount <= 0 THEN
    RAISE EXCEPTION 'amount must be positive';
  END IF;

  IF p_idempotency_key IS NOT NULL THEN
    SELECT response_body INTO v_existing
    FROM public.idempotency_keys
    WHERE scope = 'wallet_movement'
      AND key = p_idempotency_key
      AND expires_at > now();

    IF FOUND AND v_existing IS NOT NULL THEN
      RETURN v_existing;
    END IF;

    SELECT jsonb_build_object(
      'transaction_id', t.id,
      'balance_before', t.balance_before,
      'balance_after', t.balance_after,
      'idempotent_replay', true
    ) INTO v_existing
    FROM public.transactions t
    WHERE t.idempotency_key = p_idempotency_key;

    IF FOUND THEN
      RETURN v_existing;
    END IF;
  END IF;

  SELECT * INTO v_wallet
  FROM public.wallets
  WHERE user_id = p_user_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'wallet not found for user %', p_user_id;
  END IF;

  v_balance_before := v_wallet.balance_usd;

  IF p_direction = 'credit' THEN
    v_balance_after := v_balance_before + p_amount;
  ELSE
    IF v_balance_before >= p_amount THEN
      v_balance_after := v_balance_before - p_amount;
    ELSIF p_type IN ('double_loss', 'credit_line_draw', 'payment', 'withdrawal', 'p2p_send', 'fee') THEN
      IF (v_wallet.double_credit_limit - v_wallet.double_credit_used) >= (p_amount - v_balance_before) THEN
        v_balance_after := 0;
        PERFORM set_config('dubl.allow_wallet_mutation', 'true', true);
        UPDATE public.wallets
        SET double_credit_used = double_credit_used + (p_amount - v_balance_before)
        WHERE user_id = p_user_id;
      ELSE
        RAISE EXCEPTION 'insufficient balance and credit line';
      END IF;
    ELSE
      RAISE EXCEPTION 'insufficient balance';
    END IF;
  END IF;

  IF v_balance_after < 0 THEN
    RAISE EXCEPTION 'balance would go negative';
  END IF;

  PERFORM set_config('dubl.allow_wallet_mutation', 'true', true);
  UPDATE public.wallets
  SET balance_usd = v_balance_after
  WHERE user_id = p_user_id;

  INSERT INTO public.transactions (
    user_id, type, direction, amount, currency,
    balance_before, balance_after,
    reference_type, reference_id, idempotency_key,
    status, metadata
  ) VALUES (
    p_user_id, p_type, p_direction, p_amount, 'USD',
    v_balance_before, v_balance_after,
    p_reference_type, p_reference_id, p_idempotency_key,
    'completed', p_metadata
  )
  RETURNING id INTO v_tx_id;

  v_existing := jsonb_build_object(
    'transaction_id', v_tx_id,
    'balance_before', v_balance_before,
    'balance_after', v_balance_after,
    'double_credit_used', (SELECT double_credit_used FROM public.wallets WHERE user_id = p_user_id),
    'double_credit_limit', (SELECT double_credit_limit FROM public.wallets WHERE user_id = p_user_id)
  );

  IF p_idempotency_key IS NOT NULL THEN
    INSERT INTO public.idempotency_keys (scope, key, user_id, response_body)
    VALUES ('wallet_movement', p_idempotency_key, p_user_id, v_existing)
    ON CONFLICT (scope, key) DO UPDATE SET response_body = EXCLUDED.response_body;
  END IF;

  RETURN v_existing;
END;
$$;

REVOKE ALL ON FUNCTION public.dubl_wallet_movement FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.dubl_wallet_movement TO service_role;

-- Reconciliation export job metadata (admin cron target)
CREATE TABLE IF NOT EXISTS public.reconciliation_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'completed'
    CHECK (status IN ('running', 'completed', 'failed')),
  row_count INT NOT NULL DEFAULT 0,
  mismatch_count INT NOT NULL DEFAULT 0,
  storage_path TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb
);

ALTER TABLE public.reconciliation_runs ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE public.reconciliation_runs IS 'Ledger reconciliation export job history. Phase 8.';
COMMENT ON FUNCTION public.guard_wallet_direct_mutation IS 'Blocks direct wallet UPDATE outside dubl_wallet_movement RPC.';
