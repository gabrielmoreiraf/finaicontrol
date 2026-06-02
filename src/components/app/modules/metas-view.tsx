"use client";

import { Target } from "lucide-react";
import { EmptyState } from "@/components/app/premium/empty-state";
import { PageHeader } from "@/components/app/premium/page-header";
import { PremiumCard } from "@/components/app/premium/premium-card";
import { brl } from "@/lib/finance/format";

export type MetaRow = {
  id: string;
  name: string;
  current: number;
  target: number;
};

const COLORS = ["#00e676", "#8b5cf6", "#38bdf8", "#f97316"];

export function MetasView({ items }: { items: MetaRow[] }) {
  return (
    <div className="space-y-6 sm:space-y-8">
      <PageHeader
        title="Metas"
        description="Acompanhe seus objetivos financeiros com progresso visual."
      />

      {items.length === 0 ? (
        <EmptyState
          title="Nenhuma meta cadastrada"
          description="Defina objetivos financeiros usando o formulário abaixo."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {items.map((goal, index) => {
            const percent = goal.target > 0 ? Math.round((goal.current / goal.target) * 100) : 0;
            const color = COLORS[index % COLORS.length] ?? "#00e676";
            const circumference = 2 * Math.PI * 36;
            const offset = circumference - (percent / 100) * circumference;

            return (
              <PremiumCard key={goal.id} hover className="group">
                <div className="p-5 sm:p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <Target className="size-4 text-brand" />
                        <h3 className="font-semibold">{goal.name}</h3>
                      </div>
                    </div>
                    <div className="relative size-20 shrink-0">
                      <svg className="size-full -rotate-90" viewBox="0 0 88 88" aria-hidden>
                        <circle cx="44" cy="44" r="36" fill="none" stroke="currentColor" strokeWidth="8" className="text-white/[0.06]" />
                        <circle
                          cx="44"
                          cy="44"
                          r="36"
                          fill="none"
                          stroke={color}
                          strokeWidth="8"
                          strokeLinecap="round"
                          strokeDasharray={circumference}
                          strokeDashoffset={offset}
                          className="transition-all duration-1000"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center text-lg font-bold">
                        {percent}%
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 flex items-end justify-between gap-3">
                    <div>
                      <p className="text-xs text-muted-foreground">Atual</p>
                      <p className="text-xl font-bold">{brl(goal.current)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Meta</p>
                      <p className="text-sm font-semibold text-muted-foreground">{brl(goal.target)}</p>
                    </div>
                  </div>

                  <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/[0.06]">
                    <div
                      className="h-full rounded-full transition-all duration-1000"
                      style={{ width: `${percent}%`, backgroundColor: color }}
                    />
                  </div>
                </div>
              </PremiumCard>
            );
          })}
        </div>
      )}
    </div>
  );
}
