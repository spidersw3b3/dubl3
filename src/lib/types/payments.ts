export type PaymentIntentStatus = 'draft' | 'authorized' | 'settled' | 'failed' | 'cancelled'

export interface PaymentIntent {
  id: string
  user_id: string
  merchant_name: string
  amount: number
  currency: string
  source_type: string
  source_id: string | null
  double_enabled: boolean
  status: PaymentIntentStatus
  idempotency_key: string | null
  settled_at: string | null
  created_at: string
}

export interface LedgerTransaction {
  id: string
  type: string
  direction: 'credit' | 'debit'
  amount: number
  balance_before: number
  balance_after: number
  reference_type: string | null
  reference_id: string | null
  created_at: string
  metadata?: Record<string, unknown>
}

export interface DoubleAttemptRecord {
  id: string
  payment_intent_id: string
  merchant_name: string
  stake_amount: number
  payout_amount: number
  outcome: 'win' | 'loss'
  win_probability: number
  status: 'completed' | 'pending'
  rng_seed_hash: string
  server_seed_hash: string
  created_at: string
  /** Phase 9 — partner boost fields */
  base_win_probability?: number
  partner_brand_id?: string | null
  partner_brand_name?: string | null
  subsidy_burned?: number
}

export interface DublObligation {
  id: string
  principal: number
  fees: number
  due_date: string
  status: 'open' | 'collecting' | 'paid' | 'written_off'
  double_attempt_id: string | null
  created_at: string
}

export interface WalletSnapshot {
  balance_usd: number
  double_credit_limit: number
  double_credit_used: number
}

export interface OddsConfig {
  mode: string
  base_win_probability: number
  max_daily_double_usd: number
  max_single_double_usd: number
}

export interface ConfirmPaymentResult {
  intent: PaymentIntent
  wallet: WalletSnapshot
  transaction: LedgerTransaction
  double?: DoubleAttemptRecord
  obligation?: DublObligation
}

export const DOUBLE_CREDIT_AGREEMENT_KEY = 'double_credit_agreement_v1'
