/**
 * TEMPLATE 2 — Convite de Acesso
 * Avisa que o usuário foi convidado por outra pessoa + botão CTA "Aceitar Convite".
 */
import * as React from "react";
import { EmailLayout } from "./email-layout";
import { CtaButton, EmailHeading, EmailText, HighlightBox, inlineLinkStyle } from "./ui";

export interface InviteEmailProps {
  /** URL de aceite do convite (link de cadastro com token). */
  acceptUrl: string;
  /** Nome de quem convidou (opcional). */
  invitedBy?: string;
  /** Plano já definido no convite (opcional). Se ausente, o convidado escolhe. */
  planLabel?: string | null;
}

export function InviteEmail({ acceptUrl, invitedBy, planLabel }: InviteEmailProps) {
  return (
    <EmailLayout preview="Você foi convidado para o sistema">
      <EmailHeading>Você recebeu um convite 🎟️</EmailHeading>
      <EmailText muted>
        {invitedBy ? `${invitedBy} convidou você` : "Você foi convidado"} para acessar o sistema.
        É rápido: clique no botão abaixo e crie sua conta.
      </EmailText>

      {planLabel ? (
        <HighlightBox label="Seu plano" value={planLabel} />
      ) : (
        <EmailText muted>Você poderá escolher o plano que preferir no cadastro.</EmailText>
      )}

      <CtaButton href={acceptUrl}>Aceitar convite</CtaButton>

      <EmailText muted>
        Se o botão não funcionar, copie e cole este link no navegador:
        <br />
        <a href={acceptUrl} style={inlineLinkStyle()}>
          {acceptUrl}
        </a>
      </EmailText>
      <EmailText muted>
        O convite expira em 7 dias. Se você não esperava este convite, ignore esta mensagem.
      </EmailText>
    </EmailLayout>
  );
}

export default InviteEmail;
