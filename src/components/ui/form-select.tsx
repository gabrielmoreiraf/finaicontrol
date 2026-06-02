"use client";

import { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { fieldControlClass } from "@/components/ui/currency-input";
import { cn } from "@/lib/utils";

type FormSelectOption = { value: string; label: string };

type FormSelectProps = {
  id?: string;
  name: string;
  options: FormSelectOption[];
  value?: string;
  defaultValue?: string | null;
  onValueChange?: (value: string) => void;
  required?: boolean;
  placeholder?: string;
};

export function FormSelect({
  id,
  name,
  options,
  value,
  defaultValue,
  onValueChange,
  required,
  placeholder = "Selecione...",
}: FormSelectProps) {
  const fallback = defaultValue ?? options[0]?.value ?? "";
  const [internalValue, setInternalValue] = useState(fallback);
  const currentValue = value ?? internalValue;

  useEffect(() => {
    if (value !== undefined) return;
    setInternalValue(fallback);
  }, [fallback, value]);

  function handleChange(nextValue: string) {
    if (value === undefined) setInternalValue(nextValue);
    onValueChange?.(nextValue);
  }

  return (
    <>
      <input type="hidden" name={name} value={currentValue} required={required && !currentValue} />
      <div className="w-full">
        <Select value={currentValue} onValueChange={handleChange}>
          <SelectTrigger id={id} className={cn(fieldControlClass, "h-10 data-[size=default]:h-10")}>
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent
            position="popper"
            className="z-[9999] bg-popover text-popover-foreground"
          >
            {options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </>
  );
}
