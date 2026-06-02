"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronDown } from "lucide-react";
import { fieldControlClass } from "@/components/ui/currency-input";
import { uniqueCategoryNames } from "@/lib/finance/category-names";
import { cn } from "@/lib/utils";

type ExpenseCategoryComboboxProps = {
  id?: string;
  name: string;
  categories: string[];
  defaultValue?: string | null;
  required?: boolean;
  placeholder?: string;
};

type DropdownPosition = {
  top: number;
  left: number;
  width: number;
};

export function ExpenseCategoryCombobox({
  id,
  name,
  categories,
  defaultValue,
  required,
  placeholder = "Ex: Moradia",
}: ExpenseCategoryComboboxProps) {
  const [value, setValue] = useState(defaultValue ?? "");
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [mounted, setMounted] = useState(false);
  const [position, setPosition] = useState<DropdownPosition | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLUListElement>(null);

  const uniqueCategories = useMemo(() => uniqueCategoryNames(categories), [categories]);

  const suggestions = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return uniqueCategories;
    return uniqueCategories.filter((category) => category.toLowerCase().includes(normalized));
  }, [uniqueCategories, query]);

  const trimmed = value.trim();
  const showCreate =
    trimmed.length > 0 &&
    !uniqueCategories.some((category) => category.toLowerCase() === trimmed.toLowerCase());

  const showDropdown = open && (suggestions.length > 0 || showCreate);

  useEffect(() => setMounted(true), []);

  function updatePosition() {
    const input = inputRef.current;
    if (!input) return;

    const rect = input.getBoundingClientRect();
    setPosition({
      top: rect.bottom + 4,
      left: rect.left,
      width: rect.width,
    });
  }

  useLayoutEffect(() => {
    if (!showDropdown) return;

    updatePosition();

    const handleReposition = () => updatePosition();
    window.addEventListener("scroll", handleReposition, true);
    window.addEventListener("resize", handleReposition);

    return () => {
      window.removeEventListener("scroll", handleReposition, true);
      window.removeEventListener("resize", handleReposition);
    };
  }, [showDropdown, suggestions.length, showCreate]);

  function closeDropdown() {
    setOpen(false);
    setQuery("");
  }

  function selectCategory(category: string) {
    setValue(category);
    closeDropdown();
  }

  function handleBlur() {
    window.setTimeout(() => {
      const active = document.activeElement;
      if (inputRef.current === active || dropdownRef.current?.contains(active)) return;
      closeDropdown();
    }, 150);
  }

  const dropdown =
    showDropdown && position ? (
      <ul
        ref={dropdownRef}
        role="listbox"
        style={{
          position: "fixed",
          top: position.top,
          left: position.left,
          width: position.width,
          zIndex: 9999,
        }}
        className="finia-scroll max-h-48 overflow-y-auto rounded-lg border border-border bg-popover py-1 text-popover-foreground shadow-md"
      >
        {suggestions.map((category) => (
          <li key={category}>
            <button
              type="button"
              role="option"
              className="w-full px-3 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => selectCategory(category)}
            >
              {category}
            </button>
          </li>
        ))}
        {showCreate && (
          <li>
            <button
              type="button"
              className="w-full px-3 py-2 text-left text-sm text-brand hover:bg-accent hover:text-accent-foreground"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => selectCategory(trimmed)}
            >
              Criar &quot;{trimmed}&quot;
            </button>
          </li>
        )}
      </ul>
    ) : null;

  return (
    <>
      <div className="relative">
        <input type="hidden" name={name} value={value} />
        <input
          ref={inputRef}
          id={id}
          role="combobox"
          aria-expanded={open}
          aria-autocomplete="list"
          value={open ? query : value}
          onChange={(event) => {
            setQuery(event.target.value);
            setValue(event.target.value);
            setOpen(true);
          }}
          onFocus={() => {
            setQuery(value);
            setOpen(true);
          }}
          onBlur={handleBlur}
          required={required && !value.trim()}
          placeholder={placeholder}
          className={cn(fieldControlClass, "pr-9")}
          autoComplete="off"
        />
        <ChevronDown
          className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
      </div>
      {mounted && dropdown ? createPortal(dropdown, document.body) : null}
    </>
  );
}
