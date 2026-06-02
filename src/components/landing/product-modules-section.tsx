"use client";

import AnimatedContent from "@/components/AnimatedContent";
import { Badge } from "@/components/ui/badge";
import { ThemedSpotlightCard } from "@/components/react-bits/themed-spotlight-card";
import { SectionHeader, SectionWrapper } from "@/components/landing/section-wrapper";
import { platformHighlights, productModules } from "@/lib/landing-data";

export function ProductModulesSection() {
  return (
    <SectionWrapper id="recursos">
      <AnimatedContent>
        <SectionHeader
          eyebrow="Recursos do app"
          title="Tudo o que o FinIA Control já faz por você"
          subtitle="Módulos reais, disponíveis hoje, do cadastro de receitas ao controle de empréstimos feitos a outras pessoas."
        />
      </AnimatedContent>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {productModules.map((module, index) => (
          <AnimatedContent key={module.title} delay={index * 0.05} distance={28}>
            <ThemedSpotlightCard className="flex h-full flex-col" padding="md">
              <div className="mb-4 flex items-start justify-between gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-brand/15 to-violet-500/15 text-brand">
                  <module.icon className="h-5 w-5" aria-hidden />
                </div>
                <Badge
                  variant="outline"
                  className="shrink-0 border-brand/25 bg-brand/5 text-[0.6875rem] font-medium text-brand"
                >
                  {module.plan}
                </Badge>
              </div>
              <h3 className="text-lg font-semibold text-foreground">{module.title}</h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                {module.description}
              </p>
            </ThemedSpotlightCard>
          </AnimatedContent>
        ))}
      </div>

      <AnimatedContent distance={30} delay={0.15}>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {platformHighlights.map((item) => {
            const content = (
              <>
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-muted/60 text-brand dark:bg-white/[0.06]">
                  <item.icon className="h-5 w-5" aria-hidden />
                </div>
                <h3 className="font-semibold text-foreground">{item.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                  {item.description}
                </p>
              </>
            );

            if (item.href) {
              return (
                <a
                  key={item.title}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-2xl border border-border/40 bg-card/60 p-5 transition-colors hover:border-brand/30 hover:bg-card/80 dark:bg-white/[0.03]"
                >
                  {content}
                </a>
              );
            }

            return (
              <div
                key={item.title}
                className="rounded-2xl border border-border/40 bg-card/60 p-5 dark:bg-white/[0.03]"
              >
                {content}
              </div>
            );
          })}
        </div>
      </AnimatedContent>
    </SectionWrapper>
  );
}
