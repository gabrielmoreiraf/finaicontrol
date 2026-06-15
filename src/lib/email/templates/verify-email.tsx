/**
 * TEMPLATE 3 — Verificação de E-mail
 * Suporta os dois formatos (use um, o outro, ou ambos):
 *   • `code`        → bloco com código de 6 dígitos grande e em destaque;
 *   • `verifyUrl`   → botão largo "Confirmar e-mail".
 */
import * as React from "react";
import { EmailLayout } from "./email-layout";
import { CodeBlock, CtaButton, EmailHeading, EmailText, inlineLinkStyle } from "./ui";

export interface VerifyEmailProps {
  /** Nome do destinatário (saudação). */
  name: string;
  /** Código numérico de 6 dígitos (opcional). */
  code?: string;
  /** Link de confirmação por botão (opcional). */
  verifyUrl?: string;
}

export function VerifyEmail({ name, code, verifyUrl }: VerifyEmailProps) {
  return (
    <EmailLayout preview="Confirme seu e-mail">
      <EmailHeading>Confirme seu e-mail</EmailHeading>
      <EmailText muted>Olá {name},</EmailText>
      <EmailText muted>
        Para ativar sua conta, confirme que este e-mail é seu
        {code ? " usando o código abaixo:" : " clicando no botão abaixo:"}
      </EmailText>

      {code && <CodeBlock code={code} />}

      {verifyUrl && <CtaButton href={verifyUrl}>Confirmar e-mail</CtaButton>}

      {verifyUrl && (
        <EmailText muted>
          Se o botão não funcionar, copie e cole este link no navegador:
          <br />
          <a href={verifyUrl} style={inlineLinkStyle()}>
            {verifyUrl}
          </a>
        </EmailText>
      )}

      <EmailText muted>
        O {code ? "código" : "link"} expira em 24 horas. Se você não criou esta conta, ignore esta
        mensagem.
      </EmailText>
    </EmailLayout>
  );
}

export default VerifyEmail;
