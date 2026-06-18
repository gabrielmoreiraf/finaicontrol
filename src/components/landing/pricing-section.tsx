"use client";

import { Check, Sparkles } from "lucide-react";
import AnimatedContent from "@/components/AnimatedContent";
import { ReactBitsButton } from "@/components/react-bits/react-bits-button";
import { SectionHeader, SectionWrapper } from "@/components/landing/section-wrapper";

const TRIAL_FEATURES = [
  "Dashboard completo",
  "Receitas, despesas e lançamentos ilimitados",
  "Metas e dívidas",
  "Relatórios e projeções",
  "Assistente de IA",
];

const FREE_FEATURES = [
  "Dashboard",
  "Receitas e despesas",
  "Até 5 lançamentos por mês",
  "Acesso pelo celular",
];

export function PricingSection() {
  return (
    <SectionWrapper id="planos" variant="muted">
      <AnimatedContent>
        <SectionHeader
          eyebrow="Comece grátis"
          title="30 dias de acesso completo, por nossa conta"
          subtitle="Crie sua conta e use todos os recursos gratuitamente por 30 dias. Sem cartão, sem compromisso. Depois, continue de graça no plano Gratuito."
        />
      </AnimatedContent>

      <AnimatedContent>
        <div className="mx-auto grid max-w-3xl gap-4 sm:grid-cols-2">
          {/* Durante o trial — destaque */}
          <div className="rounded-3xl border-2 border-brand/40 bg-card/80 p-6 dark:bg-neutral-900/80 sm:p-7">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-brand/30 bg-brand/10 px-3 py-1 text-xs font-semibold text-brand">
              <Sparkles className="size-3.5" aria-hidden />
              30 dias grátis
            </span>
            <h3 className="mt-4 text-xl font-bold tracking-tight">Acesso completo</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Tudo liberado desde o primeiro dia, sem custo.
            </p>
            <ul className="mt-5 space-y-2.5">
              {TRIAL_FEATURES.map((feature) => (
                <li key={feature} className="flex items-start gap-2.5 text-sm">
                  <Check className="mt-0.5 size-4 shrink-0 text-brand" aria-hidden />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Depois do trial — plano gratuito */}
          <div className="rounded-3xl border border-border bg-card/60 p-6 dark:border-white/10 dark:bg-neutral-900/60 sm:p-7">
            <span className="inline-flex items-center rounded-full border border-border bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground dark:border-white/10">
              Depois dos 30 dias
            </span>
            <h3 className="mt-4 text-xl font-bold tracking-tight">Plano Gratuito</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Continue de graça, para sempre, com o essencial.
            </p>
            <ul className="mt-5 space-y-2.5">
              {FREE_FEATURES.map((feature) => (
                <li key={feature} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                  <Check className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center gap-2">
          <ReactBitsButton href="/cadastro" color="#10b981">
            Começar 30 dias grátis
          </ReactBitsButton>
          <p className="text-xs text-muted-foreground">Sem cartão de crédito.</p>
        </div>
      </AnimatedContent>
    </SectionWrapper>
  );
}
