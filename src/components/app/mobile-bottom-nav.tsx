"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  HelpCircle,
  LayoutGrid,
  MoreHorizontal,
  ShieldCheck,
  Target,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { APP_NAV_LINKS } from "@/components/app/app-nav-links";
import { PlanLimitedIcon, PlanLockIcon } from "@/components/app/plan-gate";
import { SUPPORT_WHATSAPP_URL } from "@/lib/brand";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  getLimitedPlanFeatureHint,
  hasPlanAccess,
  isLimitedPlanFeature,
} from "@/lib/plans/features";
import type { SubscriptionPlan } from "@/types/finance";
import { cn } from "@/lib/utils";

const MOBILE_PRIMARY_HREFS = new Set([
  "/dashboard",
  "/receitas",
  "/despesas",
  "/metas",
]);

const MOBILE_PRIMARY_NAV = [
  { href: "/dashboard", label: "Início", icon: LayoutGrid, feature: "dashboard_basic" as const },
  { href: "/receitas", label: "Receitas", icon: TrendingUp, feature: "incomes" as const },
  { href: "/despesas", label: "Despesas", icon: TrendingDown, feature: "expenses" as const },
  { href: "/metas", label: "Metas", icon: Target, feature: "goals" as const },
] as const;

const MORE_PATHS = [
  "/dividas",
  "/emprestei",
  "/investimentos",
  "/relatorios",
  "/ia",
] as const;

const MOBILE_MORE_LINKS = APP_NAV_LINKS.filter((link) => !MOBILE_PRIMARY_HREFS.has(link.href));

function isMorePathActive(pathname: string) {
  return MORE_PATHS.some(
    (path) => pathname === path || pathname.startsWith(path),
  );
}

export function MobileBottomNav({
  planId = "free",
  isAdmin = false,
  loansEnabled = false,
}: {
  planId?: SubscriptionPlan;
  isAdmin?: boolean;
  loansEnabled?: boolean;
}) {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);
  const moreActive = isMorePathActive(pathname);
  const moreLinks = MOBILE_MORE_LINKS.filter(
    (link) => link.href !== "/emprestei" || loansEnabled,
  );

  return (
    <>
      <nav
        className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-background/95 backdrop-blur-xl lg:hidden"
        aria-label="Navegação mobile"
      >
        <div className="flex w-full items-stretch justify-between gap-0.5 px-1 pb-[max(0.375rem,env(safe-area-inset-bottom))] pt-1.5 pl-[max(0.25rem,env(safe-area-inset-left))] pr-[max(0.25rem,env(safe-area-inset-right))]">
          {MOBILE_PRIMARY_NAV.map(({ href, label, icon: Icon, feature }) => {
            const active =
              pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
            const locked = !hasPlanAccess(planId, feature);

            return (
              <Link
                key={href}
                href={href}
                prefetch={false}
                className={cn(
                  "relative flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-lg px-0.5 py-1 text-[0.625rem] font-medium leading-tight transition-colors sm:gap-1 sm:rounded-xl sm:px-1 sm:py-1.5 sm:text-[0.6875rem]",
                  active ? "text-brand" : "text-muted-foreground",
                )}
              >
                <Icon
                  className={cn(
                    "size-[1.125rem] shrink-0 sm:size-5",
                    active && "drop-shadow-[0_0_8px_color-mix(in_oklch,var(--brand)_50%,transparent)]",
                  )}
                />
                <span className="flex max-w-full items-center justify-center gap-0.5 truncate">
                  <span className="truncate">{label}</span>
                  {locked && <PlanLockIcon className="size-2 shrink-0" />}
                </span>
              </Link>
            );
          })}

          <button
            type="button"
            onClick={() => setMoreOpen(true)}
            className={cn(
              "relative flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-lg px-0.5 py-1 text-[0.625rem] font-medium leading-tight transition-colors sm:gap-1 sm:rounded-xl sm:px-1 sm:py-1.5 sm:text-[0.6875rem]",
              moreActive ? "text-brand" : "text-muted-foreground",
            )}
            aria-expanded={moreOpen}
            aria-haspopup="dialog"
          >
            <MoreHorizontal
              className={cn(
                "size-[1.125rem] shrink-0 sm:size-5",
                moreActive && "drop-shadow-[0_0_8px_color-mix(in_oklch,var(--brand)_50%,transparent)]",
              )}
            />
            <span className="truncate">Mais</span>
          </button>
        </div>
      </nav>

      <Sheet open={moreOpen} onOpenChange={setMoreOpen}>
        <SheetContent
          side="bottom"
          className="max-h-[min(85dvh,32rem)] rounded-t-2xl border-border px-0 pb-[max(1rem,env(safe-area-inset-bottom))]"
        >
          <SheetHeader className="border-b border-border px-4 pb-3 text-left">
            <SheetTitle>Menu</SheetTitle>
          </SheetHeader>

          <nav className="overflow-y-auto px-2 py-2" aria-label="Mais opções">
            {moreLinks.map(({ href, label, shortLabel, icon: Icon, feature }) => {
              const active =
                pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
              const locked = !hasPlanAccess(planId, feature);
              const limited = isLimitedPlanFeature(planId, feature);
              const limitedHint = getLimitedPlanFeatureHint(feature);
              const displayLabel = shortLabel ?? label;

              return (
                <Link
                  key={href}
                  href={href}
                  prefetch={false}
                  onClick={() => setMoreOpen(false)}
                  title={limited ? (limitedHint ?? undefined) : undefined}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-medium transition-colors",
                    active
                      ? "bg-brand/10 text-brand"
                      : "text-foreground hover:bg-muted",
                    locked && !active && "opacity-80",
                  )}
                >
                  <Icon
                    className={cn(
                      "size-5 shrink-0",
                      active ? "text-brand" : "text-muted-foreground",
                    )}
                    aria-hidden
                  />
                  <span className="min-w-0 flex-1 truncate">{displayLabel}</span>
                  {limited && (
                    <span
                      className="flex shrink-0 items-center gap-1.5"
                      title={limitedHint ?? "Bônus limitado"}
                    >
                      <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-1.5 py-0.5 text-[0.625rem] font-semibold uppercase tracking-wide text-emerald-700 dark:border-emerald-500/25 dark:text-emerald-400">
                        Bônus
                      </span>
                      <PlanLimitedIcon title={limitedHint ?? "Bônus limitado"} />
                    </span>
                  )}
                  {locked && <PlanLockIcon className="shrink-0" />}
                </Link>
              );
            })}

            {isAdmin && (
              <Link
                href="/admin"
                onClick={() => setMoreOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-medium transition-colors",
                  pathname === "/admin" || pathname.startsWith("/admin/")
                    ? "bg-violet-500/10 text-violet-600 dark:text-violet-300"
                    : "text-foreground hover:bg-muted",
                )}
              >
                <ShieldCheck className="size-5 shrink-0 text-violet-500" aria-hidden />
                <span className="min-w-0 flex-1 truncate">Admin</span>
              </Link>
            )}
          </nav>

          <div className="mt-auto border-t border-border px-2 py-2">
            <a
              href={SUPPORT_WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setMoreOpen(false)}
              className="flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <HelpCircle className="size-5 shrink-0" aria-hidden />
              Precisando de ajuda?
            </a>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
