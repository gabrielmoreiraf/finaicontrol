import "server-only";

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
/**
 * Modelo gratuito da Groq. Padrão: 8b-instant (cota diária ~5x maior que o 70b
 * e mais rápido). Para mais qualidade de raciocínio, defina GROQ_MODEL=
 * llama-3.3-70b-versatile (porém TPD menor: 100k/dia).
 */
const GROQ_MODEL = process.env.GROQ_MODEL ?? "llama-3.1-8b-instant";

export type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

export function isGroqConfigured(): boolean {
  return !!process.env.GROQ_API_KEY;
}

/**
 * Chama a Groq (API compatível com OpenAI) em modo streaming e devolve um
 * ReadableStream de TEXTO puro (apenas os deltas de conteúdo), pronto para ser
 * repassado ao cliente.
 */
export async function streamGroqChat(messages: ChatMessage[]): Promise<ReadableStream<Uint8Array>> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error("GROQ_API_KEY não configurada.");

  const res = await fetch(GROQ_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages,
      stream: true,
      temperature: 0.4,
      max_tokens: 1024,
    }),
  });

  if (!res.ok || !res.body) {
    const detail = await res.text().catch(() => "");
    const err = new Error(`Groq ${res.status}: ${detail.slice(0, 300)}`) as Error & {
      status?: number;
    };
    err.status = res.status;
    throw err;
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();
  let buffer = "";

  return new ReadableStream<Uint8Array>({
    async pull(controller) {
      const { done, value } = await reader.read();
      if (done) {
        controller.close();
        return;
      }
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed.startsWith("data:")) continue;
        const data = trimmed.slice(5).trim();
        if (data === "[DONE]") {
          controller.close();
          return;
        }
        try {
          const json = JSON.parse(data);
          const delta = json?.choices?.[0]?.delta?.content;
          if (typeof delta === "string" && delta) {
            controller.enqueue(encoder.encode(delta));
          }
        } catch {
          // linha parcial/keep-alive — ignora
        }
      }
    },
    cancel() {
      void reader.cancel();
    },
  });
}
