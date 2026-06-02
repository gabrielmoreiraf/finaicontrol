"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Bot, Send, Sparkles } from "lucide-react";
import { FiniaMascot } from "@/components/app/premium/finia-mascot";
import { EmptyState } from "@/components/app/premium/empty-state";
import { PageHeader } from "@/components/app/premium/page-header";
import { PremiumCard } from "@/components/app/premium/premium-card";
import { Button } from "@/components/ui/button";
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

  function sendMessage(text?: string) {
    const content = (text ?? input).trim();
    if (!content) return;

    setMessages((prev) => [
      ...prev,
      { id: String(Date.now()), role: "user", content },
      {
        id: String(Date.now() + 1),
        role: "assistant",
        content:
          "A IA usará seus dados cadastrados para responder. Cadastre receitas, despesas, dívidas e metas para respostas personalizadas.",
      },
    ]);
    setInput("");
  }

  return (
    <div className="flex h-[calc(100dvh-12rem)] min-h-[32rem] flex-col gap-4 lg:h-[calc(100dvh-8rem)]">
      <PageHeader
        title="Assistente IA"
        description="Converse com a FinIA sobre finanças, com respostas baseadas nos seus dados cadastrados."
      />

      <div className="grid min-h-0 flex-1 gap-4 lg:grid-cols-[1fr_280px]">
        <PremiumCard className="flex min-h-0 flex-col overflow-hidden ai-assistant-glow border-brand/15">
          <div className="flex-1 space-y-4 overflow-y-auto p-4 sm:p-6">
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
                  className={cn("flex gap-3", msg.role === "user" ? "justify-end" : "justify-start")}
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
                      <p className="mb-2 text-2xl font-bold text-brand">{msg.highlight}</p>
                    ) : null}
                    <p>{msg.content}</p>
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
                placeholder="Pergunte sobre suas finanças..."
                className="h-12 flex-1 rounded-xl border border-white/[0.08] bg-background/70 px-4 text-sm outline-none focus:border-brand/40 focus:ring-2 focus:ring-brand/15"
              />
              <Button type="submit" className="size-12 shrink-0 rounded-xl btn-brand">
                <Send className="size-4" />
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
                    className="w-full rounded-xl border border-border bg-muted px-3 py-2.5 text-left text-xs text-muted-foreground transition-colors hover:border-brand/40 hover:bg-brand/10 hover:text-foreground dark:border-white/15 dark:bg-white/[0.07]"
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
