/**
 * TEMPLATE (bônus) — Boas-vindas
 * Enviado após a confirmação da conta. Saudação + CTA para o painel.
 */
import * as React from "react";
import { EmailLayout } from "./email-layout";
import { CtaButton, EmailHeading, EmailText } from "./ui";

export interface WelcomeEmailProps {
  /** Nome do destinatário. */
  name: string;
  /** Link para o painel / primeiro acesso. */
  ctaUrl: string;
}

export function WelcomeEmail({ name, ctaUrl }: WelcomeEmailProps) {
  return (
    <EmailLayout preview="Bem-vindo ao FinIA Control">
      <EmailHeading>Bem-vindo, {name}! 🎉</EmailHeading>
      <EmailText muted>
        Sua conta está pronta. A partir de agora você pode organizar receitas, despesas, dívidas e
        metas em um só lugar.
      </EmailText>

      <CtaButton href={ctaUrl}>Acessar meu painel</CtaButton>

      <EmailText muted>Qualquer dúvida, é só responder a este e-mail. Boas finanças!</EmailText>
    </EmailLayout>
  );
}

export default WelcomeEmail;
