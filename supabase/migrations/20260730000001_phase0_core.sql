-- DUBL Phase 0: Core identity + ledger foundation
-- Author: spidersw3b3

-- Extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ---------------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------------
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  email TEXT,
  display_name TEXT,
  address_json JSONB DEFAULT '{}'::jsonb,
  appearance_preset TEXT NOT NULL DEFAULT 'dark'
    CHECK (appearance_preset IN ('dark', 'light', 'system', 'brown', 'pink', 'teal-light')),
  is_test_account BOOLEAN NOT NULL DEFAULT false,
  referral_code TEXT UNIQUE,
  avatar_initials TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_profiles_username ON public.profiles(username);
CREATE INDEX idx_profiles_referral_code ON public.profiles(referral_code);

-- ---------------------------------------------------------------------------
-- wallets (one row per user)
-- ---------------------------------------------------------------------------
CREATE TABLE public.wallets (
  user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  balance_usd NUMERIC(18, 2) NOT NULL DEFAULT 0
    CHECK (balance_usd >= 0),
  double_credit_limit NUMERIC(18, 2) NOT NULL DEFAULT 0
    CHECK (double_credit_limit >= 0),
  double_credit_used NUMERIC(18, 2) NOT NULL DEFAULT 0
    CHECK (double_credit_used >= 0),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT wallets_credit_used_lte_limit
    CHECK (double_credit_used <= double_credit_limit)
);

-- ---------------------------------------------------------------------------
-- transactions (append-only ledger)
-- ---------------------------------------------------------------------------
CREATE TYPE public.transaction_type AS ENUM (
  'deposit',
  'withdrawal',
  'p2p_send',
  'p2p_receive',
  'payment',
  'double_win',
  'double_loss',
  'credit_line_draw',
  'credit_line_repay',
  'referral_bonus',
  'fee',
  'adjustment'
);

CREATE TYPE public.transaction_direction AS ENUM ('credit', 'debit');

CREATE TYPE public.transaction_status AS ENUM (
  'pending',
  'completed',
  'failed',
  'reversed'
);

CREATE TABLE public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type public.transaction_type NOT NULL,
  direction public.transaction_direction NOT NULL,
  amount NUMERIC(18, 2) NOT NULL CHECK (amount > 0),
  currency TEXT NOT NULL DEFAULT 'USD',
  balance_before NUMERIC(18, 2) NOT NULL,
  balance_after NUMERIC(18, 2) NOT NULL,
  reference_type TEXT,
  reference_id UUID,
  idempotency_key TEXT,
  status public.transaction_status NOT NULL DEFAULT 'completed',
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX idx_transactions_idempotency
  ON public.transactions(idempotency_key)
  WHERE idempotency_key IS NOT NULL;

CREATE INDEX idx_transactions_user_created
  ON public.transactions(user_id, created_at DESC);

CREATE INDEX idx_transactions_type
  ON public.transactions(type);

CREATE INDEX idx_transactions_reference
  ON public.transactions(reference_type, reference_id)
  WHERE reference_id IS NOT NULL;

-- ---------------------------------------------------------------------------
-- idempotency_keys
-- ---------------------------------------------------------------------------
CREATE TABLE public.idempotency_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scope TEXT NOT NULL,
  key TEXT NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  response_hash TEXT,
  response_body JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '24 hours'),
  UNIQUE (scope, key)
);

CREATE INDEX idx_idempotency_keys_expires ON public.idempotency_keys(expires_at);

-- ---------------------------------------------------------------------------
-- updated_at trigger
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER wallets_updated_at
  BEFORE UPDATE ON public.wallets
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ---------------------------------------------------------------------------
-- profile bootstrap on signup
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_referral TEXT;
BEGIN
  v_referral := upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8));

  INSERT INTO public.profiles (id, email, username, referral_code, avatar_initials)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    v_referral,
    upper(substr(COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)), 1, 2))
  );

  INSERT INTO public.wallets (user_id, balance_usd, double_credit_limit, double_credit_used)
  VALUES (NEW.id, 0, 0, 0);

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.idempotency_keys ENABLE ROW LEVEL SECURITY;

-- Players: read own profile
CREATE POLICY profiles_select_own ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY profiles_update_own ON public.profiles
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Players: read own wallet only — no writes
CREATE POLICY wallets_select_own ON public.wallets
  FOR SELECT USING (auth.uid() = user_id);

-- Players: read own transactions only — no writes
CREATE POLICY transactions_select_own ON public.transactions
  FOR SELECT USING (auth.uid() = user_id);

-- idempotency_keys: no client access
-- (edge functions use service_role)

COMMENT ON TABLE public.transactions IS 'Append-only ledger. All mutations via dubl_wallet_movement() RPC.';
COMMENT ON TABLE public.wallets IS 'Authoritative USD balance + double credit line. Never update from client.';
