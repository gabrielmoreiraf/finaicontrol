"use client";

import Link from "next/link";
import { ChevronDown, LogOut, Settings, ShieldCheck } from "lucide-react";
import { PlanBadge } from "@/components/app/plan-badge";
import { UserAvatar } from "@/components/app/premium/user-avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { signOutAction } from "@/lib/actions/auth";
import type { SubscriptionPlan } from "@/types/finance";
import { getUserShortName } from "@/lib/user/initials";
import { cn } from "@/lib/utils";

type UserAccountMenuProps = {
  userName: string;
  avatarUrl?: string | null;
  planLabel?: string;
  planId?: SubscriptionPlan;
  planHighlighted?: boolean;
  className?: string;
  compact?: boolean;
  /** Só avatar no gatilho, ideal para topbar mobile estreita */
  avatarOnly?: boolean;
  isAdmin?: boolean;
};

export function UserAccountMenu({
  userName,
  avatarUrl,
  planLabel,
  planId = "free",
  planHighlighted = false,
  className,
  compact = false,
  avatarOnly = false,
  isAdmin = false,
}: UserAccountMenuProps) {
  const displayName = getUserShortName(userName);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={cn(
            "group flex items-center rounded-xl border border-border bg-card text-left outline-none transition-all",
            "hover:border-border hover:bg-muted/50 focus-visible:border-brand/30 focus-visible:ring-2 focus-visible:ring-brand/20 dark:border-white/[0.06] dark:bg-card/60 dark:hover:border-white/12 dark:hover:bg-card/80",
            avatarOnly
              ? "size-10 shrink-0 justify-center p-0"
              : cn(
                  "gap-2.5 py-1.5 pl-1.5 pr-2.5",
                  compact ? "max-w-[11rem]" : "max-w-[12.5rem] sm:max-w-none",
                ),
            className,
          )}
          aria-label="Menu da conta"
        >
          <UserAvatar
            name={userName}
            imageUrl={avatarUrl}
            size={avatarOnly ? "sm" : compact ? "sm" : "md"}
            className={cn("shrink-0", !avatarOnly && compact && "ml-0")}
          />
          {!avatarOnly && (
            <>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold leading-tight">{displayName}</p>
                {planLabel && (
                  <PlanBadge
                    label={planLabel}
                    planId={planId}
                    highlighted={planHighlighted}
                    admin={isAdmin}
                    className="mt-1"
                  />
                )}
              </div>
              <ChevronDown
                className="size-4 shrink-0 text-muted-foreground transition-transform group-data-[state=open]:rotate-180"
                aria-hidden
              />
            </>
          )}
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56">
        {avatarOnly && (
          <div className="border-b border-border px-3 py-2.5 dark:border-white/8">
            <p className="truncate text-sm font-semibold">{displayName}</p>
            {planLabel && (
              <PlanBadge
                label={planLabel}
                planId={planId}
                highlighted={planHighlighted}
                admin={isAdmin}
                className="mt-1.5"
              />
            )}
          </div>
        )}
        {isAdmin && (
          <DropdownMenuItem asChild>
            <Link href="/admin" className="cursor-pointer">
              <ShieldCheck className="size-4 text-violet-500" aria-hidden />
              Painel Admin
            </Link>
          </DropdownMenuItem>
        )}
        <DropdownMenuItem asChild>
          <Link href="/configuracoes" className="cursor-pointer">
            <Settings className="size-4 text-muted-foreground" aria-hidden />
            Configurações
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          className="p-0 focus:bg-transparent data-[highlighted]:bg-transparent"
          onSelect={(event) => event.preventDefault()}
        >
          <form action={signOutAction} className="w-full">
            <button
              type="submit"
              className="flex w-full cursor-pointer items-center gap-2 rounded-lg px-2.5 py-2 text-sm text-red-400 outline-none transition-colors hover:bg-red-500/10"
            >
              <LogOut className="size-4" aria-hidden />
              Sair da conta
            </button>
          </form>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
