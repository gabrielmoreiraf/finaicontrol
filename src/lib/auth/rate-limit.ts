import "server-only";

import { headers } from "next/headers";

/**
 * Rate limiter simples em memória (janela deslizante). Adequado para frear
 * rajadas de tentativas (login/cadastro/reenvio) numa instância quente. Em
 * ambiente serverless com múltiplas instâncias o limite é por instância — para
 * um limite global e persistente, migrar para Redis/Upstash ou tabela no banco.
 */
const buckets = new Map<string, number[]>();

// Evita crescimento ilimitado do Map em processos longos.
const MAX_KEYS = 5000;

export type RateLimitResult = {
  allowed: boolean;
  retryAfterSeconds: number;
};

export function checkRateLimit(
  key: string,
  options: { max: number; windowMs: number },
): RateLimitResult {
  const now = Date.now();
  const windowStart = now - options.windowMs;

  const timestamps = (buckets.get(key) ?? []).filter((t) => t > windowStart);

  if (timestamps.length >= options.max) {
    const oldest = timestamps[0]!;
    const retryAfterSeconds = Math.max(1, Math.ceil((oldest + options.windowMs - now) / 1000));
    buckets.set(key, timestamps);
    return { allowed: false, retryAfterSeconds };
  }

  timestamps.push(now);
  buckets.set(key, timestamps);

  if (buckets.size > MAX_KEYS) {
    // Limpeza preguiçosa: remove chaves cujas janelas já expiraram.
    for (const [k, ts] of buckets) {
      const fresh = ts.filter((t) => t > windowStart);
      if (fresh.length === 0) buckets.delete(k);
      else buckets.set(k, fresh);
    }
  }

  return { allowed: true, retryAfterSeconds: 0 };
}

/** IP do cliente a partir dos headers de proxy (Vercel/Neon). */
export async function getClientIp(): Promise<string> {
  const headerList = await headers();
  const forwarded = headerList.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]!.trim();
  return headerList.get("x-real-ip") ?? "unknown";
}

export function tooManyRequestsMessage(retryAfterSeconds: number): string {
  const minutes = Math.ceil(retryAfterSeconds / 60);
  if (retryAfterSeconds <= 60) {
    return "Muitas tentativas. Aguarde alguns segundos e tente novamente.";
  }
  return `Muitas tentativas. Tente novamente em ${minutes} minuto(s).`;
}
