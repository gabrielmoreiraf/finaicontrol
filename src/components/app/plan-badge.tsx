import { Crown, Sparkles, Zap } from "lucide-react";
import type { SubscriptionPlan } from "@/types/finance";
import { cn } from "@/lib/utils";

const PLAN_STYLES: Record<
  SubscriptionPlan,
  { container: string; icon: typeof Sparkles | typeof Zap | typeof Crown }
> = {
  free: {
    container:
      "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-brand/25 dark:bg-brand/10 dark:text-brand",
    icon: Zap,
  },
  plus: {
    container:
      "border-sky-200 bg-sky-50 text-sky-800 dark:border-brand/25 dark:bg-brand/10 dark:text-brand",
    icon: Zap,
  },
  premium: {
    container:
      "border-amber-200 bg-gradient-to-r from-amber-50 to-emerald-50 text-amber-900 dark:border-amber-500/35 dark:from-amber-500/20 dark:to-brand/15 dark:text-amber-200",
    icon: Crown,
  },
};

const SIZE_STYLES = {
  sm: {
    badge: "gap-1.5 rounded-md px-2 py-0.5 text-[0.6875rem]",
    icon: "size-3",
  },
  lg: {
    badge: "gap-2.5 rounded-full px-6 py-3 text-base sm:text-lg",
    icon: "size-5 sm:size-6",
  },
} as const;

export function PlanBadge({
  label,
  planId = "free",
  highlighted = false,
  size = "sm",
  className,
}: {
  label: string;
  planId?: SubscriptionPlan;
  highlighted?: boolean;
  size?: keyof typeof SIZE_STYLES;
  className?: string;
}) {
  const styles = PLAN_STYLES[planId];
  const sizeStyles = SIZE_STYLES[size];
  const Icon = highlighted && planId === "premium" ? Sparkles : styles.icon;

  return (
    <span
      className={cn(
        "inline-flex w-fit items-center font-semibold leading-tight tracking-wide",
        sizeStyles.badge,
        styles.container,
        size === "sm" && "self-start border",
        size === "lg" && "border-2",
        className,
      )}
    >
      <Icon className={cn(sizeStyles.icon, "shrink-0 opacity-90")} aria-hidden />
      Plano {label}
    </span>
  );
}
