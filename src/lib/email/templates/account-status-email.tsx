/**
 * TEMPLATE 1 — Confirmação / Status de Conta
 * Saudação + texto informativo + caixa de destaque com uma variável
 * (ex.: "Seu perfil: Atleta").
 */
import * as React from "react";
import { EmailLayout } from "./email-layout";
import { EmailHeading, EmailText, HighlightBox } from "./ui";

export interface AccountStatusEmailProps {
  /** Nome do destinatário (saudação). */
  name: string;
  /** Título do e-mail (ex.: "Você está na lista!"). */
  title: string;
  /** Parágrafo principal informativo. */
  message: string;
  /** Rótulo da caixa de destaque (ex.: "Seu perfil"). */
  highlightLabel: string;
  /** Valor em destaque (ex.: "Atleta"). */
  highlightValue: string;
  /** Texto de fechamento opcional (ex.: "Avisaremos assim que abrirmos."). */
  closing?: string;
}

export function AccountStatusEmail({
  name,
  title,
  message,
  highlightLabel,
  highlightValue,
  closing,
}: AccountStatusEmailProps) {
  return (
    <EmailLayout preview={title}>
      <EmailHeading>{title}</EmailHeading>
      <EmailText muted>Olá {name},</EmailText>
      <EmailText muted>{message}</EmailText>

      <HighlightBox label={highlightLabel} value={highlightValue} />

      {closing && <EmailText muted>{closing}</EmailText>}
    </EmailLayout>
  );
}

export default AccountStatusEmail;
