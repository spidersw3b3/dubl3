-- DUBL Phase 0: Seed test user
-- Run after auth user is created, or use supabase db seed
-- Credentials: test@dubl.app / TestDubl123!

-- Note: Auth user must be created via Supabase Auth API or dashboard first.
-- This migration upserts profile + wallet for the known test UUID pattern.

-- dubl_odds_config (minimal for Phase 0 reference)
CREATE TABLE IF NOT EXISTS public.dubl_odds_config (
  id SMALLINT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  mode TEXT NOT NULL DEFAULT 'bonus_only'
    CHECK (mode IN ('bonus_only', 'split_payment', 'tiered', 'partner_boost')),
  base_win_probability NUMERIC(5, 4) NOT NULL DEFAULT 0.4000
    CHECK (base_win_probability >= 0 AND base_win_probability <= 1),
  max_daily_double_usd NUMERIC(18, 2) NOT NULL DEFAULT 25.00,
  max_single_double_usd NUMERIC(18, 2) NOT NULL DEFAULT 200.00,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by UUID
);

INSERT INTO public.dubl_odds_config (id) VALUES (1)
ON CONFLICT (id) DO NOTHING;

ALTER TABLE public.dubl_odds_config ENABLE ROW LEVEL SECURITY;
-- No client policies — admin/service_role only

-- Helper to seed test account after signup
CREATE OR REPLACE FUNCTION public.seed_test_account(p_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.profiles
  SET
    is_test_account = true,
    username = 'testuser',
    display_name = 'Test User',
    avatar_initials = 'JD',
    appearance_preset = 'dark'
  WHERE id = p_user_id;

  UPDATE public.wallets
  SET
    balance_usd = 1234.56,
    double_credit_limit = 500.00,
    double_credit_used = 0
  WHERE user_id = p_user_id;
END;
$$;

REVOKE ALL ON FUNCTION public.seed_test_account FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.seed_test_account TO service_role;

COMMENT ON FUNCTION public.seed_test_account IS
  'Marks user as test account with $1,234.56 balance and $500 double credit.';
