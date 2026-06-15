/**
 * TEMPLATE 4 — Redefinição de Senha
 * Mensagem de segurança + botão CTA "Redefinir minha senha".
 */
import * as React from "react";
import { EmailLayout } from "./email-layout";
import { CtaButton, EmailHeading, EmailText, inlineLinkStyle } from "./ui";

export interface ResetPasswordEmailProps {
  /** Nome do destinatário (saudação). */
  name: string;
  /** Link de redefinição (com token). */
  resetUrl: string;
}

export function ResetPasswordEmail({ name, resetUrl }: ResetPasswordEmailProps) {
  return (
    <EmailLayout preview="Redefinição de senha">
      <EmailHeading>Redefinir sua senha</EmailHeading>
      <EmailText muted>Olá {name},</EmailText>
      <EmailText muted>
        Recebemos um pedido para redefinir a senha da sua conta. Clique no botão abaixo para criar
        uma nova senha.
      </EmailText>

      <CtaButton href={resetUrl}>Redefinir minha senha</CtaButton>

      <EmailText muted>
        Se o botão não funcionar, copie e cole este link no navegador:
        <br />
        <a href={resetUrl} style={inlineLinkStyle()}>
          {resetUrl}
        </a>
      </EmailText>
      <EmailText muted>
        O link expira em 1 hora. Se você não solicitou isso, ignore este e-mail — sua senha
        continua a mesma.
      </EmailText>
    </EmailLayout>
  );
}

export default ResetPasswordEmail;
