"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "finia-hide-values";

type BalanceVisibility = { hidden: boolean; toggle: () => void };

const BalanceVisibilityContext = createContext<BalanceVisibility>({
  hidden: false,
  toggle: () => {},
});

export function BalanceVisibilityProvider({ children }: { children: React.ReactNode }) {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    // Hidrata do localStorage só após o mount (evita mismatch de SSR).
    try {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setHidden(localStorage.getItem(STORAGE_KEY) === "1");
    } catch {
      /* ignore */
    }
  }, []);

  function toggle() {
    setHidden((current) => {
      const next = !current;
      try {
        localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
      } catch {
        /* ignore */
      }
      return next;
    });
  }

  return (
    <BalanceVisibilityContext.Provider value={{ hidden, toggle }}>
      {children}
    </BalanceVisibilityContext.Provider>
  );
}

export function useBalanceVisibility() {
  return useContext(BalanceVisibilityContext);
}

/** Envolve um valor monetário: aplica blur quando o modo "ocultar valores" está ativo. */
export function Amount({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const { hidden } = useBalanceVisibility();
  return (
    <span
      className={cn(
        "transition-[filter] duration-150",
        hidden && "pointer-events-none select-none blur-[7px]",
        className,
      )}
      title={hidden ? "Valor oculto" : undefined}
    >
      {children}
    </span>
  );
}

/** Botão de olho no header para ocultar/mostrar todos os valores. */
export function BalanceToggle({ className }: { className?: string }) {
  const { hidden, toggle } = useBalanceVisibility();
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={toggle}
      className={cn(
        "size-10 rounded-xl text-muted-foreground hover:text-foreground",
        className,
      )}
      aria-pressed={hidden}
      aria-label={hidden ? "Mostrar valores" : "Ocultar valores"}
      title={hidden ? "Mostrar valores" : "Ocultar valores"}
    >
      {hidden ? <EyeOff className="size-[1.125rem]" /> : <Eye className="size-[1.125rem]" />}
    </Button>
  );
}
