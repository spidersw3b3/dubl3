const ASSET_SYMBOLS: Record<string, string> = {
  BTC: '₿',
  ETH: 'Ξ',
  USDT: '$',
  DOGE: 'Ð',
  XRP: '✕',
  SOL: '◎',
}

export function AssetIcon({ asset, className }: { asset: string; className?: string }) {
  return (
    <span className={className} aria-hidden>
      {ASSET_SYMBOLS[asset] ?? asset.slice(0, 1)}
    </span>
  )
}
