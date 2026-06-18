"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Bot, Info, Loader2, MessageCircle, Send, Sparkles, TriangleAlert } from "lucide-react";
import { FiniaMascot } from "@/components/app/premium/finia-mascot";
import { EmptyState } from "@/components/app/premium/empty-state";
import { PageHeader } from "@/components/app/premium/page-header";
import { PremiumCard } from "@/components/app/premium/premium-card";
import { Button } from "@/components/ui/button";
import { SUPPORT_WHATSAPP_URL } from "@/lib/brand";
import { IA_SUGGESTIONS } from "@/lib/finance/format";
import { cn } from "@/lib/utils";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  highlight?: string;
};

export function IaAssistantView() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") ?? "";
  const [input, setInput] = useState(initialQuery);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const idRef = useRef(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Rola para a última mensagem a cada atualização (envio + streaming).
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);

  function nextId() {
    idRef.current += 1;
    return `m${idRef.current}`;
  }

  async function sendMessage(text?: string) {
    const content = (text ?? input).trim();
    if (!content || isLoading) return;

    const userMsg: ChatMessage = { id: nextId(), role: "user", content };
    const assistantId = nextId();

    // Histórico enviado ao servidor (apenas papel + conteúdo).
    const history = [...messages, userMsg].map((m) => ({
      role: m.role,
      content: m.content,
    }));

    setMessages((prev) => [
      ...prev,
      userMsg,
      { id: assistantId, role: "assistant", content: "" },
    ]);
    setInput("");
    setIsLoading(true);

    function setAssistant(value: string) {
      setMessages((prev) =>
        prev.map((m) => (m.id === assistantId ? { ...m, content: value } : m)),
      );
    }

    try {
      const res = await fetch("/api/ia/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history }),
      });

      if (!res.ok || !res.body) {
        const errorText = await res.text().catch(() => "");
        setAssistant(
          errorText || "Tive um soluço agora e não consegui responder. 🙏 Tente de novo em instantes?",
        );
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = "";
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        setAssistant(acc);
      }
      if (!acc.trim()) {
        setAssistant("Hmm, não consegui formular uma resposta dessa vez. Pode reformular a pergunta? 🤔");
      }
    } catch {
      setAssistant("Parece que a conexão caiu. 📶 Confira sua internet e tente de novo.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Assistente IA"
        description="Converse com a FinIA sobre finanças, com respostas baseadas nos seus dados cadastrados."
      />

      <div
        role="status"
        className="flex items-start gap-2.5 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-700 dark:text-amber-300"
      >
        <TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
        <p>
          <span className="font-medium">Atenção:</span> o Assistente IA ainda
          está em desenvolvimento e pode fornecer informações inconsistentes ou
          imprecisas. Estamos evoluindo a ferramenta — se algo parecer errado,{" "}
          <a
            href={SUPPORT_WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold underline underline-offset-2 hover:text-amber-900 dark:hover:text-amber-200"
          >
            fale com o suporte
          </a>
          .
        </p>
      </div>

      {/* Explicador sempre visível (mobile + desktop): uso e limites do modelo gratuito. */}
      <details className="group rounded-xl border border-white/[0.08] bg-white/[0.02] px-4 py-3 text-sm">
        <summary className="flex cursor-pointer list-none items-center gap-2 font-medium text-foreground [&::-webkit-details-marker]:hidden">
          <Info className="size-4 shrink-0 text-brand" aria-hidden />
          Como a FinIA funciona (e por que às vezes fica indisponível)
          <span className="ml-auto text-xs text-muted-foreground transition-transform group-open:rotate-180">
            ▾
          </span>
        </summary>
        <div className="mt-3 space-y-2.5 leading-relaxed text-muted-foreground">
          <p>
            As respostas são geradas com base nos{" "}
            <strong className="font-medium text-foreground">seus dados cadastrados</strong>{" "}
            (receitas, despesas, metas, parcelas...). Quanto mais completo o seu
            cadastro, mais precisas ficam as respostas.
          </p>
          <p>
            A FinIA usa um{" "}
            <strong className="font-medium text-foreground">modelo de IA gratuito</strong>,
            com um limite diário de uso{" "}
            <strong className="font-medium text-foreground">
              compartilhado entre todos os usuários
            </strong>
            . Em dias de uso intenso esse limite pode se esgotar e o assistente
            fica indisponível por um tempo — quando isso acontecer, é só tentar
            novamente mais tarde.
          </p>
          <p>
            Ela responde apenas sobre{" "}
            <strong className="font-medium text-foreground">finanças e o uso do sistema</strong>.
            Nunca peça nem compartilhe senhas, PIX ou dados de cartão.
          </p>
          <p className="pt-1">
            Encontrou algo errado ou tem dúvidas?{" "}
            <a
              href={SUPPORT_WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-medium text-brand hover:underline"
            >
              <MessageCircle className="size-3.5" aria-hidden />
              Falar com o suporte
            </a>
          </p>
        </div>
      </details>

      <div className="grid gap-4 lg:grid-cols-[1fr_280px] lg:items-start">
        <PremiumCard className="flex flex-col overflow-hidden ai-assistant-glow border-brand/15">
          <div
            ref={scrollRef}
            className="h-[55vh] space-y-4 overflow-y-auto p-4 sm:p-6"
          >
            {messages.length === 0 ? (
              <EmptyState
                title="Nenhuma conversa ainda"
                description="Faça uma pergunta ou escolha uma sugestão ao lado."
                className="my-8"
              />
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={cn(
                    "flex gap-3",
                    msg.role === "user" ? "justify-end" : "justify-start",
                  )}
                >
                  {msg.role === "assistant" && (
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-brand/15 text-brand">
                      <Bot className="size-4" />
                    </div>
                  )}
                  <div
                    className={cn(
                      "max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
                      msg.role === "user"
                        ? "bg-brand/15 text-foreground"
                        : "border border-white/[0.06] bg-white/[0.03]",
                    )}
                  >
                    {msg.highlight ? (
                      <p className="mb-2 text-2xl font-bold text-brand">
                        {msg.highlight}
                      </p>
                    ) : null}
                    {msg.role === "assistant" && msg.content === "" ? (
                      <span className="flex items-center gap-2 text-muted-foreground">
                        <Loader2 className="size-4 animate-spin" aria-hidden />
                        Pensando...
                      </span>
                    ) : (
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          <form
            className="border-t border-white/[0.06] p-4 sm:p-5"
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage();
            }}
          >
            <div className="flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={isLoading}
                placeholder="Pergunte sobre suas finanças..."
                className="h-12 flex-1 rounded-xl border border-white/[0.08] bg-background/70 px-4 text-sm outline-none focus:border-brand/40 focus:ring-2 focus:ring-brand/15 disabled:opacity-60"
              />
              <Button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="size-12 shrink-0 rounded-xl btn-brand"
              >
                {isLoading ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Send className="size-4" />
                )}
              </Button>
            </div>
          </form>
        </PremiumCard>

        <div className="hidden space-y-4 lg:block">
          <PremiumCard>
            <div className="flex flex-col items-center p-5">
              <FiniaMascot className="size-24" />
              <p className="mt-3 flex items-center gap-1 text-sm font-semibold">
                FinIA <Sparkles className="size-3.5 text-brand" />
              </p>
              <p className="mt-1 text-center text-xs text-muted-foreground">
                Respostas com base nos seus dados
              </p>
            </div>
          </PremiumCard>

          <PremiumCard>
            <div className="p-4">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Sugestões
              </p>
              <div className="space-y-2">
                {IA_SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => sendMessage(s)}
                    disabled={isLoading}
                    className="w-full rounded-xl border border-border bg-muted px-3 py-2.5 text-left text-xs text-muted-foreground transition-colors hover:border-brand/40 hover:bg-brand/10 hover:text-foreground disabled:opacity-50 dark:border-white/15 dark:bg-white/[0.07]"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </PremiumCard>
        </div>
      </div>
    </div>
  );
}
