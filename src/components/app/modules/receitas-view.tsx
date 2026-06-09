import { PageHeader } from "@/components/app/premium/page-header";
import { StatCard } from "@/components/app/premium/data-table";
import { EMPTY_DISPLAY } from "@/lib/empty-display";
import { brl } from "@/lib/finance/format";
import type { IncomeSummary } from "@/lib/finance/summary";

type ReceitasViewProps = {
  summary: IncomeSummary;
  fixedIncome: number;
};

export function ReceitasView({ summary, fixedIncome }: ReceitasViewProps) {
  const { total, byType } = summary;

  const stats = [
    {
      label: "Total do mês",
      value: brl(total),
      change: total > 0 ? "com renda fixa do perfil" : "cadastre receitas",
      trend: total > 0 ? ("up" as const) : ("neutral" as const),
    },
    {
      label: "Fixas",
      value: brl(fixedIncome + byType.fixed.total),
      change: fixedIncome > 0 ? "inclui perfil" : EMPTY_DISPLAY,
      trend: "neutral" as const,
    },
    {
      label: "Variáveis",
      value: brl(byType.variable.total),
      change: EMPTY_DISPLAY,
      trend: "neutral" as const,
    },
    {
      label: "Temporárias",
      value: brl(byType.temporary.total),
      change: `${byType.temporary.count} fonte(s)`,
      trend: "neutral" as const,
    },
  ];

  return (
    <div className="space-y-6 sm:space-y-8">
      <PageHeader
        title="Receitas"
        description="Rendas fixas, variáveis, extras e temporárias, tudo em um só lugar."
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>
    </div>
  );
}
