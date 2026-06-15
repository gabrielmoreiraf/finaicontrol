import { PageHeader } from "@/components/app/premium/page-header";
import { StatCard } from "@/components/app/premium/data-table";
import { EMPTY_DISPLAY } from "@/lib/empty-display";
import { brl } from "@/lib/finance/format";
import type { GoalSummary } from "@/lib/finance/summary";

export function MetasView({
  summary,
  monthlyNet,
}: {
  summary: GoalSummary;
  monthlyNet: number;
}) {
  const { activeCount, completedCount, totalCurrent, totalTarget, totalContribution } = summary;
  const percent = totalTarget > 0 ? Math.min(100, Math.round((totalCurrent / totalTarget) * 100)) : 0;
  // Quanto ainda falta guardar para bater todas as metas (alvo - guardado).
  const remaining = Math.max(0, totalTarget - totalCurrent);
  // Sobra do mês menos o que você reservou para as metas = sobra livre.
  const freeAfter = monthlyNet - totalContribution;

  return (
    <div className="space-y-4">
      <PageHeader
        title="Metas"
        description="Acompanhe seus objetivos financeiros e o progresso acumulado."
      />

      <div className="grid grid-cols-2 gap-3 lg:[grid-template-columns:repeat(auto-fit,minmax(11rem,1fr))]">
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
        <StatCard
          label="Guardado"
          value={brl(totalCurrent)}
          change={totalTarget > 0 ? `${percent}% do total das metas` : EMPTY_DISPLAY}
          trend={percent > 0 ? "up" : "neutral"}
        />
        <StatCard
          label="Total das metas"
          value={brl(totalTarget)}
          change={totalTarget > 0 ? `Falta ${brl(remaining)}` : EMPTY_DISPLAY}
          trend={totalTarget > 0 && remaining > 0 ? "negative" : totalTarget > 0 ? "up" : "neutral"}
        />
        <StatCard
          label="Livre após metas"
          value={brl(freeAfter)}
          change={
            totalContribution > 0
              ? `${brl(monthlyNet)} − ${brl(totalContribution)} reservado`
              : "reserve um valor/mês nas metas"
          }
          trend={freeAfter > 0 ? "up" : freeAfter < 0 ? "negative" : "neutral"}
        />
      </div>
    </div>
  );
}
