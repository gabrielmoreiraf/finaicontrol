"use client";

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Lightbulb, LineChart as LineChartIcon } from "lucide-react";
import { PremiumCard } from "@/components/app/premium/premium-card";
import type { DashboardProjectionPoint } from "@/lib/dashboard/types";
import { chartAxisTick, chartAxisTickSmall, chartTooltipStyle } from "@/lib/chart-styles";

const brl = (value: number) =>
  value.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });

const INSIGHTS_EMPTY = [
  "Cadastre receitas e despesas para gerar projeções e insights personalizados.",
];

export function ProjectionChart({
  data,
  insights,
}: {
  data: DashboardProjectionPoint[];
  insights?: string[];
}) {
  const insightList = insights && insights.length > 0 ? insights : INSIGHTS_EMPTY;
  const hasData = data.some((point) => point.receitas > 0 || point.despesas > 0);
  return (
    <div className="grid gap-4 xl:grid-cols-[1fr_280px]">
      <PremiumCard className="h-full">
        <div className="p-5 sm:p-6">
          <div className="mb-1 flex items-center gap-2">
            <LineChartIcon className="size-5 text-brand" aria-hidden />
            <h2 className="text-base font-semibold sm:text-lg">Projeção financeira</h2>
          </div>
          <p className="mb-5 text-xs text-muted-foreground sm:text-sm">
            Receitas, despesas e saldo projetado nos próximos meses.
          </p>

          <div className="h-[16rem] w-full sm:h-[20rem]">
            {hasData ? (
              <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                <XAxis dataKey="month" tick={chartAxisTick} axisLine={false} tickLine={false} />
                <YAxis
                  tick={chartAxisTickSmall}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `${(Number(v) / 1000).toFixed(1)}k`}
                />
                <Tooltip
                  formatter={(value, name) => [brl(Number(value ?? 0)), String(name)]}
                  contentStyle={chartTooltipStyle}
                />
                <Legend wrapperStyle={{ paddingTop: 16 }} />
                <Line
                  type="monotone"
                  dataKey="receitas"
                  name="Receitas"
                  stroke="#00e676"
                  strokeWidth={2.5}
                  dot={false}
                  activeDot={{ r: 5, fill: "#00e676" }}
                />
                <Line
                  type="monotone"
                  dataKey="despesas"
                  name="Despesas"
                  stroke="#f97316"
                  strokeWidth={2.5}
                  dot={false}
                  activeDot={{ r: 5, fill: "#f97316" }}
                />
                <Line
                  type="monotone"
                  dataKey="saldo"
                  name="Saldo projetado"
                  stroke="#8b5cf6"
                  strokeWidth={2.5}
                  strokeDasharray="6 4"
                  dot={false}
                  activeDot={{ r: 5, fill: "#8b5cf6" }}
                />
              </LineChart>
            </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                Sem dados para projetar. Cadastre receitas e despesas.
              </div>
            )}
          </div>
        </div>
      </PremiumCard>

      <PremiumCard className="h-full">
        <div className="p-5 sm:p-6">
          <div className="mb-4 flex items-center gap-2">
            <Lightbulb className="size-5 text-brand" aria-hidden />
            <h3 className="text-base font-semibold">Insights da projeção</h3>
          </div>
          <ul className="space-y-3">
            {insightList.map((insight, index) => (
              <li
                key={index}
                className="rounded-xl border border-border/60 bg-muted/30 p-3.5 text-sm leading-relaxed text-muted-foreground dark:border-white/[0.04] dark:bg-white/[0.02]"
              >
                {insight}
              </li>
            ))}
          </ul>
        </div>
      </PremiumCard>
    </div>
  );
}
