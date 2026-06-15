import "server-only";

import { dispatchEmail } from "@/lib/email/dispatch";
import { ResetPasswordEmail } from "@/lib/email/templates";
import { getAppUrl } from "@/lib/email/shared";

export type SendPasswordResetEmailResult = {
  sent: boolean;
  userMessage?: string;
};

export function buildPasswordResetUrl(token: string): string {
  return `${getAppUrl()}/redefinir-senha?token=${token}`;
}

export async function sendPasswordResetEmail(params: {
  to: string;
  name: string;
  token: string;
}): Promise<SendPasswordResetEmailResult> {
  const resetUrl = buildPasswordResetUrl(params.token);

  return dispatchEmail({
    to: params.to,
    subject: "Redefinição de senha: FinIA Control",
    template: ResetPasswordEmail({ name: params.name, resetUrl }),
    devLogLabel: "E-mail de redefinição",
    devUserMessage:
      "E-mail não enviado (Resend não configurado). Use o link de redefinição abaixo.",
    notAllowedMessage:
      process.env.NODE_ENV === "production"
        ? "Não foi possível enviar o e-mail de redefinição. Verifique a configuração do domínio no Resend."
        : "No modo de teste do Resend, só é possível enviar para o e-mail da sua conta. Use o link de redefinição abaixo.",
    genericErrorMessage:
      "Não foi possível enviar o e-mail de redefinição. Tente novamente em alguns minutos.",
  });
}
