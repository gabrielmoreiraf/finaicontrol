"use server";

import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { users } from "@/lib/db/schema";
import { getEmailValidationError, normalizeEmail } from "@/lib/auth/validate-email";
import {
  createEmailVerificationToken,
  getLatestVerificationTokenForEmail,
} from "@/lib/auth/verification-token";
import { sendVerificationEmail } from "@/lib/email/send-verification-email";
import {
  checkRateLimit,
  getClientIp,
  tooManyRequestsMessage,
} from "@/lib/auth/rate-limit";

export type VerifyEmailState = { error?: string; success?: string };

export async function resendVerificationEmailAction(
  _prev: VerifyEmailState,
  formData: FormData,
): Promise<VerifyEmailState> {
  const email = normalizeEmail(String(formData.get("email") ?? ""));

  const ip = await getClientIp();
  const limit = checkRateLimit(`resend:${ip}:${email}`, { max: 3, windowMs: 5 * 60_000 });
  if (!limit.allowed) {
    return { error: tooManyRequestsMessage(limit.retryAfterSeconds) };
  }

  const validationError = getEmailValidationError(email);
  if (validationError) {
    return { error: validationError };
  }

  const rows = await db
    .select({ id: users.id, name: users.name, emailVerified: users.emailVerified })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  const user = rows[0];
  if (!user) {
    return {
      success:
        "Se existir uma conta pendente com este e-mail, enviamos um novo link de confirmação.",
    };
  }

  if (user.emailVerified) {
    return { error: "Este e-mail já foi confirmado. Faça login." };
  }

  const token = await createEmailVerificationToken(user.id);
  const sendResult = await sendVerificationEmail({ to: email, name: user.name, token });

  if (sendResult.sent) {
    return {
      success: "Enviamos um novo link de confirmação. Verifique sua caixa de entrada.",
    };
  }

  return {
    error:
      sendResult.userMessage ??
      "Não foi possível enviar o e-mail agora. Tente novamente em alguns minutos.",
  };
}

export async function getDevVerificationLink(email: string): Promise<string | null> {
  if (process.env.NODE_ENV === "production") {
    return null;
  }

  const normalized = normalizeEmail(email);
  const token = await getLatestVerificationTokenForEmail(normalized);
  if (!token) return null;

  const { buildVerificationUrl } = await import("@/lib/email/send-verification-email");
  return buildVerificationUrl(token);
}
