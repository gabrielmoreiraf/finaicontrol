"use client";

import { BalanceToggle } from "@/components/app/balance-visibility";
import { NotificationsMenu } from "@/components/app/notifications-menu";
import { ThemeToggle } from "@/components/app/theme-toggle";
import { UserAccountMenu } from "@/components/app/user-account-menu";
import type { AppNotification } from "@/lib/notifications";
import { cn } from "@/lib/utils";
import type { SubscriptionPlan } from "@/types/finance";

type AppTopbarProps = {
  userName: string;
  avatarUrl?: string | null;
  planLabel?: string;
  planId?: SubscriptionPlan;
  planHighlighted?: boolean;
  isAdmin?: boolean;
  notifications?: AppNotification[];
  showGreeting?: boolean;
  greeting?: string;
  subtitle?: string;
};

export function AppTopbar({
  userName,
  avatarUrl,
  planLabel,
  planId = "free",
  planHighlighted = false,
  isAdmin = false,
  notifications = [],
  showGreeting = false,
  greeting,
  subtitle,
}: AppTopbarProps) {
  const firstName = userName.split(" ")[0] ?? userName;

  return (
    <header className="shrink-0 border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="flex h-[4.25rem] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        {showGreeting ? (
          <div className="min-w-0">
            <h1 className="truncate text-lg font-bold tracking-tight sm:text-xl">
              {greeting}, {firstName} 👋
            </h1>
            {subtitle && (
              <p className="truncate text-xs text-muted-foreground sm:text-sm">{subtitle}</p>
            )}
          </div>
        ) : (
          <UserAccountMenu
            userName={userName}
            avatarUrl={avatarUrl}
            planLabel={planLabel}
            planId={planId}
            planHighlighted={planHighlighted}
            compact
            className="lg:hidden"
          />
        )}

        <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
          <BalanceToggle />

          <NotificationsMenu notifications={notifications} />

          <ThemeToggle variant="icon" className="size-10 rounded-xl" />

          <UserAccountMenu
            userName={userName}
            avatarUrl={avatarUrl}
            planLabel={planLabel}
            planId={planId}
            planHighlighted={planHighlighted}
            isAdmin={isAdmin}
            className="ml-1 hidden lg:flex"
          />
        </div>
      </div>
    </header>
  );
}

export function AppTopbarGreeting({
  className,
  ...props
}: AppTopbarProps & { className?: string }) {
  return (
    <div className={cn("border-b border-border bg-background/40 lg:hidden", className)}>
      <AppTopbar showGreeting {...props} />
    </div>
  );
}
