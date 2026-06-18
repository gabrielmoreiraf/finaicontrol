"use server";

import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { users } from "@/lib/db/schema";
import { hashPassword } from "@/lib/auth/password";
import { getPasswordError } from "@/lib/auth/password-policy";
import { destroyAllSessionsForUser } from "@/lib/auth/session";
import { getEmailValidationError, normalizeEmail } from "@/lib/auth/validate-email";
import {
  consumePasswordResetTokens,
  createPasswordResetToken,
  verifyPasswordResetToken,
} from "@/lib/auth/password-reset-token";
import { sendPasswordResetEmail } from "@/lib/email/send-password-reset-email";
import {
  checkRateLimit,
  getClientIp,
  tooManyRequestsMessage,
} from "@/lib/auth/rate-limit";
import { TOAST_URL_KEYS } from "@/lib/toast/messages";

export type RequestResetState = {
  error?: string;
  success?: string;
  devResetUrl?: string;
};
export type ResetPasswordState = { error?: string };

const GENERIC_SUCCESS =
  "Se existir uma conta com este e-mail, enviamos um link para redefinir a senha.";

export async function requestPasswordResetAction(
  _prev: RequestResetState,
  formData: FormData,
): Promise<RequestResetState> {
  const email = normalizeEmail(String(formData.get("email") ?? ""));

  const ip = await getClientIp();
  const limit = await checkRateLimit(`reset:${ip}:${email}`, { max: 3, windowMs: 5 * 60_000 });
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

  // Não revela se a conta existe (evita enumeração de e-mails).
  if (!user || !user.emailVerified) {
    return { success: GENERIC_SUCCESS };
  }

  const token = await createPasswordResetToken(user.id);
  const sendResult = await sendPasswordResetEmail({ to: email, name: user.name, token });

  if (sendResult.sent || process.env.NODE_ENV === "production") {
    return { success: GENERIC_SUCCESS };
  }

  // Desenvolvimento sem Resend configurado: expõe o link manualmente.
  const { buildPasswordResetUrl } = await import(
    "@/lib/email/send-password-reset-email"
  );
  return { success: GENERIC_SUCCESS, devResetUrl: buildPasswordResetUrl(token) };
}

export async function resetPasswordAction(
  _prev: ResetPasswordState,
  formData: FormData,
): Promise<ResetPasswordState> {
  const token = String(formData.get("token") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (!token) {
    return { error: "Link de redefinição inválido. Solicite um novo." };
  }

  const passwordError = getPasswordError(password);
  if (passwordError) {
    return { error: passwordError };
  }

  if (password !== confirmPassword) {
    return { error: "As senhas não coincidem." };
  }

  const userId = await verifyPasswordResetToken(token);
  if (!userId) {
    return { error: "Este link expirou ou já foi usado. Solicite um novo." };
  }

  const passwordHash = await hashPassword(password);

  await db.update(users).set({ passwordHash }).where(eq(users.id, userId));
  await consumePasswordResetTokens(userId);
  // Invalida sessões antigas após a troca de senha (segurança).
  await destroyAllSessionsForUser(userId);

  redirect(`/login?toast=${TOAST_URL_KEYS.passwordReset}`);
}
