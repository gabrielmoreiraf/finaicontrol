"use client";

import AnimatedContent from "@/components/AnimatedContent";
import { ThemedSpotlightCard } from "@/components/react-bits/themed-spotlight-card";
import { SectionHeader, SectionWrapper } from "@/components/landing/section-wrapper";
import { painPoints } from "@/lib/landing-data";

export function PainPointsSection() {
  return (
    <SectionWrapper variant="muted">
      <AnimatedContent>
        <SectionHeader
          eyebrow="O problema"
          title="Você não precisa ganhar mais para começar a se organizar melhor."
          subtitle="A maioria das pessoas não perde dinheiro por falta de renda, e sim por falta de clareza sobre para onde ele vai."
        />
      </AnimatedContent>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {painPoints.map((point, index) => (
          <AnimatedContent key={point.title} delay={index * 0.05} distance={30}>
            <ThemedSpotlightCard
              spotlightColor="rgba(239, 68, 68, 0.12)"
              className="h-full"
            >
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
                <point.icon className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">{point.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {point.description}
              </p>
            </ThemedSpotlightCard>
          </AnimatedContent>
        ))}
      </div>
    </SectionWrapper>
  );
}
