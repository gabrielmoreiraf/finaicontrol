"use client";

import dynamic from "next/dynamic";
import { useActionState, useEffect, useState, type ReactNode } from "react";
import {
  Brain,
  Check,
  CheckCircle2,
  CreditCard,
  Crown,
  Headphones,
  LineChart,
  Lock,
  Shield,
  Sparkles,
  Target,
} from "lucide-react";

const ElectricBorder = dynamic(
  () => import("@/components/react-bits/electric-border"),
  { ssr: false },
);
import { selectPlanAction, type PlanSelectionState } from "@/lib/actions/plan";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { pricingPlans, type PlanId, type PricingPlan } from "@/lib/landing-data";
import { notify } from "@/lib/toast";
import type { SubscriptionPlan } from "@/types/finance";
import { cn } from "@/lib/utils";

const initialState: PlanSelectionState = {};

const orderedPlans: PricingPlan[] = [pricingPlans[0], pricingPlans[2], pricingPlans[1]];

const planVisuals = {
  free: {
    Icon: CreditCard,
    accent: "text-brand",
    check: "text-brand",
    iconWrap: "border-brand/25 bg-brand/10",
    cardBg: "from-card/90 to-card/80",
  },
  plus: {
    Icon: LineChart,
    accent: "text-brand",
    check: "text-brand",
    iconWrap: "border-brand/25 bg-brand/10",
    cardBg: "from-brand/[0.04] to-card/80",
  },
  premium: {
    Icon: Brain,
    accent: "text-brand",
    check: "text-brand",
    iconWrap: "border-brand/25 bg-brand/10",
    cardBg: "from-brand/10 via-brand/[0.04] to-card/90",
  },
} as const;

function PlanModalCardContent({
  plan,
  currentPlanId,
  pending,
}: {
  plan: PricingPlan;
  currentPlanId: SubscriptionPlan;
  pending: boolean;
}) {
  const isAvailable = plan.id === "free";
  const isCurrent = plan.id === currentPlanId;
  const visuals = planVisuals[plan.id];
  const PlanIcon = visuals.Icon;

  return (
    <div className="relative flex h-full flex-col p-3 text-center sm:p-3.5">
      {isCurrent && (
        <div className="mb-2 flex justify-center">
          <span className="inline-flex items-center gap-1 rounded-full border border-brand/50 bg-brand/20 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-brand">
            <CheckCircle2 className="size-2.5" aria-hidden />
            Seu plano
          </span>
        </div>
      )}

      {plan.highlighted && !isCurrent && (
        <div className="mb-2 flex justify-center">
          <span className="inline-flex items-center gap-1 rounded-full border border-brand/40 bg-brand/15 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-brand">
            <Sparkles className="size-2.5" aria-hidden />
            Mais escolhido
          </span>
        </div>
      )}

      <div className="flex flex-col items-center">
        <span
          className={cn(
            "relative mb-2 flex size-8 items-center justify-center rounded-lg border",
            visuals.iconWrap,
            isCurrent && "ring-2 ring-brand/40 ring-offset-1 ring-offset-background",
          )}
        >
          <PlanIcon className={cn("size-4", visuals.accent)} aria-hidden />
          {isCurrent && (
            <span className="absolute -right-1 -top-1 flex size-3.5 items-center justify-center rounded-full bg-brand text-black">
              <Check className="size-2" strokeWidth={3} aria-hidden />
            </span>
          )}
        </span>

        <h3 className="text-sm font-bold tracking-tight sm:text-base">{plan.name}</h3>

        <div className="mt-1 flex items-baseline justify-center gap-0.5">
          <span
            className={cn(
              "text-xl font-bold tracking-tight sm:text-2xl",
              visuals.accent,
              !isAvailable && "select-none blur-[4px]",
            )}
          >
            {plan.price}
          </span>
          {plan.period && (
            <span
              className={cn(
                "text-xs text-muted-foreground",
                !isAvailable && "select-none blur-[4px]",
              )}
            >
              {plan.period}
            </span>
          )}
        </div>

        <p className="mt-1 max-w-[14rem] text-[11px] leading-snug text-muted-foreground sm:text-xs">
          {plan.description}
        </p>
      </div>

      <ul className="mt-3 flex-1 space-y-1 text-left">
        {plan.features.map((feature) => (
          <li key={feature} className="flex items-start gap-1.5 text-[11px] leading-snug sm:text-xs">
            <Check className={cn("mt-0.5 size-3 shrink-0", visuals.check)} aria-hidden />
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      <div className="mt-3">
        {isCurrent ? (
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
        ) : isAvailable ? (
          <button
            type="submit"
            name="planId"
            value={plan.id satisfies PlanId}
            disabled={pending}
            className="btn-brand flex w-full items-center justify-center rounded-xl py-2 text-xs font-semibold text-black transition-opacity hover:opacity-90 disabled:opacity-60 sm:text-sm"
          >
            {pending ? "Confirmando..." : "Usar plano gratuito"}
          </button>
        ) : (
          <button
            type="button"
            disabled
            className="flex w-full cursor-not-allowed items-center justify-center rounded-xl border border-white/10 bg-neutral-900/90 py-2 text-xs font-semibold text-white/40 sm:text-sm"
          >
            Pagamento em breve
          </button>
        )}
      </div>
    </div>
  );
}

function PlanModalCard({
  plan,
  currentPlanId,
  pending,
}: {
  plan: PricingPlan;
  currentPlanId: SubscriptionPlan;
  pending: boolean;
}) {
  const isAvailable = plan.id === "free";
  const isCurrent = plan.id === currentPlanId;
  const visuals = planVisuals[plan.id];

  const cardInner = (
    <div
      className={cn(
        "h-full overflow-hidden rounded-[inherit] bg-gradient-to-b shadow-lg backdrop-blur-xl",
        visuals.cardBg,
        isCurrent && "from-brand/10 to-brand/[0.04]",
        !plan.highlighted && !isCurrent && "border border-white/10",
        !plan.highlighted && isCurrent && "border border-brand/40",
      )}
    >
      <PlanModalCardContent plan={plan} currentPlanId={currentPlanId} pending={pending} />
    </div>
  );

  const cardShellClass = cn(
    "h-full overflow-hidden rounded-2xl transition-opacity",
    isCurrent && !plan.highlighted && "ring-2 ring-brand/60 shadow-[0_0_24px_-6px] shadow-brand/25",
    !isCurrent && !plan.highlighted && "opacity-90",
  );

  if (!plan.highlighted) {
    return (
      <div className={cardShellClass} data-current-plan={isCurrent || undefined}>
        {cardInner}
      </div>
    );
  }

  return (
    <div
      className={cn(cardShellClass, isCurrent && "ring-2 ring-brand/60 shadow-[0_0_24px_-6px] shadow-brand/25")}
      data-current-plan={isCurrent || undefined}
    >
      <ElectricBorder
        color="#10b981"
        speed={1}
        chaos={0.12}
        borderRadius={16}
        className="h-full w-full md:z-10"
        style={{ borderRadius: 16 }}
      >
        {cardInner}
      </ElectricBorder>
    </div>
  );
}

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
          <div className="grid grid-cols-3 items-stretch gap-2 sm:gap-3">
            {orderedPlans.map((plan) => (
              <PlanModalCard
                key={plan.id}
                plan={plan}
                currentPlanId={currentPlanId}
                pending={pending}
              />
            ))}
          </div>

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
