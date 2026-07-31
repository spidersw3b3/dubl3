import {
  adminLedgerAdjustmentMock,
  getOddsConfigMeta,
  getPaymentMockDb,
  listPaymentDbSnapshots,
  setOddsConfigMock,
  updateObligationStatusMock,
} from '@/lib/api/paymentMockApi'
import { MOCK_DIRECTORY } from '@/lib/api/socialMockApi'
import type {
  AdminAuditEntry,
  AdminCollectionRow,
  AdminKpis,
  AdminLedgerRow,
  AdminSession,
  AdminUser,
  AdminUser360,
  AdminUserSummary,
  CollectionActionParams,
  LedgerAdjustmentParams,
  ReconciliationReport,
  UpdateOddsParams,
} from '@/lib/types/admin'

const ADMIN_SESSION_KEY = 'dubl-admin-session'

export const ADMIN_CREDENTIALS = {
  email: 'admin@dubl.app',
  password: 'AdminDubl123!',
} as const

const MASTER_ADMIN: AdminUser = {
  id: 'admin-master-001',
  email: ADMIN_CREDENTIALS.email,
  display_name: 'DUBL Master Admin',
  role: 'master',
}

const auditLog: AdminAuditEntry[] = []

async function delay(ms = 200) {
  await new Promise((r) => setTimeout(r, ms))
}

function hydrateAllUsers() {
  for (const u of MOCK_DIRECTORY) {
    getPaymentMockDb(u.id, u.is_test_account ?? false)
  }
}

function usernameFor(userId: string): string {
  return MOCK_DIRECTORY.find((u) => u.id === userId)?.username ?? userId.slice(0, 8)
}

function emailFor(userId: string): string | null {
  if (userId === MOCK_DIRECTORY[0]?.id) return 'test@dubl.app'
  return `${usernameFor(userId)}@dubl.app`
}

function appendAudit(
  admin: AdminUser,
  action: string,
  reason: string,
  target?: { type: string; id: string },
  metadata: Record<string, unknown> = {},
) {
  const entry: AdminAuditEntry = {
    id: crypto.randomUUID(),
    admin_email: admin.email,
    action,
    target_type: target?.type ?? null,
    target_id: target?.id ?? null,
    reason,
    metadata,
    created_at: new Date().toISOString(),
  }
  auditLog.unshift(entry)
  return entry
}

export function readAdminSession(): AdminSession | null {
  try {
    const raw = localStorage.getItem(ADMIN_SESSION_KEY)
    if (!raw) return null
    const session = JSON.parse(raw) as AdminSession
    if (new Date(session.expires_at) < new Date()) {
      localStorage.removeItem(ADMIN_SESSION_KEY)
      return null
    }
    return session
  } catch {
    return null
  }
}

export function writeAdminSession(session: AdminSession) {
  localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(session))
}

export function clearAdminSession() {
  localStorage.removeItem(ADMIN_SESSION_KEY)
}

export async function adminLoginMock(email: string, password: string): Promise<AdminSession> {
  await delay(300)
  if (email !== ADMIN_CREDENTIALS.email || password !== ADMIN_CREDENTIALS.password) {
    throw new Error('Invalid admin credentials')
  }
  const session: AdminSession = {
    token: btoa(`admin:${Date.now()}`),
    user: MASTER_ADMIN,
    expires_at: new Date(Date.now() + 8 * 3600000).toISOString(),
  }
  writeAdminSession(session)
  appendAudit(MASTER_ADMIN, 'admin.login', 'Session started')
  return session
}

export async function fetchAdminKpisMock(): Promise<AdminKpis> {
  await delay(150)
  hydrateAllUsers()
  const snapshots = listPaymentDbSnapshots()

  let gmv = 0
  let doubleVolume = 0
  let doubleWins = 0
  let doubleCount = 0
  let outstanding = 0
  let txCount = 0

  for (const s of snapshots) {
    txCount += s.transactions.length
    for (const tx of s.transactions) {
      if (tx.type === 'payment') gmv += tx.amount
    }
    for (const d of s.dubls) {
      doubleCount += 1
      doubleVolume += d.stake_amount
      if (d.outcome === 'win') doubleWins += 1
    }
    for (const o of s.obligations) {
      if (o.status === 'open' || o.status === 'collecting') outstanding += o.principal
    }
  }

  return {
    gmv_usd: gmv,
    double_volume_usd: doubleVolume,
    double_win_rate: doubleCount > 0 ? doubleWins / doubleCount : 0,
    outstanding_obligations_usd: outstanding,
    active_users: snapshots.length,
    transaction_count: txCount,
  }
}

export async function listAdminUsersMock(): Promise<AdminUserSummary[]> {
  await delay(150)
  hydrateAllUsers()
  return listPaymentDbSnapshots().map((s) => {
    const dir = MOCK_DIRECTORY.find((u) => u.id === s.userId)
    return {
      id: s.userId,
      username: dir?.username ?? usernameFor(s.userId),
      email: emailFor(s.userId),
      display_name: dir?.display_name ?? usernameFor(s.userId),
      is_test_account: dir?.is_test_account ?? false,
      wallet: s.wallet,
      obligation_count: s.obligations.filter((o) => o.status === 'open' || o.status === 'collecting').length,
      dubl_count: s.dubls.length,
    }
  })
}

export async function getAdminUser360Mock(userId: string): Promise<AdminUser360 | null> {
  await delay(200)
  const users = await listAdminUsersMock()
  const user = users.find((u) => u.id === userId)
  if (!user) return null

  const snap = listPaymentDbSnapshots().find((s) => s.userId === userId)
  if (!snap) return null

  return {
    user,
    transactions: snap.transactions,
    dubls: snap.dubls,
    obligations: snap.obligations,
    payment_intents: snap.intents,
  }
}

export async function listAdminLedgerMock(filters?: {
  type?: string
  userId?: string
  query?: string
}): Promise<AdminLedgerRow[]> {
  await delay(200)
  hydrateAllUsers()

  const rows: AdminLedgerRow[] = []
  for (const s of listPaymentDbSnapshots()) {
    const uname = usernameFor(s.userId)
    for (const tx of s.transactions) {
      rows.push({
        ...tx,
        user_id: s.userId,
        username: uname,
        merchant_name: (tx.metadata?.merchant_name as string | undefined) ?? undefined,
      })
    }
  }

  rows.sort((a, b) => b.created_at.localeCompare(a.created_at))

  return rows.filter((r) => {
    if (filters?.type && filters.type !== 'all' && r.type !== filters.type) return false
    if (filters?.userId && r.user_id !== filters.userId) return false
    if (filters?.query) {
      const q = filters.query.toLowerCase()
      const hay = `${r.username} ${r.type} ${r.merchant_name ?? ''} ${r.id}`.toLowerCase()
      if (!hay.includes(q)) return false
    }
    return true
  })
}

export async function listCollectionsMock(): Promise<AdminCollectionRow[]> {
  await delay(150)
  hydrateAllUsers()
  const rows: AdminCollectionRow[] = []
  for (const s of listPaymentDbSnapshots()) {
    const uname = usernameFor(s.userId)
    for (const o of s.obligations) {
      if (o.status === 'open' || o.status === 'collecting') {
        rows.push({ ...o, user_id: s.userId, username: uname })
      }
    }
  }
  return rows.sort((a, b) => a.due_date.localeCompare(b.due_date))
}

export async function getOddsConfigAdminMock() {
  await delay(100)
  return getOddsConfigMeta()
}

export async function updateOddsConfigAdminMock(
  admin: AdminUser,
  params: UpdateOddsParams,
  reason: string,
) {
  await delay(250)
  const updated = setOddsConfigMock(params, admin.email)
  appendAudit(admin, 'odds.update', reason, { type: 'dubl_odds_config', id: '1' }, { ...params })
  return { ...updated, updated_at: new Date().toISOString(), updated_by: admin.email }
}

export async function collectionActionMock(
  admin: AdminUser,
  params: CollectionActionParams,
) {
  await delay(300)
  const statusMap = {
    mark_paid: 'paid' as const,
    mark_written_off: 'written_off' as const,
    retry_ach: 'collecting' as const,
  }
  const updated = updateObligationStatusMock(params.obligation_id, statusMap[params.action])
  if (!updated) throw new Error('Obligation not found')

  appendAudit(
    admin,
    `collection.${params.action}`,
    params.reason,
    { type: 'dubl_obligation', id: params.obligation_id },
    { action: params.action },
  )
  return updated
}

export async function ledgerAdjustmentAdminMock(
  admin: AdminUser,
  params: LedgerAdjustmentParams,
) {
  await delay(350)
  const dir = MOCK_DIRECTORY.find((u) => u.id === params.user_id)
  const tx = adminLedgerAdjustmentMock(
    params.user_id,
    {
      amount: params.amount,
      direction: params.direction,
      reason: params.reason,
      idempotency_key: params.idempotency_key,
    },
    dir?.is_test_account ?? false,
  )
  appendAudit(
    admin,
    'ledger.adjustment',
    params.reason,
    { type: 'wallet', id: params.user_id },
    { amount: params.amount, direction: params.direction, transaction_id: tx.id },
  )
  return tx
}

export async function listAuditLogMock(): Promise<AdminAuditEntry[]> {
  await delay(100)
  return [...auditLog]
}

export function exportLedgerCsv(rows: AdminLedgerRow[]): string {
  const header = 'id,user,username,type,direction,amount,balance_before,balance_after,created_at,merchant'
  const lines = rows.map((r) =>
    [
      r.id,
      r.user_id,
      r.username,
      r.type,
      r.direction,
      r.amount.toFixed(2),
      r.balance_before.toFixed(2),
      r.balance_after.toFixed(2),
      r.created_at,
      r.merchant_name ?? '',
    ].join(','),
  )
  return [header, ...lines].join('\n')
}

export async function runReconciliationMock(): Promise<ReconciliationReport> {
  await delay(200)
  hydrateAllUsers()
  const snapshots = listPaymentDbSnapshots()
  const rows = snapshots.map((s) => {
    const uname = usernameFor(s.userId)
    let ledgerNet = 0
    for (const tx of s.transactions) {
      if (tx.direction === 'credit') ledgerNet += tx.amount
      else ledgerNet -= tx.amount
    }
    const walletBalance = s.wallet.balance_usd
    const delta = Math.round((walletBalance - ledgerNet) * 100) / 100
    return {
      user_id: s.userId,
      username: uname,
      wallet_balance: walletBalance,
      ledger_net: ledgerNet,
      delta,
      transaction_count: s.transactions.length,
      balanced: Math.abs(delta) < 0.01,
    }
  })

  return {
    run_at: new Date().toISOString(),
    rows,
    mismatch_count: rows.filter((r) => !r.balanced).length,
    total_rows: rows.length,
  }
}

export function exportReconciliationCsv(report: ReconciliationReport): string {
  const header = 'user_id,username,wallet_balance,ledger_net,delta,transaction_count,balanced'
  const lines = report.rows.map((r) =>
    [
      r.user_id,
      r.username,
      r.wallet_balance.toFixed(2),
      r.ledger_net.toFixed(2),
      r.delta.toFixed(2),
      r.transaction_count,
      r.balanced,
    ].join(','),
  )
  return [header, ...lines].join('\n')
}
