import {
  CRYPTO_NAMES,
  cryptoToUsd,
  generateMockAddress,
  generateMockTxHash,
} from '@/lib/crypto/rates'
import {
  getIdempotentResponse,
  requireIdempotencyKey,
  setIdempotentResponse,
} from '@/lib/idempotency/mockIdempotency'

export interface CryptoWallet {
  id: string
  asset: string
  name: string
  address: string
  balance: number
  isDefault: boolean
}

export interface CryptoTransaction {
  id: string
  walletId: string
  asset: string
  direction: 'in' | 'out'
  amount: number
  counterpartyAddress: string
  txHash: string | null
  status: 'pending' | 'confirmed' | 'failed'
  createdAt: string
}

export type FeeTier = 'slow' | 'fast' | 'instant'

const FEE_USD: Record<FeeTier, number> = {
  slow: 0.12,
  fast: 0.35,
  instant: 0.65,
}

/** In-memory mock backend — mirrors dubl-api edge fn responses (per user) */
const mockDbByUser = new Map<string, { wallets: CryptoWallet[]; transactions: CryptoTransaction[] }>()

function initMockDb(userId: string) {
  const existing = mockDbByUser.get(userId)
  if (existing) return existing

  const db: { wallets: CryptoWallet[]; transactions: CryptoTransaction[] } = {
    wallets: [
      {
        id: 'w-btc',
        asset: 'BTC',
        name: CRYPTO_NAMES.BTC,
        address: generateMockAddress('BTC', userId),
        balance: 0.0421,
        isDefault: true,
      },
      {
        id: 'w-eth',
        asset: 'ETH',
        name: CRYPTO_NAMES.ETH,
        address: generateMockAddress('ETH', userId),
        balance: 0.85,
        isDefault: false,
      },
      {
        id: 'w-usdt',
        asset: 'USDT',
        name: CRYPTO_NAMES.USDT,
        address: generateMockAddress('USDT', userId),
        balance: 250,
        isDefault: false,
      },
    ],
    transactions: [
      {
        id: 'tx-1',
        walletId: 'w-btc',
        asset: 'BTC',
        direction: 'in' as const,
        amount: 0.012,
        counterpartyAddress: 'bc1q…0wlh',
        txHash: generateMockTxHash(),
        status: 'confirmed' as const,
        createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
      },
      {
        id: 'tx-2',
        walletId: 'w-btc',
        asset: 'BTC',
        direction: 'out' as const,
        amount: 0.005,
        counterpartyAddress: 'bc1q…9k2m',
        txHash: generateMockTxHash(),
        status: 'confirmed' as const,
        createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
      },
      {
        id: 'tx-3',
        walletId: 'w-btc',
        asset: 'BTC',
        direction: 'out' as const,
        amount: 0.001,
        counterpartyAddress: 'bc1q…4p7x',
        txHash: null,
        status: 'pending' as const,
        createdAt: new Date(Date.now() - 6 * 86400000).toISOString(),
      },
    ],
  }
  mockDbByUser.set(userId, db)
  return db
}

export function resetMockCryptoDb(userId?: string): void {
  if (userId) mockDbByUser.delete(userId)
  else mockDbByUser.clear()
}

async function delay(ms = 400): Promise<void> {
  await new Promise((r) => setTimeout(r, ms))
}

export async function cryptoReceiveAddress(userId: string, asset: string): Promise<{ address: string }> {
  await delay(200)
  const db = initMockDb(userId)
  const wallet = db.wallets.find((w) => w.asset === asset)
  if (!wallet) throw new Error(`Wallet not found for ${asset}`)
  return { address: wallet.address }
}

export async function cryptoSendMock(
  userId: string,
  params: {
    asset: string
    to: string
    amount: number
    feeTier: FeeTier
    idempotency_key?: string
  },
): Promise<{ txHash: string; status: 'pending' | 'confirmed' }> {
  await delay(600)
  const idemKey = params.idempotency_key
    ? requireIdempotencyKey(params.idempotency_key, 'crypto_send')
    : `crypto-${userId}-${params.asset}-${params.amount}-${Date.now()}`
  const cached = getIdempotentResponse<{ txHash: string; status: 'pending' | 'confirmed' }>(
    'crypto_send',
    idemKey,
  )
  if (cached) return cached

  const db = initMockDb(userId)
  const wallet = db.wallets.find((w) => w.asset === params.asset)
  if (!wallet) throw new Error(`Wallet not found for ${params.asset}`)
  if (params.amount <= 0) throw new Error('Amount must be positive')
  if (params.amount > wallet.balance) throw new Error('Insufficient balance')

  const feeUsd = FEE_USD[params.feeTier]
  const feeCrypto = feeUsd / (cryptoToUsd(1, params.asset) || 1)

  wallet.balance -= params.amount + feeCrypto

  const txHash = generateMockTxHash()
  const tx: CryptoTransaction = {
    id: crypto.randomUUID(),
    walletId: wallet.id,
    asset: params.asset,
    direction: 'out',
    amount: params.amount,
    counterpartyAddress: params.to,
    txHash,
    status: 'confirmed',
    createdAt: new Date().toISOString(),
  }
  db.transactions.unshift(tx)
  const result = { txHash, status: 'confirmed' as const }
  setIdempotentResponse('crypto_send', idemKey, result)
  return result
}

export async function cryptoAddWalletsMock(
  userId: string,
  assets: string[],
): Promise<CryptoWallet[]> {
  await delay(300)
  const db = initMockDb(userId)
  const added: CryptoWallet[] = []

  for (const asset of assets) {
    if (db.wallets.some((w) => w.asset === asset)) continue
    const wallet: CryptoWallet = {
      id: `w-${asset.toLowerCase()}`,
      asset,
      name: CRYPTO_NAMES[asset] ?? asset,
      address: generateMockAddress(asset, userId + asset),
      balance: 0,
      isDefault: false,
    }
    db.wallets.push(wallet)
    added.push(wallet)
  }
  return added
}

export async function getCryptoDashboard(userId: string): Promise<{
  wallets: CryptoWallet[]
  transactions: CryptoTransaction[]
}> {
  await delay(150)
  const db = initMockDb(userId)
  return {
    wallets: [...db.wallets],
    transactions: [...db.transactions].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    ),
  }
}

export function getFeeUsd(tier: FeeTier): number {
  return FEE_USD[tier]
}
