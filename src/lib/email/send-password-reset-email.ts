import "server-only";

import { Resend } from "resend";

export type SendPasswordResetEmailResult = {
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

export function buildPasswordResetUrl(token: string): string {
  return `${getAppUrl()}/redefinir-senha?token=${token}`;
}

function isRecipientNotAllowedError(message: string): boolean {
  return (
    message.includes("testing emails to your own email") ||
    message.includes("verify a domain at resend.com/domains")
  );
}

export async function sendPasswordResetEmail(params: {
  to: string;
  name: string;
  token: string;
}): Promise<SendPasswordResetEmailResult> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM ?? "FinIA Control <onboarding@resend.dev>";
  const resetUrl = buildPasswordResetUrl(params.token);

  if (!apiKey) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("RESEND_API_KEY não configurada.");
    }
    console.info("[dev] Link de redefinição de senha:", resetUrl);
    return {
      sent: false,
      userMessage:
        "E-mail não enviado (Resend não configurado). Use o link de redefinição abaixo.",
    };
  }

  const resend = new Resend(apiKey);
  const { error } = await resend.emails.send({
    from,
    to: params.to,
    subject: "Redefinição de senha: FinIA Control",
    html: `
      <p>Olá, ${params.name}!</p>
      <p>Recebemos um pedido para redefinir a senha da sua conta no FinIA Control. Clique no link abaixo para criar uma nova senha:</p>
      <p><a href="${resetUrl}">Redefinir minha senha</a></p>
      <p>O link expira em 1 hora. Se você não solicitou isso, ignore esta mensagem — sua senha continua a mesma.</p>
    `,
  });

  if (error) {
    console.error("[resend] Falha ao enviar e-mail de redefinição:", error.message);

    if (isRecipientNotAllowedError(error.message)) {
      return {
        sent: false,
        userMessage:
          process.env.NODE_ENV === "production"
            ? "Não foi possível enviar o e-mail de redefinição. Verifique a configuração do domínio no Resend."
            : "No modo de teste do Resend, só é possível enviar para o e-mail da sua conta. Use o link de redefinição abaixo.",
      };
    }

    return {
      sent: false,
      userMessage:
        "Não foi possível enviar o e-mail de redefinição. Tente novamente em alguns minutos.",
    };
  }

  return { sent: true };
}
