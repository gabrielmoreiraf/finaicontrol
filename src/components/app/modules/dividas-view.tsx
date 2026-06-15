import { PageHeader } from "@/components/app/premium/page-header";
import { StatCard } from "@/components/app/premium/data-table";
import { brl } from "@/lib/finance/format";

export type DividasSummary = {
  total: number;
  monthly: number;
  count: number;
};

export function DividasView({ summary }: { summary: DividasSummary }) {
  return (
    <div className="space-y-6 sm:space-y-8">
      <PageHeader
        title="Dívidas"
        description="Painel com total devido, parcelas e priorização."
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard label="Total devido" value={brl(summary.total)} trend={summary.total > 0 ? "negative" : "neutral"} />
        <StatCard label="Pagamento mensal" value={brl(summary.monthly)} change="soma das parcelas" />
        <StatCard
          label="Dívidas ativas"
          value={String(summary.count)}
          change={summary.count === 0 ? "nenhuma" : "cadastradas"}
        />
      </div>
    </div>
  );
}
