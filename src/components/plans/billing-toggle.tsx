"use client";

import { cn } from "@/lib/utils";
import type { BillingInterval } from "@/lib/landing-data";

const OPTIONS: { id: BillingInterval; label: string }[] = [
  { id: "monthly", label: "Mensal" },
  { id: "annual", label: "Anual" },
];

export function BillingToggle({
  value,
  onChange,
  savingsLabel = "2 meses grátis",
  className,
}: {
  value: BillingInterval;
  onChange: (value: BillingInterval) => void;
  savingsLabel?: string;
  className?: string;
}) {
  return (
    <div className={cn("inline-flex items-center gap-2.5", className)}>
      <div
        role="radiogroup"
        aria-label="Ciclo de cobrança"
        className="inline-flex items-center rounded-full border border-border bg-muted/60 p-1 dark:border-white/10 dark:bg-white/[0.05]"
      >
        {OPTIONS.map((option) => {
          const active = value === option.id;
          return (
            <button
              key={option.id}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onChange(option.id)}
              className={cn(
                "rounded-full px-4 py-1.5 text-sm font-semibold transition-colors",
                active
                  ? "bg-brand text-brand-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {option.label}
            </button>
          );
        })}
      </div>

      {savingsLabel && (
        <span className="hidden items-center rounded-full border border-brand/30 bg-brand/10 px-2.5 py-1 text-xs font-semibold text-brand sm:inline-flex">
          {savingsLabel}
        </span>
      )}
    </div>
  );
}
