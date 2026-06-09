"use client";

import { useState } from "react";
import { ExpenseCategoryCombobox } from "@/components/app/expense-category-combobox";
import { CurrencyInput, fieldControlClass } from "@/components/ui/currency-input";
import { FormSelect } from "@/components/ui/form-select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export interface ResourceFieldOption {
  value: string;
  label: string;
}

export interface ResourceField {
  name: string;
  label: string;
  type: "text" | "number" | "select" | "date" | "currency" | "category";
  options?: ResourceFieldOption[];
  categoryNames?: string[];
  required?: boolean;
  step?: string;
  min?: number;
  max?: number;
  placeholder?: string;
  currency?: boolean;
  showWhen?: { field: string; values: string[] };
}

export type ResourceItem = { id: string } & Record<string, string | number | null>;

export function isFieldVisible(field: ResourceField, values: Record<string, string>) {
  if (!field.showWhen) return true;
  return field.showWhen.values.includes(values[field.showWhen.field] ?? "");
}

export function buildInitialValues(fields: ResourceField[], item?: ResourceItem) {
  const values: Record<string, string> = {};
  for (const field of fields) {
    if (item && item[field.name] != null && item[field.name] !== "") {
      values[field.name] = String(item[field.name]);
    } else if (field.name === "type") {
      values[field.name] = field.options?.[0]?.value ?? "fixed";
    } else {
      values[field.name] = "";
    }
  }
  return values;
}

export function FieldInput({
  field,
  defaultValue,
  inputId,
  selectValue,
  onSelectChange,
}: {
  field: ResourceField;
  defaultValue?: string | number | null;
  inputId?: string;
  selectValue?: string;
  onSelectChange?: (value: string) => void;
}) {
  const id = inputId ?? field.name;

  if (field.type === "currency" || field.currency) {
    return (
      <CurrencyInput
        id={id}
        name={field.name}
        defaultValue={defaultValue}
        required={field.required}
        placeholder="R$ 0,00"
      />
    );
  }

  if (field.type === "category") {
    return (
      <ExpenseCategoryCombobox
        id={id}
        name={field.name}
        categories={field.categoryNames ?? []}
        defaultValue={defaultValue != null ? String(defaultValue) : undefined}
        required={field.required}
        placeholder={field.placeholder ?? "Ex: Moradia"}
      />
    );
  }

  if (field.type === "select") {
    return (
      <FormSelect
        id={id}
        name={field.name}
        options={field.options ?? []}
        value={selectValue}
        defaultValue={defaultValue != null ? String(defaultValue) : undefined}
        onValueChange={onSelectChange}
        required={field.required}
        placeholder={field.placeholder ?? "Selecione..."}
      />
    );
  }

  return (
    <Input
      id={id}
      name={field.name}
      required={field.required}
      defaultValue={defaultValue ?? undefined}
      type={field.type}
      step={field.step}
      min={field.min}
      max={field.max}
      placeholder={field.placeholder}
      className={fieldControlClass}
    />
  );
}

export function ResourceFormFields({
  fields,
  item,
  inputIdPrefix,
}: {
  fields: ResourceField[];
  item?: ResourceItem;
  inputIdPrefix?: string;
}) {
  const [values, setValues] = useState<Record<string, string>>(() =>
    buildInitialValues(fields, item),
  );

  const visibleFields = fields.filter((field) => isFieldVisible(field, values));

  function setFieldValue(name: string, value: string) {
    setValues((current) => ({ ...current, [name]: value }));
  }

  return (
    <>
      {visibleFields.map((field) => {
        const inputId = inputIdPrefix ? `${inputIdPrefix}-${field.name}` : field.name;
        return (
          <div key={field.name} className="space-y-1.5 sm:col-span-1">
            <Label htmlFor={inputId}>{field.label}</Label>
            <FieldInput
              field={field}
              defaultValue={item?.[field.name]}
              inputId={inputId}
              selectValue={field.type === "select" ? values[field.name] : undefined}
              onSelectChange={
                field.type === "select"
                  ? (value) => setFieldValue(field.name, value)
                  : undefined
              }
            />
          </div>
        );
      })}
    </>
  );
}
