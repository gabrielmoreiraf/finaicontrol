import "server-only";
import { randomBytes } from "node:crypto";
import { cache } from "react";
import { cookies } from "next/headers";
import { and, eq, gt } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { profiles, sessions, users } from "@/lib/db/schema";
import { buildAvatarUrl } from "@/lib/avatar/process-upload";
import type { AuthUser, SubscriptionPlan, UsageMode } from "@/types/finance";

const SESSION_COOKIE = "finia_session";
const SESSION_TTL_DAYS = 30;
const SESSION_TTL_MS = SESSION_TTL_DAYS * 24 * 60 * 60 * 1000;

export async function createSession(userId: string): Promise<void> {
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);

  await db.insert(sessions).values({ id: token, userId, expiresAt });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_TTL_DAYS * 24 * 60 * 60,
  });
}

export const getCurrentUser = cache(async function getCurrentUser(): Promise<AuthUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const rows = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      emailVerified: users.emailVerified,
      mode: users.mode,
      plan: users.plan,
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

  return {
    id: row.id,
    name: row.name,
    email: row.email,
    emailVerified: row.emailVerified,
    mode: row.mode as UsageMode,
    plan: (row.plan as SubscriptionPlan | null) ?? null,
    onboardingComplete: row.onboardingComplete,
    createdAt: row.createdAt.toISOString(),
    avatarUrl:
      row.avatarWebp && row.avatarUpdatedAt
        ? buildAvatarUrl(row.id, row.avatarUpdatedAt)
        : null,
    fixedMonthlyIncome: Number(row.fixedMonthlyIncome ?? 0),
  };
});

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (token) {
    await db.delete(sessions).where(eq(sessions.id, token));
  }
  cookieStore.delete(SESSION_COOKIE);
}
