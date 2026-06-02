import { Bell, ChevronRight, Lightbulb, ShieldCheck, TriangleAlert } from "lucide-react";
import { PremiumCard } from "@/components/app/premium/premium-card";
import type { DashboardSmartAlert } from "@/lib/dashboard/types";
import { cn } from "@/lib/utils";

const toneStyles = {
  insight: {
    icon: Lightbulb,
    className:
      "border-brand/25 bg-brand/5 hover:border-brand/40 dark:border-brand/20 dark:bg-brand/[0.06] dark:hover:border-brand/35",
    iconClassName: "text-brand bg-brand/10",
  },
  warning: {
    icon: TriangleAlert,
    className:
      "border-amber-200 bg-amber-50 hover:border-amber-300 dark:border-amber-500/20 dark:bg-amber-500/[0.06] dark:hover:border-amber-500/35",
    iconClassName:
      "text-amber-700 bg-amber-100 dark:text-amber-400 dark:bg-amber-500/10",
  },
  success: {
    icon: ShieldCheck,
    className:
      "border-emerald-200 bg-emerald-50 hover:border-emerald-300 dark:border-emerald-500/20 dark:bg-emerald-500/[0.06] dark:hover:border-emerald-500/35",
    iconClassName:
      "text-emerald-700 bg-emerald-100 dark:text-emerald-400 dark:bg-emerald-500/10",
  },
} as const;

export function SmartAlerts({
  items,
  compact = false,
}: {
  items: DashboardSmartAlert[];
  compact?: boolean;
}) {
  return (
    <PremiumCard className="h-full">
      <div className={cn(compact ? "p-3 sm:p-3.5" : "p-5 sm:p-6")}>
        <div className={cn("flex items-center gap-2", compact ? "mb-2.5" : "mb-5")}>
          <Bell className={cn("text-brand", compact ? "size-4" : "size-5")} aria-hidden />
          <h2 className={cn("font-semibold", compact ? "text-sm" : "text-base sm:text-lg")}>
            Alertas inteligentes
          </h2>
        </div>

        <ul className={cn(compact ? "space-y-2" : "space-y-3")}>
          {items.map((item) => {
            const tone = toneStyles[item.tone];
            const Icon = tone.icon;
            return (
              <li key={item.id}>
                <button
                  type="button"
                  className={cn(
                    "group flex w-full items-center gap-3 rounded-xl border text-left transition-all",
                    compact ? "px-3 py-2.5" : "px-4 py-3.5",
                    tone.className,
                  )}
                >
                  <div
                    className={cn(
                      "flex shrink-0 items-center justify-center rounded-lg",
                      compact ? "size-7" : "size-9",
                      tone.iconClassName,
                    )}
                  >
                    <Icon className={cn(compact ? "size-3.5" : "size-4")} aria-hidden />
                  </div>
                  <p
                    className={cn(
                      "flex-1 leading-relaxed",
                      compact ? "text-xs leading-snug" : "text-sm",
                    )}
                  >
                    {item.message}
                  </p>
                  {!compact && (
                    <ChevronRight
                      className="size-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100"
                      aria-hidden
                    />
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </PremiumCard>
  );
}
