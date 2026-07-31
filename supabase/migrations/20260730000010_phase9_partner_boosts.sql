-- DUBL Phase 9: Partner brands + subsidy burn tracking
-- Author: spidersw3b3

CREATE TABLE public.partner_brands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  merchant_tags TEXT[] NOT NULL DEFAULT '{}',
  boosted_win_probability NUMERIC(5, 4) NOT NULL
    CHECK (boosted_win_probability >= 0 AND boosted_win_probability <= 1),
  subsidy_cap NUMERIC(18, 2) NOT NULL DEFAULT 0 CHECK (subsidy_cap >= 0),
  subsidy_used NUMERIC(18, 2) NOT NULL DEFAULT 0 CHECK (subsidy_used >= 0),
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT partner_brands_subsidy_used_lte_cap
    CHECK (subsidy_used <= subsidy_cap OR subsidy_cap = 0)
);

CREATE INDEX idx_partner_brands_slug ON public.partner_brands(slug);
CREATE INDEX idx_partner_brands_active ON public.partner_brands(active) WHERE active = true;

CREATE TABLE public.partner_subsidy_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID NOT NULL REFERENCES public.partner_brands(id) ON DELETE CASCADE,
  double_attempt_id UUID REFERENCES public.double_attempts(id) ON DELETE SET NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  merchant_name TEXT NOT NULL,
  stake_amount NUMERIC(18, 2) NOT NULL CHECK (stake_amount > 0),
  subsidy_amount NUMERIC(18, 2) NOT NULL CHECK (subsidy_amount > 0),
  win_probability_used NUMERIC(5, 4) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_partner_subsidy_events_partner
  ON public.partner_subsidy_events(partner_id, created_at DESC);

ALTER TABLE public.partner_brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partner_subsidy_events ENABLE ROW LEVEL SECURITY;
-- No client policies — admin-api / service_role only

-- Seed default partners (idempotent by slug)
INSERT INTO public.partner_brands (name, slug, merchant_tags, boosted_win_probability, subsidy_cap, active)
VALUES
  ('Nike', 'nike', ARRAY['nike', 'nike store'], 0.5500, 10000.00, true),
  ('Starbucks', 'starbucks', ARRAY['starbucks', 'coffee shop'], 0.5000, 5000.00, true),
  ('Target', 'target', ARRAY['target'], 0.4500, 8000.00, true)
ON CONFLICT (slug) DO NOTHING;

COMMENT ON TABLE public.partner_brands IS 'Partner odds boosts at checkout. Merchant tag match → boosted_win_probability.';
COMMENT ON TABLE public.partner_subsidy_events IS 'Append-only subsidy burn log when partner-funded double wins pay out.';
