import "server-only";
import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { cache } from "react";
import { cookies } from "next/headers";
import { and, eq, gt, ne } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { profiles, sessions, users } from "@/lib/db/schema";
import { buildAvatarUrl } from "@/lib/avatar/process-upload";
import { getSessionCookieName } from "@/lib/auth/session-cookie";
import type { AuthUser, SubscriptionPlan, UsageMode, UserRole } from "@/types/finance";

const SESSION_TTL_DAYS = 30;
const SESSION_TTL_MS = SESSION_TTL_DAYS * 24 * 60 * 60 * 1000;

const SESSION_SECRET =
  process.env.SESSION_SECRET ||
  (process.env.NODE_ENV === "production"
    ? (() => {
        throw new Error("SESSION_SECRET não está definida em produção.");
      })()
    : "dev-insecure-session-secret");

/** Assina o token opaco com HMAC para garantir integridade do cookie. */
function signToken(token: string): string {
  return createHmac("sha256", SESSION_SECRET).update(token).digest("hex");
}

/** Verifica o valor assinado do cookie e retorna o token bruto (ou null). */
function readSignedToken(value: string | undefined): string | null {
  if (!value) return null;
  const idx = value.lastIndexOf(".");
  if (idx <= 0) return null;
  const token = value.slice(0, idx);
  const signature = value.slice(idx + 1);
  const expected = signToken(token);
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  return token;
}

export async function createSession(userId: string): Promise<void> {
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);

  await db.insert(sessions).values({ id: token, userId, expiresAt });

  const cookieStore = await cookies();
  cookieStore.set(getSessionCookieName(), `${token}.${signToken(token)}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_TTL_DAYS * 24 * 60 * 60,
  });
}

/** Retorna o token de sessão verificado do request atual (ou null). */
export async function getCurrentSessionToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return readSignedToken(cookieStore.get(getSessionCookieName())?.value);
}

export const getCurrentUser = cache(async function getCurrentUser(): Promise<AuthUser | null> {
  const cookieStore = await cookies();
  const token = readSignedToken(cookieStore.get(getSessionCookieName())?.value);
  if (!token) return null;

  const rows = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      emailVerified: users.emailVerified,
      mode: users.mode,
      plan: users.plan,
      role: users.role,
      loansEnabled: users.loansEnabled,
      onboardingComplete: users.onboardingComplete,
      createdAt: users.createdAt,
      avatarWebp: profiles.avatarWebp,
      avatarUpdatedAt: profiles.avatarUpdatedAt,
      fixedMonthlyIncome: profiles.fixedMonthlyIncome,
    })
    .from(sessions)
    .innerJoin(users, eq(sessions.userId, users.id))
    .leftJoin(profiles, eq(profiles.userId, users.id))
    .where(and(eq(sessions.id, token), gt(sessions.expiresAt, new Date())))
    .limit(1);

  const row = rows[0];
  if (!row) return null;

  const role = (row.role as UserRole) ?? "user";
  const storedPlan = (row.plan as SubscriptionPlan | null) ?? null;
  // Admin tem acesso premium completo (plano efetivo), independente do plano salvo.
  const effectivePlan: SubscriptionPlan | null = role === "admin" ? "premium" : storedPlan;

  return {
    id: row.id,
    name: row.name,
    email: row.email,
    emailVerified: row.emailVerified,
    mode: row.mode as UsageMode,
    role,
    plan: effectivePlan,
    onboardingComplete: row.onboardingComplete,
    createdAt: row.createdAt.toISOString(),
    avatarUrl:
      row.avatarWebp && row.avatarUpdatedAt
        ? buildAvatarUrl(row.id, row.avatarUpdatedAt)
        : null,
    fixedMonthlyIncome: Number(row.fixedMonthlyIncome ?? 0),
    // Admins têm o módulo Emprestei sempre liberado.
    loansEnabled: role === "admin" ? true : row.loansEnabled,
  };
});

export async function destroyAllSessionsForUser(userId: string): Promise<void> {
  await db.delete(sessions).where(eq(sessions.userId, userId));
}

/** Invalida todas as outras sessões do usuário, preservando a sessão atual. */
export async function invalidateOtherSessions(userId: string): Promise<void> {
  const currentToken = await getCurrentSessionToken();
  if (currentToken) {
    await db
      .delete(sessions)
      .where(and(eq(sessions.userId, userId), ne(sessions.id, currentToken)));
  } else {
    await db.delete(sessions).where(eq(sessions.userId, userId));
  }
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  const token = readSignedToken(cookieStore.get(getSessionCookieName())?.value);
  if (token) {
    await db.delete(sessions).where(eq(sessions.id, token));
  }
  cookieStore.delete(getSessionCookieName());
}
