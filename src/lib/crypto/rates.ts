/** Static mid-market rates for mock USD conversion (MVP) */
export const CRYPTO_USD_RATES: Record<string, number> = {
  BTC: 67_600,
  ETH: 3_400,
  USDT: 1,
  DOGE: 0.15,
  XRP: 0.55,
  SOL: 145,
}

export const CRYPTO_NAMES: Record<string, string> = {
  BTC: 'Bitcoin',
  ETH: 'Ethereum',
  USDT: 'Tether',
  DOGE: 'Dogecoin',
  XRP: 'XRP Ledger',
  SOL: 'Solana',
}

export function getUsdRate(asset: string): number {
  return CRYPTO_USD_RATES[asset] ?? 1
}

export function cryptoToUsd(amount: number, asset: string): number {
  return amount * getUsdRate(asset)
}

export function generateMockAddress(asset: string, seed: string): string {
  const hex = Array.from({ length: 8 }, (_, i) =>
    ((seed.charCodeAt(i % seed.length) * 17 + i * 31) % 256).toString(16).padStart(2, '0'),
  ).join('')

  switch (asset) {
    case 'BTC':
      return `bc1q${hex}${seed.slice(0, 8)}mock`
    case 'ETH':
    case 'USDT':
      return `0x${hex}${seed.slice(0, 32).padEnd(32, '0')}`
    case 'DOGE':
      return `D${hex.toUpperCase()}${seed.slice(0, 6)}`
    case 'XRP':
      return `r${hex}${seed.slice(0, 10)}`
    case 'SOL':
      return `${hex}${seed.slice(0, 12)}Sol`
    default:
      return `${asset}_${hex}`
  }
}

export function generateMockTxHash(): string {
  return '0x' + Array.from({ length: 32 }, () =>
    Math.floor(Math.random() * 256).toString(16).padStart(2, '0'),
  ).join('')
}
