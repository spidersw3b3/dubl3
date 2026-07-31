import {
  DEV_SERVER_SEED,
  DEV_SERVER_SEED_HASH,
  isWin,
  provablyFairRoll,
} from '@/lib/crypto/provablyFair'
import {
  getIdempotentResponse,
  requireIdempotencyKey,
  setIdempotentResponse,
} from '@/lib/idempotency/mockIdempotency'
import type {
  ConfirmPaymentResult,
  DoubleAttemptRecord,
  DublObligation,
  LedgerTransaction,
  OddsConfig,
  PaymentIntent,
  WalletSnapshot,
} from '@/lib/types/payments'
import { DOUBLE_CREDIT_AGREEMENT_KEY } from '@/lib/types/payments'
import { matchPartnerBoost, recordSubsidyBurnMock } from '@/lib/api/partnerMockApi'

interface UserPaymentDb {
  wallet: WalletSnapshot
  intents: PaymentIntent[]
  transactions: LedgerTransaction[]
  dubls: DoubleAttemptRecord[]
  obligations: DublObligation[]
  legalAcceptances: Set<string>
  dailyDoubleUsd: { date: string; amount: number }
}

const mockDb = new Map<string, UserPaymentDb>()

const DEFAULT_ODDS: OddsConfig = {
  mode: 'bonus_only',
  base_win_probability: 0.4,
  max_daily_double_usd: 25,
  max_single_double_usd: 200,
}

let runtimeOdds: OddsConfig = { ...DEFAULT_ODDS }
let oddsUpdatedAt = new Date().toISOString()
let oddsUpdatedBy: string | null = null

function todayKey(): string {
  return new Date().toISOString().slice(0, 10)
}

function initDb(userId: string, isTestAccount = false): UserPaymentDb {
  const existing = mockDb.get(userId)
  if (existing) return existing

  const db: UserPaymentDb = {
    wallet: {
      balance_usd: isTestAccount ? 1234.56 : 100,
      double_credit_limit: isTestAccount ? 500 : 0,
      double_credit_used: 0,
    },
    intents: [],
    transactions: [],
    dubls: isTestAccount
      ? [
          {
            id: 'seed-dubl-1',
            payment_intent_id: 'seed-intent-1',
            merchant_name: 'Target',
            stake_amount: 42.5,
            payout_amount: 42.5,
            outcome: 'win',
            win_probability: 0.4,
            status: 'completed',
            rng_seed_hash: 'a3f9c2e1mockhash001',
            server_seed_hash: DEV_SERVER_SEED_HASH,
            created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
          },
        ]
      : [],
    obligations: [],
    legalAcceptances: new Set(),
    dailyDoubleUsd: { date: todayKey(), amount: 0 },
  }
  mockDb.set(userId, db)
  return db
}

async function delay(ms = 300) {
  await new Promise((r) => setTimeout(r, ms))
}

function walletMovement(
  db: UserPaymentDb,
  params: {
    type: string
    direction: 'credit' | 'debit'
    amount: number
    reference_type?: string
    reference_id?: string
    metadata?: Record<string, unknown>
  },
): LedgerTransaction {
  const { wallet } = db
  const balance_before = wallet.balance_usd
  let balance_after = balance_before

  if (params.direction === 'credit') {
    balance_after = balance_before + params.amount
  } else {
    if (balance_before >= params.amount) {
      balance_after = balance_before - params.amount
    } else if (
      ['double_loss', 'credit_line_draw', 'payment', 'fee'].includes(params.type)
    ) {
      const shortfall = params.amount - balance_before
      const available = wallet.double_credit_limit - wallet.double_credit_used
      if (available >= shortfall) {
        balance_after = 0
        wallet.double_credit_used += shortfall
      } else {
        throw new Error('Insufficient balance and credit line')
      }
    } else {
      throw new Error('Insufficient balance')
    }
  }

  wallet.balance_usd = balance_after

  const tx: LedgerTransaction = {
    id: crypto.randomUUID(),
    type: params.type,
    direction: params.direction,
    amount: params.amount,
    balance_before,
    balance_after,
    reference_type: params.reference_type ?? null,
    reference_id: params.reference_id ?? null,
    created_at: new Date().toISOString(),
    metadata: params.metadata,
  }
  db.transactions.unshift(tx)
  return tx
}

export function getPaymentMockDb(userId: string, isTestAccount = false): UserPaymentDb {
  return initDb(userId, isTestAccount)
}

export function recordWalletMovement(
  db: UserPaymentDb,
  params: Parameters<typeof walletMovement>[1],
): LedgerTransaction {
  return walletMovement(db, params)
}

export async function getWalletState(userId: string, isTestAccount = false) {
  await delay(100)
  const db = initDb(userId, isTestAccount)
  return {
    wallet: { ...db.wallet },
    transactions: [...db.transactions],
    dubls: [...db.dubls],
    obligations: [...db.obligations],
    hasDoubleAgreement: db.legalAcceptances.has(DOUBLE_CREDIT_AGREEMENT_KEY),
    odds: { ...runtimeOdds },
  }
}

export async function acceptLegalMock(userId: string, documentKey: string) {
  await delay(150)
  const db = initDb(userId)
  db.legalAcceptances.add(documentKey)
}

export async function createPaymentIntentMock(
  userId: string,
  params: {
    merchant_name: string
    amount: number
    source_type?: string
    source_id?: string
    double_enabled: boolean
    idempotency_key?: string
  },
): Promise<PaymentIntent> {
  await delay(200)
  const db = initDb(userId)

  if (params.idempotency_key) {
    const existing = db.intents.find((i) => i.idempotency_key === params.idempotency_key)
    if (existing) return existing
  }

  const intent: PaymentIntent = {
    id: crypto.randomUUID(),
    user_id: userId,
    merchant_name: params.merchant_name,
    amount: params.amount,
    currency: 'USD',
    source_type: params.source_type ?? 'balance',
    source_id: params.source_id ?? null,
    double_enabled: params.double_enabled,
    status: 'draft',
    idempotency_key: params.idempotency_key ?? null,
    settled_at: null,
    created_at: new Date().toISOString(),
  }
  db.intents.unshift(intent)
  return intent
}

export async function confirmPaymentMock(
  userId: string,
  params: {
    intent_id: string
    double_enabled: boolean
    idempotency_key: string
    isTestAccount?: boolean
  },
): Promise<ConfirmPaymentResult> {
  await delay(500)
  const idemKey = requireIdempotencyKey(params.idempotency_key, 'confirm_payment')
  const cached = getIdempotentResponse<ConfirmPaymentResult>('confirm_payment', idemKey)
  if (cached) return cached

  const db = initDb(userId, params.isTestAccount ?? false)
  const odds = { ...runtimeOdds }

  const intent = db.intents.find((i) => i.id === params.intent_id)
  if (!intent) throw new Error('Payment intent not found')
  if (intent.status === 'settled') {
    const tx = db.transactions.find((t) => t.reference_id === intent.id)
    return {
      intent,
      wallet: { ...db.wallet },
      transaction: tx!,
    }
  }

  if (intent.amount > odds.max_single_double_usd && params.double_enabled) {
    throw new Error(`Double max single stake is $${odds.max_single_double_usd}`)
  }

  intent.status = 'authorized'
  intent.double_enabled = params.double_enabled

  const tx = walletMovement(db, {
    type: 'payment',
    direction: 'debit',
    amount: intent.amount,
    reference_type: 'payment_intent',
    reference_id: intent.id,
    metadata: { merchant_name: intent.merchant_name },
  })

  intent.status = 'settled'
  intent.settled_at = new Date().toISOString()

  let double: DoubleAttemptRecord | undefined
  let obligation: DublObligation | undefined

  if (params.double_enabled) {
    if (!db.legalAcceptances.has(DOUBLE_CREDIT_AGREEMENT_KEY)) {
      throw new Error('DOUBLE_CREDIT_AGREEMENT_REQUIRED')
    }

    const day = todayKey()
    if (db.dailyDoubleUsd.date !== day) {
      db.dailyDoubleUsd = { date: day, amount: 0 }
    }
    if (db.dailyDoubleUsd.amount + intent.amount > odds.max_daily_double_usd) {
      throw new Error(`Daily double limit $${odds.max_daily_double_usd} exceeded`)
    }
    db.dailyDoubleUsd.amount += intent.amount

    const boost = matchPartnerBoost(intent.merchant_name, odds.base_win_probability)
    const winProbability = boost?.win_probability ?? odds.base_win_probability

    const nonce = crypto.randomUUID()
    const { roll, digest } = await provablyFairRoll(
      DEV_SERVER_SEED,
      userId,
      intent.id,
      nonce,
    )
    const win = isWin(roll, winProbability)
    const creditUsedBefore = db.wallet.double_credit_used

    double = {
      id: crypto.randomUUID(),
      payment_intent_id: intent.id,
      merchant_name: intent.merchant_name,
      stake_amount: intent.amount,
      payout_amount: win ? intent.amount : 0,
      outcome: win ? 'win' : 'loss',
      win_probability: winProbability,
      base_win_probability: odds.base_win_probability,
      partner_brand_id: boost?.partner.id ?? null,
      partner_brand_name: boost?.partner.name ?? null,
      subsidy_burned: 0,
      status: 'completed',
      rng_seed_hash: digest,
      server_seed_hash: DEV_SERVER_SEED_HASH,
      created_at: new Date().toISOString(),
    }
    db.dubls.unshift(double)

    if (win) {
      walletMovement(db, {
        type: 'double_win',
        direction: 'credit',
        amount: intent.amount,
        reference_type: 'double_attempt',
        reference_id: double.id,
        metadata: {
          mode: odds.mode,
          roll,
          partner: boost?.partner.name ?? null,
        },
      })

      if (boost) {
        const burn = recordSubsidyBurnMock({
          partner_id: boost.partner.id,
          double_attempt_id: double.id,
          user_id: userId,
          merchant_name: intent.merchant_name,
          stake_amount: intent.amount,
          subsidy_amount: intent.amount,
          win_probability_used: winProbability,
        })
        if (burn) double.subsidy_burned = burn.subsidy_amount
      }
    } else {
      try {
        walletMovement(db, {
          type: 'double_loss',
          direction: 'debit',
          amount: intent.amount,
          reference_type: 'double_attempt',
          reference_id: double.id,
          metadata: { mode: odds.mode, roll },
        })
      } catch {
        throw new Error('Insufficient funds for double loss')
      }

      const creditUsedDelta = db.wallet.double_credit_used - creditUsedBefore
      if (creditUsedDelta > 0) {
        obligation = {
          id: crypto.randomUUID(),
          principal: creditUsedDelta,
          fees: 0,
          due_date: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
          status: 'open',
          double_attempt_id: double.id,
          created_at: new Date().toISOString(),
        }
        db.obligations.unshift(obligation)
      }
    }
  }

  const result: ConfirmPaymentResult = {
    intent: { ...intent },
    wallet: { ...db.wallet },
    transaction: tx,
    double,
    obligation,
  }
  setIdempotentResponse('confirm_payment', idemKey, result)
  return result
}

export function getOddsConfig(): OddsConfig {
  return { ...runtimeOdds }
}

export function setOddsConfigMock(
  patch: Partial<OddsConfig>,
  updatedBy: string,
): OddsConfig {
  runtimeOdds = { ...runtimeOdds, ...patch }
  oddsUpdatedAt = new Date().toISOString()
  oddsUpdatedBy = updatedBy
  return { ...runtimeOdds }
}

export function getOddsConfigMeta() {
  return {
    ...runtimeOdds,
    updated_at: oddsUpdatedAt,
    updated_by: oddsUpdatedBy,
  }
}

export function listPaymentDbSnapshots() {
  return Array.from(mockDb.entries()).map(([userId, db]) => ({
    userId,
    wallet: { ...db.wallet },
    transactions: [...db.transactions],
    dubls: [...db.dubls],
    obligations: [...db.obligations],
    intents: [...db.intents],
  }))
}

export function findObligationById(obligationId: string): { userId: string; obligation: DublObligation } | null {
  for (const [userId, db] of mockDb.entries()) {
    const obligation = db.obligations.find((o) => o.id === obligationId)
    if (obligation) return { userId, obligation }
  }
  return null
}

export function updateObligationStatusMock(
  obligationId: string,
  status: DublObligation['status'],
): DublObligation | null {
  for (const db of mockDb.values()) {
    const obligation = db.obligations.find((o) => o.id === obligationId)
    if (obligation) {
      obligation.status = status
      return { ...obligation }
    }
  }
  return null
}

export function adminLedgerAdjustmentMock(
  userId: string,
  params: { amount: number; direction: 'credit' | 'debit'; reason: string; idempotency_key?: string },
  isTestAccount = false,
): LedgerTransaction {
  if (params.idempotency_key) {
    const cached = getIdempotentResponse<LedgerTransaction>(
      'ledger_adjustment',
      params.idempotency_key,
    )
    if (cached) return cached
  }
  const db = initDb(userId, isTestAccount)
  const tx = walletMovement(db, {
    type: 'adjustment',
    direction: params.direction,
    amount: params.amount,
    reference_type: 'admin_adjustment',
    metadata: { reason: params.reason },
  })
  if (params.idempotency_key) {
    setIdempotentResponse('ledger_adjustment', params.idempotency_key, tx)
  }
  return tx
}

/** Test helper — reset in-memory payment state */
export function resetPaymentMockDb(): void {
  mockDb.clear()
  runtimeOdds = { ...DEFAULT_ODDS }
  oddsUpdatedAt = new Date().toISOString()
  oddsUpdatedBy = null
}
