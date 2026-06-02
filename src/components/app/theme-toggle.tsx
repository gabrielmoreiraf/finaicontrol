"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useTheme } from "@teispace/next-themes";

type ThemeToggleProps = {
  variant?: "sidebar" | "icon";
  className?: string;
};

export function ThemeToggle({ variant = "sidebar", className }: ThemeToggleProps) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return variant === "icon" ? (
      <div className={cn("size-9", className)} aria-hidden />
    ) : (
      <div className={cn("h-10", className)} aria-hidden />
    );
  }

  const isDark = resolvedTheme === "dark";

  if (variant === "icon") {
    return (
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className={className}
        aria-label={isDark ? "Ativar modo claro" : "Ativar modo escuro"}
        onClick={() => setTheme(isDark ? "light" : "dark")}
      >
        {isDark ? <Sun className="size-5" /> : <Moon className="size-5" />}
      </Button>
    );
  }

  return (
    <button
      type="button"
      className={cn(
        "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground",
        className,
      )}
      aria-label={isDark ? "Ativar modo claro" : "Ativar modo escuro"}
      onClick={() => setTheme(isDark ? "light" : "dark")}
    >
      {isDark ? (
        <Sun className="size-4.5 shrink-0" aria-hidden />
      ) : (
        <Moon className="size-4.5 shrink-0" aria-hidden />
      )}
      {isDark ? "Modo claro" : "Modo escuro"}
    </button>
  );
}
