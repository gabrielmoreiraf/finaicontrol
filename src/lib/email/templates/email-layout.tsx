/**
 * ============================================================================
 *  LAYOUT BASE (WRAPPER) DE TODOS OS E-MAILS
 * ============================================================================
 *  Header (logo centralizada + divisor) → Conteúdo (children) → Footer
 *  (divisor + assinatura + copyright + link do site).
 *
 *  Todo template específico apenas injeta seu conteúdo dentro de <EmailLayout>.
 * ============================================================================
 */
import * as React from "react";
import {
  Body,
  Container,
  Head,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";
import { EMAIL_THEME, emailTailwindConfig } from "./theme";

const { colors } = EMAIL_THEME;

/** Ano atual para o copyright do rodapé. */
function currentYear(): number {
  return new Date().getFullYear();
}

const dividerStyle: React.CSSProperties = {
  borderColor: colors.border,
  borderWidth: "0.5px 0 0",
  margin: "0",
};

export function EmailLayout({
  preview,
  children,
}: {
  /** Texto de pré-visualização (preheader) mostrado na caixa de entrada. */
  preview: string;
  children: React.ReactNode;
}) {
  return (
    <Html lang="pt-BR">
      <Head />
      <Preview>{preview}</Preview>
      <Tailwind config={emailTailwindConfig}>
        <Body
          style={{
            margin: 0,
            padding: "32px 0",
            backgroundColor: colors.background,
            fontFamily: EMAIL_THEME.fontFamily,
          }}
        >
          <Container
            style={{
              maxWidth: "520px",
              margin: "0 auto",
              padding: "0 24px",
              backgroundColor: colors.background,
            }}
          >
            {/* ---------- HEADER: ícone + nome (lockup centralizado) ---------- */}
            <Section style={{ padding: "8px 0 18px", textAlign: "center" as const }}>
              {/* Tabela interna só para alinhar ícone + texto e centralizar o grupo */}
              <table
                role="presentation"
                cellPadding={0}
                cellSpacing={0}
                border={0}
                style={{ margin: "0 auto" }}
              >
                <tbody>
                  <tr>
                    <td style={{ verticalAlign: "middle", paddingRight: "10px" }}>
                      <Img
                        src={EMAIL_THEME.iconUrl}
                        width={EMAIL_THEME.iconSize}
                        height={EMAIL_THEME.iconSize}
                        alt={EMAIL_THEME.brandName}
                        style={{ display: "block", borderRadius: "9px" }}
                      />
                    </td>
                    <td style={{ verticalAlign: "middle" }}>
                      <span
                        style={{
                          fontSize: "20px",
                          fontWeight: 700,
                          letterSpacing: "-0.01em",
                          color: colors.textPrimary,
                        }}
                      >
                        {EMAIL_THEME.brandNameStart}{" "}
                        <span style={{ color: colors.brand }}>{EMAIL_THEME.brandNameEnd}</span>
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </Section>
            <Hr style={dividerStyle} />

            {/* ---------- CONTEÚDO (children) ---------- */}
            <Section style={{ padding: "26px 0 30px" }}>{children}</Section>

            {/* ---------- FOOTER: divisor + assinatura + copyright + site ---------- */}
            <Hr style={dividerStyle} />
            <Section style={{ padding: "20px 0 0" }}>
              <Text
                style={{
                  margin: "0 0 10px",
                  color: colors.textPrimary,
                  fontSize: "14px",
                  fontWeight: 600,
                }}
              >
                — Time {EMAIL_THEME.brandName}
              </Text>
              <Text style={{ margin: "0 0 2px", color: colors.textSecondary, fontSize: "12px" }}>
                © {currentYear()} {EMAIL_THEME.brandName}
              </Text>
              <Link
                href={EMAIL_THEME.siteUrl}
                style={{ color: colors.brand, fontSize: "12px", textDecoration: "none" }}
              >
                {EMAIL_THEME.siteLabel}
              </Link>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
