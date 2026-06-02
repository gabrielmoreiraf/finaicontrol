import type { CSSProperties } from "react";

export const chartTooltipStyle: CSSProperties = {
  borderRadius: "8px",
  border: "1px solid var(--border)",
  backgroundColor: "var(--card)",
  color: "var(--foreground)",
  fontSize: "12px",
  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
};

export const chartAxisTick = {
  fontSize: 12,
  fill: "var(--muted-foreground)",
};

export const chartAxisTickSmall = {
  fontSize: 11,
  fill: "var(--muted-foreground)",
};

export const brandChartColor = "#10b981";
