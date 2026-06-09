import { EmptyState } from "@/components/app/premium/empty-state";
import { PageHeader } from "@/components/app/premium/page-header";
import { StatCard } from "@/components/app/premium/data-table";
import { PremiumCard } from "@/components/app/premium/premium-card";
import { EMPTY_DISPLAY } from "@/lib/empty-display";
import { brl } from "@/lib/finance/format";
import type { ExpenseSummary } from "@/lib/finance/summary";

type DespesasViewProps = {
  summary: ExpenseSummary;
  debtPayments: number;
};

export function DespesasView({ summary, debtPayments }: DespesasViewProps) {
  const { byType, total: expenseTotal, categories, upcoming } = summary;
  const total = expenseTotal + debtPayments;

  return (
    <div className="space-y-6 sm:space-y-8">
      <PageHeader
        title="Despesas"
        description="Controle fixas, variáveis e parceladas com visão clara dos próximos vencimentos."
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total do mês"
          value={brl(total)}
          change={debtPayments > 0 ? "inclui parcelas de dívidas" : EMPTY_DISPLAY}
          trend={total > 0 ? "negative" : "neutral"}
        />
        <StatCard label="Fixas" value={brl(byType.fixed.total)} change={EMPTY_DISPLAY} trend="neutral" />
        <StatCard label="Variáveis" value={brl(byType.variable.total)} change={EMPTY_DISPLAY} trend="neutral" />
        <StatCard
          label="Parceladas"
          value={brl(byType.installment.total + debtPayments)}
          change={EMPTY_DISPLAY}
          trend="neutral"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <PremiumCard>
          <div className="p-5 sm:p-6">
            <h3 className="mb-4 font-semibold">Próximos vencimentos</h3>
            {upcoming.length === 0 ? (
              <EmptyState
                title="Nenhum vencimento previsto"
                description="Cadastre despesas fixas com dia do mês para ver os próximos vencimentos."
              />
            ) : (
              <ul className="space-y-3">
                {upcoming.map((item) => (
                  <li
                    key={item.id}
                    className="flex items-center justify-between rounded-xl border border-border/60 bg-muted/30 p-3.5 dark:border-white/[0.04] dark:bg-white/[0.02]"
                  >
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-xs text-muted-foreground">{item.date}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{brl(item.amount)}</p>
                      <p className="text-xs font-medium text-amber-800 dark:text-amber-400">{item.days} dias</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </PremiumCard>

        <PremiumCard>
          <div className="p-5 sm:p-6">
            <h3 className="mb-4 font-semibold">Por categoria</h3>
            {categories.length === 0 ? (
              <EmptyState title="Sem categorias" description="Cadastre despesas com categoria." />
            ) : (
              <ul className="space-y-4">
                {categories.map((cat) => (
                  <li key={cat.name}>
                    <div className="mb-1.5 flex justify-between text-sm">
                      <span>{cat.name}</span>
                      <span className="font-medium">{brl(cat.amount)}</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-muted dark:bg-white/[0.06]">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${cat.percent}%`, backgroundColor: cat.color }}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </PremiumCard>
      </div>
    </div>
  );
}
