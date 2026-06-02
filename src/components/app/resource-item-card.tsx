"use client";

import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { ResourceField, ResourceItem } from "@/components/app/resource-manager";
import { getInstallmentProgress } from "@/lib/finance/installment-progress";
import { EMPTY_DISPLAY, isEmptyDisplay } from "@/lib/empty-display";
import { cn } from "@/lib/utils";

const brl = (value: number) =>
  value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

function displayValue(field: ResourceField, raw: string | number | null): string {
  if (raw === null || raw === "") return EMPTY_DISPLAY;
  if (field.type === "select") {
    return field.options?.find((option) => option.value === String(raw))?.label ?? String(raw);
  }
  if (field.type === "date") {
    const parts = String(raw).split("-");
    if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
    return String(raw);
  }
  if (field.type === "currency" || field.currency) return brl(Number(raw));
  return String(raw);
}

function isFieldVisible(field: ResourceField, values: Record<string, string>) {
  if (!field.showWhen) return true;
  return field.showWhen.values.includes(values[field.showWhen.field] ?? "");
}

function fieldsForItem(fields: ResourceField[], item: ResourceItem) {
  const values = Object.fromEntries(
    fields.map((field) => [field.name, String(item[field.name] ?? "")]),
  ) as Record<string, string>;
  return fields.filter((field) => isFieldVisible(field, values));
}

function badgeClass(name: string) {
  if (name === "type") return "bg-brand/10 text-brand";
  if (name === "category") return "bg-violet-100 text-violet-800 dark:bg-violet-500/10 dark:text-violet-300";
  return "bg-muted text-foreground/70 dark:bg-white/5 dark:text-muted-foreground";
}

type ResourceItemCardProps = {
  fields: ResourceField[];
  item: ResourceItem;
  isPending: boolean;
  onEdit: () => void;
  onDelete: (formData: FormData) => void;
};

export function ResourceItemCard({
  fields,
  item,
  isPending,
  onEdit,
  onDelete,
}: ResourceItemCardProps) {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const visibleFields = fieldsForItem(fields, item);
  const titleField = visibleFields[0];
  const amountField = visibleFields.find((field) => field.type === "currency" || field.currency);
  const badgeFields = visibleFields.filter(
    (field) => field !== titleField && field !== amountField && ["type", "category"].includes(field.name),
  );
  const metaFields = visibleFields.filter(
    (field) =>
      field !== titleField &&
      field !== amountField &&
      !["type", "category"].includes(field.name),
  );

  const progress =
    String(item.type) === "installment"
      ? getInstallmentProgress(
          item.paymentStartDate != null ? String(item.paymentStartDate) : null,
          item.installmentCount != null ? Number(item.installmentCount) : null,
        )
      : null;

  const progressPercent =
    progress && progress.total > 0
      ? Math.round((progress.current / progress.total) * 100)
      : 0;

  const itemTitle = titleField ? displayValue(titleField, item[titleField.name]) : "este item";

  function confirmDelete() {
    const formData = new FormData();
    formData.set("id", item.id);
    onDelete(formData);
    setDeleteOpen(false);
  }

  return (
    <article className="rounded-xl border border-border/70 bg-card p-4 shadow-sm transition-colors hover:border-border hover:bg-muted/30 dark:border-white/[0.06] dark:bg-white/[0.02] dark:hover:border-white/10 dark:hover:bg-white/[0.04] sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base font-semibold tracking-tight sm:text-lg">
              {titleField ? displayValue(titleField, item[titleField.name]) : EMPTY_DISPLAY}
            </h3>
            {badgeFields.map((field) => {
              const value = displayValue(field, item[field.name]);
              if (isEmptyDisplay(value)) return null;
              return (
                <span
                  key={field.name}
                  className={cn(
                    "rounded-full px-2.5 py-0.5 text-xs font-medium",
                    badgeClass(field.name),
                  )}
                >
                  {value}
                </span>
              );
            })}
          </div>

          {amountField && (
            <p className="text-xl font-bold tracking-tight text-brand sm:text-2xl">
              {displayValue(amountField, item[amountField.name])}
            </p>
          )}
        </div>

        <div className="flex shrink-0 gap-1">
          <Button type="button" variant="ghost" size="icon" onClick={onEdit} aria-label="Editar">
            <Pencil className="size-4" />
          </Button>
          <Button
            type="button"
            variant="destructive"
            size="icon"
            disabled={isPending}
            aria-label="Excluir"
            onClick={() => setDeleteOpen(true)}
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      </div>

      {metaFields.length > 0 && (
        <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {metaFields.map((field) => (
            <div
              key={field.name}
              className="rounded-lg border border-border/60 bg-muted/40 px-3 py-2 dark:border-white/[0.04] dark:bg-black/20"
            >
              <dt className="text-[11px] font-medium uppercase tracking-wide text-foreground/55 dark:text-muted-foreground">
                {field.label}
              </dt>
              <dd className="mt-0.5 text-sm font-medium">
                {displayValue(field, item[field.name])}
              </dd>
            </div>
          ))}
        </dl>
      )}

      {progress && (
        <div className="mt-4 rounded-lg border border-brand/20 bg-brand/5 px-3 py-3 sm:px-4">
          <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
            <span className="font-medium text-brand">Andamento das parcelas</span>
            <span className="text-muted-foreground">{progress.label}</span>
          </div>
          <div className="mt-2.5 h-2 overflow-hidden rounded-full bg-muted dark:bg-white/10">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-500",
                progress.status === "completed" ? "bg-emerald-400" : "bg-brand",
              )}
              style={{ width: `${Math.max(progressPercent, progress.status === "upcoming" ? 4 : 0)}%` }}
            />
          </div>
        </div>
      )}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir <strong className="text-foreground">{itemTitle}</strong>?
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              disabled={isPending}
              className="bg-destructive text-white hover:bg-destructive/90"
              onClick={confirmDelete}
            >
              {isPending ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </article>
  );
}
