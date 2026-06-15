import { Hourglass } from "lucide-react";
import { Amount } from "@/components/app/balance-visibility";
import { EmptyState } from "@/components/app/premium/empty-state";
import { PremiumCard } from "@/components/app/premium/premium-card";
import type { DashboardTemporaryIncome } from "@/lib/dashboard/types";

export function TemporaryIncomeCard({ items }: { items: DashboardTemporaryIncome[] }) {
  return (
    <PremiumCard glow className="border-brand/15">
      <div className="p-5 sm:p-6">
        <div className="mb-5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Hourglass className="size-5 text-brand" aria-hidden />
            <h2 className="text-base font-semibold sm:text-lg">Rendas temporárias</h2>
          </div>
          <span className="rounded-full border border-brand/20 bg-brand/10 px-2.5 py-1 text-[0.625rem] font-semibold uppercase tracking-wide text-brand">
            Diferencial FinIA
          </span>
        </div>

        {items.length === 0 ? (
          <EmptyState
            title="Nenhuma renda temporária"
            description="Cadastre receitas do tipo Temporária com data de término para acompanhar aqui."
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
          {items.map((item) => (
            <div
              key={item.id}
              className="rounded-xl border border-border/60 bg-gradient-to-br from-brand/5 to-transparent p-4 sm:p-5 dark:border-white/[0.06] dark:from-brand/[0.06]"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold">{item.label}</p>
                  <p className="mt-1 text-lg font-bold text-brand">
                    <Amount>{item.amount}</Amount>
                  </p>
                </div>
                <span className="rounded-lg bg-muted px-2 py-1 text-xs font-medium text-muted-foreground dark:bg-white/[0.04]">
                  Restam {item.monthsLeft} meses
                </span>
              </div>
              <p className="mt-3 text-xs text-muted-foreground">Termina em {item.endsAt}</p>
              <div className="mt-4">
                <div className="mb-1.5 flex justify-between text-[0.625rem] font-medium text-muted-foreground">
                  <span>Progresso</span>
                  <span>{item.progress}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted dark:bg-white/[0.06]">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-brand to-brand-dark transition-all duration-1000"
                    style={{ width: `${item.progress}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
        )}
      </div>
    </PremiumCard>
  );
}
