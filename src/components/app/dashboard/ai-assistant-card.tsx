"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Send, Sparkles } from "lucide-react";
import { FiniaMascot } from "@/components/app/premium/finia-mascot";
import { PremiumCard } from "@/components/app/premium/premium-card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function AiAssistantCard({ suggestions }: { suggestions: string[] }) {
  const router = useRouter();
  const [question, setQuestion] = useState("");

  function askAi(prompt?: string) {
    const value = (prompt ?? question).trim();
    if (!value) return;
    router.push(`/ia?q=${encodeURIComponent(value)}`);
  }

  return (
    <PremiumCard glow className="ai-assistant-glow border-brand/20">
      <div className="grid gap-6 p-5 sm:p-7 lg:grid-cols-[1fr_11rem] lg:items-center xl:grid-cols-[1fr_13rem]">
        <div className="space-y-5">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold tracking-tight sm:text-2xl">Assistente FinIA</h2>
              <Sparkles className="size-4 text-brand animate-pulse" aria-hidden />
            </div>
            <p className="mt-1.5 text-sm text-muted-foreground sm:text-base">
              Pergunte qualquer coisa sobre sua vida financeira. Respostas baseadas nos seus dados.
            </p>
          </div>

          <form
            className="flex flex-col gap-3 sm:flex-row"
            onSubmit={(event) => {
              event.preventDefault();
              askAi();
            }}
          >
            <input
              type="text"
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              placeholder="Quanto posso gastar este fim de semana?"
              className="h-12 flex-1 rounded-xl border border-border bg-background px-4 text-sm outline-none transition-all placeholder:text-muted-foreground focus:border-brand/40 focus:ring-2 focus:ring-brand/15 dark:border-white/[0.08] dark:bg-background/70 sm:text-base"
            />
            <Button type="submit" className="h-12 shrink-0 gap-2 rounded-xl px-6 btn-brand">
              <Send className="size-4" aria-hidden />
              Perguntar à IA
            </Button>
          </form>

          <div className="flex flex-wrap gap-2">
            {suggestions.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => askAi(suggestion)}
                className={cn(
                  "rounded-full border border-border bg-muted/50 px-3.5 py-2 text-xs font-medium text-muted-foreground transition-all dark:border-white/[0.08] dark:bg-white/[0.03]",
                  "hover:border-brand/30 hover:bg-brand/10 hover:text-foreground sm:text-sm",
                )}
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>

        <div className="relative mx-auto aspect-square w-full max-w-[7rem] sm:max-w-[8rem] lg:hidden">
          <FiniaMascot className="size-full" />
        </div>

        <div className="relative mx-auto hidden aspect-square w-full max-w-[8rem] lg:block xl:max-w-[9.5rem]">
          <FiniaMascot className="size-full" />
        </div>
      </div>
    </PremiumCard>
  );
}
