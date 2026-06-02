"use client";

import { useState } from "react";
import { settingsInputClass } from "@/components/app/settings-field";
import {
  centsToNumber,
  formatCentsAsBrl,
  numberToCents,
  digitsToCents,
} from "@/lib/finance/currency-input";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

const controlClass =
  "h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-foreground/45 outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30 dark:placeholder:text-muted-foreground";

type CurrencyInputProps = {
  id?: string;
  name: string;
  defaultValue?: string | number | null;
  value?: string;
  onValueChange?: (value: string) => void;
  required?: boolean;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  /** Sem borda própria, para uso dentro de SettingsField. */
  embedded?: boolean;
};

export function CurrencyInput({
  id,
  name,
  defaultValue,
  value,
  onValueChange,
  required,
  placeholder = "R$ 0,00",
  className,
  disabled = false,
  embedded = false,
}: CurrencyInputProps) {
  const isControlled = value !== undefined;
  const initialCents =
    defaultValue !== undefined && defaultValue !== null && defaultValue !== ""
      ? numberToCents(Number(defaultValue))
      : isControlled && value
        ? numberToCents(Number(value))
        : 0;

  const [cents, setCents] = useState(initialCents);
  const activeCents =
    isControlled && value !== undefined && value !== ""
      ? numberToCents(Number(value))
      : cents;
  const display =
    activeCents > 0 ? formatCentsAsBrl(activeCents) : disabled ? formatCentsAsBrl(0) : "";

  const sharedProps = {
    id,
    inputMode: "numeric" as const,
    autoComplete: "off",
    required: required && activeCents <= 0,
    placeholder,
    value: display,
    disabled,
    readOnly: disabled,
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => {
      const nextCents = digitsToCents(event.target.value);
      if (!isControlled) setCents(nextCents);
      onValueChange?.(centsToNumber(nextCents).toFixed(2));
    },
  };

  return (
    <>
      <input type="hidden" name={name} value={centsToNumber(activeCents).toFixed(2)} />
      {embedded ? (
        <input
          {...sharedProps}
          className={cn(
            settingsInputClass,
            "tabular-nums",
            disabled && "cursor-default text-muted-foreground",
            className,
          )}
        />
      ) : (
        <Input {...sharedProps} className={cn(controlClass, className)} />
      )}
    </>
  );
}

export { controlClass as fieldControlClass };
