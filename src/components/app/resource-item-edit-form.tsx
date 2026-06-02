"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import type { ResourceField, ResourceItem } from "@/components/app/resource-manager";
import { ExpenseCategoryCombobox } from "@/components/app/expense-category-combobox";
import { CurrencyInput, fieldControlClass } from "@/components/ui/currency-input";
import { FormSelect } from "@/components/ui/form-select";
import { Input } from "@/components/ui/input";

function isFieldVisible(field: ResourceField, values: Record<string, string>) {
  if (!field.showWhen) return true;
  return field.showWhen.values.includes(values[field.showWhen.field] ?? "");
}

function buildInitialValues(fields: ResourceField[], item: ResourceItem) {
  const values: Record<string, string> = {};
  for (const field of fields) {
    if (item[field.name] != null && item[field.name] !== "") {
      values[field.name] = String(item[field.name]);
    } else if (field.name === "type") {
      values[field.name] = field.options?.[0]?.value ?? "fixed";
    } else {
      values[field.name] = "";
    }
  }
  return values;
}

function FieldInput({
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
      placeholder={field.placeholder}
      className={fieldControlClass}
    />
  );
}

function EditFormFields({
  fields,
  item,
}: {
  fields: ResourceField[];
  item: ResourceItem;
}) {
  const [values, setValues] = useState(() => buildInitialValues(fields, item));
  const visibleFields = fields.filter((field) => isFieldVisible(field, values));

  return (
    <>
      {visibleFields.map((field) => {
        const inputId = `${item.id}-${field.name}`;
        return (
          <div key={field.name} className="space-y-1.5">
            <Label htmlFor={inputId}>{field.label}</Label>
            <FieldInput
              field={field}
              defaultValue={item[field.name]}
              inputId={inputId}
              selectValue={field.type === "select" ? values[field.name] : undefined}
              onSelectChange={
                field.type === "select"
                  ? (value) => setValues((current) => ({ ...current, [field.name]: value }))
                  : undefined
              }
            />
          </div>
        );
      })}
    </>
  );
}

type ResourceItemEditFormProps = {
  fields: ResourceField[];
  item: ResourceItem;
  isPending: boolean;
  onCancel: () => void;
  onSubmit: (formData: FormData) => void;
};

export function ResourceItemEditForm({
  fields,
  item,
  isPending,
  onCancel,
  onSubmit,
}: ResourceItemEditFormProps) {
  const titleField = fields[0];
  const title = titleField ? String(item[titleField.name] ?? "Item") : "Item";

  useEffect(() => {
    document.getElementById(`resource-item-${item.id}`)?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
    });
  }, [item.id]);

  return (
    <div
      id={`resource-item-${item.id}`}
      className="rounded-xl border border-brand/30 bg-brand/[0.04] p-4 ring-1 ring-brand/20 sm:p-5"
    >
      <div className="mb-5 flex items-start justify-between gap-3 border-b border-white/10 pb-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-brand">Editando</p>
          <h3 className="mt-1 text-lg font-semibold tracking-tight">{title}</h3>
        </div>
        <Button type="button" variant="ghost" size="sm" onClick={onCancel} className="shrink-0">
          <X className="size-4" />
          Cancelar
        </Button>
      </div>

      <form
        key={item.id}
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit(new FormData(event.currentTarget));
        }}
        className="space-y-5"
      >
        <input type="hidden" name="id" value={item.id} />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <EditFormFields fields={fields} item={item} />
        </div>
        <div className="flex flex-col-reverse gap-2 border-t border-white/10 pt-4 sm:flex-row sm:justify-end">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isPending}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isPending} className="btn-brand min-w-[9rem]">
            {isPending ? "Salvando..." : "Salvar alterações"}
          </Button>
        </div>
      </form>
    </div>
  );
}
