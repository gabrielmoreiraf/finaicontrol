"use client";

import dynamic from "next/dynamic";
import type { ReactNode } from "react";
import { CheckCircle2, Lock, Sparkles } from "lucide-react";
import { isPlanCheckoutAvailable } from "@/lib/plans";
import {
  type BillingInterval,
  type PlanId,
  type PricingPlan,
} from "@/lib/landing-data";
import { cn } from "@/lib/utils";

const ElectricBorder = dynamic(
  () => import("@/components/react-bits/electric-border"),
  { ssr: false },
);

export type PlanCardDensity = "comfortable" | "compact";

export interface PlanCtaContext {
  plan: PricingPlan;
  interval: BillingInterval;
  isAvailable: boolean;
  isCurrent: boolean;
}

interface PlanCardProps {
  plan: PricingPlan;
  interval: BillingInterval;
  currentPlanId?: PlanId | null;
  density?: PlanCardDensity;
  renderCta: (context: PlanCtaContext) => ReactNode;
}

export function PlanCard({
  plan,
  interval,
  currentPlanId = null,
  density = "comfortable",
  renderCta,
}: PlanCardProps) {
  const isAvailable = isPlanCheckoutAvailable(plan.id);
  const isCurrent = currentPlanId === plan.id;
  const isHighlighted = Boolean(plan.highlighted);
  const compact = density === "compact";

  const intervalPrice = plan.pricing ? plan.pricing[interval] : null;
  const priceMain = intervalPrice ? intervalPrice.perMonth : plan.price;
  const priceSuffix = intervalPrice ? intervalPrice.suffix : plan.period;
  const billedLabel =
    interval === "annual" ? intervalPrice?.billedLabel : undefined;

  const content = (
    <div
      className={cn(
        "relative flex h-full flex-col",
        compact ? "p-4" : "p-5 sm:p-6",
      )}
    >
      {/* Selo "Em breve" (canto) — apenas planos pagos ainda indisponíveis */}
      {!isAvailable && (
        <div className="absolute right-3 top-3 z-10">
          <span className="inline-flex items-center gap-1 rounded-full border border-border bg-background/95 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground backdrop-blur-sm dark:border-white/15 dark:bg-neutral-950/95 dark:text-white/70">
            <Lock className="size-3 shrink-0" aria-hidden />
            Em breve
          </span>
        </div>
      )}

      {/* Badge de status (centro) */}
      <StatusBadge
        isCurrent={isCurrent}
        isHighlighted={isHighlighted}
        isAvailable={isAvailable}
      />

      <h3
        className={cn(
          "font-bold tracking-tight",
          compact ? "text-base" : "text-lg sm:text-xl",
          isHighlighted && "text-brand",
        )}
      >
        {plan.name}
      </h3>

      <div className="mt-2 flex items-baseline gap-1">
        <span
          className={cn(
            "font-bold tracking-tight",
            compact ? "text-2xl" : "text-3xl sm:text-4xl",
            isHighlighted ? "text-brand" : "text-foreground",
            !isAvailable && "select-none blur-[4px]",
          )}
        >
          {priceMain}
        </span>
        {priceSuffix && (
          <span
            className={cn(
              "text-sm text-muted-foreground",
              !isAvailable && "select-none blur-[4px]",
            )}
          >
            {priceSuffix}
          </span>
        )}
      </div>

      {billedLabel && (
        <p
          className={cn(
            "mt-1 text-xs text-muted-foreground",
            !isAvailable && "select-none blur-[4px]",
          )}
        >
          {billedLabel}
        </p>
      )}

      <p className={cn("text-muted-foreground", compact ? "mt-1 text-xs" : "mt-1.5 text-sm")}>
        {plan.description}
      </p>

      <ul className={cn("flex-1 space-y-2", compact ? "mt-3" : "mt-4")}>
        {plan.features.map((feature) => (
          <li
            key={feature}
            className={cn("flex items-start gap-2.5", compact ? "text-[11px] leading-snug sm:text-xs" : "text-sm")}
          >
            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-brand" aria-hidden />
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      <div className={cn("shrink-0", compact ? "mt-3" : "mt-5 pt-2")}>
        {renderCta({ plan, interval, isAvailable, isCurrent })}
      </div>
    </div>
  );

  const cardInner = (
    <div
      className={cn(
        "h-full overflow-hidden rounded-[inherit] border border-border bg-card shadow-lg backdrop-blur-xl dark:border-white/10 dark:bg-neutral-950/85",
        isCurrent && "border-brand/40",
        !isHighlighted && !isAvailable && !isCurrent && "opacity-90",
      )}
    >
      {content}
    </div>
  );

  // Destaque (borda elétrica) sempre no plano em destaque (Premium IA).
  if (!isHighlighted) {
    return <div className="h-full overflow-hidden rounded-[20px]">{cardInner}</div>;
  }

  return (
    <ElectricBorder
      color="#10b981"
      speed={1}
      chaos={0.12}
      borderRadius={20}
      className="h-full w-full"
      style={{ borderRadius: 20 }}
    >
      {cardInner}
    </ElectricBorder>
  );
}

function StatusBadge({
  isCurrent,
  isHighlighted,
  isAvailable,
}: {
  isCurrent: boolean;
  isHighlighted: boolean;
  isAvailable: boolean;
}) {
  let badge: { icon: typeof Sparkles; label: string } | null = null;

  if (isCurrent) {
    badge = { icon: CheckCircle2, label: "Seu plano" };
  } else if (isHighlighted) {
    badge = { icon: Sparkles, label: "Mais escolhido" };
  } else if (isAvailable) {
    badge = { icon: Sparkles, label: "Disponível agora" };
  }

  if (!badge) return null;

  const Icon = badge.icon;
  return (
    <div className="mb-3 flex justify-center">
      <span className="inline-flex items-center gap-1.5 rounded-full border border-brand/40 bg-brand/15 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-brand">
        <Icon className="size-3 shrink-0" aria-hidden />
        {badge.label}
      </span>
    </div>
  );
}
