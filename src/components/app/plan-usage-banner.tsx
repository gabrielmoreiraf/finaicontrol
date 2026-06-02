import Link from "next/link";
import { FREE_MONTHLY_ENTRY_LIMIT } from "@/lib/plans/features";
import { getMonthlyEntryCount } from "@/lib/plans/entry-limit";
import type { SubscriptionPlan } from "@/types/finance";
import { cn } from "@/lib/utils";

export async function PlanUsageBanner({
  userId,
  planId,
}: {
  userId: string;
  planId: SubscriptionPlan;
}) {
  if (planId !== "free") return null;

  const count = await getMonthlyEntryCount(userId);
  const remaining = Math.max(0, FREE_MONTHLY_ENTRY_LIMIT - count);
  const isNearLimit = remaining <= 10;

  return (
    <div
      className={cn(
        "rounded-xl border px-4 py-3 text-sm",
        isNearLimit
          ? "alert-surface alert-surface-text"
          : "border-border bg-muted/50 text-foreground/80 dark:border-white/10 dark:bg-white/[0.03] dark:text-muted-foreground",
      )}
    >
      <span className="font-medium text-foreground">Plano Gratuito:</span>{" "}
      {count}/{FREE_MONTHLY_ENTRY_LIMIT} lançamentos este mês
      {remaining === 0 ? (
        <>
          {" "}
          . Limite atingido.{" "}
          <Link href="/configuracoes" className="font-semibold text-brand hover:underline">
            Fazer upgrade
          </Link>
        </>
      ) : isNearLimit ? (
        <> Restam {remaining}.</>
      ) : null}
    </div>
  );
}
