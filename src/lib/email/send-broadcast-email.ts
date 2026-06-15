import "server-only";

import { render } from "@react-email/render";
import { Resend } from "resend";
import { AnnouncementEmail } from "@/lib/email/templates";

export type BroadcastContent = {
  subject: string;
  title: string;
  message: string;
  highlightLabel?: string;
  highlightValue?: string;
  ctaLabel?: string;
  ctaUrl?: string;
};

export type BroadcastRecipient = {
  email: string;
  name: string;
  /** Sobrescreve o link do botão SÓ para este destinatário (ex.: link de trial exclusivo). */
  ctaUrl?: string;
};

export type BroadcastResult = {
  sent: number;
  failed: number;
  /** true quando o Resend não está configurado (dev): nada foi enviado. */
  skipped: boolean;
  userMessage?: string;
};

const BATCH_SIZE = 100; // limite do endpoint resend.batch.send

function chunk<T>(items: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
  return out;
}

/**
 * Envia um comunicado (mesma mensagem) para vários destinatários, personalizando
 * a saudação com o nome de cada um. Usa o endpoint de lote do Resend (até 100 por
 * chamada) e divide automaticamente em lotes.
 */
export async function sendBroadcast(
  recipients: BroadcastRecipient[],
  content: BroadcastContent,
): Promise<BroadcastResult> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM ?? "FinIA Control <onboarding@resend.dev>";

  if (recipients.length === 0) {
    return { sent: 0, failed: 0, skipped: false, userMessage: "Nenhum destinatário." };
  }

  if (!apiKey) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("RESEND_API_KEY não configurada.");
    }
    console.info(`[dev] Comunicado não enviado (Resend não configurado) para ${recipients.length} destinatário(s).`);
    return {
      sent: 0,
      failed: 0,
      skipped: true,
      userMessage: "Resend não configurado (dev): nenhum e-mail foi enviado.",
    };
  }

  const resend = new Resend(apiKey);
  let sent = 0;
  let failed = 0;

  for (const group of chunk(recipients, BATCH_SIZE)) {
    const payload = await Promise.all(
      group.map(async (r) => {
        const template = AnnouncementEmail({
          name: r.name || r.email.split("@")[0],
          title: content.title,
          message: content.message,
          highlightLabel: content.highlightLabel,
          highlightValue: content.highlightValue,
          ctaLabel: content.ctaLabel,
          ctaUrl: r.ctaUrl ?? content.ctaUrl,
        });
        const [html, text] = await Promise.all([
          render(template),
          render(template, { plainText: true }),
        ]);
        return { from, to: r.email, subject: content.subject, html, text };
      }),
    );

    try {
      const { error } = await resend.batch.send(payload);
      if (error) {
        console.error("[resend] Falha no lote de comunicado:", error.message);
        failed += group.length;
      } else {
        sent += group.length;
      }
    } catch (error) {
      console.error("[resend] Exceção no lote de comunicado:", error);
      failed += group.length;
    }
  }

  return { sent, failed, skipped: false };
}
