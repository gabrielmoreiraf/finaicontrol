"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Bell, CheckCheck, AlertTriangle, Info, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { AppNotification } from "@/lib/notifications";
import { cn } from "@/lib/utils";

const READ_STORAGE_KEY = "finia-read-notifications";

const TYPE_STYLES = {
  warning: {
    icon: AlertTriangle,
    dot: "bg-amber-500 dark:bg-amber-400",
    border: "border-amber-200 bg-amber-50 dark:border-amber-500/20 dark:bg-amber-500/5",
    iconColor: "text-amber-700 dark:text-amber-400",
  },
  info: {
    icon: Info,
    dot: "bg-sky-500 dark:bg-sky-400",
    border: "border-border bg-muted/40 dark:border-white/8 dark:bg-white/[0.03]",
    iconColor: "text-sky-700 dark:text-sky-400",
  },
  success: {
    icon: Sparkles,
    dot: "bg-brand",
    border: "border-brand/20 bg-brand/5",
    iconColor: "text-brand",
  },
} as const;

export function NotificationsMenu({
  notifications,
}: {
  notifications: AppNotification[];
}) {
  const [readIds, setReadIds] = useState<Set<string>>(new Set());
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(READ_STORAGE_KEY);
      if (stored) setReadIds(new Set(JSON.parse(stored) as string[]));
    } catch {
      setReadIds(new Set());
    }
  }, []);

  const actionable = useMemo(
    () => notifications.filter((item) => item.id !== "empty"),
    [notifications],
  );

  const unreadCount = useMemo(
    () => actionable.filter((item) => !readIds.has(item.id)).length,
    [actionable, readIds],
  );

  function persistReadIds(next: Set<string>) {
    setReadIds(next);
    localStorage.setItem(READ_STORAGE_KEY, JSON.stringify([...next]));
  }

  function markAsRead(id: string) {
    const next = new Set(readIds);
    next.add(id);
    persistReadIds(next);
  }

  function markAllAsRead() {
    persistReadIds(new Set(actionable.map((item) => item.id)));
  }

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (nextOpen && unreadCount > 0) {
      markAllAsRead();
    }
  }

  return (
    <DropdownMenu open={open} onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative size-10 rounded-xl text-muted-foreground hover:text-foreground"
          aria-label={unreadCount > 0 ? `${unreadCount} notificações não lidas` : "Notificações"}
        >
          <Bell className="size-[1.125rem]" />
          {unreadCount > 0 && (
            <span className="absolute right-2 top-2 flex size-2 items-center justify-center">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-brand opacity-60" />
              <span className="relative size-2 rounded-full bg-brand shadow-[0_0_8px_rgba(0,230,118,0.8)]" />
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-[min(22rem,calc(100vw-2rem))] p-0">
        <div className="flex items-center justify-between border-b border-border px-3 py-2.5 dark:border-white/[0.08]">
          <DropdownMenuLabel className="p-0 text-sm font-semibold">Notificações</DropdownMenuLabel>
          {actionable.length > 0 && unreadCount > 0 && (
            <button
              type="button"
              onClick={markAllAsRead}
              className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[0.6875rem] font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground dark:hover:bg-white/[0.06]"
            >
              <CheckCheck className="size-3.5" aria-hidden />
              Marcar lidas
            </button>
          )}
        </div>

        <div className="max-h-[min(24rem,50dvh)] overflow-y-auto finia-scroll p-1.5">
          {notifications.map((item) => {
            const styles = TYPE_STYLES[item.type];
            const Icon = styles.icon;
            const isUnread = item.id !== "empty" && !readIds.has(item.id);

            const content = (
              <div
                className={cn(
                  "flex gap-3 rounded-lg border p-3 transition-colors",
                  styles.border,
                  isUnread && "ring-1 ring-brand/20",
                )}
              >
                <div
                  className={cn(
                    "flex size-8 shrink-0 items-center justify-center rounded-lg bg-black/20",
                    styles.iconColor,
                  )}
                >
                  <Icon className="size-4" aria-hidden />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-semibold leading-snug">{item.title}</p>
                    {item.timeLabel && (
                      <span className="shrink-0 text-[0.625rem] text-muted-foreground">
                        {item.timeLabel}
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                    {item.message}
                  </p>
                </div>
                {isUnread && (
                  <span className={cn("mt-1 size-2 shrink-0 rounded-full", styles.dot)} aria-hidden />
                )}
              </div>
            );

            if (item.href && item.id !== "empty") {
              return (
                <DropdownMenuItem key={item.id} asChild className="cursor-pointer p-1 focus:bg-transparent">
                  <Link href={item.href} onClick={() => markAsRead(item.id)}>
                    {content}
                  </Link>
                </DropdownMenuItem>
              );
            }

            return (
              <DropdownMenuItem
                key={item.id}
                className="cursor-default p-1 focus:bg-transparent"
                onSelect={(event) => event.preventDefault()}
              >
                {content}
              </DropdownMenuItem>
            );
          })}
        </div>

        <DropdownMenuSeparator className="m-0" />

        <div className="p-1.5">
          <DropdownMenuItem asChild className="cursor-pointer">
            <Link href="/dashboard" className="justify-center text-center text-xs text-muted-foreground">
              Ver tudo no dashboard
            </Link>
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
