import { PageHeader } from "@/components/app/premium/page-header";
import { StatCard } from "@/components/app/premium/data-table";
import { EMPTY_DISPLAY } from "@/lib/empty-display";
import { brl } from "@/lib/finance/format";
import type { GoalSummary } from "@/lib/finance/summary";

export function MetasView({ summary }: { summary: GoalSummary }) {
  const { activeCount, completedCount, totalCurrent, totalTarget } = summary;
  const percent = totalTarget > 0 ? Math.min(100, Math.round((totalCurrent / totalTarget) * 100)) : 0;

  return (
    <div className="space-y-6 sm:space-y-8">
      <PageHeader
        title="Metas"
        description="Acompanhe seus objetivos financeiros e o progresso acumulado."
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Metas ativas"
          value={String(activeCount)}
          change={
            completedCount > 0
              ? `${completedCount} concluída(s)`
              : activeCount > 0
                ? "objetivo(s) em andamento"
                : "cadastre uma meta"
          }
          trend={activeCount > 0 ? "up" : "neutral"}
        />
        <StatCard label="Guardado" value={brl(totalCurrent)} change={EMPTY_DISPLAY} trend="neutral" />
        <StatCard label="Total das metas" value={brl(totalTarget)} change={EMPTY_DISPLAY} trend="neutral" />
        <StatCard
          label="Progresso geral"
          value={`${percent}%`}
          change={EMPTY_DISPLAY}
          trend={percent > 0 ? "up" : "neutral"}
        />
      </div>
    </div>
  );
}
