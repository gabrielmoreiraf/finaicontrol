"use client";

import dynamic from "next/dynamic";
import { Check, Lock } from "lucide-react";
import AnimatedContent from "@/components/AnimatedContent";
import { ReactBitsButton } from "@/components/react-bits/react-bits-button";
import { SectionHeader, SectionWrapper } from "@/components/landing/section-wrapper";
import { pricingPlans, type PricingPlan } from "@/lib/landing-data";
import { isPlanCheckoutAvailable } from "@/lib/plans";
import { cn } from "@/lib/utils";

const ElectricBorder = dynamic(
  () => import("@/components/react-bits/electric-border"),
  { ssr: false },
);

const orderedPlans: PricingPlan[] = [
  pricingPlans[0],
  pricingPlans[2],
  pricingPlans[1],
];

function PricingCardContent({ plan }: { plan: PricingPlan }) {
  const isAvailable = isPlanCheckoutAvailable(plan.id);

  return (
    <div className="relative flex h-full min-h-[28rem] flex-col p-5 sm:min-h-[29rem] sm:p-6">
      {!isAvailable && (
        <div className="absolute inset-x-0 top-0 z-10 flex justify-center pt-4">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-background/95 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground backdrop-blur-sm dark:border-white/15 dark:bg-neutral-950/95 dark:text-white/70">
            <Lock className="size-3.5 shrink-0" aria-hidden />
            Em breve
          </span>
        </div>
      )}

      {isAvailable && (
        <div className="mb-3 flex justify-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-brand/40 bg-brand/15 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-brand">
            Disponível agora
          </span>
        </div>
      )}

      <h3 className="text-lg font-bold sm:text-xl">{plan.name}</h3>
      <div className="mt-2 flex items-baseline gap-1">
        <span
          className={cn(
            "text-3xl font-bold sm:text-4xl",
            isAvailable ? "text-brand" : "select-none blur-[4px]",
          )}
        >
          {plan.price}
        </span>
        {plan.period && (
          <span
            className={cn("text-sm text-muted-foreground", !isAvailable && "select-none blur-[4px]")}
          >
            {plan.period}
          </span>
        )}
      </div>
      <p className="mt-1.5 text-sm text-muted-foreground">{plan.description}</p>

      <ul className="mt-4 flex-1 space-y-2">
        {plan.features.map((feature) => (
          <li key={feature} className="flex items-start gap-2.5 text-sm">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      <div className="mt-5 shrink-0 pt-2">
        {isAvailable ? (
          <ReactBitsButton href="/cadastro" className="w-full" color="#10b981">
            Começar grátis
          </ReactBitsButton>
        ) : (
          <button
            type="button"
            disabled
            className="flex w-full cursor-not-allowed items-center justify-center rounded-2xl border border-border/50 bg-muted/40 px-6 py-3.5 text-sm font-semibold text-muted-foreground dark:border-white/10 dark:bg-neutral-900/90 dark:text-white/40"
          >
            Pagamento em breve
          </button>
        )}
      </div>
    </div>
  );
}

function PricingCard({ plan }: { plan: PricingPlan }) {
  const isAvailable = isPlanCheckoutAvailable(plan.id);

  const cardInner = (
    <div
      className={cn(
        "h-full overflow-hidden rounded-[inherit] border border-border/40 bg-card/90 shadow-lg backdrop-blur-xl",
        "dark:border-white/10 dark:bg-neutral-950/85",
        isAvailable && "border-brand/30",
        !isAvailable && "opacity-90",
      )}
    >
      <PricingCardContent plan={plan} />
    </div>
  );

  if (!isAvailable) {
    return <div className="h-full overflow-hidden rounded-[20px]">{cardInner}</div>;
  }

  return (
    <ElectricBorder
      color="#10b981"
      speed={1}
      chaos={0.12}
      borderRadius={20}
      className="h-full w-full"
      style={{ borderRadius: 20 }}
    >
      {cardInner}
    </ElectricBorder>
  );
}

export function PricingSection() {
  return (
    <SectionWrapper id="planos" variant="muted">
      <AnimatedContent>
        <SectionHeader
          eyebrow="Planos"
          title="Escolha o plano ideal para sua jornada financeira"
          subtitle="Por enquanto, apenas o plano Gratuito está disponível. Plus e Premium IA serão liberados assim que o pagamento estiver ativo."
        />
      </AnimatedContent>

      <div className="mx-auto grid max-w-full gap-6 lg:grid-cols-3 lg:items-stretch lg:gap-5">
        {orderedPlans.map((plan, index) => (
          <AnimatedContent
            key={plan.name}
            delay={index * 0.08}
            distance={35}
            className={cn("h-full min-w-0", isPlanCheckoutAvailable(plan.id) && "lg:z-10")}
          >
            <PricingCard plan={plan} />
          </AnimatedContent>
        ))}
      </div>
    </SectionWrapper>
  );
}
