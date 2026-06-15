import { PageHeader } from "@/components/app/premium/page-header";
import { StatCard } from "@/components/app/premium/data-table";
import { brl } from "@/lib/finance/format";
import type { IncomeSummary } from "@/lib/finance/summary";

type ReceitasViewProps = {
  summary: IncomeSummary;
  fixedIncome: number;
};

export function ReceitasView({ summary, fixedIncome }: ReceitasViewProps) {
  const { total, byType } = summary;
  const fixedTotal = fixedIncome + byType.fixed.total;
  const pct = (value: number) => (total > 0 ? Math.round((value / total) * 100) : 0);
  const share = (value: number) => (total > 0 ? `${pct(value)}% do total` : "—");

  const stats = [
    {
      label: "Total do mês",
      value: brl(total),
      change: total > 0 ? "com renda fixa do perfil" : "cadastre receitas",
      trend: total > 0 ? ("up" as const) : ("neutral" as const),
    },
    {
      label: "Fixas",
      value: brl(fixedTotal),
      change: share(fixedTotal),
      progress: pct(fixedTotal),
      trend: "neutral" as const,
    },
    {
      label: "Variáveis",
      value: brl(byType.variable.total),
      change: share(byType.variable.total),
      progress: pct(byType.variable.total),
      trend: "neutral" as const,
    },
    {
      label: "Temporárias",
      value: brl(byType.temporary.total),
      change: `${byType.temporary.count} fonte(s)`,
      progress: pct(byType.temporary.total),
      trend: "neutral" as const,
    },
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        title="Receitas"
        description="Rendas fixas, variáveis, extras e temporárias, tudo em um só lugar."
      />

      <div className="grid grid-cols-2 gap-3 lg:[grid-template-columns:repeat(auto-fit,minmax(11rem,1fr))]">
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>
    </div>
  );
}
