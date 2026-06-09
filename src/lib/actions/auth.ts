"use server";

import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { profiles, users } from "@/lib/db/schema";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { getPostAuthPath } from "@/lib/auth/post-auth-redirect";
import { createSession, destroySession } from "@/lib/auth/session";
import { getEmailValidationError, normalizeEmail } from "@/lib/auth/validate-email";
import { createEmailVerificationToken } from "@/lib/auth/verification-token";
import {
  checkRateLimit,
  getClientIp,
  tooManyRequestsMessage,
} from "@/lib/auth/rate-limit";
import { sendVerificationEmail } from "@/lib/email/send-verification-email";
import { TOAST_URL_KEYS } from "@/lib/toast/messages";
import type { SubscriptionPlan } from "@/types/finance";

export type AuthState = { error?: string };

function redirectWithToast(path: string, toast: string): never {
  const separator = path.includes("?") ? "&" : "?";
  redirect(`${path}${separator}toast=${toast}`);
}

export async function signUpAction(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = normalizeEmail(String(formData.get("email") ?? ""));
  const password = String(formData.get("password") ?? "");

  const ip = await getClientIp();
  const limit = checkRateLimit(`signup:${ip}`, { max: 5, windowMs: 60_000 });
  if (!limit.allowed) {
    return { error: tooManyRequestsMessage(limit.retryAfterSeconds) };
  }

  if (!name || !email || !password) {
    return { error: "Preencha nome, e-mail e senha." };
  }

  const emailError = getEmailValidationError(email);
  if (emailError) {
    return { error: emailError };
  }

  if (password.length < 6) {
    return { error: "A senha deve ter ao menos 6 caracteres." };
  }

  const existing = await db
    .select({ id: users.id, emailVerified: users.emailVerified })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (existing[0]?.emailVerified) {
    return { error: "Já existe uma conta com este e-mail." };
  }

  const passwordHash = await hashPassword(password);

  if (existing[0]) {
    await db
      .update(users)
      .set({ name, passwordHash })
      .where(eq(users.id, existing[0].id));

    const token = await createEmailVerificationToken(existing[0].id);
    const sendResult = await sendVerificationEmail({ to: email, name, token });
    const params = new URLSearchParams({ email, toast: TOAST_URL_KEYS.signup });
    if (!sendResult.sent) params.set("nao_enviado", "1");
    redirect(`/verificar-email?${params}`);
  }

  const inserted = await db
    .insert(users)
    .values({ name, email, passwordHash, emailVerified: false })
    .returning({ id: users.id });

  const userId = inserted[0].id;
  await db.insert(profiles).values({ userId });

  const token = await createEmailVerificationToken(userId);
  const sendResult = await sendVerificationEmail({ to: email, name, token });
  const params = new URLSearchParams({ email, toast: TOAST_URL_KEYS.signup });
  if (!sendResult.sent) params.set("nao_enviado", "1");
  redirect(`/verificar-email?${params}`);
}

export async function signInAction(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const email = normalizeEmail(String(formData.get("email") ?? ""));
  const password = String(formData.get("password") ?? "");

  const ip = await getClientIp();
  const limit = checkRateLimit(`login:${ip}:${email}`, { max: 5, windowMs: 60_000 });
  if (!limit.allowed) {
    return { error: tooManyRequestsMessage(limit.retryAfterSeconds) };
  }

  if (!email || !password) {
    return { error: "Informe e-mail e senha." };
  }

  const emailError = getEmailValidationError(email);
  if (emailError) {
    return { error: emailError };
  }

  const rows = await db
    .select({
      id: users.id,
      name: users.name,
      passwordHash: users.passwordHash,
      emailVerified: users.emailVerified,
      onboardingComplete: users.onboardingComplete,
      plan: users.plan,
    })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  const user = rows[0];
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return { error: "E-mail ou senha incorretos." };
  }

  if (!user.emailVerified) {
    const token = await createEmailVerificationToken(user.id);
    const sendResult = await sendVerificationEmail({ to: email, name: user.name, token });

    if (sendResult.sent) {
      return {
        error:
          "Confirme seu e-mail antes de entrar. Enviamos um novo link de confirmação.",
      };
    }

    return {
      error:
        sendResult.userMessage ??
        "Confirme seu e-mail antes de entrar. Não foi possível reenviar o link agora.",
    };
  }

  await createSession(user.id);
  redirectWithToast(
    getPostAuthPath({
      plan: (user.plan as SubscriptionPlan | null) ?? null,
      onboardingComplete: user.onboardingComplete,
    }),
    TOAST_URL_KEYS.login,
  );
}

export async function signOutAction(): Promise<void> {
  await destroySession();
  redirectWithToast("/login", TOAST_URL_KEYS.logout);
}
