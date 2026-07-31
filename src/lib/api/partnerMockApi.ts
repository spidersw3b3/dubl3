import type {
  PartnerBoostMatch,
  PartnerBrand,
  PartnerSubsidyEvent,
  RecordSubsidyBurnParams,
  SubsidyBurnReport,
  UpsertPartnerParams,
} from '@/lib/types/partner'

const partners: PartnerBrand[] = [
  {
    id: 'partner-nike',
    name: 'Nike',
    slug: 'nike',
    merchant_tags: ['nike', 'nike store'],
    boosted_win_probability: 0.55,
    subsidy_cap: 10000,
    subsidy_used: 0,
    active: true,
    created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'partner-starbucks',
    name: 'Starbucks',
    slug: 'starbucks',
    merchant_tags: ['starbucks', 'coffee shop'],
    boosted_win_probability: 0.5,
    subsidy_cap: 5000,
    subsidy_used: 125,
    active: true,
    created_at: new Date(Date.now() - 20 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'partner-target',
    name: 'Target',
    slug: 'target',
    merchant_tags: ['target'],
    boosted_win_probability: 0.45,
    subsidy_cap: 8000,
    subsidy_used: 42.5,
    active: true,
    created_at: new Date(Date.now() - 10 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
]

const subsidyEvents: PartnerSubsidyEvent[] = [
  {
    id: 'subsidy-seed-1',
    partner_id: 'partner-target',
    partner_name: 'Target',
    double_attempt_id: 'seed-dubl-1',
    user_id: '00000000-0000-4000-8000-000000000001',
    merchant_name: 'Target',
    stake_amount: 42.5,
    subsidy_amount: 42.5,
    win_probability_used: 0.45,
    created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
]

async function delay(ms = 150) {
  await new Promise((r) => setTimeout(r, ms))
}

function normalizeMerchant(name: string): string {
  return name.trim().toLowerCase()
}

function partnerRemaining(partner: PartnerBrand): number {
  return Math.max(0, partner.subsidy_cap - partner.subsidy_used)
}

export function matchPartnerBoost(
  merchantName: string,
  baseWinProbability: number,
): PartnerBoostMatch | null {
  const merchant = normalizeMerchant(merchantName)
  if (!merchant) return null

  for (const partner of partners) {
    if (!partner.active) continue
    const tags = [partner.slug, ...partner.merchant_tags].map((t) => t.toLowerCase())
    const matched = tags.some((tag) => merchant.includes(tag))
    if (!matched) continue

    const remaining = partnerRemaining(partner)
    if (remaining <= 0 && partner.subsidy_cap > 0) continue

    return {
      partner: { ...partner },
      win_probability: partner.boosted_win_probability,
      base_win_probability: baseWinProbability,
      subsidy_remaining: remaining,
    }
  }
  return null
}

export async function listPartnersMock(): Promise<PartnerBrand[]> {
  await delay(100)
  return partners.map((p) => ({ ...p }))
}

export async function listActivePartnersMock(): Promise<PartnerBrand[]> {
  await delay(80)
  return partners.filter((p) => p.active).map((p) => ({ ...p }))
}

export async function createPartnerMock(params: UpsertPartnerParams): Promise<PartnerBrand> {
  await delay(200)
  const slug = params.slug.trim().toLowerCase()
  if (partners.some((p) => p.slug === slug)) {
    throw new Error('Partner slug already exists')
  }
  const now = new Date().toISOString()
  const partner: PartnerBrand = {
    id: crypto.randomUUID(),
    name: params.name.trim(),
    slug,
    merchant_tags: params.merchant_tags.map((t) => t.trim().toLowerCase()).filter(Boolean),
    boosted_win_probability: params.boosted_win_probability,
    subsidy_cap: params.subsidy_cap,
    subsidy_used: 0,
    active: params.active ?? true,
    created_at: now,
    updated_at: now,
  }
  partners.unshift(partner)
  return { ...partner }
}

export async function updatePartnerMock(
  id: string,
  params: Partial<UpsertPartnerParams>,
): Promise<PartnerBrand> {
  await delay(200)
  const partner = partners.find((p) => p.id === id)
  if (!partner) throw new Error('Partner not found')

  if (params.name !== undefined) partner.name = params.name.trim()
  if (params.slug !== undefined) {
    const slug = params.slug.trim().toLowerCase()
    if (partners.some((p) => p.slug === slug && p.id !== id)) {
      throw new Error('Partner slug already exists')
    }
    partner.slug = slug
  }
  if (params.merchant_tags !== undefined) {
    partner.merchant_tags = params.merchant_tags.map((t) => t.trim().toLowerCase()).filter(Boolean)
  }
  if (params.boosted_win_probability !== undefined) {
    partner.boosted_win_probability = params.boosted_win_probability
  }
  if (params.subsidy_cap !== undefined) {
    partner.subsidy_cap = params.subsidy_cap
  }
  if (params.active !== undefined) partner.active = params.active
  partner.updated_at = new Date().toISOString()

  return { ...partner }
}

export async function deletePartnerMock(id: string): Promise<void> {
  await delay(150)
  const idx = partners.findIndex((p) => p.id === id)
  if (idx === -1) throw new Error('Partner not found')
  partners.splice(idx, 1)
}

export function recordSubsidyBurnMock(params: RecordSubsidyBurnParams): PartnerSubsidyEvent | null {
  const partner = partners.find((p) => p.id === params.partner_id)
  if (!partner) return null

  const remaining = partnerRemaining(partner)
  if (params.subsidy_amount > remaining && partner.subsidy_cap > 0) {
    return null
  }

  partner.subsidy_used += params.subsidy_amount
  partner.updated_at = new Date().toISOString()

  const event: PartnerSubsidyEvent = {
    id: crypto.randomUUID(),
    partner_id: partner.id,
    partner_name: partner.name,
    double_attempt_id: params.double_attempt_id,
    user_id: params.user_id,
    merchant_name: params.merchant_name,
    stake_amount: params.stake_amount,
    subsidy_amount: params.subsidy_amount,
    win_probability_used: params.win_probability_used,
    created_at: new Date().toISOString(),
  }
  subsidyEvents.unshift(event)
  return event
}

export async function getSubsidyBurnReportMock(): Promise<SubsidyBurnReport> {
  await delay(150)
  const reportPartners = partners.map((partner) => {
    const events = subsidyEvents.filter((e) => e.partner_id === partner.id)
    const total_burned = events.reduce((sum, e) => sum + e.subsidy_amount, 0)
    const utilization_pct = partner.subsidy_cap > 0
      ? (partner.subsidy_used / partner.subsidy_cap) * 100
      : 0
    return {
      partner: { ...partner },
      events: [...events],
      total_burned,
      utilization_pct,
    }
  })

  return {
    generated_at: new Date().toISOString(),
    partners: reportPartners,
    total_burned: subsidyEvents.reduce((sum, e) => sum + e.subsidy_amount, 0),
  }
}

export function exportSubsidyBurnCsv(report: SubsidyBurnReport): string {
  const header = 'partner,merchant,stake,subsidy,win_prob,created_at,double_attempt_id'
  const lines: string[] = []
  for (const row of report.partners) {
    for (const e of row.events) {
      lines.push(
        [
          e.partner_name,
          e.merchant_name,
          e.stake_amount.toFixed(2),
          e.subsidy_amount.toFixed(2),
          e.win_probability_used.toFixed(4),
          e.created_at,
          e.double_attempt_id ?? '',
        ].join(','),
      )
    }
  }
  return [header, ...lines].join('\n')
}

export function resetPartnerMockDb(): void {
  partners.length = 0
  subsidyEvents.length = 0
}
