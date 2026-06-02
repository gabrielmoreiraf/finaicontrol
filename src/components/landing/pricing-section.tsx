"use client";

import AnimatedContent from "@/components/AnimatedContent";
import { ReactBitsButton } from "@/components/react-bits/react-bits-button";
import { SectionHeader, SectionWrapper } from "@/components/landing/section-wrapper";
import { PlanCards } from "@/components/plans/plan-cards";

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

      <PlanCards
        className="mx-auto max-w-full"
        cardWrapper={(card, index) => (
          <AnimatedContent delay={index * 0.08} distance={35} className="h-full min-w-0">
            {card}
          </AnimatedContent>
        )}
        renderCta={({ plan, isAvailable }) =>
          isAvailable ? (
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
          )
        }
      />
    </SectionWrapper>
  );
}
