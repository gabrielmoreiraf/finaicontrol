"use client";

import { useMemo, useState } from "react";
import { Search, ShieldCheck } from "lucide-react";
import { PageHeader } from "@/components/app/premium/page-header";
import { DataTable, StatCard } from "@/components/app/premium/data-table";
import { UserAvatar } from "@/components/app/premium/user-avatar";
import { CustomerDetailDialog } from "@/components/app/admin/customer-detail-dialog";
import { getPlanLabel } from "@/lib/plans";
import type { AdminCustomer, AdminOverview } from "@/lib/admin/customers";
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
  currentAdminId,
}: {
  customers: AdminCustomer[];
  overview: AdminOverview;
  currentAdminId: string;
}) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<AdminCustomer | null>(null);
  const [open, setOpen] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return customers;
    return customers.filter(
      (c) =>
        c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q),
    );
  }, [customers, query]);

  const rows = filtered.map((c) => ({
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
    <div className="space-y-6">
      <PageHeader
        title="Painel Admin"
        description="Visão geral dos clientes cadastrados no FinIA Control."
      />

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard label="Clientes" value={String(overview.total)} />
        <StatCard label="Gratuito" value={String(overview.free)} />
        <StatCard label="Plus" value={String(overview.plus)} />
        <StatCard label="Premium IA" value={String(overview.premium)} />
        <StatCard label="Verificados" value={String(overview.verified)} />
        <StatCard label="Onboarding" value={String(overview.onboarded)} />
      </div>

      <div className="space-y-3">
        <div className="relative max-w-sm">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar por nome ou e-mail..."
            className="h-10 w-full rounded-xl border border-border bg-card pl-9 pr-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-brand/40 focus:ring-2 focus:ring-brand/15 dark:border-white/[0.08] dark:bg-card/60"
          />
        </div>

        {rows.length > 0 ? (
          <DataTable
            columns={COLUMNS}
            rows={rows}
            onRowClick={(index) => {
              setSelected(filtered[index]);
              setOpen(true);
            }}
          />
        ) : (
          <p className="rounded-2xl border border-border bg-card py-10 text-center text-sm text-muted-foreground dark:border-white/[0.06]">
            Nenhum cliente encontrado para “{query}”.
          </p>
        )}

        <p className="text-xs text-muted-foreground">
          {filtered.length} de {customers.length} cliente(s) · clique numa linha para ver
          detalhes e editar. Forma de pagamento e vencimento ficam disponíveis quando o
          pagamento (Stripe) for ativado.
        </p>
      </div>

      <CustomerDetailDialog
        customer={selected}
        open={open}
        onOpenChange={setOpen}
        currentAdminId={currentAdminId}
      />
    </div>
  );
}
