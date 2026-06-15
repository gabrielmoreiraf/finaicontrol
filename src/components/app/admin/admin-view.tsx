"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Search, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataPage } from "@/components/app/data-page";
import { PageHeader } from "@/components/app/premium/page-header";
import { DataTable, StatCard } from "@/components/app/premium/data-table";
import { UserAvatar } from "@/components/app/premium/user-avatar";
import { CustomerDetailDialog } from "@/components/app/admin/customer-detail-dialog";
import { InviteDialog } from "@/components/app/admin/invite-dialog";
import { BroadcastDialog } from "@/components/app/admin/broadcast-dialog";
import { getPlanLabel } from "@/lib/plans";
import type { AdminCustomer, AdminOverview } from "@/lib/admin/customers";
import type { PendingInvitation } from "@/lib/auth/invitation";
import { DEFAULT_PAGE_SIZE, PAGE_SIZE_OPTIONS } from "@/lib/pagination";
import { cn } from "@/lib/utils";

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

const COLUMNS = [
  { key: "name", label: "Nome" },
  { key: "email", label: "E-mail" },
  { key: "plan", label: "Plano" },
  { key: "createdAt", label: "Cadastro" },
  { key: "status", label: "Status" },
  { key: "payment", label: "Pagamento" },
  { key: "expires", label: "Vencimento" },
];

function StatusPills({ customer }: { customer: AdminCustomer }) {
  return (
    <span className="flex flex-wrap gap-1">
      <Pill ok={customer.emailVerified}>
        {customer.emailVerified ? "Verificado" : "Não verificado"}
      </Pill>
      <Pill ok={customer.onboardingComplete}>
        {customer.onboardingComplete ? "Onboarding" : "Onboarding pendente"}
      </Pill>
    </span>
  );
}

function Pill({ ok, children }: { ok: boolean; children: React.ReactNode }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-[0.6875rem] font-medium",
        ok
          ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
          : "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300",
      )}
    >
      {children}
    </span>
  );
}

export function AdminView({
  customers,
  overview,
  invitations,
  currentAdminId,
}: {
  customers: AdminCustomer[];
  overview: AdminOverview;
  invitations: PendingInvitation[];
  currentAdminId: string;
}) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<AdminCustomer | null>(null);
  const [open, setOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return customers;
    return customers.filter(
      (c) =>
        c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q),
    );
  }, [customers, query]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paged = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const from = filtered.length === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const to = Math.min(currentPage * pageSize, filtered.length);

  function handleQuery(value: string) {
    setQuery(value);
    setPage(1);
  }

  const rows = paged.map((c) => ({
    name: (
      <span className="flex items-center gap-2 font-medium">
        <UserAvatar name={c.name} imageUrl={c.avatarUrl} size="sm" />
        {c.name}
        {c.role === "admin" && (
          <span
            className="inline-flex items-center gap-1 rounded-full border border-violet-400/30 bg-violet-500/15 px-1.5 py-0.5 text-[0.625rem] font-semibold text-violet-700 dark:text-violet-300"
            title="Conta master"
          >
            <ShieldCheck className="size-2.5" aria-hidden />
            Admin
          </span>
        )}
      </span>
    ),
    email: <span className="text-muted-foreground">{c.email}</span>,
    plan: c.plan ? getPlanLabel(c.plan) : "—",
    createdAt: dateFormatter.format(new Date(c.createdAt)),
    status: <StatusPills customer={c} />,
    payment: <span className="text-muted-foreground">—</span>,
    expires: <span className="text-muted-foreground">—</span>,
  }));

  return (
    <DataPage>
      {/* Cabeçalho + indicadores + busca: fixos */}
      <div className="shrink-0 space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <PageHeader
            title="Painel Admin"
            description="Visão geral dos clientes cadastrados no FinIA Control."
          />
          <div className="flex flex-wrap items-center gap-2">
            <BroadcastDialog
              totalUsers={overview.total}
              users={customers.map((c) => ({ name: c.name, email: c.email }))}
            />
            <InviteDialog invitations={invitations} />
          </div>
        </div>

        <div className="grid gap-3 sm:gap-4 [grid-template-columns:repeat(auto-fit,minmax(8.5rem,1fr))]">
          <StatCard label="Clientes" value={String(overview.total - overview.staff)} />
          <StatCard label="Gratuito" value={String(overview.free)} />
          <StatCard label="Plus" value={String(overview.plus)} />
          <StatCard label="Premium IA" value={String(overview.premium)} />
          <StatCard label="Equipe" value={String(overview.staff)} />
          <StatCard label="Verificados" value={String(overview.verified)} />
          <StatCard label="Onboarding" value={String(overview.onboarded)} />
        </div>

        <div className="relative max-w-sm">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <input
            type="search"
            value={query}
            onChange={(event) => handleQuery(event.target.value)}
            placeholder="Buscar por nome ou e-mail..."
            className="h-10 w-full rounded-xl border border-border bg-card pl-9 pr-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-brand/40 focus:ring-2 focus:ring-brand/15 dark:border-white/[0.08] dark:bg-card/60"
          />
        </div>
      </div>

      {/* Tabela: ocupa o restante e rola por dentro (cabeçalho fixo) */}
      {rows.length > 0 ? (
        <DataTable
          columns={COLUMNS}
          rows={rows}
          fillHeight
          onRowClick={(index) => {
            setSelected(paged[index]);
            setOpen(true);
          }}
        />
      ) : (
        <div className="lg:flex lg:flex-1 lg:items-center lg:justify-center">
          <p className="w-full rounded-2xl border border-border bg-card py-10 text-center text-sm text-muted-foreground dark:border-white/[0.06]">
            Nenhum cliente encontrado para “{query}”.
          </p>
        </div>
      )}

      {filtered.length > 0 && (
        <div className="flex shrink-0 flex-col items-center justify-between gap-3 sm:flex-row">
          <div className="flex items-center gap-3">
            <p className="text-xs text-muted-foreground">
              Mostrando <span className="font-medium text-foreground">{from}</span>–
              <span className="font-medium text-foreground">{to}</span> de{" "}
              <span className="font-medium text-foreground">{filtered.length}</span>
            </p>
            <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
              Por página
              <select
                value={pageSize}
                onChange={(event) => {
                  setPageSize(Number(event.target.value));
                  setPage(1);
                }}
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
          </div>
          {totalPages > 1 && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="gap-1 rounded-lg border-white/10"
                disabled={currentPage <= 1}
                onClick={() => setPage(currentPage - 1)}
              >
                <ChevronLeft className="size-4" aria-hidden />
                Anterior
              </Button>
              <span className="text-xs text-muted-foreground">
                Página {currentPage} de {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                className="gap-1 rounded-lg border-white/10"
                disabled={currentPage >= totalPages}
                onClick={() => setPage(currentPage + 1)}
              >
                Próxima
                <ChevronRight className="size-4" aria-hidden />
              </Button>
            </div>
          )}
        </div>
      )}

      <CustomerDetailDialog
        customer={selected}
        open={open}
        onOpenChange={setOpen}
        currentAdminId={currentAdminId}
      />
    </DataPage>
  );
}
