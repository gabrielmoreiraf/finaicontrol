"use client";

/* Atmosfera de moedas flutuando para cima, determinística (LCG) para evitar
   mismatch de hidratação entre servidor e cliente. */
function lcg(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

const CURRENCIES = ["$", "€", "£", "¥", "₿", "⟠"];

interface Particle {
  id: number;
  symbol: string;
  left: number; // %
  size: number; // px
  duration: number; // s
  delay: number; // s
}

function buildParticles(count: number): Particle[] {
  const rand = lcg(1337);
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    symbol: CURRENCIES[Math.floor(rand() * CURRENCIES.length)],
    left: rand() * 100,
    size: rand() * 20 + 10,
    duration: rand() * 20 + 15,
    delay: -(rand() * 30),
  }));
}

const PARTICLES = buildParticles(24);

export function AuthRainAnimation() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <style>{`
        @keyframes auth-float-up {
          from { transform: translateY(100vh) rotate(0deg); }
          to   { transform: translateY(-12vh) rotate(360deg); }
        }
      `}</style>

      {PARTICLES.map((p) => (
        <span
          key={p.id}
          className="absolute top-0 select-none font-mono font-medium text-[#44dfa7]"
          style={{
            left: `${p.left}%`,
            fontSize: p.size,
            opacity: 0.15,
            filter: "blur(1px)",
            animation: `auth-float-up ${p.duration}s ${p.delay}s linear infinite`,
          }}
        >
          {p.symbol}
        </span>
      ))}
    </div>
  );
}
