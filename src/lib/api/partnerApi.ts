import { isSupabaseConfigured } from '@/lib/supabase'
import {
  createPartnerMock,
  deletePartnerMock,
  exportSubsidyBurnCsv,
  getSubsidyBurnReportMock,
  listActivePartnersMock,
  listPartnersMock,
  matchPartnerBoost,
  updatePartnerMock,
} from '@/lib/api/partnerMockApi'
import type { UpsertPartnerParams } from '@/lib/types/partner'

export const partnerApi = {
  useMock: !isSupabaseConfigured,

  matchBoost(merchantName: string, baseWinProbability: number) {
    if (this.useMock) return matchPartnerBoost(merchantName, baseWinProbability)
    return null
  },

  listActive() {
    if (this.useMock) return listActivePartnersMock()
    throw new Error('Supabase partner API not wired')
  },

  listAll() {
    if (this.useMock) return listPartnersMock()
    throw new Error('Supabase partner API not wired')
  },

  create(params: UpsertPartnerParams) {
    if (this.useMock) return createPartnerMock(params)
    throw new Error('Supabase partner API not wired')
  },

  update(id: string, params: Partial<UpsertPartnerParams>) {
    if (this.useMock) return updatePartnerMock(id, params)
    throw new Error('Supabase partner API not wired')
  },

  delete(id: string) {
    if (this.useMock) return deletePartnerMock(id)
    throw new Error('Supabase partner API not wired')
  },

  getSubsidyReport() {
    if (this.useMock) return getSubsidyBurnReportMock()
    throw new Error('Supabase partner API not wired')
  },

  exportSubsidyCsv: exportSubsidyBurnCsv,
}
