export function FiniaMascot({ className }: { className?: string }) {
  return (
    <div className={className} aria-hidden>
      <div className="relative flex size-full items-center justify-center">
        <div className="absolute inset-0 rounded-full bg-brand/20 blur-2xl" />
        <div className="absolute inset-4 rounded-full bg-brand/10 blur-xl" />
        <svg viewBox="0 0 120 120" className="relative size-full drop-shadow-[0_0_24px_rgba(0,230,118,0.45)]">
          <defs>
            <linearGradient id="mascot-body" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00E676" />
              <stop offset="100%" stopColor="#059669" />
            </linearGradient>
            <linearGradient id="mascot-face" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#111827" />
              <stop offset="100%" stopColor="#030712" />
            </linearGradient>
          </defs>
          <rect x="28" y="18" width="64" height="52" rx="16" fill="url(#mascot-body)" />
          <rect x="36" y="28" width="48" height="32" rx="10" fill="url(#mascot-face)" />
          <circle cx="48" cy="42" r="5" fill="#00E676" />
          <circle cx="72" cy="42" r="5" fill="#00E676" />
          <rect x="46" y="52" width="28" height="4" rx="2" fill="#00E676" opacity="0.8" />
          <rect x="38" y="72" width="44" height="28" rx="12" fill="url(#mascot-body)" />
          <rect x="18" y="76" width="14" height="22" rx="7" fill="url(#mascot-body)" />
          <rect x="88" y="76" width="14" height="22" rx="7" fill="url(#mascot-body)" />
          <rect x="44" y="96" width="12" height="16" rx="6" fill="#047857" />
          <rect x="64" y="96" width="12" height="16" rx="6" fill="#047857" />
          <circle cx="60" cy="12" r="4" fill="#00E676" />
          <line x1="60" y1="16" x2="60" y2="22" stroke="#00E676" strokeWidth="2" />
        </svg>
      </div>
    </div>
  );
}
