import "server-only";

/** URL base da aplicação (env > Vercel > localhost), usada nos links de e-mail. */
export function getAppUrl(): string {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL;
  }
  if (process.env.VERCEL_URL) {
    return process.env.VERCEL_URL.startsWith("http")
      ? process.env.VERCEL_URL
      : `https://${process.env.VERCEL_URL}`;
  }
  return "http://localhost:3000";
}

/** Erro do Resend no modo de teste (só envia para o e-mail da própria conta). */
export function isRecipientNotAllowedError(message: string): boolean {
  return (
    message.includes("testing emails to your own email") ||
    message.includes("verify a domain at resend.com/domains")
  );
}
