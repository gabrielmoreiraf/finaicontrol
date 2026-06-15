/**
 * Peças reutilizáveis dos e-mails (botão, caixa de destaque, textos).
 * Estilizadas a partir do EMAIL_THEME — não há cor "hardcoded" aqui.
 */
import * as React from "react";
import { Button, Heading, Section, Text } from "@react-email/components";
import { EMAIL_THEME } from "./theme";

const { colors } = EMAIL_THEME;

/** Título principal do conteúdo (ex.: "Você está na lista!"). */
export function EmailHeading({ children }: { children: React.ReactNode }) {
  return (
    <Heading
      as="h1"
      style={{
        margin: "0 0 16px",
        color: colors.textPrimary,
        fontSize: "22px",
        lineHeight: "1.3",
        fontWeight: 700,
      }}
    >
      {children}
    </Heading>
  );
}

/** Parágrafo de corpo. Use `muted` para texto secundário/observações. */
export function EmailText({
  children,
  muted = false,
}: {
  children: React.ReactNode;
  muted?: boolean;
}) {
  return (
    <Text
      style={{
        margin: "0 0 14px",
        color: muted ? colors.textSecondary : colors.textPrimary,
        fontSize: "15px",
        lineHeight: "1.6",
      }}
    >
      {children}
    </Text>
  );
}

/**
 * Caixa de destaque com borda fina na cor da marca.
 * Ex.: <HighlightBox label="Seu perfil" value="Atleta" />
 */
export function HighlightBox({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <Section
      style={{
        margin: "8px 0 20px",
        padding: "16px 20px",
        backgroundColor: colors.surface,
        border: `1px solid ${colors.brand}`,
        borderRadius: "10px",
      }}
    >
      <Text style={{ margin: 0, fontSize: "14px", lineHeight: "1.5" }}>
        <span style={{ color: colors.textSecondary }}>{label}:&nbsp;</span>
        <span style={{ color: colors.brand, fontWeight: 700 }}>{value}</span>
      </Text>
    </Section>
  );
}

/** Botão de ação principal (CTA), na cor de destaque da marca. */
export function CtaButton({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Section style={{ margin: "24px 0 8px" }}>
      <Button
        href={href}
        style={{
          display: "inline-block",
          backgroundColor: colors.brand,
          color: colors.brandText,
          fontSize: "15px",
          fontWeight: 700,
          textDecoration: "none",
          padding: "13px 28px",
          borderRadius: "10px",
        }}
      >
        {children}
      </Button>
    </Section>
  );
}

/**
 * Bloco visual com um código grande em destaque (ex.: verificação 6 dígitos).
 */
export function CodeBlock({ code }: { code: string }) {
  return (
    <Section
      style={{
        margin: "8px 0 20px",
        padding: "20px",
        textAlign: "center" as const,
        backgroundColor: colors.surface,
        border: `1px solid ${colors.border}`,
        borderRadius: "10px",
      }}
    >
      <Text
        style={{
          margin: 0,
          color: colors.brand,
          fontSize: "34px",
          fontWeight: 700,
          letterSpacing: "10px",
          fontFamily: "'Courier New', Courier, monospace",
        }}
      >
        {code}
      </Text>
    </Section>
  );
}

/** Link inline na cor da marca (para "ou copie este link"). */
export function inlineLinkStyle(): React.CSSProperties {
  return { color: colors.brand, textDecoration: "underline", wordBreak: "break-all" };
}
