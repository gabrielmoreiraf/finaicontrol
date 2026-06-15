import "server-only";

import { dispatchEmail } from "@/lib/email/dispatch";
import { InviteEmail } from "@/lib/email/templates";
import { getAppUrl } from "@/lib/email/shared";
import { getPlanLabel } from "@/lib/plans";
import type { SubscriptionPlan } from "@/types/finance";

export type SendInviteEmailResult = {
  sent: boolean;
  userMessage?: string;
  /** Link de cadastro, devolvido para fallback em dev/erro. */
  url: string;
};

export function buildInviteUrl(token: string): string {
  return `${getAppUrl()}/cadastro?invite=${token}`;
}

export async function sendInviteEmail(params: {
  to: string;
  plan: SubscriptionPlan | null;
  token: string;
  invitedBy?: string;
}): Promise<SendInviteEmailResult> {
  const url = buildInviteUrl(params.token);

  const result = await dispatchEmail({
    to: params.to,
    subject: "Você foi convidado para o FinIA Control",
    template: InviteEmail({
      acceptUrl: url,
      invitedBy: params.invitedBy,
      planLabel: params.plan ? getPlanLabel(params.plan) : null,
    }),
    devLogLabel: "Convite",
    devUserMessage: "E-mail não enviado (Resend não configurado). Copie o link de convite abaixo.",
    notAllowedMessage:
      process.env.NODE_ENV === "production"
        ? "Não foi possível enviar o convite. Verifique se o domínio de envio está configurado no Resend."
        : "No modo de teste do Resend, só é possível enviar para o e-mail da sua conta. Copie o link de convite abaixo.",
    genericErrorMessage: "Não foi possível enviar o convite por e-mail. Copie o link abaixo.",
  });

  return { ...result, url };
}
