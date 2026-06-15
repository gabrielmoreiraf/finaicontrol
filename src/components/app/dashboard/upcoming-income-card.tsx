import { Building2, CalendarDays } from "lucide-react";
import { Amount } from "@/components/app/balance-visibility";
import { EmptyState } from "@/components/app/premium/empty-state";
import { PremiumCard } from "@/components/app/premium/premium-card";
import type { DashboardUpcomingIncome } from "@/lib/dashboard/types";

export function UpcomingIncomeCard({ items }: { items: DashboardUpcomingIncome[] }) {
  return (
    <PremiumCard className="h-full">
      <div className="p-5 sm:p-6">
        <div className="mb-5 flex items-center gap-2">
          <CalendarDays className="size-5 text-brand" aria-hidden />
          <h2 className="text-base font-semibold sm:text-lg">Próximos recebimentos</h2>
        </div>

        {items.length === 0 ? (
          <EmptyState
            title="Nenhum recebimento previsto"
            description="Cadastre receitas com dia do mês em Receitas para ver a timeline aqui."
          />
        ) : (
          <ul className="finia-scroll max-h-[19rem] space-y-0 overflow-y-auto pr-1">
          {items.map((item, index) => (
            <li key={item.id} className="relative flex gap-4 pb-5 last:pb-0">
              {index < items.length - 1 && (
                <span
                  className="absolute left-[0.6875rem] top-7 h-[calc(100%-0.75rem)] w-px bg-gradient-to-b from-brand/40 to-transparent"
                  aria-hidden
                />
              )}
              <span className="relative z-10 mt-2 size-3.5 shrink-0 rounded-full border-2 border-brand bg-background shadow-[0_0_8px_rgba(0,230,118,0.4)]" />
              <div className="flex min-w-0 flex-1 items-start justify-between gap-3 rounded-xl p-2 transition-colors hover:bg-muted/40 dark:hover:bg-white/[0.02]">
                <div className="min-w-0">
                  <p className="font-medium">{item.label}</p>
                  <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-muted-foreground">
                    {item.bank && (
                      <span className="inline-flex items-center gap-1">
                        <Building2 className="size-3" aria-hidden />
                        {item.bank}
                      </span>
                    )}
                    <span>{item.date}</span>
                  </div>
                </div>
                <p className="shrink-0 text-sm font-semibold text-brand sm:text-base">
                  <Amount>{item.amount}</Amount>
                </p>
              </div>
            </li>
          ))}
        </ul>
        )}
      </div>
    </PremiumCard>
  );
}
