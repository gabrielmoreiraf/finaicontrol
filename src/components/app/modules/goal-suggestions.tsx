"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Sparkles } from "lucide-react";
import { createGoal } from "@/lib/actions/goals";
import { brl } from "@/lib/finance/format";
import { notify } from "@/lib/toast";

export type GoalSuggestion = {
  name: string;
  target: number;
  contribution: number;
  hint: string;
};

/** Sugestões de metas (1 clique cria), calculadas a partir das despesas do usuário. */
export function GoalSuggestions({ suggestions }: { suggestions: GoalSuggestion[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function create(s: GoalSuggestion) {
    const formData = new FormData();
    formData.set("name", s.name);
    formData.set("targetAmount", String(s.target));
    formData.set("currentAmount", "0");
    formData.set("monthlyContribution", String(s.contribution));
    startTransition(async () => {
      const result = await createGoal(formData);
      if (result.ok) {
        notify.success(result.message ?? "Meta criada.");
        router.refresh();
      } else {
        notify.error(result.error);
      }
    });
  }

  return (
    <div className="rounded-2xl border border-border bg-card/60 p-4 dark:border-white/[0.06]">
      <p className="mb-2.5 flex items-center gap-1.5 text-sm font-medium">
        <Sparkles className="size-4 text-brand" aria-hidden />
        Sugestões de metas
      </p>
      <div className="flex flex-wrap gap-2">
        {suggestions.map((s) => (
          <button
            key={s.name}
            type="button"
            onClick={() => create(s)}
            disabled={isPending}
            title={s.hint}
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-muted px-3 py-2 text-left text-sm transition-colors hover:border-brand/40 hover:bg-brand/10 disabled:opacity-50 dark:border-white/15 dark:bg-white/[0.05]"
          >
            <Plus className="size-4 shrink-0 text-brand" aria-hidden />
            <span>
              <span className="font-medium">{s.name}</span>
              <span className="ml-1.5 text-muted-foreground">{brl(s.target)}</span>
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
