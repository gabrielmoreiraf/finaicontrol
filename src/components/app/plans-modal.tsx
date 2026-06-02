"use client";

import { useActionState, useEffect, useState, type ReactNode } from "react";
import { CheckCircle2, Crown, Headphones, Lock, Shield, Target } from "lucide-react";
import { selectPlanAction, type PlanSelectionState } from "@/lib/actions/plan";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PlanCards } from "@/components/plans/plan-cards";
import type { PlanId } from "@/lib/landing-data";
import { notify } from "@/lib/toast";
import type { SubscriptionPlan } from "@/types/finance";
import { cn } from "@/lib/utils";

const initialState: PlanSelectionState = {};

const trustItems = [
  {
    icon: Shield,
    title: "Seus dados protegidos",
    description: "Segurança de nível bancário.",
  },
  {
    icon: Target,
    title: "Cancele quando quiser",
    description: "Sem burocracia e sem fidelidade.",
  },
  {
    icon: Headphones,
    title: "Suporte especializado",
    description: "Estamos aqui para te ajudar.",
  },
] as const;

type PlansModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentPlanId: SubscriptionPlan;
};

export function PlansModal({ open, onOpenChange, currentPlanId }: PlansModalProps) {
  const [state, formAction, pending] = useActionState(selectPlanAction, initialState);

  useEffect(() => {
    if (state.error) notify.error(state.error);
  }, [state.error]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        aria-describedby={undefined}
        className="max-w-[min(96vw,68rem)] gap-0 overflow-hidden border-white/10 bg-background/95 p-0 sm:p-0"
      >
        <DialogHeader className="border-b border-white/10 px-4 py-3 text-center sm:text-center">
          <div className="flex items-center justify-center gap-2.5">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-brand/30 bg-brand/10">
              <Crown className="size-4 text-brand" aria-hidden />
            </span>
            <DialogTitle className="text-lg font-bold tracking-tight">
              Planos FinIA
            </DialogTitle>
          </div>
        </DialogHeader>

        <form action={formAction} className="px-3 py-3 sm:px-4 sm:py-4">
          <PlanCards
            density="compact"
            currentPlanId={currentPlanId}
            renderCta={({ plan, isAvailable, isCurrent }) => {
              if (isCurrent) {
                return (
                  <div
                    className={cn(
                      "flex w-full items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-semibold sm:text-sm",
                      plan.highlighted
                        ? "btn-brand text-black"
                        : "border border-brand/40 bg-brand/15 text-brand",
                    )}
                    aria-current="true"
                  >
                    <CheckCircle2 className="size-3.5 shrink-0" aria-hidden />
                    Plano atual
                  </div>
                );
              }

              if (isAvailable) {
                return (
                  <button
                    type="submit"
                    name="planId"
                    value={plan.id satisfies PlanId}
                    disabled={pending}
                    className="btn-brand flex w-full items-center justify-center rounded-xl py-2 text-xs font-semibold text-black transition-opacity hover:opacity-90 disabled:opacity-60 sm:text-sm"
                  >
                    {pending ? "Confirmando..." : "Usar plano gratuito"}
                  </button>
                );
              }

              return (
                <button
                  type="button"
                  disabled
                  className="flex w-full cursor-not-allowed items-center justify-center rounded-xl border border-white/10 bg-neutral-900/90 py-2 text-xs font-semibold text-white/40 sm:text-sm"
                >
                  Pagamento em breve
                </button>
              );
            }}
          />

          <div className="mt-4 grid gap-3 border-t border-white/10 pt-3 sm:grid-cols-3 sm:gap-4">
            {trustItems.map(({ icon: Icon, title, description }) => (
              <div key={title} className="flex items-start gap-2 sm:gap-2.5">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-md border border-white/10 bg-muted/30">
                  <Icon className="size-3.5 text-muted-foreground" aria-hidden />
                </span>
                <div className="min-w-0 text-left">
                  <p className="text-[11px] font-semibold leading-tight sm:text-xs">{title}</p>
                  <p className="mt-0.5 text-[10px] leading-snug text-muted-foreground sm:text-[11px]">
                    {description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <p className="mt-3 flex items-center justify-center gap-1 text-[10px] text-muted-foreground sm:text-[11px]">
            <Lock className="size-2.5 shrink-0" aria-hidden />
            Pagamento 100% seguro e criptografado
          </p>
        </form>
      </DialogContent>
    </Dialog>
  );
}

type OpenPlansButtonProps = {
  currentPlanId: SubscriptionPlan;
  children: ReactNode;
  className?: string;
  size?: React.ComponentProps<typeof Button>["size"];
  variant?: React.ComponentProps<typeof Button>["variant"];
};

export function OpenPlansButton({
  currentPlanId,
  children,
  className,
  size,
  variant,
}: OpenPlansButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        type="button"
        size={size}
        variant={variant}
        className={className}
        onClick={() => setOpen(true)}
      >
        {children}
      </Button>
      <PlansModal open={open} onOpenChange={setOpen} currentPlanId={currentPlanId} />
    </>
  );
}
