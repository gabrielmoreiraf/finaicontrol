import { PageHeader } from "@/components/app/premium/page-header";
import { StatCard } from "@/components/app/premium/data-table";
import { brl } from "@/lib/finance/format";
import type { ExpenseSummary } from "@/lib/finance/summary";

type DespesasViewProps = {
  summary: ExpenseSummary;
  debtPayments: number;
};

export function DespesasView({ summary, debtPayments }: DespesasViewProps) {
  const { byType, total: expenseTotal, totalCount } = summary;
  const total = expenseTotal + debtPayments;
  const parceladas = byType.installment.total + debtPayments;
  const pct = (value: number) => (total > 0 ? Math.round((value / total) * 100) : 0);
  const share = (value: number) => (total > 0 ? `${pct(value)}% do total` : "—");

  return (
    <div className="space-y-4">
      <PageHeader
        title="Despesas"
        description="Controle fixas, variáveis e parceladas com visão clara dos próximos vencimentos."
      />

      <div className="grid grid-cols-2 gap-3 lg:[grid-template-columns:repeat(auto-fit,minmax(11rem,1fr))]">
        <StatCard
          label="Total do mês"
          value={brl(total)}
          change={
            debtPayments > 0
              ? "inclui parcelas de dívidas"
              : `${totalCount} lançamento(s)`
          }
          trend={total > 0 ? "negative" : "neutral"}
        />
        <StatCard
          label="Fixas"
          value={brl(byType.fixed.total)}
          change={share(byType.fixed.total)}
          progress={pct(byType.fixed.total)}
          trend="neutral"
        />
        <StatCard
          label="Variáveis"
          value={brl(byType.variable.total)}
          change={share(byType.variable.total)}
          progress={pct(byType.variable.total)}
          trend="neutral"
        />
        <StatCard
          label="Parceladas"
          value={brl(parceladas)}
          change={share(parceladas)}
          progress={pct(parceladas)}
          trend="neutral"
        />
      </div>
    </div>
  );
}
