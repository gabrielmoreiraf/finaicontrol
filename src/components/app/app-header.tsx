"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut } from "lucide-react";
import { APP_NAV_LINKS } from "@/components/app/app-nav-links";
import { PlanBadge } from "@/components/app/plan-badge";
import { ThemeToggle } from "@/components/app/theme-toggle";
import { BrandLogo } from "@/components/brand/brand-logo";
import { signOutAction } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type AppHeaderProps = {
  userName: string;
  planLabel?: string;
  planHighlighted?: boolean;
};

export function AppHeader({
  userName,
  planLabel,
  planHighlighted = false,
}: AppHeaderProps) {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-border/50 bg-background/95 backdrop-blur-xl">
      <div className="mx-auto flex max-w-[1600px] items-center gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <BrandLogo
          variant="full"
          size="md"
          href="/dashboard"
          className="shrink-0"
          imageClassName="!h-11 !w-auto !max-w-[min(55vw,260px)] object-contain sm:!h-12 lg:!h-[3.25rem] lg:!max-w-[280px]"
        />

        <div className="ml-auto flex shrink-0 items-center gap-2 sm:gap-3">
          <div className="hidden flex-col items-end gap-1.5 sm:flex">
            <span className="max-w-[11rem] truncate text-sm font-semibold text-foreground lg:max-w-[14rem] lg:text-base">
              Olá, {userName}
            </span>
            {planLabel && (
              <PlanBadge label={planLabel} highlighted={planHighlighted} className="text-xs lg:text-sm" />
            )}
          </div>

          <ThemeToggle variant="icon" className="size-11" />

          <form action={signOutAction}>
            <Button
              type="submit"
              variant="outline"
              size="default"
              className="h-11 gap-2 px-3 text-sm sm:px-4"
            >
              <LogOut className="size-4" aria-hidden />
              <span className="hidden sm:inline">Sair</span>
            </Button>
          </form>
        </div>
      </div>

      <nav
        className="border-t border-border/40 bg-muted/25"
        aria-label="Navegação principal"
      >
        <div className="mx-auto flex max-w-[1600px] gap-1 overflow-x-auto px-3 py-2 sm:gap-1.5 sm:px-6 lg:px-8 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {APP_NAV_LINKS.map(({ href, label, shortLabel, icon: Icon }) => {
            const active = pathname === href;
            const displayLabel = shortLabel ?? label;

            return (
              <Link
                key={href}
                href={href}
                title={label}
                className={cn(
                  "inline-flex shrink-0 items-center gap-2 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors sm:px-4 sm:py-3 sm:text-[0.9375rem] lg:text-base",
                  active
                    ? "bg-brand/15 text-brand shadow-sm"
                    : "text-muted-foreground hover:bg-background/80 hover:text-foreground",
                )}
              >
                <Icon className="size-[1.125rem] shrink-0 sm:size-5" aria-hidden />
                <span className="sm:hidden">{displayLabel}</span>
                <span className="hidden sm:inline">{label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      <div className="flex items-center justify-between gap-3 border-t border-border/40 px-4 py-2 sm:hidden">
        <span className="truncate text-sm font-semibold">Olá, {userName}</span>
        {planLabel && (
          <PlanBadge label={planLabel} highlighted={planHighlighted} className="shrink-0 text-xs" />
        )}
      </div>
    </header>
  );
}
