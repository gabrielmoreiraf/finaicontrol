"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { ArrowRight } from "lucide-react";
import AnimatedContent from "@/components/AnimatedContent";
import BlurText from "@/components/BlurText";
import { ReactBitsButton } from "@/components/react-bits/react-bits-button";
import { SectionWrapper } from "@/components/landing/section-wrapper";

const Aurora = dynamic(() => import("@/components/Aurora"), { ssr: false });

export function CtaSection() {
  return (
    <SectionWrapper id="cadastro">
      <AnimatedContent distance={35}>
        <div className="relative overflow-hidden rounded-3xl border border-brand/20 px-6 py-16 text-center sm:px-12 sm:py-20">
          <div className="absolute inset-0 opacity-40">
            <Aurora
              colorStops={["#059669", "#7c3aed", "#059669"]}
              amplitude={1.4}
              blend={0.6}
            />
          </div>
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-background/20 via-transparent to-background/40" />

          <div className="relative mx-auto max-w-3xl">
            <BlurText
              text="Pare de apenas anotar gastos. Comece a entender seu dinheiro."
              delay={60}
              animateBy="words"
              className="justify-center text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl"
            />
            <p className="mt-6 text-lg leading-relaxed text-muted-foreground sm:text-xl">
              Com o FinIA Control, você acompanha receitas, despesas, dívidas,
              empréstimos e metas no celular ou no desktop e recebe ajuda
              inteligente para tomar melhores decisões.
            </p>
            <div className="mt-10 flex justify-center">
              <ReactBitsButton href="/cadastro" color="#10b981">
                <span className="inline-flex items-center gap-2">
                  Começar 30 dias grátis
                  <ArrowRight className="h-4 w-4" />
                </span>
              </ReactBitsButton>
            </div>
          </div>
        </div>
      </AnimatedContent>
    </SectionWrapper>
  );
}
