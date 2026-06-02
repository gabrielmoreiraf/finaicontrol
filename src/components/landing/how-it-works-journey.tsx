"use client";

import { howItWorksSteps } from "@/lib/landing-data";
import { cn } from "@/lib/utils";

export function HowItWorksJourney() {
  return (
    <ol className="mx-auto grid max-w-2xl gap-3 sm:gap-4">
      {howItWorksSteps.map((step) => {
        const Icon = step.icon;

        return (
          <li
            key={step.step}
            className="flex gap-3 rounded-2xl border border-border/60 bg-card/50 p-4 backdrop-blur-sm sm:gap-4 sm:p-5 dark:border-white/10 dark:bg-white/[0.03]"
          >
            <div
              className={cn(
                "flex size-10 shrink-0 items-center justify-center rounded-xl sm:size-11",
                "border border-brand/25 bg-brand/10 text-brand",
              )}
              aria-hidden
            >
              <Icon className="size-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wide text-brand">
                {step.step}. {step.shortLabel}
              </p>
              <h3 className="mt-1 text-base font-bold text-foreground sm:text-lg">
                {step.title}
              </h3>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                {step.description}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
