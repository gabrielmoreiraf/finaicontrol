import { Clock, Receipt } from "lucide-react";
import { Amount } from "@/components/app/balance-visibility";
import { EmptyState } from "@/components/app/premium/empty-state";
import { PremiumCard } from "@/components/app/premium/premium-card";
import type { DashboardUpcomingBill } from "@/lib/dashboard/types";
import { cn } from "@/lib/utils";

const urgencyStyles = {
  critical: "border-red-200 bg-red-50 text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400",
  high: "border-red-200 bg-red-50 text-red-700 dark:border-red-500/25 dark:bg-red-500/10 dark:text-red-400",
  medium: "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-500/25 dark:bg-amber-500/10 dark:text-amber-400",
  low: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/25 dark:bg-emerald-500/10 dark:text-emerald-400",
} as const;

function getUrgency(daysUntil: number): keyof typeof urgencyStyles {
  if (daysUntil <= 3) return "critical";
  if (daysUntil <= 6) return "high";
  if (daysUntil <= 11) return "medium";
  return "low";
}

export function UpcomingBillsCard({ items }: { items: DashboardUpcomingBill[] }) {
  return (
    <PremiumCard className="h-full">
      <div className="p-5 sm:p-6">
        <div className="mb-5 flex items-center gap-2">
          <Receipt className="size-5 text-brand" aria-hidden />
          <h2 className="text-base font-semibold sm:text-lg">Próximos pagamentos</h2>
        </div>

        {items.length === 0 ? (
          <EmptyState
            title="Nenhum pagamento previsto"
            description="Cadastre despesas com dia de vencimento em Despesas para acompanhar aqui."
          />
        ) : (
          <ul className="finia-scroll max-h-[19rem] space-y-3 overflow-y-auto pr-1">
          {items.map((item) => {
            const urgency = getUrgency(item.daysUntil);
            return (
              <li
                key={item.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-border/60 bg-muted/30 p-3.5 transition-colors hover:border-border hover:bg-muted/50 dark:border-white/[0.04] dark:bg-white/[0.02] dark:hover:border-white/[0.08] dark:hover:bg-white/[0.04]"
              >
                <div className="min-w-0">
                  <p className="font-medium">{item.label}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{item.date}</p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1.5">
                  <p className="text-sm font-semibold sm:text-base">
                    <Amount>{item.amount}</Amount>
                  </p>
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[0.625rem] font-semibold uppercase tracking-wide",
                      urgencyStyles[urgency],
                    )}
                  >
                    <Clock className="size-3" aria-hidden />
                    {item.daysUntil} dias
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
        )}
      </div>
    </PremiumCard>
  );
}
