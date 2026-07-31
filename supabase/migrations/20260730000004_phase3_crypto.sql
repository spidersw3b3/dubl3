-- DUBL Phase 3: Crypto wallets + transactions
-- Author: spidersw3b3

CREATE TABLE public.crypto_wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  asset TEXT NOT NULL,
  address TEXT NOT NULL,
  balance NUMERIC(24, 8) NOT NULL DEFAULT 0 CHECK (balance >= 0),
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, asset)
);

CREATE INDEX idx_crypto_wallets_user ON public.crypto_wallets(user_id);

CREATE TYPE public.crypto_tx_direction AS ENUM ('in', 'out');
CREATE TYPE public.crypto_tx_status AS ENUM ('pending', 'confirmed', 'failed');

CREATE TABLE public.crypto_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  wallet_id UUID NOT NULL REFERENCES public.crypto_wallets(id) ON DELETE CASCADE,
  direction public.crypto_tx_direction NOT NULL,
  amount NUMERIC(24, 8) NOT NULL CHECK (amount > 0),
  asset TEXT NOT NULL,
  tx_hash TEXT,
  counterparty_address TEXT,
  status public.crypto_tx_status NOT NULL DEFAULT 'pending',
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_crypto_tx_user_created ON public.crypto_transactions(user_id, created_at DESC);
CREATE INDEX idx_crypto_tx_wallet ON public.crypto_transactions(wallet_id);

ALTER TABLE public.crypto_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crypto_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY crypto_wallets_select_own ON public.crypto_wallets
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY crypto_transactions_select_own ON public.crypto_transactions
  FOR SELECT USING (auth.uid() = user_id);

COMMENT ON TABLE public.crypto_wallets IS 'Per-asset crypto wallets. Mutations via dubl-api edge fn only.';
COMMENT ON TABLE public.crypto_transactions IS 'Mock on-chain activity log. Simulated tx hashes in MVP.';
