"use client";

import AnimatedContent from "@/components/AnimatedContent";
import { HowItWorksJourney } from "@/components/landing/how-it-works-journey";
import { SectionHeader, SectionWrapper } from "@/components/landing/section-wrapper";

export function HowItWorksSection() {
  return (
    <SectionWrapper id="como-funciona" variant="muted">
      <AnimatedContent>
        <SectionHeader
          eyebrow="Como funciona"
          title="5 passos, do cadastro à decisão"
          subtitle="Cadastre, organize e deixe a IA te avisar antes do problema aparecer."
        />
      </AnimatedContent>

      <AnimatedContent distance={28} delay={0.08}>
        <HowItWorksJourney />
      </AnimatedContent>
    </SectionWrapper>
  );
}
