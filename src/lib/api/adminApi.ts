import { isSupabaseConfigured } from '@/lib/supabase'
import {
  adminLoginMock,
  clearAdminSession,
  collectionActionMock,
  exportLedgerCsv,
  exportReconciliationCsv,
  fetchAdminKpisMock,
  getAdminUser360Mock,
  getOddsConfigAdminMock,
  ledgerAdjustmentAdminMock,
  listAdminLedgerMock,
  listAdminUsersMock,
  listAuditLogMock,
  listCollectionsMock,
  readAdminSession,
  runReconciliationMock,
  updateOddsConfigAdminMock,
} from '@/lib/api/adminMockApi'
import type {
  AdminUser,
  CollectionActionParams,
  LedgerAdjustmentParams,
  UpdateOddsParams,
} from '@/lib/types/admin'

export const adminApi = {
  useMock: !isSupabaseConfigured,

  readSession() {
    return readAdminSession()
  },

  clearSession() {
    clearAdminSession()
  },

  login(email: string, password: string) {
    if (this.useMock) return adminLoginMock(email, password)
    throw new Error('Supabase admin API not wired — use mock mode')
  },

  getKpis() {
    if (this.useMock) return fetchAdminKpisMock()
    throw new Error('Supabase admin API not wired')
  },

  listUsers() {
    if (this.useMock) return listAdminUsersMock()
    throw new Error('Supabase admin API not wired')
  },

  getUser360(userId: string) {
    if (this.useMock) return getAdminUser360Mock(userId)
    throw new Error('Supabase admin API not wired')
  },

  listLedger(filters?: Parameters<typeof listAdminLedgerMock>[0]) {
    if (this.useMock) return listAdminLedgerMock(filters)
    throw new Error('Supabase admin API not wired')
  },

  listCollections() {
    if (this.useMock) return listCollectionsMock()
    throw new Error('Supabase admin API not wired')
  },

  getOddsConfig() {
    if (this.useMock) return getOddsConfigAdminMock()
    throw new Error('Supabase admin API not wired')
  },

  updateOddsConfig(admin: AdminUser, params: UpdateOddsParams, reason: string) {
    if (this.useMock) return updateOddsConfigAdminMock(admin, params, reason)
    throw new Error('Supabase admin API not wired')
  },

  collectionAction(admin: AdminUser, params: CollectionActionParams) {
    if (this.useMock) return collectionActionMock(admin, params)
    throw new Error('Supabase admin API not wired')
  },

  ledgerAdjustment(admin: AdminUser, params: LedgerAdjustmentParams) {
    if (this.useMock) return ledgerAdjustmentAdminMock(admin, params)
    throw new Error('Supabase admin API not wired')
  },

  listAuditLog() {
    if (this.useMock) return listAuditLogMock()
    throw new Error('Supabase admin API not wired')
  },

  exportLedgerCsv,
  exportReconciliationCsv,

  runReconciliation() {
    if (this.useMock) return runReconciliationMock()
    throw new Error('Supabase admin API not wired')
  },
}
