import "server-only";

import { Resend } from "resend";

export type SendVerificationEmailResult = {
  sent: boolean;
  userMessage?: string;
};

function getAppUrl(): string {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL;
  }
  if (process.env.VERCEL_URL) {
    return process.env.VERCEL_URL.startsWith("http")
      ? process.env.VERCEL_URL
      : `https://${process.env.VERCEL_URL}`;
  }
  return "http://localhost:3000";
}

export function buildVerificationUrl(token: string): string {
  return `${getAppUrl()}/verificar-email/confirmar?token=${token}`;
}

function isRecipientNotAllowedError(message: string): boolean {
  return (
    message.includes("testing emails to your own email") ||
    message.includes("verify a domain at resend.com/domains")
  );
}

export async function sendVerificationEmail(params: {
  to: string;
  name: string;
  token: string;
}): Promise<SendVerificationEmailResult> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM ?? "FinIA Control <onboarding@resend.dev>";
  const verificationUrl = buildVerificationUrl(params.token);

  if (!apiKey) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("RESEND_API_KEY não configurada.");
    }
    console.info("[dev] Link de verificação:", verificationUrl);
    return {
      sent: false,
      userMessage:
        "E-mail não enviado (Resend não configurado). Use o link de confirmação abaixo.",
    };
  }

  const resend = new Resend(apiKey);
  const { error } = await resend.emails.send({
    from,
    to: params.to,
    subject: "Confirme seu e-mail: FinIA Control",
    html: `
      <p>Olá, ${params.name}!</p>
      <p>Clique no link abaixo para confirmar seu e-mail e ativar sua conta no FinIA Control:</p>
      <p><a href="${verificationUrl}">Confirmar e-mail</a></p>
      <p>O link expira em 24 horas. Se você não criou esta conta, ignore esta mensagem.</p>
    `,
  });

  if (error) {
    console.error("[resend] Falha ao enviar e-mail de verificação:", error.message);

    if (isRecipientNotAllowedError(error.message)) {
      return {
        sent: false,
        userMessage:
          process.env.NODE_ENV === "production"
            ? "Não foi possível enviar o e-mail de confirmação. Verifique se o domínio de envio está configurado no Resend."
            : "No modo de teste do Resend, só é possível enviar para o e-mail da sua conta. Use o link de confirmação abaixo ou cadastre-se com o e-mail vinculado ao Resend.",
      };
    }

    return {
      sent: false,
      userMessage: "Não foi possível enviar o e-mail de confirmação. Tente reenviar em alguns minutos.",
    };
  }

  return { sent: true };
}
