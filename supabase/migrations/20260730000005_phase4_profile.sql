-- DUBL Phase 4: Profile settings, dubls feed, tax documents
-- Author: spidersw3b3

-- ---------------------------------------------------------------------------
-- user_privacy_settings
-- ---------------------------------------------------------------------------
CREATE TABLE public.user_privacy_settings (
  user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  hide_personal_info BOOLEAN NOT NULL DEFAULT false,
  discoverable_by_username BOOLEAN NOT NULL DEFAULT true,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- user_notification_settings
-- ---------------------------------------------------------------------------
CREATE TABLE public.user_notification_settings (
  user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  push_enabled BOOLEAN NOT NULL DEFAULT true,
  email_enabled BOOLEAN NOT NULL DEFAULT true,
  txn_alerts BOOLEAN NOT NULL DEFAULT true,
  promo_alerts BOOLEAN NOT NULL DEFAULT false,
  referral_alerts BOOLEAN NOT NULL DEFAULT true,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- user_app_settings
-- ---------------------------------------------------------------------------
CREATE TABLE public.user_app_settings (
  user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  language TEXT NOT NULL DEFAULT 'en',
  currency TEXT NOT NULL DEFAULT 'USD',
  default_payment_method TEXT NOT NULL DEFAULT 'balance'
    CHECK (default_payment_method IN ('balance', 'debit', 'credit_line')),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- double_attempts (dubls feed — payment_intent FK added Phase 5)
-- ---------------------------------------------------------------------------
CREATE TABLE public.double_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  payment_intent_id UUID,
  stake_amount NUMERIC(18, 2) NOT NULL CHECK (stake_amount > 0),
  win_probability NUMERIC(5, 4) NOT NULL,
  outcome TEXT NOT NULL CHECK (outcome IN ('win', 'loss')),
  payout_amount NUMERIC(18, 2) NOT NULL DEFAULT 0,
  rng_seed_hash TEXT,
  status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('completed', 'pending')),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_double_attempts_user ON public.double_attempts(user_id, created_at DESC);

-- ---------------------------------------------------------------------------
-- tax_documents
-- ---------------------------------------------------------------------------
CREATE TABLE public.tax_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  period TEXT NOT NULL,
  label TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  uploaded_by_admin UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, period)
);

CREATE INDEX idx_tax_documents_user ON public.tax_documents(user_id, period DESC);

-- ---------------------------------------------------------------------------
-- Bootstrap settings on new profile
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.bootstrap_profile_settings()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_privacy_settings (user_id) VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  INSERT INTO public.user_notification_settings (user_id) VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  INSERT INTO public.user_app_settings (user_id) VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER profiles_bootstrap_settings
  AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.bootstrap_profile_settings();

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
ALTER TABLE public.user_privacy_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_notification_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_app_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.double_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tax_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY privacy_select_own ON public.user_privacy_settings
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY privacy_update_own ON public.user_privacy_settings
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY notif_select_own ON public.user_notification_settings
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY notif_update_own ON public.user_notification_settings
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY app_settings_select_own ON public.user_app_settings
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY app_settings_update_own ON public.user_app_settings
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY double_attempts_select_own ON public.double_attempts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY tax_docs_select_own ON public.tax_documents
  FOR SELECT USING (auth.uid() = user_id);

COMMENT ON TABLE public.double_attempts IS 'Double flip outcomes for Dubls feed. Inserts via edge fn Phase 5.';
COMMENT ON TABLE public.tax_documents IS 'Monthly tax PDFs uploaded by admin to storage bucket.';
