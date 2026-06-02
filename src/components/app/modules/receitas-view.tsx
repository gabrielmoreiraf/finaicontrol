"use client";

import { useState } from "react";
import { EmptyState } from "@/components/app/premium/empty-state";
import { FilterTabs } from "@/components/app/premium/filter-tabs";
import { PageHeader } from "@/components/app/premium/page-header";
import { DataTable, StatCard } from "@/components/app/premium/data-table";
import { EMPTY_DISPLAY } from "@/lib/empty-display";
import { brl, INCOME_TYPE_LABELS } from "@/lib/finance/format";

export type ReceitaRow = {
  id: string;
  label: string;
  amount: number;
  type: string;
  dayOfMonth: number | null;
};

type ReceitasViewProps = {
  items: ReceitaRow[];
  fixedIncome: number;
};

export function ReceitasView({ items, fixedIncome }: ReceitasViewProps) {
  const [filter, setFilter] = useState("all");

  const total = fixedIncome + items.reduce((sum, item) => sum + item.amount, 0);
  const byType = (type: string) =>
    items.filter((item) => item.type === type).reduce((sum, item) => sum + item.amount, 0);

  const filterTabs = [
    { id: "all", label: "Todas", count: items.length },
    { id: "fixed", label: "Fixas", count: items.filter((i) => i.type === "fixed").length },
    { id: "variable", label: "Variáveis", count: items.filter((i) => i.type === "variable").length },
    { id: "extra", label: "Extras", count: items.filter((i) => i.type === "extra").length },
    { id: "temporary", label: "Temporárias", count: items.filter((i) => i.type === "temporary").length },
  ];

  const filtered =
    filter === "all" ? items : items.filter((item) => item.type === filter);

  const summary = [
    {
      label: "Total do mês",
      value: brl(total),
      change: total > 0 ? "com renda fixa do perfil" : "cadastre receitas",
      trend: total > 0 ? ("up" as const) : ("neutral" as const),
    },
    {
      label: "Fixas",
      value: brl(fixedIncome + byType("fixed")),
      change: fixedIncome > 0 ? "inclui perfil" : EMPTY_DISPLAY,
      trend: "neutral" as const,
    },
    {
      label: "Variáveis",
      value: brl(byType("variable")),
      change: EMPTY_DISPLAY,
      trend: "neutral" as const,
    },
    {
      label: "Temporárias",
      value: brl(byType("temporary")),
      change: `${items.filter((i) => i.type === "temporary").length} fonte(s)`,
      trend: "neutral" as const,
    },
  ];

  return (
    <div className="space-y-6 sm:space-y-8">
      <PageHeader
        title="Receitas"
        description="Rendas fixas, variáveis, extras e temporárias, tudo em um só lugar."
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {summary.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      <div className="space-y-4">
        <FilterTabs tabs={filterTabs} active={filter} onChange={setFilter} />
        {filtered.length === 0 ? (
          <EmptyState
            title="Nenhuma receita neste filtro"
            description="Use o formulário abaixo para cadastrar sua primeira receita."
          />
        ) : (
          <DataTable
            columns={[
              { key: "name", label: "Descrição" },
              { key: "type", label: "Tipo" },
              { key: "date", label: "Dia" },
              { key: "amount", label: "Valor", align: "right" },
            ]}
            rows={filtered.map((item) => ({
              name: item.label,
              type: (
                <span className="rounded-md bg-brand/10 px-2 py-0.5 text-xs font-medium text-brand">
                  {INCOME_TYPE_LABELS[item.type] ?? item.type}
                </span>
              ),
              date: item.dayOfMonth ?? EMPTY_DISPLAY,
              amount: brl(item.amount),
            }))}
          />
        )}
      </div>
    </div>
  );
}
