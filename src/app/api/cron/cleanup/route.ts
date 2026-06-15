import { lt } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import {
  emailVerificationTokens,
  passwordResetTokens,
  rateLimits,
  sessions,
} from "@/lib/db/schema";

/**
 * LGPD (Art. 15/16) — Retenção/descarte: remove periodicamente dados expirados
 * (sessões, tokens de verificação/reset e contadores de rate-limit com IP).
 * Protegido por `CRON_SECRET` (header Authorization: Bearer ... — padrão Vercel Cron).
 */
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  const auth = request.headers.get("authorization");
  if (!secret || auth !== `Bearer ${secret}`) {
    return new NextResponse(null, { status: 401 });
  }

  const now = new Date();
  const [s, ev, pr, rl] = await Promise.all([
    db.delete(sessions).where(lt(sessions.expiresAt, now)).returning({ id: sessions.id }),
    db
      .delete(emailVerificationTokens)
      .where(lt(emailVerificationTokens.expiresAt, now))
      .returning({ id: emailVerificationTokens.id }),
    db
      .delete(passwordResetTokens)
      .where(lt(passwordResetTokens.expiresAt, now))
      .returning({ id: passwordResetTokens.id }),
    db.delete(rateLimits).where(lt(rateLimits.expiresAt, now)).returning({ key: rateLimits.key }),
  ]);

  return NextResponse.json({
    ok: true,
    removed: {
      sessions: s.length,
      emailVerificationTokens: ev.length,
      passwordResetTokens: pr.length,
      rateLimits: rl.length,
    },
  });
}
