"use client";

import { AlertCircle, CheckCircle2 } from "lucide-react";
import AnimatedContent from "@/components/AnimatedContent";
import { Badge } from "@/components/ui/badge";
import { ThemedSpotlightCard } from "@/components/react-bits/themed-spotlight-card";
import { SectionHeader, SectionWrapper } from "@/components/landing/section-wrapper";
import {
  mockIncomeEntry,
  variableIncomeBenefits,
  variableIncomeFields,
} from "@/lib/landing-data";

export function VariableIncomeSection() {
  return (
    <SectionWrapper id="renda-variavel">
      <div className="grid items-center gap-12 lg:grid-cols-2">
        <AnimatedContent distance={35}>
          <SectionHeader
            align="left"
            eyebrow="Diferencial FinIA"
            title="Recebe renda extra, comissão ou bolsa temporária? O FinIA Control entende isso."
            subtitle="Cadastre rendas com prazo definido e veja o impacto real no seu orçamento, hoje e no futuro."
          />

          <ThemedSpotlightCard
            className="mt-8"
            spotlightColor="rgba(16, 185, 129, 0.2)"
            padding="md"
          >
            <p className="text-sm font-medium text-muted-foreground">
              Exemplo de cadastro
            </p>
            <p className="mt-2 text-2xl font-bold text-brand sm:text-3xl">
              &ldquo;R$ 500,00 todo dia 10 até dezembro.&rdquo;
            </p>
          </ThemedSpotlightCard>

          <div className="mt-8">
            <p className="mb-3 text-sm font-semibold text-foreground">
              Campos disponíveis no cadastro:
            </p>
            <div className="flex flex-wrap gap-2">
              {variableIncomeFields.map((field) => (
                <Badge key={field} variant="secondary" className="font-normal backdrop-blur-sm">
                  {field}
                </Badge>
              ))}
            </div>
          </div>
        </AnimatedContent>

        <AnimatedContent distance={40} delay={0.12}>
          <ThemedSpotlightCard spotlightColor="rgba(16, 185, 129, 0.15)" padding="md">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold">Renda extra cadastrada</h3>
              <Badge className="success-surface border-0">Ativa</Badge>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {mockIncomeEntry.map((field) => (
                <div
                  key={field.label}
                  className="flex items-start gap-3 rounded-lg border border-border/40 bg-muted/30 p-3 backdrop-blur-sm dark:bg-muted/20"
                >
                  <div className="rounded-md bg-brand/10 p-2 text-brand">
                    <field.icon className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{field.label}</p>
                    <p className="font-medium">{field.value}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="alert-surface mt-4 flex items-start gap-3 rounded-lg p-3">
              <AlertCircle className="alert-surface-muted mt-0.5 h-4 w-4 shrink-0" />
              <div>
                <p className="alert-surface-text text-sm font-medium">
                  Alerta: renda termina em 7 meses
                </p>
                <p className="alert-surface-muted mt-1 text-xs">
                  A partir de janeiro/2027, seu saldo previsto cai R$ 480/mês.
                </p>
              </div>
            </div>
          </ThemedSpotlightCard>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {variableIncomeBenefits.map((benefit, index) => (
              <AnimatedContent key={benefit.title} delay={index * 0.05} distance={25}>
                <ThemedSpotlightCard className="h-36" padding="sm">
                  <div className="flex h-full gap-3">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-brand" />
                    <div className="flex flex-col">
                      <p className="font-semibold">{benefit.title}</p>
                      <p className="mt-1 flex-1 text-sm text-muted-foreground">
                        {benefit.description}
                      </p>
                    </div>
                  </div>
                </ThemedSpotlightCard>
              </AnimatedContent>
            ))}
          </div>
        </AnimatedContent>
      </div>
    </SectionWrapper>
  );
}
