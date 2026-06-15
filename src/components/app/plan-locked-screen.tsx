import { Crown, Lock } from "lucide-react";
import { OpenPlansButton } from "@/components/app/plans-modal";
import { FEATURE_LABELS, getRequiredPlanLabel, type PlanFeature } from "@/lib/plans/features";
import type { SubscriptionPlan } from "@/types/finance";
import { cn } from "@/lib/utils";

/**
 * Tela de upgrade renderizada no SERVIDOR quando o usuário não tem acesso ao
 * recurso. Ao contrário do `PlanGate` (que borra o conteúdo no cliente, deixando
 * o HTML real acessível via DevTools), aqui o conteúdo protegido NUNCA é
 * renderizado nem enviado ao cliente.
 */
export function PlanLockedScreen({
  feature,
  planId,
  fullPage = true,
  className,
}: {
  feature: PlanFeature;
  planId: SubscriptionPlan;
  fullPage?: boolean;
  className?: string;
}) {
  const requiredPlan = getRequiredPlanLabel(feature);
  const featureLabel = FEATURE_LABELS[feature];

  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-2xl border border-border bg-card/60 p-4 dark:border-white/10",
        fullPage ? "min-h-[min(70vh,40rem)]" : "min-h-[12rem]",
        className,
      )}
    >
      <div className="w-full max-w-sm rounded-xl border border-border bg-card p-5 text-center shadow-xl dark:border-white/10 dark:bg-card/95 sm:p-6">
        <div className="mx-auto flex size-11 items-center justify-center rounded-xl border border-amber-200 bg-amber-50 dark:border-amber-500/25 dark:bg-amber-500/10">
          <Lock className="size-5 text-amber-700 dark:text-amber-400" aria-hidden />
        </div>
        <h3 className="mt-3 text-base font-bold tracking-tight sm:text-lg">Plano {requiredPlan}</h3>
        <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground sm:text-sm">
          <span className="font-medium text-foreground">{featureLabel}</span> não está incluído no
          seu plano atual. Faça upgrade para desbloquear.
        </p>
        <OpenPlansButton currentPlanId={planId} size="sm" className="btn-brand mt-4 w-full rounded-xl">
          <Crown className="size-4" aria-hidden />
          Fazer upgrade
        </OpenPlansButton>
      </div>
    </div>
  );
}
