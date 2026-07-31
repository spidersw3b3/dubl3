export interface PartnerBrand {
  id: string
  name: string
  slug: string
  merchant_tags: string[]
  boosted_win_probability: number
  subsidy_cap: number
  subsidy_used: number
  active: boolean
  created_at: string
  updated_at: string
}

export interface PartnerBoostMatch {
  partner: PartnerBrand
  win_probability: number
  base_win_probability: number
  subsidy_remaining: number
}

export interface PartnerSubsidyEvent {
  id: string
  partner_id: string
  partner_name: string
  double_attempt_id: string | null
  user_id: string | null
  merchant_name: string
  stake_amount: number
  subsidy_amount: number
  win_probability_used: number
  created_at: string
}

export interface SubsidyBurnReport {
  generated_at: string
  partners: Array<{
    partner: PartnerBrand
    events: PartnerSubsidyEvent[]
    total_burned: number
    utilization_pct: number
  }>
  total_burned: number
}

export interface UpsertPartnerParams {
  name: string
  slug: string
  merchant_tags: string[]
  boosted_win_probability: number
  subsidy_cap: number
  active?: boolean
}

export interface RecordSubsidyBurnParams {
  partner_id: string
  double_attempt_id: string
  user_id: string
  merchant_name: string
  stake_amount: number
  subsidy_amount: number
  win_probability_used: number
}
