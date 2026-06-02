"use client";

import type { LucideIcon } from "lucide-react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export function SettingsField({
  id,
  label,
  icon: Icon,
  children,
  trailing,
  className,
}: {
  id?: string;
  label: string;
  icon: LucideIcon;
  children: React.ReactNode;
  trailing?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor={id} className="text-sm font-medium">
        {label}
      </Label>
      <div className="flex items-center rounded-xl border border-white/10 bg-white/[0.02] transition-colors focus-within:border-brand/40 focus-within:ring-2 focus-within:ring-brand/15">
        <Icon className="ml-3 size-4 shrink-0 text-muted-foreground" aria-hidden />
        <div className="min-w-0 flex-1">{children}</div>
        {trailing ? <div className="mr-3 shrink-0">{trailing}</div> : null}
      </div>
    </div>
  );
}

export const settingsInputClass =
  "w-full bg-transparent px-3 py-2.5 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-default disabled:text-muted-foreground";
