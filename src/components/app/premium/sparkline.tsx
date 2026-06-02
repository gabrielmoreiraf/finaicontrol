import { cn } from "@/lib/utils";

type SparklineProps = {
  data: number[];
  trend?: "up" | "down" | "neutral";
  className?: string;
};

export function Sparkline({ data, trend = "neutral", className }: SparklineProps) {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const width = 72;
  const height = 28;
  const padding = 2;

  const points = data
    .map((value, index) => {
      const x = padding + (index / (data.length - 1)) * (width - padding * 2);
      const y = height - padding - ((value - min) / range) * (height - padding * 2);
      return `${x},${y}`;
    })
    .join(" ");

  const strokeClass =
    trend === "up"
      ? "stroke-brand"
      : trend === "down"
        ? "stroke-emerald-400"
        : "stroke-muted-foreground/50";

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className={cn("h-7 w-[4.5rem] shrink-0", className)}
      aria-hidden
    >
      <polyline
        fill="none"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
        className={cn(strokeClass, "drop-shadow-[0_0_6px_rgba(0,230,118,0.35)]")}
      />
    </svg>
  );
}
