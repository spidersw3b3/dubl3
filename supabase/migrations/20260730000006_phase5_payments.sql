-- DUBL Phase 5: Payment intents, obligations, legal acceptances
-- Author: spidersw3b3

CREATE TYPE public.payment_intent_status AS ENUM (
  'draft',
  'authorized',
  'settled',
  'failed',
  'cancelled'
);

CREATE TABLE public.payment_intents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  merchant_name TEXT NOT NULL,
  amount NUMERIC(18, 2) NOT NULL CHECK (amount > 0),
  currency TEXT NOT NULL DEFAULT 'USD',
  source_type TEXT NOT NULL DEFAULT 'balance',
  source_id TEXT,
  double_enabled BOOLEAN NOT NULL DEFAULT false,
  status public.payment_intent_status NOT NULL DEFAULT 'draft',
  idempotency_key TEXT,
  settled_at TIMESTAMPTZ,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX idx_payment_intents_idempotency
  ON public.payment_intents(idempotency_key)
  WHERE idempotency_key IS NOT NULL;

CREATE INDEX idx_payment_intents_user ON public.payment_intents(user_id, created_at DESC);

-- Link double_attempts to payment_intents (FK added now that table exists)
ALTER TABLE public.double_attempts
  ADD CONSTRAINT double_attempts_payment_intent_fkey
  FOREIGN KEY (payment_intent_id) REFERENCES public.payment_intents(id) ON DELETE SET NULL;

CREATE TABLE public.dubl_obligations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  double_attempt_id UUID REFERENCES public.double_attempts(id) ON DELETE SET NULL,
  principal NUMERIC(18, 2) NOT NULL CHECK (principal > 0),
  fees NUMERIC(18, 2) NOT NULL DEFAULT 0,
  due_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'open'
    CHECK (status IN ('open', 'collecting', 'paid', 'written_off')),
  collection_attempts INT NOT NULL DEFAULT 0,
  linked_tx_ids UUID[] NOT NULL DEFAULT '{}',
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_obligations_user_status ON public.dubl_obligations(user_id, status);

CREATE TABLE public.legal_acceptances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  document_key TEXT NOT NULL,
  version TEXT NOT NULL DEFAULT '1.0',
  accepted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ip TEXT,
  UNIQUE (user_id, document_key, version)
);

CREATE INDEX idx_legal_acceptances_user ON public.legal_acceptances(user_id);

-- Provably-fair server seed registry (mock/dev seed in MVP)
CREATE TABLE public.pf_server_seeds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seed_hash TEXT NOT NULL,
  seed_plaintext TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  rotated_at TIMESTAMPTZ
);

INSERT INTO public.pf_server_seeds (seed_hash, seed_plaintext, active)
SELECT 'sha256:dev-mvp-seed-v1', 'dubl-dev-server-seed-do-not-use-in-prod', true
WHERE NOT EXISTS (SELECT 1 FROM public.pf_server_seeds WHERE active = true);

ALTER TABLE public.payment_intents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dubl_obligations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.legal_acceptances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pf_server_seeds ENABLE ROW LEVEL SECURITY;

CREATE POLICY payment_intents_select_own ON public.payment_intents
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY obligations_select_own ON public.dubl_obligations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY legal_acceptances_select_own ON public.legal_acceptances
  FOR SELECT USING (auth.uid() = user_id);

COMMENT ON TABLE public.payment_intents IS 'Payment lifecycle: draft → authorized → settled via dubl-api.';
COMMENT ON TABLE public.dubl_obligations IS 'Outstanding double-loss debt for collections queue.';
