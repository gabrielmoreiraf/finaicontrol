import { ArrowDownRight, ArrowUpRight, Minus, Target, TrendingDown, TrendingUp, Wallet } from "lucide-react";
import { Amount } from "@/components/app/balance-visibility";
import { PremiumCard } from "@/components/app/premium/premium-card";
import type { DashboardHealthData, DashboardSummaryItem } from "@/lib/dashboard/types";
import { cn } from "@/lib/utils";

const iconMap = {
  income: TrendingUp,
  expense: TrendingDown,
  balance: Wallet,
  goals: Target,
} as const;

const HEALTH_TONE: Record<
  DashboardHealthData["tone"],
  { ring: string; text: string }
> = {
  good: { ring: "text-brand", text: "text-brand" },
  regular: {
    ring: "text-amber-500 dark:text-amber-400",
    text: "text-amber-600 dark:text-amber-400",
  },
  bad: {
    ring: "text-red-500 dark:text-red-400",
    text: "text-red-600 dark:text-red-400",
  },
  empty: { ring: "text-muted-foreground/50", text: "text-muted-foreground" },
};

export function SummaryCards({
  items,
  health,
}: {
  items: DashboardSummaryItem[];
  health: DashboardHealthData;
}) {
  const percentage = Math.round((health.score / health.maxScore) * 100);
  const circumference = 2 * Math.PI * 22;
  const offset = circumference - (percentage / 100) * circumference;
  const healthTone = HEALTH_TONE[health.tone];

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-5">
      {items.map((item) => {
        const Icon = iconMap[item.icon];
        return (
          <PremiumCard key={item.id} className="group">
            <div className="p-4 sm:p-5">
              <div className="flex items-start justify-between gap-2">
                <div className="flex size-9 items-center justify-center rounded-xl bg-brand/10 text-brand transition-colors group-hover:bg-brand/15">
                  <Icon className="size-4.5" aria-hidden />
                </div>
              </div>
              <p className="mt-3 text-xs font-medium text-muted-foreground sm:text-sm">{item.label}</p>
              <p className="mt-0.5 text-xl font-bold tracking-tight sm:text-2xl">
                {item.value.trimStart().startsWith("R$") ? (
                  <Amount>{item.value}</Amount>
                ) : (
                  item.value
                )}
              </p>
              <p
                className={cn(
                  "mt-1.5 flex items-center gap-1 text-[0.6875rem] font-medium sm:text-xs",
                  item.trend === "up" && "text-brand",
                  item.trend === "down" && item.icon === "expense" && "text-emerald-600 dark:text-emerald-400",
                  item.trend === "down" && item.icon !== "expense" && "text-red-600 dark:text-red-400",
                  item.trend === "neutral" && "text-muted-foreground",
                )}
              >
                <TrendIcon trend={item.trend} icon={item.icon} />
                {item.change}
              </p>
            </div>
          </PremiumCard>
        );
      })}

      <PremiumCard className="group col-span-2 lg:col-span-1">
        <div className="flex h-full flex-col items-center justify-center gap-3 p-4 text-center sm:gap-4 sm:p-5">
          <div className="relative size-20 shrink-0 sm:size-[5.5rem]">
            <svg className="size-full -rotate-90 health-ring-glow" viewBox="0 0 56 56" aria-hidden>
              <circle cx="28" cy="28" r="22" fill="none" stroke="currentColor" strokeWidth="5" className="text-border dark:text-white/[0.06]" />
              <circle
                cx="28"
                cy="28"
                r="22"
                fill="none"
                stroke="currentColor"
                strokeWidth="5"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                className={cn("transition-all duration-1000", healthTone.ring)}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xl font-bold leading-none sm:text-2xl">{health.score}</span>
              <span className="text-[0.625rem] text-muted-foreground sm:text-xs">/100</span>
            </div>
          </div>
          <div className="w-full min-w-0">
            <p className="text-xs font-medium text-muted-foreground sm:text-sm">Saúde Financeira</p>
            <p className={cn("mt-0.5 text-lg font-bold sm:text-xl", healthTone.text)}>{health.status}</p>
            <p className="mt-1 text-[0.6875rem] leading-snug text-muted-foreground sm:text-xs">
              {health.description}
            </p>
          </div>
        </div>
      </PremiumCard>
    </div>
  );
}

function TrendIcon({
  trend,
  icon,
}: {
  trend: DashboardSummaryItem["trend"];
  icon: DashboardSummaryItem["icon"];
}) {
  if (trend === "up") return <ArrowUpRight className="size-3 shrink-0" aria-hidden />;
  if (trend === "down" && icon === "expense")
    return <ArrowDownRight className="size-3 shrink-0 text-emerald-600 dark:text-emerald-400" aria-hidden />;
  if (trend === "down") return <ArrowDownRight className="size-3 shrink-0" aria-hidden />;
  return <Minus className="size-3 shrink-0" aria-hidden />;
}
