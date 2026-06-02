"use client";

import { useActionState, useEffect } from "react";
import dynamic from "next/dynamic";
import { Check, Lock, Sparkles } from "lucide-react";
import { selectPlanAction, type PlanSelectionState } from "@/lib/actions/plan";
import { pricingPlans, type PlanId, type PricingPlan } from "@/lib/landing-data";
import { notify } from "@/lib/toast";
import { cn } from "@/lib/utils";

const ElectricBorder = dynamic(
  () => import("@/components/react-bits/electric-border"),
  { ssr: false },
);

const initialState: PlanSelectionState = {};

const orderedPlans: PricingPlan[] = [
  pricingPlans[0],
  pricingPlans[2],
  pricingPlans[1],
];

function PlanCardContent({ plan, pending }: { plan: PricingPlan; pending: boolean }) {
  const isAvailable = plan.id === "free";

  return (
    <div className="relative flex h-full flex-col p-5 sm:p-6">
      {!isAvailable && (
        <div className="absolute inset-x-0 top-0 z-10 flex justify-center pt-4">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-neutral-950 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-white/70">
            <Lock style={{ width: "0.85em", height: "0.85em" }} aria-hidden />
            Em breve
          </span>
        </div>
      )}

      {plan.highlighted && (
        <div className="mb-3 flex justify-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-brand/40 bg-brand/15 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-brand">
            <Sparkles style={{ width: "0.85em", height: "0.85em" }} aria-hidden />
            Mais escolhido
          </span>
        </div>
      )}

      <h3 className="text-lg font-bold text-white">{plan.name}</h3>
      <div className="mt-2 flex items-baseline gap-1">
        <span className={cn("text-3xl font-bold", plan.highlighted && "text-brand")}>
          {plan.price}
        </span>
        {plan.period && <span className="text-sm text-white/50">{plan.period}</span>}
      </div>
      <p className="mt-2 text-sm text-white/60">{plan.description}</p>

      <ul className="mt-5 flex-1 space-y-2.5">
        {plan.features.map((feature) => (
          <li key={feature} className="flex items-start gap-2.5 text-sm text-white/80">
            <Check className="mt-0.5 shrink-0 text-brand" style={{ width: "1em", height: "1em" }} />
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      <div className="mt-6">
        {isAvailable ? (
          <button
            type="submit"
            name="planId"
            value={plan.id satisfies PlanId}
            disabled={pending}
            className="auth-submit-btn flex w-full items-center justify-center rounded-xl bg-brand font-semibold text-black transition-opacity hover:opacity-90 disabled:opacity-60"
            style={{ paddingTop: "0.85em", paddingBottom: "0.85em", fontSize: "0.95em" }}
          >
            {pending ? "Confirmando..." : "Continuar com este plano"}
          </button>
        ) : (
          <button
            type="button"
            disabled
            className="flex w-full cursor-not-allowed items-center justify-center rounded-xl border border-white/10 bg-neutral-900 font-semibold text-white/40"
            style={{ paddingTop: "0.85em", paddingBottom: "0.85em", fontSize: "0.95em" }}
          >
            Pagamento em breve
          </button>
        )}
      </div>
    </div>
  );
}

function PlanCard({ plan, pending }: { plan: PricingPlan; pending: boolean }) {
  const isAvailable = plan.id === "free";

  const cardInner = (
    <div
      className={cn(
        "h-full overflow-hidden rounded-[inherit] bg-neutral-950 shadow-lg",
        !plan.highlighted && "border border-white/10",
        !isAvailable && !plan.highlighted && "opacity-90",
      )}
    >
      <PlanCardContent plan={plan} pending={pending} />
    </div>
  );

  if (!plan.highlighted) {
    return <div className="h-full overflow-hidden rounded-[20px]">{cardInner}</div>;
  }

  return (
    <ElectricBorder
      color="#10b981"
      speed={1}
      chaos={0.12}
      borderRadius={20}
      className="h-full w-full lg:z-10"
      style={{ borderRadius: 20 }}
    >
      {cardInner}
    </ElectricBorder>
  );
}

export function PlanSelectionForm() {
  const [state, formAction, pending] = useActionState(selectPlanAction, initialState);

  useEffect(() => {
    if (state.error) notify.error(state.error);
  }, [state.error]);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <p className="text-center text-sm text-white/60">
        Por enquanto, apenas o plano Gratuito está disponível. Os planos pagos serão liberados
        assim que o gateway de pagamento estiver ativo.
      </p>

      <div className="grid gap-4 lg:grid-cols-3 lg:items-stretch">
        {orderedPlans.map((plan) => (
          <PlanCard key={plan.id} plan={plan} pending={pending} />
        ))}
      </div>

      {state.error && (
        <p
          className="rounded-lg border border-red-500/30 bg-red-500/10 text-red-300"
          style={{ fontSize: "0.9em", padding: "0.5em 0.75em" }}
        >
          {state.error}
        </p>
      )}
    </form>
  );
}
