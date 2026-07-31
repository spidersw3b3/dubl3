import { isSupabaseConfigured, getSupabaseOptional } from '@/lib/supabase'
import {
  cryptoAddWalletsMock,
  cryptoReceiveAddress,
  cryptoSendMock,
  getCryptoDashboard,
  type FeeTier,
} from '@/lib/api/cryptoMockApi'

const EDGE_URL = import.meta.env.VITE_SUPABASE_URL
  ? `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/dubl-api`
  : null

async function callEdge<T>(action: string, payload: Record<string, unknown>): Promise<T> {
  const supabase = getSupabaseOptional()
  if (!supabase || !EDGE_URL) throw new Error('Edge API unavailable')
  const { data: { session } } = await supabase.auth.getSession()
  const res = await fetch(EDGE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session?.access_token ?? import.meta.env.VITE_SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify({ action, payload }),
  })
  if (!res.ok) throw new Error(`Edge API error: ${res.status}`)
  return res.json() as Promise<T>
}

/** Routes to edge fn when configured, otherwise local mock */
export const dublApi = {
  useMock: !isSupabaseConfigured,

  async getCryptoDashboard(userId: string) {
    if (this.useMock) return getCryptoDashboard(userId)
    return callEdge('get_crypto_dashboard', { userId })
  },

  async cryptoReceiveAddress(userId: string, asset: string) {
    if (this.useMock) return cryptoReceiveAddress(userId, asset)
    return callEdge('crypto_receive_address', { userId, asset })
  },

  async cryptoSendMock(
    userId: string,
    params: { asset: string; to: string; amount: number; feeTier: FeeTier },
  ) {
    if (this.useMock) return cryptoSendMock(userId, params)
    return callEdge('crypto_send_mock', { userId, ...params })
  },

  async cryptoAddWallets(userId: string, assets: string[]) {
    if (this.useMock) return cryptoAddWalletsMock(userId, assets)
    return callEdge('crypto_add_wallets', { userId, assets })
  },
}
