-- DUBL Phase 0: Atomic wallet movement RPC
-- Author: spidersw3b3
-- All money mutations MUST go through this function (service_role / edge fns only)

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

  -- Idempotency: return cached response if key already used
  IF p_idempotency_key IS NOT NULL THEN
    SELECT response_body INTO v_existing
    FROM public.idempotency_keys
    WHERE scope = 'wallet_movement'
      AND key = p_idempotency_key
      AND expires_at > now();

    IF FOUND AND v_existing IS NOT NULL THEN
      RETURN v_existing;
    END IF;

    -- Also check transactions table
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

  -- Lock wallet row
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
    -- Debit: try balance first, then credit line for eligible types
    IF v_balance_before >= p_amount THEN
      v_balance_after := v_balance_before - p_amount;
    ELSIF p_type IN ('double_loss', 'credit_line_draw', 'payment', 'withdrawal', 'p2p_send', 'fee') THEN
      -- Use credit line if available
      IF (v_wallet.double_credit_limit - v_wallet.double_credit_used) >= (p_amount - v_balance_before) THEN
        v_balance_after := 0;
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

COMMENT ON FUNCTION public.dubl_wallet_movement IS
  'Atomic ledger mutation with row lock, idempotency, and credit line waterfall.';
