"use server";

import { revalidatePath } from "next/cache";
import { eq, sql } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { creditGrants, users } from "@/lib/db/schema";
import { requireAdmin } from "@/lib/admin/customers";
import { recordAudit } from "@/lib/admin/audit";
import { actionError, actionSuccess, type ActionResult } from "@/lib/actions/result";
import { getEmailValidationError, normalizeEmail } from "@/lib/auth/validate-email";
import { createInvitation, revokeInvitation } from "@/lib/auth/invitation";
import { createTrialToken, grantTrialDirect, TRIAL_DAYS, TRIAL_PLAN } from "@/lib/auth/trial";
import { sendInviteEmail } from "@/lib/email/send-invite-email";
import { sendBroadcast, type BroadcastRecipient } from "@/lib/email/send-broadcast-email";
import { getAppUrl } from "@/lib/email/shared";
import type { SubscriptionPlan, UserRole } from "@/types/finance";

const PLANS: SubscriptionPlan[] = ["free", "plus", "premium"];
const ROLES: UserRole[] = ["user", "admin"];

export async function updateCustomerAccessAction(
  formData: FormData,
): Promise<ActionResult> {
  const admin = await requireAdmin();

  const userId = String(formData.get("userId") ?? "");
  const plan = String(formData.get("plan") ?? "");
  const role = String(formData.get("role") ?? "");
  const loansEnabled = String(formData.get("loansEnabled") ?? "") === "true";

  if (!userId) return actionError("Cliente inválido.");
  if (!PLANS.includes(plan as SubscriptionPlan)) return actionError("Plano inválido.");
  if (!ROLES.includes(role as UserRole)) return actionError("Papel inválido.");

  // Salvaguarda: admin não pode remover o próprio acesso master (evita auto-bloqueio).
  if (userId === admin.id && role !== "admin") {
    return actionError("Você não pode remover seu próprio acesso admin.");
  }

  await db
    .update(users)
    .set({ plan, role, loansEnabled })
    .where(eq(users.id, userId));

  // LGPD (Art. 37): registra a alteração de acesso feita pelo admin.
  await recordAudit(admin.id, "update_customer_access", userId);

  revalidatePath("/admin");
  return actionSuccess("Cliente atualizado com sucesso.");
}

/** Registra a visualização do detalhe de um cliente pelo admin (rastreabilidade). */
export async function logCustomerViewAction(targetUserId: string): Promise<void> {
  const admin = await requireAdmin();
  if (!targetUserId) return;
  await recordAudit(admin.id, "view_customer", targetUserId);
}

/**
 * Concede (ou ajusta) créditos de lançamentos extras a um cliente, registrando
 * no ledger `credit_grants` (quem concedeu, quanto e por quê) — "manter registrado".
 */
export async function grantEntryCreditsAction(formData: FormData): Promise<ActionResult> {
  const admin = await requireAdmin();

  const userId = String(formData.get("userId") ?? "");
  const amount = Math.trunc(Number(formData.get("amount") ?? 0));
  const reason = String(formData.get("reason") ?? "").trim().slice(0, 200);

  if (!userId) return actionError("Cliente inválido.");
  if (!Number.isFinite(amount) || amount === 0) {
    return actionError("Informe uma quantidade de créditos (diferente de zero).");
  }
  if (amount < -1000 || amount > 1000) {
    return actionError("Quantidade fora do intervalo permitido (-1000 a 1000).");
  }

  try {
    await db
      .update(users)
      .set({ entryCredits: sql`greatest(0, ${users.entryCredits} + ${amount})` })
      .where(eq(users.id, userId));
    await db.insert(creditGrants).values({ userId, amount, reason, grantedBy: admin.id });
    await recordAudit(admin.id, "grant_credits", userId);
  } catch (error) {
    console.error("[grantEntryCreditsAction]", error);
    return actionError("Não foi possível registrar os créditos.");
  }

  revalidatePath("/admin");
  return actionSuccess(
    amount > 0 ? `+${amount} crédito(s) concedido(s).` : `${amount} crédito(s) ajustado(s).`,
  );
}

/**
 * Concede acesso completo por tempo limitado (trial) DIRETAMENTE a um usuário,
 * sem precisar enviar e-mail. `days = 0` remove o trial.
 */
export async function grantTrialAction(formData: FormData): Promise<ActionResult> {
  const admin = await requireAdmin();

  const userId = String(formData.get("userId") ?? "");
  const days = Math.trunc(Number(formData.get("days") ?? TRIAL_DAYS));

  if (!userId) return actionError("Cliente inválido.");
  if (!Number.isFinite(days) || days < 0 || days > 3650) {
    return actionError("Quantidade de dias inválida (0 a 3650).");
  }

  try {
    if (days === 0) {
      await db
        .update(users)
        .set({ trialPlan: null, trialExpiresAt: null })
        .where(eq(users.id, userId));
    } else {
      await grantTrialDirect(userId, TRIAL_PLAN, days);
    }
    await recordAudit(admin.id, days === 0 ? "revoke_trial" : "grant_trial", userId);
  } catch (error) {
    console.error("[grantTrialAction]", error);
    return actionError("Não foi possível atualizar o acesso trial.");
  }

  revalidatePath("/admin");
  return actionSuccess(
    days === 0 ? "Acesso trial removido." : `${days} dias de acesso completo liberados.`,
  );
}

const INVITE_PLANS: SubscriptionPlan[] = ["free", "plus", "premium"];

/**
 * Envia um convite de acesso ao sistema para um e-mail, com plano opcional
 * (vazio = o convidado escolhe o plano no cadastro). Gera token, registra o
 * convite e dispara o e-mail. Em dev/erro, devolve o link para cópia manual.
 */
export async function sendInviteAction(formData: FormData): Promise<ActionResult> {
  const admin = await requireAdmin();

  const email = normalizeEmail(String(formData.get("email") ?? ""));
  const rawPlan = String(formData.get("plan") ?? "").trim();
  const plan = rawPlan === "" ? null : (rawPlan as SubscriptionPlan);

  if (!email) return actionError("Informe o e-mail do convidado.");
  const emailError = getEmailValidationError(email);
  if (emailError) return actionError(emailError);
  if (plan !== null && !INVITE_PLANS.includes(plan)) {
    return actionError("Plano inválido.");
  }

  // Já existe conta com esse e-mail? Convite não se aplica.
  const existing = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);
  if (existing[0]) {
    return actionError("Já existe uma conta com esse e-mail.");
  }

  let result: Awaited<ReturnType<typeof sendInviteEmail>>;
  try {
    const token = await createInvitation({ email, plan, invitedBy: admin.id });
    result = await sendInviteEmail({ to: email, plan, token });
    await recordAudit(admin.id, "send_invite", undefined);
  } catch (error) {
    console.error("[sendInviteAction]", error);
    return actionError("Não foi possível criar o convite.");
  }

  revalidatePath("/admin");

  if (result.sent) {
    return actionSuccess(`Convite enviado para ${email}.`);
  }
  // Fallback: e-mail não saiu — devolve o link para o admin copiar.
  return actionSuccess(`${result.userMessage ?? "Convite criado."} Link: ${result.url}`);
}

/**
 * Envia um comunicado (novidade/promoção) para um único usuário ou para todos.
 * Mensagem igual para todos, com saudação personalizada por nome. Tudo é
 * registrado no audit log (LGPD Art. 37).
 */
export async function sendBroadcastAction(formData: FormData): Promise<ActionResult> {
  const admin = await requireAdmin();

  const target = String(formData.get("target") ?? "all"); // "all" | "single"
  const subject = String(formData.get("subject") ?? "").trim().slice(0, 150);
  const title = String(formData.get("title") ?? "").trim().slice(0, 150);
  const message = String(formData.get("message") ?? "").trim().slice(0, 4000);
  const highlightLabel = String(formData.get("highlightLabel") ?? "").trim().slice(0, 60);
  const highlightValue = String(formData.get("highlightValue") ?? "").trim().slice(0, 60);
  const ctaLabel = String(formData.get("ctaLabel") ?? "").trim().slice(0, 40);
  const ctaUrl = String(formData.get("ctaUrl") ?? "").trim().slice(0, 500);

  if (!subject || !title || !message) {
    return actionError("Preencha assunto, título e mensagem.");
  }
  // Quando o comunicado concede 30 dias grátis, o botão vira um link de resgate
  // EXCLUSIVO por usuário (gerado abaixo). Senão, é um botão/link manual.
  const grantTrial = String(formData.get("grantTrial") ?? "") === "true";
  if (!grantTrial) {
    if (ctaLabel && !/^https?:\/\//i.test(ctaUrl)) {
      return actionError("O botão precisa de um link válido (começando com http).");
    }
    if (ctaUrl && !ctaLabel) {
      return actionError("Informe também o texto do botão.");
    }
  }

  let baseUsers: { id: string; name: string; email: string }[] = [];
  try {
    if (target === "single") {
      const email = normalizeEmail(String(formData.get("email") ?? ""));
      if (!email) return actionError("Informe o e-mail do destinatário.");
      const rows = await db
        .select({ id: users.id, name: users.name, email: users.email })
        .from(users)
        .where(eq(users.email, email))
        .limit(1);
      if (!rows[0]) return actionError("Nenhum usuário com esse e-mail.");
      baseUsers = rows;
    } else {
      baseUsers = await db
        .select({ id: users.id, name: users.name, email: users.email })
        .from(users);
    }
  } catch (error) {
    console.error("[sendBroadcastAction] recipients", error);
    return actionError("Não foi possível carregar os destinatários.");
  }

  let recipients: BroadcastRecipient[];
  let content: Parameters<typeof sendBroadcast>[1];
  try {
    if (grantTrial) {
      // Cada usuário recebe um link de resgate AMARRADO ao seu id (não funciona
      // se for compartilhado com outra pessoa).
      const appUrl = getAppUrl();
      recipients = await Promise.all(
        baseUsers.map(async (u) => {
          const token = await createTrialToken(u.id, TRIAL_PLAN, TRIAL_DAYS);
          return {
            name: u.name,
            email: u.email,
            ctaUrl: `${appUrl}/api/trial/redeem?token=${token}`,
          };
        }),
      );
      content = {
        subject,
        title,
        message,
        highlightLabel: highlightLabel || undefined,
        highlightValue: highlightValue || undefined,
        ctaLabel: ctaLabel || `Ativar meus ${TRIAL_DAYS} dias grátis`,
        ctaUrl: undefined, // sobrescrito por destinatário
      };
    } else {
      recipients = baseUsers.map((u) => ({ name: u.name, email: u.email }));
      content = {
        subject,
        title,
        message,
        highlightLabel: highlightLabel || undefined,
        highlightValue: highlightValue || undefined,
        ctaLabel: ctaLabel || undefined,
        ctaUrl: ctaUrl || undefined,
      };
    }
  } catch (error) {
    console.error("[sendBroadcastAction] trial tokens", error);
    return actionError("Não foi possível preparar os links de acesso.");
  }

  let result: Awaited<ReturnType<typeof sendBroadcast>>;
  try {
    result = await sendBroadcast(recipients, content);
    const auditAction = grantTrial
      ? target === "single"
        ? "broadcast_trial_single"
        : "broadcast_trial_all"
      : target === "single"
        ? "broadcast_single"
        : "broadcast_all";
    await recordAudit(admin.id, auditAction);
  } catch (error) {
    console.error("[sendBroadcastAction] send", error);
    return actionError("Não foi possível enviar o comunicado.");
  }

  if (result.skipped) {
    return actionSuccess(result.userMessage ?? "Resend não configurado — nada enviado.");
  }
  if (result.sent === 0) {
    return actionError(`Falha ao enviar (${result.failed} destinatário(s)).`);
  }
  const failNote = result.failed > 0 ? ` ${result.failed} falharam.` : "";
  return actionSuccess(`Comunicado enviado para ${result.sent} destinatário(s).${failNote}`);
}

/** Revoga (cancela) um convite pendente. */
export async function revokeInviteAction(formData: FormData): Promise<ActionResult> {
  const admin = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return actionError("Convite inválido.");

  try {
    await revokeInvitation(id);
    await recordAudit(admin.id, "revoke_invite", undefined);
  } catch (error) {
    console.error("[revokeInviteAction]", error);
    return actionError("Não foi possível revogar o convite.");
  }

  revalidatePath("/admin");
  return actionSuccess("Convite revogado.");
}
