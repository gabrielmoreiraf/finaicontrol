"use client";

import { useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight, Eye, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { Amount } from "@/components/app/balance-visibility";
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
import { PAGE_SIZE_OPTIONS } from "@/lib/pagination";
import { brl } from "@/lib/finance/format";
import { notify } from "@/lib/toast";
import { cn } from "@/lib/utils";

/** Formata o valor de um campo para exibição no modal de detalhes. */
function formatFieldDisplay(field: ResourceField, item: ResourceItem): string {
  const raw = item[field.name];
  if (raw === null || raw === undefined || raw === "") return "—";
  if (field.type === "currency") return brl(Number(raw));
  if (field.type === "select") {
    return field.options?.find((o) => o.value === String(raw))?.label ?? String(raw);
  }
  return String(raw);
}

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
  /** Detalhes extras (ex.: progresso de parcelas) exibidos no modal de visualização. */
  details?: { label: string; value: string }[];
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
  /** Texto da busca (placeholder). Quando definido, mostra o campo de busca. */
  searchPlaceholder?: string;
  /** Preenche a altura disponível: cabeçalho/filtros/paginação fixos e só o corpo da tabela rola. */
  fillHeight?: boolean;
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
  searchPlaceholder,
  fillHeight = false,
}: ResourceTableProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("q") ?? "");

  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<ResourceTableRow | null>(null);
  const [viewing, setViewing] = useState<ResourceTableRow | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [isPending, startTransition] = useTransition();

  function openEdit(row: ResourceTableRow) {
    setViewing(null);
    setConfirmingDelete(false);
    setEditing(row);
  }

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

  function changePageSize(size: string) {
    navigate({ por: size, page: "1" });
  }

  function changeFilter(id: string) {
    navigate({ tipo: id === "all" ? null : id, page: "1" });
  }

  function submitSearch(event: React.FormEvent) {
    event.preventDefault();
    navigate({ q: search.trim() || null, page: "1" });
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
    // Valores monetários respeitam o modo "ocultar valores" (olho do header).
    if (typeof value === "string" && value.trimStart().startsWith("R$")) {
      return <Amount>{value}</Amount>;
    }
    return value;
  }

  // Mobile (cards): título = 1ª coluna · valor = coluna alinhada à direita · resto = meta.
  const titleCol = columns[0];
  const valueCol = [...columns].reverse().find((c) => c.align === "right");
  const metaCols = columns.filter((c) => c !== titleCol && c !== valueCol);

  const paginationInner = (
    <>
      <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
        Por página
        <select
          value={pageSize}
          onChange={(event) => changePageSize(event.target.value)}
          aria-label="Itens por página"
          className="h-8 rounded-lg border border-border bg-card px-2 text-xs text-foreground outline-none transition-colors focus:border-brand/40 focus:ring-2 focus:ring-brand/15 dark:border-white/[0.08] dark:bg-card/60"
        >
          {PAGE_SIZE_OPTIONS.map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>
      </label>
      <p className="text-xs text-muted-foreground">
        <span className="font-medium text-foreground">{from}</span>–
        <span className="font-medium text-foreground">{to}</span> de{" "}
        <span className="font-medium text-foreground">{total}</span>
      </p>
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="icon-sm"
          className="rounded-lg border-white/10"
          disabled={page <= 1}
          onClick={() => goToPage(page - 1)}
          aria-label="Página anterior"
        >
          <ChevronLeft className="size-4" aria-hidden />
        </Button>
        <span className="px-1 text-xs tabular-nums text-muted-foreground">
          {page}/{totalPages}
        </span>
        <Button
          variant="outline"
          size="icon-sm"
          className="rounded-lg border-white/10"
          disabled={page >= totalPages}
          onClick={() => goToPage(page + 1)}
          aria-label="Próxima página"
        >
          <ChevronRight className="size-4" aria-hidden />
        </Button>
      </div>
    </>
  );

  return (
    <section className={cn(fillHeight ? "flex flex-col gap-4 lg:min-h-0 lg:flex-1" : "space-y-4")}>
      <div className="shrink-0 space-y-3">
        <div>
          <h2 className="text-lg font-semibold tracking-tight xl:text-xl">{title}</h2>
          {description && (
            <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
          )}
        </div>

        {/* Toolbar: busca + filtros à esquerda · criar à direita */}
        <div className="flex flex-col gap-2.5 rounded-2xl border border-border bg-card/60 p-2.5 shadow-sm sm:flex-row sm:items-center dark:border-white/[0.06]">
          {searchPlaceholder && (
            <form onSubmit={submitSearch} className="relative w-full sm:max-w-xs">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden
              />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={searchPlaceholder}
                className="h-10 w-full rounded-xl border border-border bg-card pl-9 pr-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-brand/40 focus:ring-2 focus:ring-brand/15 dark:border-white/[0.08] dark:bg-card/60"
              />
            </form>
          )}
          {filterTabs && filterTabs.length > 0 && (
            <FilterTabs
              tabs={filterTabs}
              active={activeFilter}
              onChange={changeFilter}
              className="border-0 bg-transparent p-0 dark:bg-transparent dark:border-0"
            />
          )}
          <Button
            className="btn-brand shrink-0 gap-1.5 sm:ml-auto"
            onClick={() => setCreateOpen(true)}
          >
            <Plus className="size-4" aria-hidden />
            {createLabel}
          </Button>
        </div>
      </div>

      {rows.length === 0 ? (
        <div className={cn(fillHeight && "lg:flex lg:flex-1 lg:items-center lg:justify-center")}>
          <EmptyState title="Nada por aqui ainda" description={emptyLabel} />
        </div>
      ) : (
        <>
        {/* MOBILE: lista de cards (cada lançamento vira um card) */}
        <ul className="space-y-2.5 lg:hidden">
          {rows.map((row) => (
            <li
              key={row.id}
              onClick={() => setViewing(row)}
              className="cursor-pointer rounded-2xl border border-border bg-card p-4 shadow-sm transition-transform active:scale-[0.99] dark:border-white/[0.06]"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 space-y-0.5">
                  <p className="truncate font-semibold">{row.cells[titleCol.key]}</p>
                  {valueCol && (
                    <p className="text-lg font-bold tracking-tight">
                      {renderCell(valueCol, row.cells[valueCol.key])}
                    </p>
                  )}
                </div>
                <div className="flex shrink-0 items-center gap-0.5">
                  <button
                    type="button"
                    aria-label={`Ver ${entityLabel}`}
                    onClick={(event) => {
                      event.stopPropagation();
                      setViewing(row);
                    }}
                    className="inline-flex size-11 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground dark:hover:bg-white/[0.06]"
                  >
                    <Eye className="size-4" aria-hidden />
                  </button>
                  <button
                    type="button"
                    aria-label={`Editar ${entityLabel}`}
                    onClick={(event) => {
                      event.stopPropagation();
                      openEdit(row);
                    }}
                    className="inline-flex size-11 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-brand/10 hover:text-brand"
                  >
                    <Pencil className="size-4" aria-hidden />
                  </button>
                </div>
              </div>
              {metaCols.length > 0 && (
                <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-muted-foreground">
                  {metaCols.map((col) => {
                    const value = row.cells[col.key];
                    if (value === undefined || value === null || value === "" || value === "—") {
                      return null;
                    }
                    return (
                      <span key={col.key} className="inline-flex items-center">
                        {renderCell(col, value)}
                      </span>
                    );
                  })}
                </div>
              )}
            </li>
          ))}
        </ul>

        {/* DESKTOP: tabela */}
        <div
          className={cn(
            "hidden flex-col rounded-2xl border border-border bg-card shadow-sm lg:flex dark:border-white/[0.06]",
            fillHeight && "lg:min-h-0 lg:flex-1 lg:overflow-hidden",
          )}
        >
          <div
            className={cn(
              "overflow-x-auto",
              fillHeight && "lg:min-h-0 lg:flex-1 lg:overflow-auto",
            )}
          >
          <table className="w-full min-w-[680px] text-[0.9375rem]">
            <thead className={cn(fillHeight && "lg:sticky lg:top-0 lg:z-10")}>
              <tr className="border-b border-border bg-muted [&>th]:bg-muted dark:border-white/[0.06]">
                {columns.map((col) => (
                  <th
                    key={col.key}
                    className={cn(
                      "px-5 py-4 text-xs font-semibold uppercase tracking-wide text-foreground/65 dark:text-muted-foreground",
                      col.align === "right" ? "text-right" : "text-left",
                    )}
                  >
                    {col.label}
                  </th>
                ))}
                <th className="w-px px-5 py-4 text-right text-xs font-semibold uppercase tracking-wide text-foreground/65 dark:text-muted-foreground">
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
                  aria-label={`Ver ${entityLabel}`}
                  onClick={() => setViewing(row)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      setViewing(row);
                    }
                  }}
                  className="cursor-pointer border-b border-border/60 outline-none transition-colors last:border-0 hover:bg-muted/40 focus-visible:bg-muted/40 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand/40 dark:border-white/[0.04] dark:hover:bg-white/[0.02]"
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={cn(
                        "px-5 py-4",
                        col.align === "right" ? "text-right font-medium" : "text-left",
                      )}
                    >
                      {renderCell(col, row.cells[col.key])}
                    </td>
                  ))}
                  <td className="px-3 py-2 sm:px-5">
                    <div className="flex items-center justify-end gap-0.5">
                      <button
                        type="button"
                        aria-label={`Ver ${entityLabel}`}
                        title="Ver detalhes"
                        onClick={(event) => {
                          event.stopPropagation();
                          setViewing(row);
                        }}
                        className="inline-flex size-11 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground dark:hover:bg-white/[0.06] sm:size-9"
                      >
                        <Eye className="size-4" aria-hidden />
                      </button>
                      <button
                        type="button"
                        aria-label={`Editar ${entityLabel}`}
                        title="Editar"
                        onClick={(event) => {
                          event.stopPropagation();
                          openEdit(row);
                        }}
                        className="inline-flex size-11 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-brand/10 hover:text-brand sm:size-9"
                      >
                        <Pencil className="size-4" aria-hidden />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>

          {/* Paginação: rodapé dentro do card (desktop), alinhado à direita */}
          {total > 0 && (
            <div className="flex shrink-0 flex-wrap items-center justify-end gap-x-5 gap-y-2 border-t border-border px-5 py-3 dark:border-white/[0.06]">
              {paginationInner}
            </div>
          )}
        </div>

        {/* MOBILE: paginação abaixo da lista de cards */}
        {total > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 rounded-2xl border border-border bg-card px-4 py-3 lg:hidden dark:border-white/[0.06]">
            {paginationInner}
          </div>
        )}
        </>
      )}

      {/* Modal: visualizar (read-only) */}
      <Dialog
        open={viewing !== null}
        onOpenChange={(open) => {
          if (!open) setViewing(null);
        }}
      >
        <DialogContent className="max-h-[90dvh] max-w-md overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="capitalize">{entityLabel}</DialogTitle>
            <DialogDescription>Detalhes do registro.</DialogDescription>
          </DialogHeader>
          {viewing && (
            <>
              <dl className="divide-y divide-border/60 dark:divide-white/[0.06]">
                {fields
                  .filter(
                    (f) => viewing.item[f.name] !== null && viewing.item[f.name] !== undefined && viewing.item[f.name] !== "",
                  )
                  .map((f) => (
                    <div key={f.name} className="flex items-center justify-between gap-4 py-2.5">
                      <dt className="text-sm text-muted-foreground">{f.label}</dt>
                      <dd className="text-right text-sm font-medium">
                        {f.type === "currency" ? (
                          <Amount>{formatFieldDisplay(f, viewing.item)}</Amount>
                        ) : (
                          formatFieldDisplay(f, viewing.item)
                        )}
                      </dd>
                    </div>
                  ))}
                {viewing.details?.map((d) => (
                  <div key={d.label} className="flex items-center justify-between gap-4 py-2.5">
                    <dt className="text-sm text-muted-foreground">{d.label}</dt>
                    <dd className="text-right text-sm font-semibold text-brand">{d.value}</dd>
                  </div>
                ))}
              </dl>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-xl border-white/10"
                  onClick={() => setViewing(null)}
                >
                  Fechar
                </Button>
                <Button type="button" className="btn-brand gap-1.5" onClick={() => openEdit(viewing)}>
                  <Pencil className="size-4" aria-hidden />
                  Editar
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal: criar */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-h-[90dvh] max-w-xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{createLabel}</DialogTitle>
            <DialogDescription>Preencha os campos abaixo.</DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              runAction(createAction, new FormData(event.currentTarget), () => {
                setCreateOpen(false);
                // F2.1: o item novo entra na 1ª página (ordem desc) — leva o usuário até lá.
                if (page !== 1) goToPage(1);
              });
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
        <DialogContent className="max-h-[90dvh] max-w-xl overflow-y-auto">
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
