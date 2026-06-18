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
import { getValidInvitation, markInvitationAccepted } from "@/lib/auth/invitation";
import { grantSignupTrialIfNew } from "@/lib/auth/trial";
import { getPasswordError } from "@/lib/auth/password-policy";
import {
  checkRateLimit,
  getClientIp,
  tooManyRequestsMessage,
} from "@/lib/auth/rate-limit";
import { sendVerificationEmail } from "@/lib/email/send-verification-email";
import { sendWelcomeEmail } from "@/lib/email/send-welcome-email";
import { TOAST_URL_KEYS } from "@/lib/toast/messages";
import type { SubscriptionPlan } from "@/types/finance";

export type AuthState = { error?: string };

/** Versão da Política/Termos vigente no aceite (LGPD — versionamento do consentimento). */
const CONSENT_VERSION = "2026-06";

function redirectWithToast(path: string, toast: string): never {
  const separator = path.includes("?") ? "&" : "?";
  redirect(`${path}${separator}toast=${toast}`);
}

/** Aceita apenas caminhos internos seguros (evita open redirect). */
function safeRedirectPath(raw: string): string | null {
  if (!raw) return null;
  let path = raw;
  try {
    path = decodeURIComponent(raw);
  } catch {
    return null;
  }
  // Precisa começar com "/" e não pode ser "//" ou "/\" (URL absoluta disfarçada).
  if (!path.startsWith("/")) return null;
  if (path.startsWith("//") || path.startsWith("/\\")) return null;
  return path;
}

export async function signUpAction(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = normalizeEmail(String(formData.get("email") ?? ""));
  const password = String(formData.get("password") ?? "");

  const ip = await getClientIp();
  const limit = await checkRateLimit(`signup:${ip}`, { max: 5, windowMs: 60_000 });
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

  const passwordError = getPasswordError(password);
  if (passwordError) {
    return { error: passwordError };
  }

  // LGPD (Art. 8º): consentimento obrigatório e registrado.
  if (formData.get("consent") !== "on") {
    return { error: "É necessário aceitar a Política de Privacidade e os Termos de Uso." };
  }

  // Cadastro por convite: e-mail já validado pelo admin. Pré-verifica o e-mail,
  // aplica o plano definido no convite (se houver) e entra direto no sistema.
  const inviteToken = String(formData.get("inviteToken") ?? "");
  const invite = inviteToken ? await getValidInvitation(inviteToken) : null;
  if (invite && invite.email === email) {
    const passwordHash = await hashPassword(password);
    const consent = { consentAcceptedAt: new Date(), consentVersion: CONSENT_VERSION };

    const existingInvited = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existingInvited[0]) {
      // Já há conta com esse e-mail — apenas consome o convite e manda logar.
      await markInvitationAccepted(inviteToken);
      redirect("/login");
    }

    const insertedInvited = await db
      .insert(users)
      .values({
        name,
        email,
        passwordHash,
        emailVerified: true,
        plan: invite.plan ?? null,
        ...consent,
      })
      .returning({ id: users.id });

    const invitedUserId = insertedInvited[0].id;
    await db.insert(profiles).values({ userId: invitedUserId });
    await markInvitationAccepted(inviteToken);
    await grantSignupTrialIfNew(invitedUserId); // 30 dias grátis de boas-vindas

    const invitedDestination = getPostAuthPath({ plan: invite.plan, onboardingComplete: false });
    // Boas-vindas (não crítico — não bloqueia o cadastro se falhar).
    await sendWelcomeEmail({ to: email, name, destinationPath: invitedDestination });

    await createSession(invitedUserId);
    redirect(invitedDestination);
  }

  const existing = await db
    .select({ id: users.id, emailVerified: users.emailVerified })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (existing[0]?.emailVerified) {
    // M3 (anti-enumeração): não revela que a conta já existe. Mostra a MESMA
    // tela de "verifique seu e-mail" de um cadastro novo, sem reenviar nada
    // (a conta já está verificada — o dono legítimo simplesmente faz login).
    const params = new URLSearchParams({ email, toast: TOAST_URL_KEYS.signup });
    redirect(`/verificar-email?${params}`);
  }

  const passwordHash = await hashPassword(password);
  const consent = { consentAcceptedAt: new Date(), consentVersion: CONSENT_VERSION };

  if (existing[0]) {
    await db
      .update(users)
      .set({ name, passwordHash, ...consent })
      .where(eq(users.id, existing[0].id));

    const token = await createEmailVerificationToken(existing[0].id);
    const sendResult = await sendVerificationEmail({ to: email, name, token });
    const params = new URLSearchParams({ email, toast: TOAST_URL_KEYS.signup });
    if (!sendResult.sent) params.set("nao_enviado", "1");
    redirect(`/verificar-email?${params}`);
  }

  const inserted = await db
    .insert(users)
    .values({ name, email, passwordHash, emailVerified: false, ...consent })
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
  const limit = await checkRateLimit(`login:${ip}:${email}`, { max: 5, windowMs: 60_000 });
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

  // Destino pós-login: se veio um `redirect` interno seguro (ex.: link de
  // resgate de trial), volta para lá; senão segue o fluxo padrão.
  const requested = safeRedirectPath(String(formData.get("redirect") ?? ""));
  if (requested) {
    redirectWithToast(requested, TOAST_URL_KEYS.login);
  }

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
