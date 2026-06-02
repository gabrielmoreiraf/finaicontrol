"use client";

import AnimatedContent from "@/components/AnimatedContent";
import { LandingDashboardVisual } from "@/components/landing/landing-dashboard-visual";
import { ThemedSpotlightCard } from "@/components/react-bits/themed-spotlight-card";
import { SectionHeader, SectionWrapper } from "@/components/landing/section-wrapper";
import { dashboardFeatures } from "@/lib/landing-data";

export function DashboardSection() {
  return (
    <SectionWrapper variant="accent">
      <AnimatedContent>
        <SectionHeader
          eyebrow="Dashboard inteligente"
          title="Tudo o que importa, em um só lugar"
          subtitle="O mesmo painel que você usa no app: cards, projeções, alertas e assistente IA."
        />
      </AnimatedContent>

      <AnimatedContent distance={40} delay={0.1}>
        <LandingDashboardVisual />
      </AnimatedContent>

      <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {dashboardFeatures.map((feature, index) => (
          <AnimatedContent key={feature.label} delay={index * 0.03} distance={20}>
            <ThemedSpotlightCard padding="sm" className="text-center">
              <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-brand/15 to-violet-500/15 text-brand">
                <feature.icon className="h-5 w-5" />
              </div>
              <span className="text-xs font-medium sm:text-sm">{feature.label}</span>
            </ThemedSpotlightCard>
          </AnimatedContent>
        ))}
      </div>
    </SectionWrapper>
  );
}
