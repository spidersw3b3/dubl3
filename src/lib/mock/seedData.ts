export interface LinkedBank {
  id: string
  route: string
  accountLast4: string
  bankName: string
  limit: number
  status: 'connected' | 'pending'
}

export interface PaymentCard {
  id: string
  type: 'debit' | 'crypto'
  brand: string
  label: string
  last4: string
  exp: string
  asset?: string
  isFrozen: boolean
}

export interface CryptoAsset {
  code: string
  name: string
  balance: number
  usdValue: number
  address: string
}

export const MOCK_BANKS: LinkedBank[] = [
  { id: '1', route: '031101279', accountLast4: '4821', bankName: 'Chime', limit: 500, status: 'connected' },
  { id: '2', route: '121000248', accountLast4: '9033', bankName: 'Wells Fargo', limit: 500, status: 'connected' },
  { id: '3', route: '043000096', accountLast4: '7712', bankName: 'PNC Bank', limit: 500, status: 'connected' },
]

export const MOCK_CARDS: PaymentCard[] = [
  {
    id: 'visa-debit',
    type: 'debit',
    brand: 'DUBL Visa',
    label: 'DUBL Visa Debit',
    last4: '4242',
    exp: '09/28',
    isFrozen: false,
  },
  {
    id: 'btc-tap',
    type: 'crypto',
    brand: 'Bitcoin',
    label: 'BTC Wallet',
    last4: 'a3f9',
    exp: '—',
    asset: 'BTC',
    isFrozen: false,
  },
]

export const DEFAULT_CRYPTO: CryptoAsset = {
  code: 'BTC',
  name: 'Bitcoin',
  balance: 0.0421,
  usdValue: 2850,
  address: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
}

export const ADDABLE_WALLETS = [
  { code: 'DOGE', name: 'Dogecoin' },
  { code: 'XRP', name: 'XRP Ledger' },
  { code: 'SOL', name: 'Solana' },
] as const

export const MOCK_ACTIVITY = [
  { id: '1', type: 'received' as const, address: 'bc1q…0wlh', amount: '0.0120 BTC', date: 'Jul 28' },
  { id: '2', type: 'sent' as const, address: 'bc1q…9k2m', amount: '0.0050 BTC', date: 'Jul 25' },
  { id: '3', type: 'pending' as const, address: 'bc1q…4p7x', amount: '0.0010 BTC', date: 'Jul 24' },
]
