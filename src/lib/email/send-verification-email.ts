import "server-only";

import { dispatchEmail } from "@/lib/email/dispatch";
import { VerifyEmail } from "@/lib/email/templates";
import { getAppUrl } from "@/lib/email/shared";

export type SendVerificationEmailResult = {
  sent: boolean;
  userMessage?: string;
};

export function buildVerificationUrl(token: string): string {
  return `${getAppUrl()}/verificar-email/confirmar?token=${token}`;
}

export async function sendVerificationEmail(params: {
  to: string;
  name: string;
  token: string;
}): Promise<SendVerificationEmailResult> {
  const verifyUrl = buildVerificationUrl(params.token);

  return dispatchEmail({
    to: params.to,
    subject: "Confirme seu e-mail: FinIA Control",
    template: VerifyEmail({ name: params.name, verifyUrl }),
    devLogLabel: "E-mail de verificação",
    devUserMessage:
      "E-mail não enviado (Resend não configurado). Use o link de confirmação abaixo.",
    notAllowedMessage:
      process.env.NODE_ENV === "production"
        ? "Não foi possível enviar o e-mail de confirmação. Verifique se o domínio de envio está configurado no Resend."
        : "No modo de teste do Resend, só é possível enviar para o e-mail da sua conta. Use o link de confirmação abaixo ou cadastre-se com o e-mail vinculado ao Resend.",
    genericErrorMessage:
      "Não foi possível enviar o e-mail de confirmação. Tente reenviar em alguns minutos.",
  });
}
