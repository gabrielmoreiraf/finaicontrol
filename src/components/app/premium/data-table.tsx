import { Amount } from "@/components/app/balance-visibility";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  change,
  trend = "neutral",
  progress,
  className,
}: {
  label: string;
  value: string;
  change?: string;
  trend?: "up" | "down" | "neutral" | "negative";
  /** 0–100: quando definido, mostra uma barra de progresso (verde) na base. */
  progress?: number;
  className?: string;
}) {
  const pct = typeof progress === "number" ? Math.min(100, Math.max(0, progress)) : null;
  return (
    <div className={cn("flex flex-col rounded-2xl border border-border bg-card p-4 shadow-sm dark:border-white/[0.06] dark:bg-card/80", className)}>
      <p className="text-xs font-medium text-muted-foreground sm:text-sm">{label}</p>
      <p className="mt-1 text-xl font-bold tracking-tight">
        {value.trimStart().startsWith("R$") ? <Amount>{value}</Amount> : value}
      </p>
      {change && (
        <p
          className={cn(
            "mt-1.5 text-xs font-medium",
            trend === "up" && "text-brand",
            trend === "down" && "text-emerald-600 dark:text-emerald-400",
            trend === "negative" && "text-amber-700 dark:text-amber-400",
            trend === "neutral" && "text-muted-foreground",
          )}
        >
          {change}
        </p>
      )}
      {pct !== null && (
        <div
          className="mt-auto pt-3"
          role="progressbar"
          aria-valuenow={Math.round(pct)}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted dark:bg-white/[0.08]">
            <div className="h-full rounded-full bg-brand transition-all" style={{ width: `${pct}%` }} />
          </div>
        </div>
      )}
    </div>
  );
}

export function DataTable({
  columns,
  rows,
  onRowClick,
  fillHeight = false,
}: {
  columns: { key: string; label: string; align?: "left" | "right" }[];
  rows: Record<string, React.ReactNode>[];
  onRowClick?: (index: number) => void;
  /** Ocupa a altura restante e rola por dentro, com cabeçalho fixo (sticky). */
  fillHeight?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-border bg-card shadow-sm dark:border-white/[0.06]",
        fillHeight
          ? "overflow-x-auto lg:min-h-0 lg:flex-1 lg:overflow-auto"
          : "overflow-x-auto",
      )}
    >
      <table className="w-full min-w-[680px] text-[0.9375rem]">
        <thead className={cn(fillHeight && "lg:sticky lg:top-0 lg:z-10")}>
          <tr className="border-b border-border bg-muted [&>th]:bg-muted dark:border-white/[0.06]">
            {columns.map((col) => (
              <th
                key={col.key}
                className={cn(
                  "px-5 py-4 text-xs font-semibold uppercase tracking-wide text-foreground/65 dark:text-muted-foreground",
                  col.align === "right" ? "text-right" : "text-left",
                )}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr
              key={index}
              onClick={onRowClick ? () => onRowClick(index) : undefined}
              className={cn(
                "border-b border-border/60 transition-colors last:border-0 hover:bg-muted/40 dark:border-white/[0.04] dark:hover:bg-white/[0.02]",
                onRowClick && "cursor-pointer",
              )}
            >
              {columns.map((col) => (
                <td
                  key={col.key}
                  className={cn(
                    "px-5 py-4",
                    col.align === "right" ? "text-right font-medium" : "text-left",
                  )}
                >
                  {row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
