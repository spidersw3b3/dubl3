export function DublLogo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 80 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      <path
        d="M8 24c0-10 8-18 18-18s18 8 18 18-8 18-18 18"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <path
        d="M36 24c0-10 8-18 18-18s18 8 18 18-8 18-18 18"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
        opacity="0.75"
      />
    </svg>
  )
}
