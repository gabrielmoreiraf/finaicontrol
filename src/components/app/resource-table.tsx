"use client";

import { useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight, Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EmptyState } from "@/components/app/premium/empty-state";
import { FilterTabs, type FilterTab } from "@/components/app/premium/filter-tabs";
import { ResourceFormFields, type ResourceField, type ResourceItem } from "@/components/app/resource-fields";
import type { ActionResult } from "@/lib/actions/result";
import { notify } from "@/lib/toast";
import { cn } from "@/lib/utils";

export type ResourceColumn = {
  key: string;
  label: string;
  align?: "left" | "right";
  badge?: boolean;
};

export type ResourceTableSecondary = {
  /** Texto do botão no modal de edição (ex.: "Concluir meta"). */
  label: string;
  /** Valor enviado ao `secondaryAction` no campo `value`. */
  value: string;
  tone?: "brand" | "default";
};

export type ResourceTableRow = {
  id: string;
  item: ResourceItem;
  cells: Record<string, string | number>;
  /** Ação extra opcional exibida no modal de edição. */
  secondary?: ResourceTableSecondary;
};

interface ResourceTableProps {
  title: string;
  description?: string;
  columns: ResourceColumn[];
  rows: ResourceTableRow[];
  fields: ResourceField[];
  createAction: (formData: FormData) => Promise<ActionResult>;
  updateAction: (formData: FormData) => Promise<ActionResult>;
  deleteAction: (formData: FormData) => Promise<ActionResult>;
  /** Ação extra opcional (ex.: concluir/reabrir meta), acionada pelo `row.secondary`. */
  secondaryAction?: (formData: FormData) => Promise<ActionResult>;
  page: number;
  pageSize: number;
  total: number;
  createLabel?: string;
  emptyLabel?: string;
  entityLabel?: string;
  /** Tabs de filtro por tipo (navegação via querystring `tipo`). */
  filterTabs?: FilterTab[];
  activeFilter?: string;
}

function applyResult(result: ActionResult) {
  if (result.ok) {
    notify.success(result.message ?? "Operação concluída.");
    return true;
  }
  notify.error(result.error);
  return false;
}

export function ResourceTable({
  title,
  description,
  columns,
  rows,
  fields,
  createAction,
  updateAction,
  deleteAction,
  secondaryAction,
  page,
  pageSize,
  total,
  createLabel = "Adicionar",
  emptyLabel = "Nenhum item cadastrado ainda.",
  entityLabel = "item",
  filterTabs,
  activeFilter = "all",
}: ResourceTableProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<ResourceTableRow | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [isPending, startTransition] = useTransition();

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  function navigate(updates: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (value === null) params.delete(key);
      else params.set(key, value);
    }
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  }

  function goToPage(next: number) {
    navigate({ page: String(next) });
  }

  function changeFilter(id: string) {
    navigate({ tipo: id === "all" ? null : id, page: "1" });
  }

  function runAction(
    action: (formData: FormData) => Promise<ActionResult>,
    formData: FormData,
    onSuccess: () => void,
  ) {
    startTransition(async () => {
      const result = await action(formData);
      if (applyResult(result)) {
        onSuccess();
        router.refresh();
      }
    });
  }

  const formGridClass = cn(
    "grid gap-4 sm:grid-cols-2",
    fields.length >= 5 && "lg:grid-cols-2",
  );

  function renderCell(column: ResourceColumn, value: string | number | undefined) {
    if (value === undefined || value === null || value === "") return "—";
    if (column.badge) {
      return (
        <span className="rounded-md bg-brand/10 px-2 py-0.5 text-xs font-medium text-brand">
          {value}
        </span>
      );
    }
    return value;
  }

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold tracking-tight xl:text-xl">{title}</h2>
          {description && (
            <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
          )}
        </div>
        <Button className="btn-brand shrink-0 gap-1.5" onClick={() => setCreateOpen(true)}>
          <Plus className="size-4" aria-hidden />
          {createLabel}
        </Button>
      </div>

      {filterTabs && filterTabs.length > 0 && (
        <FilterTabs tabs={filterTabs} active={activeFilter} onChange={changeFilter} />
      )}

      {rows.length === 0 ? (
        <EmptyState
          title={`Nenhum ${entityLabel} aqui`}
          description={emptyLabel}
        />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border bg-card shadow-sm dark:border-white/[0.06]">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50 dark:border-white/[0.06] dark:bg-white/[0.02]">
                {columns.map((col) => (
                  <th
                    key={col.key}
                    className={cn(
                      "px-4 py-3 text-xs font-semibold uppercase tracking-wide text-foreground/65 dark:text-muted-foreground",
                      col.align === "right" ? "text-right" : "text-left",
                    )}
                  >
                    {col.label}
                  </th>
                ))}
                <th className="w-px px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-foreground/65 dark:text-muted-foreground">
                  <span className="sr-only">Ações</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr
                  key={row.id}
                  tabIndex={0}
                  role="button"
                  aria-label={`Editar ${entityLabel}`}
                  onClick={() => {
                    setConfirmingDelete(false);
                    setEditing(row);
                  }}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      setConfirmingDelete(false);
                      setEditing(row);
                    }
                  }}
                  className="cursor-pointer border-b border-border/60 outline-none transition-colors last:border-0 hover:bg-muted/40 focus-visible:bg-muted/40 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand/40 dark:border-white/[0.04] dark:hover:bg-white/[0.02]"
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={cn(
                        "px-4 py-3.5",
                        col.align === "right" ? "text-right font-medium" : "text-left",
                      )}
                    >
                      {renderCell(col, row.cells[col.key])}
                    </td>
                  ))}
                  <td className="px-4 py-3.5 text-right">
                    <Pencil
                      className="ml-auto size-4 text-muted-foreground"
                      aria-hidden
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {total > 0 && (
        <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
          <p className="text-xs text-muted-foreground">
            Mostrando <span className="font-medium text-foreground">{from}</span>–
            <span className="font-medium text-foreground">{to}</span> de{" "}
            <span className="font-medium text-foreground">{total}</span>
          </p>
          {totalPages > 1 && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="gap-1 rounded-lg border-white/10"
                disabled={page <= 1}
                onClick={() => goToPage(page - 1)}
              >
                <ChevronLeft className="size-4" aria-hidden />
                Anterior
              </Button>
              <span className="text-xs text-muted-foreground">
                Página {page} de {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                className="gap-1 rounded-lg border-white/10"
                disabled={page >= totalPages}
                onClick={() => goToPage(page + 1)}
              >
                Próxima
                <ChevronRight className="size-4" aria-hidden />
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Modal: criar */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>{createLabel}</DialogTitle>
            <DialogDescription>Preencha os campos abaixo.</DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              runAction(createAction, new FormData(event.currentTarget), () =>
                setCreateOpen(false),
              );
            }}
            className="space-y-4"
          >
            <div className={formGridClass}>
              <ResourceFormFields fields={fields} inputIdPrefix="create" />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                className="rounded-xl border-white/10"
                onClick={() => setCreateOpen(false)}
                disabled={isPending}
              >
                Cancelar
              </Button>
              <Button type="submit" className="btn-brand gap-1.5" disabled={isPending}>
                <Plus className="size-4" aria-hidden />
                {isPending ? "Salvando..." : createLabel}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal: editar / excluir */}
      <Dialog
        open={editing !== null}
        onOpenChange={(open) => {
          if (!open) {
            setEditing(null);
            setConfirmingDelete(false);
          }
        }}
      >
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Editar {entityLabel}</DialogTitle>
            <DialogDescription>Altere os campos ou exclua o registro.</DialogDescription>
          </DialogHeader>
          {editing && (
            <form
              key={editing.item.id}
              onSubmit={(event) => {
                event.preventDefault();
                runAction(updateAction, new FormData(event.currentTarget), () => {
                  setEditing(null);
                  setConfirmingDelete(false);
                });
              }}
              className="space-y-4"
            >
              <input type="hidden" name="id" value={editing.item.id} />
              <div className={formGridClass}>
                <ResourceFormFields fields={fields} item={editing.item} inputIdPrefix="edit" />
              </div>
              <DialogFooter className="sm:justify-between">
                {confirmingDelete ? (
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="destructive"
                      className="gap-1.5"
                      disabled={isPending}
                      onClick={() => {
                        const formData = new FormData();
                        formData.set("id", editing.item.id);
                        runAction(deleteAction, formData, () => {
                          setEditing(null);
                          setConfirmingDelete(false);
                        });
                      }}
                    >
                      <Trash2 className="size-4" aria-hidden />
                      {isPending ? "Excluindo..." : "Confirmar exclusão"}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setConfirmingDelete(false)}
                      disabled={isPending}
                    >
                      Cancelar
                    </Button>
                  </div>
                ) : (
                  <Button
                    type="button"
                    variant="destructive"
                    className="gap-1.5"
                    disabled={isPending}
                    onClick={() => setConfirmingDelete(true)}
                  >
                    <Trash2 className="size-4" aria-hidden />
                    Excluir
                  </Button>
                )}
                <div className="flex items-center gap-2">
                  {editing.secondary && secondaryAction && (
                    <Button
                      type="button"
                      variant={editing.secondary.tone === "brand" ? "default" : "outline"}
                      className={cn(
                        "gap-1.5",
                        editing.secondary.tone === "brand"
                          ? "btn-brand"
                          : "rounded-xl border-white/10",
                      )}
                      disabled={isPending}
                      onClick={() => {
                        const formData = new FormData();
                        formData.set("id", editing.item.id);
                        formData.set("value", editing.secondary!.value);
                        runAction(secondaryAction, formData, () => {
                          setEditing(null);
                          setConfirmingDelete(false);
                        });
                      }}
                    >
                      {editing.secondary.label}
                    </Button>
                  )}
                  <Button type="submit" className="btn-brand gap-1.5" disabled={isPending}>
                    {isPending ? "Salvando..." : "Salvar alterações"}
                  </Button>
                </div>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}
