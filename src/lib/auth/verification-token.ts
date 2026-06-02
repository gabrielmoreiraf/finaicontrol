import "server-only";

import { randomBytes } from "node:crypto";
import { and, eq, gt } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { emailVerificationTokens, users } from "@/lib/db/schema";

const TOKEN_TTL_MS = 24 * 60 * 60 * 1000;

export async function createEmailVerificationToken(userId: string): Promise<string> {
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + TOKEN_TTL_MS);

  await db.delete(emailVerificationTokens).where(eq(emailVerificationTokens.userId, userId));
  await db.insert(emailVerificationTokens).values({ id: token, userId, expiresAt });

  return token;
}

export async function verifyEmailToken(token: string): Promise<string | null> {
  const rows = await db
    .select({ userId: emailVerificationTokens.userId })
    .from(emailVerificationTokens)
    .where(
      and(
        eq(emailVerificationTokens.id, token),
        gt(emailVerificationTokens.expiresAt, new Date()),
      ),
    )
    .limit(1);

  return rows[0]?.userId ?? null;
}

export async function markEmailVerified(userId: string): Promise<void> {
  await db.update(users).set({ emailVerified: true }).where(eq(users.id, userId));
  await db.delete(emailVerificationTokens).where(eq(emailVerificationTokens.userId, userId));
}

export async function getLatestVerificationTokenForEmail(
  email: string,
): Promise<string | null> {
  const rows = await db
    .select({ token: emailVerificationTokens.id })
    .from(emailVerificationTokens)
    .innerJoin(users, eq(emailVerificationTokens.userId, users.id))
    .where(
      and(
        eq(users.email, email),
        eq(users.emailVerified, false),
        gt(emailVerificationTokens.expiresAt, new Date()),
      ),
    )
    .limit(1);

  return rows[0]?.token ?? null;
}

export async function getEmailForVerificationToken(token: string): Promise<string | null> {
  const rows = await db
    .select({ email: users.email })
    .from(emailVerificationTokens)
    .innerJoin(users, eq(emailVerificationTokens.userId, users.id))
    .where(eq(emailVerificationTokens.id, token))
    .limit(1);

  return rows[0]?.email ?? null;
}
