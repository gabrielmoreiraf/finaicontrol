import "server-only";

import { createHmac } from "node:crypto";
import { sql } from "drizzle-orm";
import { headers } from "next/headers";
import { db } from "@/lib/db/client";
import { rateLimits } from "@/lib/db/schema";

const RL_SECRET = process.env.SESSION_SECRET || "dev-insecure-session-secret";

/** LGPD (Art. 13): pseudonimiza a chave (que contém IP/e-mail) antes de persistir. */
function hashKey(key: string): string {
  return createHmac("sha256", RL_SECRET).update(key).digest("hex");
}

/**
 * Rate limiter persistente (Postgres), com janela fixa atômica via upsert.
 * Ao contrário de um Map em memória, o contador é GLOBAL — funciona mesmo com
 * múltiplas instâncias serverless e cold starts. Uma única instrução SQL
 * (INSERT ... ON CONFLICT) garante atomicidade, fechando a janela de corrida.
 */
export type RateLimitResult = {
  allowed: boolean;
  retryAfterSeconds: number;
};

export async function checkRateLimit(
  key: string,
  options: { max: number; windowMs: number },
): Promise<RateLimitResult> {
  const windowExpr = sql`now() + (${options.windowMs}::bigint * interval '1 millisecond')`;
  const storedKey = hashKey(key);

  try {
    const [row] = await db
      .insert(rateLimits)
      .values({ key: storedKey, count: 1, expiresAt: windowExpr })
      .onConflictDoUpdate({
        target: rateLimits.key,
        set: {
          // Janela expirada → reinicia em 1; senão incrementa.
          count: sql`case when ${rateLimits.expiresAt} < now() then 1 else ${rateLimits.count} + 1 end`,
          expiresAt: sql`case when ${rateLimits.expiresAt} < now() then ${windowExpr} else ${rateLimits.expiresAt} end`,
        },
      })
      .returning({ count: rateLimits.count, expiresAt: rateLimits.expiresAt });

    if (!row) return { allowed: true, retryAfterSeconds: 0 };

    const allowed = row.count <= options.max;
    const retryAfterSeconds = allowed
      ? 0
      : Math.max(1, Math.ceil((row.expiresAt.getTime() - Date.now()) / 1000));

    return { allowed, retryAfterSeconds };
  } catch {
    // Fail-open em caso de erro de infra: não bloqueia usuários legítimos.
    return { allowed: true, retryAfterSeconds: 0 };
  }
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
