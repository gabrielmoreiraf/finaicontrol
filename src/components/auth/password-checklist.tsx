"use client";

import { Check, X } from "lucide-react";
import { PASSWORD_RULES } from "@/lib/auth/password-policy";
import { cn } from "@/lib/utils";

/** Mostra as regras de senha e marca em tempo real quais já foram atendidas. */
export function PasswordChecklist({
  password,
  className,
}: {
  password: string;
  className?: string;
}) {
  if (!password) return null;
  return (
    <ul className={cn("grid gap-1", className)} aria-label="Requisitos da senha">
      {PASSWORD_RULES.map((rule) => {
        const ok = rule.test(password);
        return (
          <li
            key={rule.id}
            className={cn(
              "flex items-center gap-1.5 transition-colors",
              ok ? "text-brand" : "text-muted-foreground",
            )}
            style={{ fontSize: "0.78em" }}
          >
            {ok ? (
              <Check className="size-3.5 shrink-0" aria-hidden />
            ) : (
              <X className="size-3.5 shrink-0 opacity-50" aria-hidden />
            )}
            {rule.label}
          </li>
        );
      })}
    </ul>
  );
}
