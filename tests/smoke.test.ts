import { beforeEach, describe, expect, it } from 'vitest'
import { listAdminLedgerMock } from '@/lib/api/adminMockApi'
import {
  acceptLegalMock,
  confirmPaymentMock,
  createPaymentIntentMock,
  resetPaymentMockDb,
} from '@/lib/api/paymentMockApi'
import { sendP2pMock } from '@/lib/api/socialMockApi'
import { matchPartnerBoost, getSubsidyBurnReportMock } from '@/lib/api/partnerMockApi'
import { clearIdempotencyStore } from '@/lib/idempotency/mockIdempotency'
import { DOUBLE_CREDIT_AGREEMENT_KEY } from '@/lib/types/payments'

beforeEach(() => {
  clearIdempotencyStore()
  resetPaymentMockDb()
})

describe('Phase 8 smoke — pay → double → admin visibility', () => {
  it('confirm_payment is idempotent on replay', async () => {
    const userId = crypto.randomUUID()
    await acceptLegalMock(userId, DOUBLE_CREDIT_AGREEMENT_KEY)

    const intent = await createPaymentIntentMock(userId, {
      merchant_name: 'Smoke Test Cafe',
      amount: 10,
      double_enabled: true,
      idempotency_key: 'smoke-intent-1',
    })

    const confirmKey = 'smoke-confirm-1'
    const first = await confirmPaymentMock(userId, {
      intent_id: intent.id,
      double_enabled: true,
      idempotency_key: confirmKey,
    })

    const replay = await confirmPaymentMock(userId, {
      intent_id: intent.id,
      double_enabled: true,
      idempotency_key: confirmKey,
    })

    expect(replay.transaction.id).toBe(first.transaction.id)
    expect(first.intent.status).toBe('settled')
  })

  it('settled payment appears in admin ledger explorer', async () => {
    const userId = crypto.randomUUID()
    await acceptLegalMock(userId, DOUBLE_CREDIT_AGREEMENT_KEY)

    const intent = await createPaymentIntentMock(userId, {
      merchant_name: 'Admin Visibility Shop',
      amount: 25,
      double_enabled: false,
      idempotency_key: 'smoke-intent-2',
    })

    await confirmPaymentMock(userId, {
      intent_id: intent.id,
      double_enabled: false,
      idempotency_key: 'smoke-confirm-2',
    })

    const ledger = await listAdminLedgerMock({ query: 'Admin Visibility' })
    expect(ledger.some((row) => row.type === 'payment' && row.amount === 25)).toBe(true)
  })
})

describe('Phase 8 smoke — P2P idempotency', () => {
  it('send_p2p returns same transfer on idempotent replay', async () => {
    const senderId = '00000000-0000-4000-8000-000000000001'
    const key = 'smoke-p2p-1'

    const first = await sendP2pMock(senderId, {
      to_username: 'janedoe',
      amount: 5,
      idempotency_key: key,
      isTestAccount: true,
    })

    const replay = await sendP2pMock(senderId, {
      to_username: 'janedoe',
      amount: 5,
      idempotency_key: key,
      isTestAccount: true,
    })

    expect(replay.id).toBe(first.id)
    expect(replay.status).toBe('completed')
  })
})

describe('Phase 8 smoke — idempotency required', () => {
  it('confirm_payment rejects missing idempotency key', async () => {
    const userId = crypto.randomUUID()
    const intent = await createPaymentIntentMock(userId, {
      merchant_name: 'No Key Shop',
      amount: 5,
      double_enabled: false,
      idempotency_key: 'smoke-intent-3',
    })

    await expect(
      confirmPaymentMock(userId, {
        intent_id: intent.id,
        double_enabled: false,
        idempotency_key: '',
      }),
    ).rejects.toThrow(/Idempotency key required/)
  })
})

describe('Phase 9 smoke — partner boosts', () => {
  it('merchant tag matches partner boost odds', () => {
    const boost = matchPartnerBoost('Coffee Shop', 0.4)
    expect(boost?.partner.name).toBe('Starbucks')
    expect(boost?.win_probability).toBe(0.5)
    expect(boost?.base_win_probability).toBe(0.4)
  })

  it('double flip uses partner win probability when merchant matches', async () => {
    const userId = crypto.randomUUID()
    await acceptLegalMock(userId, DOUBLE_CREDIT_AGREEMENT_KEY)

    const intent = await createPaymentIntentMock(userId, {
      merchant_name: 'Nike Store Downtown',
      amount: 20,
      double_enabled: true,
      idempotency_key: 'smoke-intent-nike',
    })

    const result = await confirmPaymentMock(userId, {
      intent_id: intent.id,
      double_enabled: true,
      idempotency_key: 'smoke-confirm-nike',
    })

    expect(result.double).toBeDefined()
    expect(result.double!.partner_brand_name).toBe('Nike')
    expect(result.double!.win_probability).toBe(0.55)
    expect(result.double!.base_win_probability).toBe(0.4)
  })

  it('subsidy burn report includes partner events', async () => {
    const report = await getSubsidyBurnReportMock()
    expect(report.partners.length).toBeGreaterThan(0)
    expect(report.total_burned).toBeGreaterThanOrEqual(0)
  })
})
