"use client";

import { useState } from "react";
import { Eye, EyeOff, type LucideIcon } from "lucide-react";

export function AuthField({
  id,
  name,
  label,
  type = "text",
  placeholder,
  icon: Icon,
  autoComplete,
  required,
  minLength,
  labelExtra,
  revealToggle,
  defaultValue,
  readOnly,
  onValueChange,
}: {
  id: string;
  name: string;
  label: string;
  type?: string;
  placeholder?: string;
  icon: LucideIcon;
  autoComplete?: string;
  required?: boolean;
  minLength?: number;
  labelExtra?: React.ReactNode;
  revealToggle?: boolean;
  defaultValue?: string;
  readOnly?: boolean;
  onValueChange?: (value: string) => void;
}) {
  const [visible, setVisible] = useState(false);
  const isPassword = type === "password";
  const effectiveType = isPassword && revealToggle ? (visible ? "text" : "password") : type;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.5em" }}>
      <div className="flex items-center justify-between gap-2">
        <label
          htmlFor={id}
          className="font-semibold uppercase tracking-[0.2em] text-white/45"
          style={{ fontSize: "0.7em" }}
        >
          {label}
        </label>
        {labelExtra}
      </div>
      <div
        className="auth-input-wrap flex items-center rounded-xl border border-white/10 bg-black/50 transition-colors focus-within:border-brand/50 focus-within:ring-2 focus-within:ring-brand/20"
        style={{ gap: "0.75em", paddingLeft: "1em", paddingRight: revealToggle ? "0.5em" : "1em" }}
      >
        <Icon className="shrink-0 text-white/35" style={{ width: "1.15em", height: "1.15em" }} aria-hidden />
        <input
          id={id}
          name={name}
          type={effectiveType}
          placeholder={placeholder}
          autoComplete={autoComplete}
          required={required}
          minLength={minLength}
          defaultValue={defaultValue}
          readOnly={readOnly}
          onChange={onValueChange ? (event) => onValueChange(event.target.value) : undefined}
          className="min-w-0 flex-1 bg-transparent text-white outline-none placeholder:text-white/25 read-only:cursor-not-allowed read-only:text-white/55"
          style={{ paddingTop: "0.85em", paddingBottom: "0.85em", fontSize: "0.95em" }}
        />
        {isPassword && revealToggle && (
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            className="shrink-0 rounded-md p-1.5 text-white/35 transition-colors hover:text-white/70"
            aria-label={visible ? "Ocultar senha" : "Mostrar senha"}
            title={visible ? "Ocultar senha" : "Mostrar senha"}
          >
            {visible ? (
              <EyeOff style={{ width: "1.15em", height: "1.15em" }} aria-hidden />
            ) : (
              <Eye style={{ width: "1.15em", height: "1.15em" }} aria-hidden />
            )}
          </button>
        )}
      </div>
    </div>
  );
}
