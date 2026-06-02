"use client";

import { useActionState, useEffect } from "react";
import { selectPlanAction, type PlanSelectionState } from "@/lib/actions/plan";
import { PlanCards } from "@/components/plans/plan-cards";
import { notify } from "@/lib/toast";
import type { PlanId } from "@/lib/landing-data";

const initialState: PlanSelectionState = {};

export function PlanSelectionForm() {
  const [state, formAction, pending] = useActionState(selectPlanAction, initialState);

  useEffect(() => {
    if (state.error) notify.error(state.error);
  }, [state.error]);

  return (
    <form action={formAction} className="flex flex-col gap-6">
      <p className="text-center text-sm text-white/60">
        Por enquanto, apenas o plano Gratuito está disponível. Os planos pagos serão liberados
        assim que o gateway de pagamento estiver ativo.
      </p>

      {/* Página de auth é sempre escura: força tokens dark no componente compartilhado. */}
      <div className="dark">
        <PlanCards
          renderCta={({ plan, isAvailable }) =>
            isAvailable ? (
              <button
                type="submit"
                name="planId"
                value={plan.id satisfies PlanId}
                disabled={pending}
                className="auth-submit-btn flex w-full items-center justify-center rounded-xl bg-brand py-3 text-sm font-semibold text-black transition-opacity hover:opacity-90 disabled:opacity-60"
              >
                {pending ? "Confirmando..." : "Continuar com este plano"}
              </button>
            ) : (
              <button
                type="button"
                disabled
                className="flex w-full cursor-not-allowed items-center justify-center rounded-xl border border-white/10 bg-neutral-900 py-3 text-sm font-semibold text-white/40"
              >
                Pagamento em breve
              </button>
            )
          }
        />
      </div>

      {state.error && (
        <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
          {state.error}
        </p>
      )}
    </form>
  );
}
