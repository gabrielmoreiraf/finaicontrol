import "server-only";

import { randomBytes } from "node:crypto";
import { and, eq, sql } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { trialTokens, users } from "@/lib/db/schema";
import type { SubscriptionPlan } from "@/types/finance";

/** Plano padrão do trial: acesso completo. */
export const TRIAL_PLAN: SubscriptionPlan = "premium";
/** Duração padrão do trial em dias. */
export const TRIAL_DAYS = 30;
/** Validade do LINK de resgate (janela para clicar), em dias. */
const TOKEN_TTL_DAYS = 14;

export type RedeemResult = "ok" | "not_found" | "wrong_user" | "expired";

function trialTarget(days: number): Date {
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
}

/**
 * Concede o trial DIRETAMENTE a um usuário (sem e-mail). Estende a data de
 * expiração para o máximo entre a atual e (agora + dias) — nunca encurta.
 */
export async function grantTrialDirect(
  userId: string,
  plan: SubscriptionPlan = TRIAL_PLAN,
  days: number = TRIAL_DAYS,
): Promise<void> {
  const target = trialTarget(days);
  await db
    .update(users)
    .set({
      trialPlan: plan,
      trialExpiresAt: sql`greatest(coalesce(${users.trialExpiresAt}, ${target}), ${target})`,
    })
    .where(eq(users.id, userId));
}

/**
 * Cria um token de resgate AMARRADO a `userId`. Remove tokens pendentes
 * anteriores do mesmo usuário para evitar duplicados. Retorna o token.
 */
export async function createTrialToken(
  userId: string,
  plan: SubscriptionPlan = TRIAL_PLAN,
  days: number = TRIAL_DAYS,
): Promise<string> {
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000);

  await db
    .delete(trialTokens)
    .where(and(eq(trialTokens.userId, userId), eq(trialTokens.status, "pending")));
  await db.insert(trialTokens).values({ id: token, userId, plan, days, status: "pending", expiresAt });

  return token;
}

/**
 * Resgata um token de trial. SEGURANÇA: só funciona se `currentUserId` for o
 * MESMO usuário a quem o token foi emitido — um link encaminhado a outra pessoa
 * não é resgatável por ela. Operação atômica (guarda por user_id + status).
 */
export async function redeemTrialToken(
  token: string,
  currentUserId: string,
): Promise<RedeemResult> {
  const rows = await db
    .select({
      userId: trialTokens.userId,
      plan: trialTokens.plan,
      days: trialTokens.days,
      status: trialTokens.status,
      expiresAt: trialTokens.expiresAt,
    })
    .from(trialTokens)
    .where(eq(trialTokens.id, token))
    .limit(1);

  const t = rows[0];
  if (!t || t.status !== "pending") return "not_found";
  if (t.expiresAt.getTime() <= Date.now()) return "expired";
  if (t.userId !== currentUserId) return "wrong_user";

  // Marca como resgatado de forma atômica, travando por user_id + status.
  const updated = await db.execute(sql`
    update trial_tokens set status = 'redeemed', redeemed_at = now()
    where id = ${token} and status = 'pending' and user_id = ${currentUserId}
    returning id
  `);
  const affected = (updated as { rows?: unknown[] }).rows;
  if (!Array.isArray(affected) || affected.length === 0) return "not_found";

  const target = trialTarget(t.days);
  await db
    .update(users)
    .set({
      trialPlan: t.plan,
      trialExpiresAt: sql`greatest(coalesce(${users.trialExpiresAt}, ${target}), ${target})`,
    })
    .where(eq(users.id, currentUserId));

  return "ok";
}
