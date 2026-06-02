"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Crown, HelpCircle, ShieldCheck } from "lucide-react";
import { APP_NAV_LINKS } from "@/components/app/app-nav-links";
import { OpenPlansButton } from "@/components/app/plans-modal";
import { PlanLimitedIcon, PlanLockIcon } from "@/components/app/plan-gate";
import { BrandLogo } from "@/components/brand/brand-logo";
import { SUPPORT_WHATSAPP_URL } from "@/lib/brand";
import {
  getLimitedPlanFeatureHint,
  hasPlanAccess,
  isLimitedPlanFeature,
} from "@/lib/plans/features";
import type { SubscriptionPlan } from "@/types/finance";
import { cn } from "@/lib/utils";

export function AppSidebar({
  planId = "free",
  isAdmin = false,
}: {
  planId?: SubscriptionPlan;
  isAdmin?: boolean;
}) {
  const pathname = usePathname();

  return (
    <aside className="app-sidebar fixed inset-y-0 left-0 z-30 hidden h-dvh w-[var(--sidebar-width,17.5rem)] flex-col overflow-hidden border-r border-sidebar-border bg-sidebar/95 backdrop-blur-xl lg:flex">
      <div className="flex h-[4.25rem] shrink-0 items-center overflow-hidden border-b border-sidebar-border px-5">
        <BrandLogo
          variant="full"
          size="lg"
          href="/dashboard"
          className="shrink-0"
          imageClassName="!h-40 !w-auto !max-w-full object-contain"
        />
      </div>

      <nav
        className="min-h-0 flex-1 space-y-1 overflow-hidden px-3 py-4"
        aria-label="Navegação principal"
      >
        {APP_NAV_LINKS.map(({ href, label, icon: Icon, feature }) => {
          const active =
            pathname === href ||
            (href !== "/dashboard" && pathname.startsWith(href));
          const locked = !hasPlanAccess(planId, feature);
          const limited = isLimitedPlanFeature(planId, feature);
          const limitedHint = getLimitedPlanFeatureHint(feature);

          return (
            <Link
              key={href}
              href={href}
              title={limited ? limitedHint ?? undefined : undefined}
              className={cn(
                "group relative flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all",
                active
                  ? "bg-brand/10 text-brand"
                  : "text-muted-foreground hover:bg-sidebar-accent hover:text-foreground",
                locked && !active && "opacity-80",
              )}
            >
              {active && (
                <span
                  className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-brand shadow-[0_0_12px_rgba(0,230,118,0.6)]"
                  aria-hidden
                />
              )}
              <Icon
                className={cn(
                  "size-[1.125rem] shrink-0 transition-colors",
                  active
                    ? "text-brand"
                    : "text-muted-foreground group-hover:text-foreground",
                )}
                aria-hidden
              />
              {label}
              {limited && (
                <span
                  className="ml-auto flex items-center gap-1.5"
                  title={limitedHint ?? "Bônus limitado"}
                >
                  <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-1.5 py-0.5 text-[0.625rem] font-semibold uppercase tracking-wide text-emerald-700 dark:border-emerald-500/25 dark:text-emerald-400">
                    Bônus
                  </span>
                  <PlanLimitedIcon title={limitedHint ?? "Bônus limitado"} />
                </span>
              )}
              {locked && <PlanLockIcon className="ml-auto" />}
            </Link>
          );
        })}

        {isAdmin && (
          <Link
            href="/admin"
            className={cn(
              "group relative mt-1 flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all",
              pathname === "/admin" || pathname.startsWith("/admin/")
                ? "bg-violet-500/10 text-violet-600 dark:text-violet-300"
                : "text-muted-foreground hover:bg-sidebar-accent hover:text-foreground",
            )}
          >
            {(pathname === "/admin" || pathname.startsWith("/admin/")) && (
              <span
                className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-violet-500 shadow-[0_0_12px_rgba(139,92,246,0.6)]"
                aria-hidden
              />
            )}
            <ShieldCheck className="size-[1.125rem] shrink-0" aria-hidden />
            Admin
          </Link>
        )}
      </nav>

      <div className="shrink-0 space-y-3 border-t border-sidebar-border p-4">
        {!isAdmin && planId !== "premium" && (
          <div className="premium-card-glow rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 via-card to-card p-4 dark:border-amber-500/20 dark:from-amber-500/10 dark:via-card/80 dark:to-card/80">
            <div className="flex items-start gap-3">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400">
                <Crown className="size-4.5" aria-hidden />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground">
                  FinIA Premium
                </p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  Desbloqueie todo o poder da IA financeira.
                </p>
              </div>
            </div>
            <OpenPlansButton
              currentPlanId={planId}
              size="sm"
              className="mt-4 h-9 w-full rounded-xl btn-brand"
            >
              Fazer upgrade
            </OpenPlansButton>
          </div>
        )}

        <a
          href={SUPPORT_WHATSAPP_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-foreground"
        >
          <HelpCircle className="size-4 shrink-0" aria-hidden />
          Precisando de ajuda?
        </a>
      </div>
    </aside>
  );
}
