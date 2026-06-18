"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { ArrowDown, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import BlurText from "@/components/BlurText";
import ShinyText from "@/components/ShinyText";
import AnimatedContent from "@/components/AnimatedContent";
import { HeroVisual } from "@/components/landing/hero-visual";
import { ReactBitsButton } from "@/components/react-bits/react-bits-button";

const Aurora = dynamic(() => import("@/components/Aurora"), { ssr: false });

const heroTrustPoints = [
  "30 dias grátis de acesso completo",
  "Sem cartão no cadastro",
  "IA com seus dados reais",
] as const;

export function HeroSection() {
  return (
    <section className="hero-fullheight relative overflow-hidden pb-10 pt-[4.75rem] sm:pb-14 sm:pt-28 lg:pb-28 lg:pt-32">
      <div className="reactbits-aurora-bg">
        <Aurora
          colorStops={["#059669", "#047857", "#10b981"]}
          amplitude={1.1}
          blend={0.45}
        />
      </div>

      <div className="landing-container relative">
        <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-14 xl:gap-16">
          <AnimatedContent distance={40} duration={0.9}>
            <div className="mb-5 inline-flex rounded-full border border-brand/20 bg-brand/5 px-4 py-1.5 backdrop-blur-sm sm:mb-6">
              <ShinyText
                text="Plataforma financeira com IA"
                speed={3}
                color="var(--muted-foreground)"
                shineColor="#10b981"
                className="text-sm font-medium"
              />
            </div>

            <h1 className="hero-headline text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl lg:text-[3.25rem] lg:leading-[1.08]">
              <BlurText
                as="span"
                text="Por que seu dinheiro acaba antes do mês terminar?"
                delay={70}
                animateBy="words"
              />
            </h1>

            <p className="mt-5 max-w-[52ch] text-base leading-relaxed text-muted-foreground sm:mt-6 sm:text-lg lg:text-xl">
              O FinIA Control organiza receitas, despesas, dívidas, empréstimos e
              metas com inteligência artificial no desktop ou no celular para
              você decidir melhor antes que o problema aconteça.
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:mt-8 sm:flex-row sm:items-center">
              <ReactBitsButton href="/cadastro">Começar 30 dias grátis</ReactBitsButton>
              <Button
                size="lg"
                variant="outline"
                asChild
                className="border-border/60 bg-background/50 backdrop-blur-sm"
              >
                <Link href="#como-funciona" className="gap-2">
                  Ver como funciona
                  <ArrowDown className="h-4 w-4" />
                </Link>
              </Button>
            </div>

            <ul className="mt-6 flex flex-col gap-2 sm:mt-7 sm:flex-row sm:flex-wrap sm:gap-x-5 sm:gap-y-2">
              {heroTrustPoints.map((point) => (
                <li
                  key={point}
                  className="flex items-center gap-2 text-sm text-muted-foreground"
                >
                  <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-brand/15 text-brand">
                    <Check className="size-3" aria-hidden />
                  </span>
                  {point}
                </li>
              ))}
            </ul>
          </AnimatedContent>

          <div className="hidden min-w-0 lg:block">
            <AnimatedContent distance={50} duration={1} delay={0.15}>
              <div className="hero-visual-shell w-full">
                <div className="hero-visual-float">
                  <HeroVisual />
                </div>
              </div>
            </AnimatedContent>
          </div>
        </div>
      </div>
    </section>
  );
}
