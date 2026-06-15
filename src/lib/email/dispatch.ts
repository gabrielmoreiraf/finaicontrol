import "server-only";

import type { ReactElement } from "react";
import { render } from "@react-email/render";
import { Resend } from "resend";
import { isRecipientNotAllowedError } from "@/lib/email/shared";

export type DispatchResult = {
  sent: boolean;
  userMessage?: string;
};

/**
 * Renderiza um template React Email e o envia via Resend.
 *
 * Centraliza tudo que os senders tinham duplicado: leitura da API key, `from`
 * padrão, render de HTML + texto puro (melhora a entregabilidade), fallback de
 * desenvolvimento (sem Resend) e tratamento do erro de "modo de teste".
 *
 * `devUserMessage` / `notAllowedMessage` permitem que cada sender mostre a
 * mensagem certa ao usuário (ex.: "use o link abaixo").
 */
export async function dispatchEmail(params: {
  to: string;
  subject: string;
  template: ReactElement;
  devLogLabel: string;
  devUserMessage: string;
  notAllowedMessage: string;
  genericErrorMessage: string;
}): Promise<DispatchResult> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM ?? "FinIA Control <onboarding@resend.dev>";

  if (!apiKey) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("RESEND_API_KEY não configurada.");
    }
    console.info(`[dev] ${params.devLogLabel} não enviado (Resend não configurado).`);
    return { sent: false, userMessage: params.devUserMessage };
  }

  const [html, text] = await Promise.all([
    render(params.template),
    render(params.template, { plainText: true }),
  ]);

  const resend = new Resend(apiKey);
  const { error } = await resend.emails.send({
    from,
    to: params.to,
    subject: params.subject,
    html,
    text,
  });

  if (error) {
    console.error(`[resend] Falha ao enviar ${params.devLogLabel}:`, error.message);
    if (isRecipientNotAllowedError(error.message)) {
      return { sent: false, userMessage: params.notAllowedMessage };
    }
    return { sent: false, userMessage: params.genericErrorMessage };
  }

  return { sent: true };
}
