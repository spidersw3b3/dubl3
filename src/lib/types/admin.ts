import type { DoubleAttemptRecord, DublObligation, LedgerTransaction, OddsConfig, PaymentIntent, WalletSnapshot } from '@/lib/types/payments'

export type AdminRole = 'support' | 'ops' | 'finance' | 'compliance' | 'master'

export interface AdminUser {
  id: string
  email: string
  display_name: string
  role: AdminRole
}

export interface AdminSession {
  token: string
  user: AdminUser
  expires_at: string
}

export interface AdminAuditEntry {
  id: string
  admin_email: string
  action: string
  target_type: string | null
  target_id: string | null
  reason: string
  metadata: Record<string, unknown>
  created_at: string
}

export interface AdminKpis {
  gmv_usd: number
  double_volume_usd: number
  double_win_rate: number
  outstanding_obligations_usd: number
  active_users: number
  transaction_count: number
}

export interface AdminUserSummary {
  id: string
  username: string
  email: string | null
  display_name: string
  is_test_account: boolean
  wallet: WalletSnapshot
  obligation_count: number
  dubl_count: number
}

export interface AdminLedgerRow extends LedgerTransaction {
  user_id: string
  username: string
  merchant_name?: string
}

export interface AdminUser360 {
  user: AdminUserSummary
  transactions: LedgerTransaction[]
  dubls: DoubleAttemptRecord[]
  obligations: DublObligation[]
  payment_intents: PaymentIntent[]
}

export interface AdminCollectionRow extends DublObligation {
  user_id: string
  username: string
}

export interface UpdateOddsParams {
  mode?: string
  base_win_probability?: number
  max_daily_double_usd?: number
  max_single_double_usd?: number
}

export interface CollectionActionParams {
  obligation_id: string
  action: 'mark_paid' | 'mark_written_off' | 'retry_ach'
  reason: string
}

export interface LedgerAdjustmentParams {
  user_id: string
  amount: number
  direction: 'credit' | 'debit'
  reason: string
  idempotency_key?: string
}

export interface ReconciliationRow {
  user_id: string
  username: string
  wallet_balance: number
  ledger_net: number
  delta: number
  transaction_count: number
  balanced: boolean
}

export interface ReconciliationReport {
  run_at: string
  rows: ReconciliationRow[]
  mismatch_count: number
  total_rows: number
}

export type OddsConfigView = OddsConfig & { updated_at: string; updated_by: string | null }
