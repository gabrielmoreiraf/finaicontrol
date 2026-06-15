import "server-only";

import { dispatchEmail } from "@/lib/email/dispatch";
import { WelcomeEmail } from "@/lib/email/templates";
import { getAppUrl } from "@/lib/email/shared";

/**
 * E-mail de boas-vindas, enviado quando a conta passa a estar ativa
 * (após confirmar o e-mail ou ao aceitar um convite).
 *
 * É um e-mail NÃO crítico: nunca deve quebrar o fluxo de login/cadastro.
 * Por isso engole os próprios erros e apenas registra no log.
 */
export async function sendWelcomeEmail(params: {
  to: string;
  name: string;
  /** Caminho de destino pós-login (ex.: "/dashboard" ou "/onboarding"). */
  destinationPath?: string;
}): Promise<void> {
  const ctaUrl = `${getAppUrl()}${params.destinationPath ?? "/dashboard"}`;

  try {
    await dispatchEmail({
      to: params.to,
      subject: "Bem-vindo ao FinIA Control 🎉",
      template: WelcomeEmail({ name: params.name, ctaUrl }),
      devLogLabel: "E-mail de boas-vindas",
      devUserMessage: "",
      notAllowedMessage: "",
      genericErrorMessage: "",
    });
  } catch (error) {
    console.error("[sendWelcomeEmail] falha (ignorada):", error);
  }
}
