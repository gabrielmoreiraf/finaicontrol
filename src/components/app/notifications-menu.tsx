"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, Bell, BellOff, Info, Sparkles, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { AppNotification } from "@/lib/notifications";
import { cn } from "@/lib/utils";

const DISMISSED_STORAGE_KEY = "finia-dismissed-notifications";

const TYPE_STYLES = {
  warning: {
    icon: AlertTriangle,
    border: "border-amber-200 bg-amber-50 dark:border-amber-500/20 dark:bg-amber-500/5",
    iconColor: "text-amber-700 dark:text-amber-400",
  },
  info: {
    icon: Info,
    border: "border-border bg-muted/40 dark:border-white/8 dark:bg-white/[0.03]",
    iconColor: "text-sky-700 dark:text-sky-400",
  },
  success: {
    icon: Sparkles,
    border: "border-brand/20 bg-brand/5",
    iconColor: "text-brand",
  },
} as const;

export function NotificationsMenu({
  notifications,
}: {
  notifications: AppNotification[];
}) {
  const router = useRouter();
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(DISMISSED_STORAGE_KEY);
      if (stored) setDismissedIds(new Set(JSON.parse(stored) as string[]));
    } catch {
      setDismissedIds(new Set());
    }
  }, []);

  // Notificações reais (sem o placeholder "empty") ainda não dispensadas.
  const visible = useMemo(
    () =>
      notifications.filter(
        (item) => item.id !== "empty" && !dismissedIds.has(item.id),
      ),
    [notifications, dismissedIds],
  );

  function persist(next: Set<string>) {
    setDismissedIds(next);
    try {
      localStorage.setItem(DISMISSED_STORAGE_KEY, JSON.stringify([...next]));
    } catch {
      /* ignore */
    }
  }

  function dismiss(id: string) {
    const next = new Set(dismissedIds);
    next.add(id);
    persist(next);
  }

  function dismissAll() {
    const next = new Set(dismissedIds);
    visible.forEach((item) => next.add(item.id));
    persist(next);
  }

  const count = visible.length;

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative size-10 rounded-xl text-muted-foreground hover:text-foreground"
          aria-label={count > 0 ? `${count} notificações` : "Notificações"}
        >
          <Bell className="size-[1.125rem]" />
          {count > 0 && (
            <span className="absolute right-1.5 top-1.5 flex min-w-4 items-center justify-center rounded-full bg-brand px-1 text-[0.625rem] font-bold leading-none text-brand-foreground shadow-[0_0_8px_rgba(0,230,118,0.6)]">
              {count > 9 ? "9+" : count}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-[min(22rem,calc(100vw-2rem))] p-0">
        <div className="flex items-center justify-between border-b border-border px-3 py-2.5 dark:border-white/[0.08]">
          <DropdownMenuLabel className="p-0 text-sm font-semibold">
            Notificações
          </DropdownMenuLabel>
          {count > 0 && (
            <button
              type="button"
              onClick={dismissAll}
              className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[0.6875rem] font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground dark:hover:bg-white/[0.06]"
            >
              <Trash2 className="size-3.5" aria-hidden />
              Limpar tudo
            </button>
          )}
        </div>

        <div className="finia-scroll max-h-[min(24rem,50dvh)] overflow-y-auto p-1.5">
          {count === 0 ? (
            <div className="flex flex-col items-center gap-2 px-4 py-8 text-center">
              <BellOff className="size-7 text-muted-foreground/60" aria-hidden />
              <p className="text-sm font-medium">Tudo em dia</p>
              <p className="text-xs text-muted-foreground">
                Você não tem notificações no momento.
              </p>
            </div>
          ) : (
            visible.map((item) => {
              const styles = TYPE_STYLES[item.type];
              const Icon = styles.icon;
              const clickable = Boolean(item.href);

              return (
                <div
                  key={item.id}
                  className={cn(
                    "group/notif relative mb-1 flex gap-3 rounded-lg border p-3 transition-colors last:mb-0",
                    styles.border,
                    clickable && "cursor-pointer hover:brightness-110",
                  )}
                  role={clickable ? "button" : undefined}
                  tabIndex={clickable ? 0 : undefined}
                  onClick={
                    clickable
                      ? () => {
                          setOpen(false);
                          router.push(item.href!);
                        }
                      : undefined
                  }
                  onKeyDown={
                    clickable
                      ? (event) => {
                          if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault();
                            setOpen(false);
                            router.push(item.href!);
                          }
                        }
                      : undefined
                  }
                >
                  <div
                    className={cn(
                      "flex size-8 shrink-0 items-center justify-center rounded-lg bg-black/20",
                      styles.iconColor,
                    )}
                  >
                    <Icon className="size-4" aria-hidden />
                  </div>
                  <div className="min-w-0 flex-1 pr-5">
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

                  <button
                    type="button"
                    aria-label="Dispensar notificação"
                    onClick={(event) => {
                      event.stopPropagation();
                      dismiss(item.id);
                    }}
                    className="absolute right-1.5 top-1.5 flex size-6 items-center justify-center rounded-md text-muted-foreground/70 opacity-0 transition-all hover:bg-black/20 hover:text-foreground focus-visible:opacity-100 group-hover/notif:opacity-100"
                  >
                    <X className="size-3.5" aria-hidden />
                  </button>
                </div>
              );
            })
          )}
        </div>

        <DropdownMenuSeparator className="m-0" />

        <div className="px-3 py-2 text-center">
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              router.push("/dashboard");
            }}
            className="text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            Ver tudo no dashboard
          </button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
