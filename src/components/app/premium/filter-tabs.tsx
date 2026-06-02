"use client";

import { cn } from "@/lib/utils";

export type FilterTab = {
  id: string;
  label: string;
  count?: number;
};

export function FilterTabs({
  tabs,
  active,
  onChange,
  className,
}: {
  tabs: FilterTab[];
  active: string;
  onChange: (id: string) => void;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "inline-flex flex-wrap gap-1 rounded-xl border border-border bg-muted/50 p-1 dark:border-white/[0.06] dark:bg-muted/30",
        className,
      )}
    >
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onChange(tab.id)}
          className={cn(
            "inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium transition-all",
            active === tab.id
              ? "bg-brand/15 text-brand shadow-sm"
              : "text-foreground/75 hover:bg-background hover:text-foreground dark:text-muted-foreground dark:hover:bg-background/60",
          )}
        >
          {tab.label}
          {tab.count !== undefined && (
            <span
              className={cn(
                "rounded-md px-1.5 py-0.5 text-xs",
                active === tab.id ? "bg-brand/20 text-brand" : "border border-border/60 bg-background text-foreground/70",
              )}
            >
              {tab.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
