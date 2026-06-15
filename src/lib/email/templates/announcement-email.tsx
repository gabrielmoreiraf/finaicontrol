/**
 * TEMPLATE — Comunicado / Anúncio (broadcast)
 * Usado para novidades, atualizações e promoções (ex.: "Você ganhou 30 dias").
 * Tudo é opcional além de título + mensagem: caixa de destaque e botão CTA.
 */
import * as React from "react";
import { EmailLayout } from "./email-layout";
import { CtaButton, EmailHeading, EmailText, HighlightBox } from "./ui";

export interface AnnouncementEmailProps {
  /** Nome do destinatário (saudação). */
  name: string;
  /** Título do comunicado. */
  title: string;
  /** Corpo da mensagem. Quebras de linha viram parágrafos. */
  message: string;
  /** Caixa de destaque opcional (ex.: "Cortesia": "30 dias grátis"). */
  highlightLabel?: string;
  highlightValue?: string;
  /** Botão de ação opcional. */
  ctaLabel?: string;
  ctaUrl?: string;
}

export function AnnouncementEmail({
  name,
  title,
  message,
  highlightLabel,
  highlightValue,
  ctaLabel,
  ctaUrl,
}: AnnouncementEmailProps) {
  const paragraphs = message.split(/\n+/).filter((p) => p.trim().length > 0);
  const hasHighlight = Boolean(highlightLabel && highlightValue);
  const hasCta = Boolean(ctaLabel && ctaUrl);

  return (
    <EmailLayout preview={title}>
      <EmailHeading>{title}</EmailHeading>
      <EmailText muted>Olá {name},</EmailText>

      {paragraphs.map((p, i) => (
        <EmailText key={i} muted>
          {p}
        </EmailText>
      ))}

      {hasHighlight && <HighlightBox label={highlightLabel!} value={highlightValue!} />}

      {hasCta && <CtaButton href={ctaUrl!}>{ctaLabel}</CtaButton>}

      <EmailText muted>
        Você recebeu este e-mail porque tem uma conta no FinIA Control.
      </EmailText>
    </EmailLayout>
  );
}

export default AnnouncementEmail;
