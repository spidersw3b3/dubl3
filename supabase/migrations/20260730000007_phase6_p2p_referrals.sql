-- DUBL Phase 6: P2P transfers, friendships, referral attributions
-- Author: spidersw3b3

CREATE TYPE public.friendship_status AS ENUM ('pending', 'accepted', 'blocked');

CREATE TABLE public.friendships (
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  friend_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status public.friendship_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, friend_id),
  CONSTRAINT friendships_not_self CHECK (user_id <> friend_id)
);

CREATE INDEX idx_friendships_user ON public.friendships(user_id, status);
CREATE INDEX idx_friendships_friend ON public.friendships(friend_id, status);

CREATE TYPE public.p2p_transfer_status AS ENUM ('pending', 'completed', 'failed', 'reversed');

CREATE TABLE public.p2p_transfers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount NUMERIC(18, 2) NOT NULL CHECK (amount > 0),
  currency TEXT NOT NULL DEFAULT 'USD',
  note TEXT,
  status public.p2p_transfer_status NOT NULL DEFAULT 'pending',
  idempotency_key TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  CONSTRAINT p2p_transfers_not_self CHECK (sender_id <> receiver_id)
);

CREATE UNIQUE INDEX idx_p2p_transfers_idempotency
  ON public.p2p_transfers(idempotency_key)
  WHERE idempotency_key IS NOT NULL;

CREATE INDEX idx_p2p_transfers_sender ON public.p2p_transfers(sender_id, created_at DESC);
CREATE INDEX idx_p2p_transfers_receiver ON public.p2p_transfers(receiver_id, created_at DESC);

CREATE TYPE public.referral_status AS ENUM ('pending', 'qualified', 'paid', 'expired');

CREATE TABLE public.referral_attributions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  referred_user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  referral_code TEXT NOT NULL,
  status public.referral_status NOT NULL DEFAULT 'pending',
  bonus_amount NUMERIC(18, 2) NOT NULL DEFAULT 50 CHECK (bonus_amount > 0),
  qualified_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  qualify_trigger TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT referral_attributions_unique_referred UNIQUE (referred_user_id)
);

CREATE INDEX idx_referral_attributions_referrer
  ON public.referral_attributions(referrer_id, status);

-- RLS: players read own social rows; writes via edge fn only
ALTER TABLE public.friendships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.p2p_transfers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_attributions ENABLE ROW LEVEL SECURITY;

CREATE POLICY friendships_select_own ON public.friendships
  FOR SELECT USING (auth.uid() = user_id OR auth.uid() = friend_id);

CREATE POLICY p2p_transfers_select_own ON public.p2p_transfers
  FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY referral_attributions_select_own ON public.referral_attributions
  FOR SELECT USING (auth.uid() = referrer_id OR auth.uid() = referred_user_id);

COMMENT ON TABLE public.friendships IS 'Venmo-style friend graph. Mutations via dubl-api edge fn.';
COMMENT ON TABLE public.p2p_transfers IS 'USD balance P2P sends. Ledger rows created atomically with transfer.';
COMMENT ON TABLE public.referral_attributions IS 'Referrer attribution; $50 bonus on qualify (mock in test).';
