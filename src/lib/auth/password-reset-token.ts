import "server-only";

import { randomBytes } from "node:crypto";
import { and, eq, gt } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { passwordResetTokens } from "@/lib/db/schema";

const TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hora

export async function createPasswordResetToken(userId: string): Promise<string> {
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + TOKEN_TTL_MS);

  await db.delete(passwordResetTokens).where(eq(passwordResetTokens.userId, userId));
  await db.insert(passwordResetTokens).values({ id: token, userId, expiresAt });

  return token;
}

export async function verifyPasswordResetToken(token: string): Promise<string | null> {
  const rows = await db
    .select({ userId: passwordResetTokens.userId })
    .from(passwordResetTokens)
    .where(
      and(
        eq(passwordResetTokens.id, token),
        gt(passwordResetTokens.expiresAt, new Date()),
      ),
    )
    .limit(1);

  return rows[0]?.userId ?? null;
}

export async function consumePasswordResetTokens(userId: string): Promise<void> {
  await db.delete(passwordResetTokens).where(eq(passwordResetTokens.userId, userId));
}
