import { cn } from '@/lib/utils'

export interface QRDisplayProps {
  value: string
  size?: number
  className?: string
}

/** Mock QR placeholder — replace with qrcode library in Phase 3 */
export function QRDisplay({ value, size = 200, className }: QRDisplayProps) {
  return (
    <div
      className={cn(
        'mx-auto flex items-center justify-center rounded-xl bg-white p-4',
        className,
      )}
      style={{ width: size + 32, height: size + 32 }}
      role="img"
      aria-label={`QR code for ${value}`}
    >
      <svg width={size} height={size} viewBox="0 0 100 100" aria-hidden>
        <rect width="100" height="100" fill="#fff" />
        {/* Simplified mock QR pattern */}
        {Array.from({ length: 10 }).map((_, row) =>
          Array.from({ length: 10 }).map((_, col) => {
            const hash = (value.charCodeAt((row * 10 + col) % value.length) + row + col) % 3
            if (hash === 0) return null
            return (
              <rect
                key={`${row}-${col}`}
                x={10 + col * 8}
                y={10 + row * 8}
                width="6"
                height="6"
                fill="#0B3D3A"
              />
            )
          }),
        )}
        <rect x="12" y="12" width="22" height="22" fill="none" stroke="#0B3D3A" strokeWidth="3" />
        <rect x="66" y="12" width="22" height="22" fill="none" stroke="#0B3D3A" strokeWidth="3" />
        <rect x="12" y="66" width="22" height="22" fill="none" stroke="#0B3D3A" strokeWidth="3" />
      </svg>
    </div>
  )
}
