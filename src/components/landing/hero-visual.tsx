"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, Sparkles, TriangleAlert } from "lucide-react";
import { GlareCard } from "@/components/react-bits/glare-card";
import { ThemedSpotlightCard } from "@/components/react-bits/themed-spotlight-card";
import { heroFinancialCards } from "@/lib/landing-data";
import { cn } from "@/lib/utils";

const [balanceCard, categoryCard, alertCard, projectionCard] = heroFinancialCards;

function getCategoryItems(
  card: (typeof heroFinancialCards)[number],
): Array<{ label: string; value: number }> {
  if ("items" in card && Array.isArray(card.items)) {
    return card.items;
  }
  return [];
}

function getProjectionValues(
  card: (typeof heroFinancialCards)[number],
): number[] {
  if ("values" in card && Array.isArray(card.values)) {
    return card.values;
  }
  return [];
}

function floatTransition(delay: number) {
  return {
    y: [0, -10, 0],
    transition: {
      duration: 5.5,
      repeat: Infinity,
      ease: "easeInOut" as const,
      delay,
    },
  };
}

export function HeroVisual() {
  const projectionValues = getProjectionValues(projectionCard);
  const maxProjection = Math.max(...projectionValues, 1);

  return (
    <div
      className="hero-visual relative mx-auto w-full max-w-lg lg:max-w-none"
      aria-hidden
    >
      <div className="hero-visual-orb pointer-events-none" />

      <motion.div
        className="absolute left-0 top-[6%] z-20 w-[58%] sm:w-[54%]"
        animate={floatTransition(0)}
      >
        <GlareCard className="rounded-2xl" interactive>
          <ThemedSpotlightCard padding="sm" spotlightColor="rgba(16, 185, 129, 0.22)">
            <p className="text-[0.625rem] font-medium uppercase tracking-wide text-muted-foreground sm:text-xs">
              {balanceCard.title}
            </p>
            <p className="mt-1 text-xl font-bold tracking-tight text-foreground sm:text-2xl">
              {balanceCard.value}
            </p>
            <p
              className={cn(
                "mt-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold",
                balanceCard.accent,
              )}
            >
              <ArrowUpRight className="size-3" />
              {balanceCard.trend} este mês
            </p>
          </ThemedSpotlightCard>
        </GlareCard>
      </motion.div>

      <motion.div
        className="absolute right-0 top-[14%] z-30 w-[52%] sm:w-[48%]"
        animate={floatTransition(0.6)}
      >
        <GlareCard className="rounded-2xl" interactive>
          <ThemedSpotlightCard padding="sm" spotlightColor="rgba(124, 58, 237, 0.18)">
            <p className="text-[0.625rem] font-medium uppercase tracking-wide text-muted-foreground sm:text-xs">
              {categoryCard.title}
            </p>
            <ul className="mt-3 space-y-2.5">
              {getCategoryItems(categoryCard).map((item) => (
                <li key={item.label}>
                  <div className="mb-1 flex justify-between text-xs">
                    <span className="text-muted-foreground">{item.label}</span>
                    <span className="font-semibold text-foreground">{item.value}%</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-muted/80">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-brand to-emerald-300"
                      style={{ width: `${item.value}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          </ThemedSpotlightCard>
        </GlareCard>
      </motion.div>

      <motion.div
        className="absolute bottom-[18%] left-[4%] z-20 w-[56%] sm:w-[52%]"
        animate={floatTransition(1.2)}
      >
        <GlareCard className="rounded-2xl" interactive>
          <ThemedSpotlightCard padding="sm" spotlightColor="rgba(245, 158, 11, 0.15)">
            <div className="flex items-start gap-2">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400">
                <TriangleAlert className="size-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-foreground sm:text-sm">{alertCard.title}</p>
                <p className="mt-0.5 text-sm font-bold text-amber-700 dark:text-amber-300">
                  {alertCard.value}
                </p>
                <p className="mt-1 text-[0.6875rem] leading-snug text-muted-foreground">
                  {alertCard.description}
                </p>
              </div>
            </div>
          </ThemedSpotlightCard>
        </GlareCard>
      </motion.div>

      <motion.div
        className="absolute bottom-[8%] right-0 z-10 w-[54%] sm:w-[50%]"
        animate={floatTransition(1.8)}
      >
        <GlareCard className="rounded-2xl" interactive>
          <ThemedSpotlightCard padding="sm" spotlightColor="rgba(16, 185, 129, 0.12)">
            <p className="text-[0.625rem] font-medium uppercase tracking-wide text-muted-foreground sm:text-xs">
              {projectionCard.title}
            </p>
            <div className="mt-3 flex h-16 items-end justify-between gap-1 sm:h-20">
              {projectionValues.map((value, index) => (
                <div
                  key={index}
                  className="flex flex-1 flex-col items-center gap-1"
                >
                  <div
                    className="w-full max-w-[1.75rem] rounded-t-md bg-gradient-to-t from-brand/80 to-emerald-300/90"
                    style={{ height: `${Math.max(18, (value / maxProjection) * 100)}%` }}
                  />
                </div>
              ))}
            </div>
          </ThemedSpotlightCard>
        </GlareCard>
      </motion.div>

      <motion.div
        className="absolute left-1/2 top-[42%] z-40 -translate-x-1/2"
        animate={{
          scale: [1, 1.06, 1],
          transition: { duration: 4, repeat: Infinity, ease: "easeInOut" },
        }}
      >
        <div className="flex items-center gap-2 rounded-full border border-brand/30 bg-background/90 px-4 py-2 shadow-lg shadow-brand/20 backdrop-blur-md dark:bg-card/90">
          <span className="flex size-8 items-center justify-center rounded-full bg-gradient-to-br from-brand to-violet-600 text-white">
            <Sparkles className="size-4" />
          </span>
          <div>
            <p className="text-xs font-bold text-foreground">IA FinIA</p>
            <p className="text-[0.625rem] text-muted-foreground">Analisando seu mês</p>
          </div>
        </div>
      </motion.div>

      <div className="hero-visual-spacer" />
    </div>
  );
}
