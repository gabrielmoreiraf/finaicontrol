export function AuthWireframeHero({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 560 280"
      className={className ?? "h-full w-full text-white/15"}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden
    >
      <path
        d="M0 260 L80 120 L160 180 L240 80 L320 140 L400 60 L480 130 L560 90"
        stroke="currentColor"
        strokeWidth="1.25"
      />
      <path
        d="M0 260 L80 120 L160 180 L240 80 L320 140 L400 60 L480 130 L560 90 L560 260 Z"
        stroke="currentColor"
        strokeWidth="0.75"
        opacity="0.5"
      />
      {Array.from({ length: 12 }).map((_, i) => (
        <line
          key={`v-${i}`}
          x1={40 + i * 48}
          y1={40}
          x2={40 + i * 48}
          y2={260}
          stroke="currentColor"
          strokeWidth="0.5"
          opacity="0.35"
        />
      ))}
      {Array.from({ length: 6 }).map((_, i) => (
        <line
          key={`h-${i}`}
          x1={0}
          y1={60 + i * 40}
          x2={560}
          y2={60 + i * 40}
          stroke="currentColor"
          strokeWidth="0.5"
          opacity="0.25"
        />
      ))}
    </svg>
  );
}
