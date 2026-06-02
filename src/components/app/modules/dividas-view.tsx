"use client";

import { Wallet } from "lucide-react";
import { EmptyState } from "@/components/app/premium/empty-state";
import { PageHeader } from "@/components/app/premium/page-header";
import { PremiumCard } from "@/components/app/premium/premium-card";
import { StatCard } from "@/components/app/premium/data-table";
import { brl } from "@/lib/finance/format";
import type { DividaRow } from "@/lib/finance/dividas";
import { cn } from "@/lib/utils";

const priorityStyles = {
  Alta: "border-red-500/30 bg-red-500/10 text-red-400",
  Média: "border-amber-500/30 bg-amber-500/10 text-amber-400",
  Baixa: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
};

export function DividasView({ items }: { items: DividaRow[] }) {
  const total = items.reduce((sum, item) => sum + item.balance, 0);
  const monthly = items.reduce((sum, item) => sum + item.monthlyPayment, 0);

  return (
    <div className="space-y-6 sm:space-y-8">
      <PageHeader
        title="Dívidas"
        description="Painel com total devido, parcelas e priorização."
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard label="Total devido" value={brl(total)} />
        <StatCard label="Pagamento mensal" value={brl(monthly)} change="soma das parcelas" />
        <StatCard label="Dívidas ativas" value={String(items.length)} change={items.length === 0 ? "nenhuma" : "cadastradas"} />
      </div>

      {items.length === 0 ? (
        <EmptyState
          title="Nenhuma dívida cadastrada"
          description="Registre cartões, empréstimos e financiamentos no formulário abaixo."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((debt) => (
            <PremiumCard key={debt.id}>
              <div className="p-5 sm:p-6">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Wallet className="size-4 text-brand" />
                    <h3 className="font-semibold">{debt.name}</h3>
                  </div>
                  <span
                    className={cn(
                      "rounded-full border px-2 py-0.5 text-[0.625rem] font-bold uppercase",
                      priorityStyles[debt.priority],
                    )}
                  >
                    {debt.priority}
                  </span>
                </div>
                <p className="mt-4 text-2xl font-bold">{brl(debt.balance)}</p>
                <p className="mt-3 text-sm text-muted-foreground">
                  Parcela mensal: {brl(debt.monthlyPayment)}
                </p>
              </div>
            </PremiumCard>
          ))}
        </div>
      )}
    </div>
  );
}

