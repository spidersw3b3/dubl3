const usdFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
})

export function formatUsd(amount: number): string {
  return usdFormatter.format(amount)
}

export function formatCrypto(amount: number, asset: string, decimals = 4): string {
  return `${amount.toFixed(decimals)} ${asset}`
}

export function maskAccount(last4: string): string {
  return `••••${last4}`
}

export function truncateAddress(address: string, head = 6, tail = 4): string {
  if (address.length <= head + tail + 3) return address
  return `${address.slice(0, head)}...${address.slice(-tail)}`
}
