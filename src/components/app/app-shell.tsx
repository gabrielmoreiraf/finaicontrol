"use client";

import { AppSidebar } from "@/components/app/app-sidebar";
import { AppTopbar } from "@/components/app/app-topbar";
import { BalanceToggle, BalanceVisibilityProvider } from "@/components/app/balance-visibility";
import { MobileBottomNav } from "@/components/app/mobile-bottom-nav";
import { NotificationsMenu } from "@/components/app/notifications-menu";
import { ThemeToggle } from "@/components/app/theme-toggle";
import { UserAccountMenu } from "@/components/app/user-account-menu";
import { BrandLogo } from "@/components/brand/brand-logo";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { AppNotification } from "@/lib/notifications";
import type { SubscriptionPlan } from "@/types/finance";

const mobileSafeX =
  "pl-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))]";

export function AppShell({
  children,
  userName,
  avatarUrl,
  planLabel,
  planId = "free",
  planHighlighted = false,
  isAdmin = false,
  loansEnabled = false,
  notifications = [],
}: {
  children: React.ReactNode;
  userName: string;
  avatarUrl?: string | null;
  planLabel?: string;
  planId?: SubscriptionPlan;
  planHighlighted?: boolean;
  isAdmin?: boolean;
  loansEnabled?: boolean;
  notifications?: AppNotification[];
}) {
  return (
    <BalanceVisibilityProvider>
    <div className="app-shell relative flex h-dvh flex-col overflow-hidden bg-background">
      <AppSidebar planId={planId} isAdmin={isAdmin} loansEnabled={loansEnabled} />

      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <header className="relative z-30 shrink-0 border-b border-border bg-background pt-[env(safe-area-inset-top)] lg:hidden">
          <div
            className={`grid h-14 grid-cols-[minmax(0,1fr)_auto] items-center gap-2 ${mobileSafeX}`}
          >
            <BrandLogo
              variant="full"
              size="lg"
              href="/dashboard"
              className="flex h-full min-w-0 max-w-full items-center justify-self-start"
              imageClassName="!h-full !max-h-14 !w-auto !max-w-full object-contain object-left"
            />
            <div className="relative z-10 flex shrink-0 items-center gap-0.5 bg-background/95 pl-1 sm:gap-1">
              <BalanceToggle className="size-9 sm:size-10" />
              <NotificationsMenu notifications={notifications} />
              <ThemeToggle
                variant="icon"
                className="size-9 rounded-xl sm:size-10"
              />
              <UserAccountMenu
                userName={userName}
                avatarUrl={avatarUrl}
                planLabel={planLabel}
                planId={planId}
                planHighlighted={planHighlighted}
                isAdmin={isAdmin}
                avatarOnly
                className="ml-0.5"
              />
            </div>
          </div>
        </header>

        <div className="hidden lg:block">
          <AppTopbar
            userName={userName}
            avatarUrl={avatarUrl}
            planLabel={planLabel}
            planId={planId}
            planHighlighted={planHighlighted}
            isAdmin={isAdmin}
            notifications={notifications}
          />
        </div>

        <ScrollArea className="min-w-0">
          <main className="app-main flex min-h-full min-w-0 flex-col overflow-x-hidden pb-[calc(4.75rem+env(safe-area-inset-bottom))] lg:min-h-0 lg:pb-8 lg:[&:has(.data-page)]:h-full">
            <div
              className={`mx-auto flex min-h-full w-full max-w-[1400px] flex-1 flex-col py-5 sm:px-6 sm:py-6 lg:min-h-0 lg:py-8 lg:[&:has(.data-page)]:h-full ${mobileSafeX}`}
            >
              {children}
            </div>
          </main>
        </ScrollArea>
      </div>

      <MobileBottomNav planId={planId} isAdmin={isAdmin} loansEnabled={loansEnabled} />
    </div>
    </BalanceVisibilityProvider>
  );
}
