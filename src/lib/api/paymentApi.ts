import { isSupabaseConfigured } from '@/lib/supabase'
import {
  acceptLegalMock,
  confirmPaymentMock,
  createPaymentIntentMock,
  getOddsConfig,
  getWalletState,
} from '@/lib/api/paymentMockApi'
import type { ConfirmPaymentResult } from '@/lib/types/payments'

export const paymentApi = {
  useMock: !isSupabaseConfigured,

  getWalletState(userId: string, isTestAccount?: boolean) {
    if (this.useMock) return getWalletState(userId, isTestAccount)
    throw new Error('Supabase payment API not wired — use mock mode')
  },

  createPaymentIntent(
    userId: string,
    params: Parameters<typeof createPaymentIntentMock>[1],
  ) {
    if (this.useMock) return createPaymentIntentMock(userId, params)
    throw new Error('Supabase payment API not wired')
  },

  confirmPayment(
    userId: string,
    params: Parameters<typeof confirmPaymentMock>[1],
  ): Promise<ConfirmPaymentResult> {
    if (this.useMock) return confirmPaymentMock(userId, params)
    throw new Error('Supabase payment API not wired')
  },

  acceptLegal(userId: string, documentKey: string) {
    if (this.useMock) return acceptLegalMock(userId, documentKey)
    throw new Error('Supabase payment API not wired')
  },

  getOddsConfig() {
    return getOddsConfig()
  },
}
