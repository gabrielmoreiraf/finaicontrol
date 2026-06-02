import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  change,
  trend = "neutral",
  className,
}: {
  label: string;
  value: string;
  change?: string;
  trend?: "up" | "down" | "neutral";
  className?: string;
}) {
  return (
    <div className={cn("rounded-2xl border border-border bg-card p-4 shadow-sm dark:border-white/[0.06] dark:bg-card/80 sm:p-5", className)}>
      <p className="text-xs font-medium text-muted-foreground sm:text-sm">{label}</p>
      <p className="mt-1 text-xl font-bold tracking-tight sm:text-2xl">{value}</p>
      {change && (
        <p
          className={cn(
            "mt-1.5 text-xs font-medium",
            trend === "up" && "text-brand",
            trend === "down" && "text-emerald-600 dark:text-emerald-400",
            trend === "neutral" && "text-muted-foreground",
          )}
        >
          {change}
        </p>
      )}
    </div>
  );
}

export function DataTable({
  columns,
  rows,
  onRowClick,
}: {
  columns: { key: string; label: string; align?: "left" | "right" }[];
  rows: Record<string, React.ReactNode>[];
  onRowClick?: (index: number) => void;
}) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-border bg-card shadow-sm dark:border-white/[0.06]">
      <table className="w-full min-w-[640px] text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/50 dark:border-white/[0.06] dark:bg-white/[0.02]">
            {columns.map((col) => (
              <th
                key={col.key}
                className={cn(
                  "px-4 py-3 text-xs font-semibold uppercase tracking-wide text-foreground/65 dark:text-muted-foreground",
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
                    "px-4 py-3.5",
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
