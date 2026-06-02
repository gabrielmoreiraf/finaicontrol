"use client";

import { EmptyState } from "@/components/app/premium/empty-state";
import { PageHeader } from "@/components/app/premium/page-header";
import { StatCard } from "@/components/app/premium/data-table";
import { brl } from "@/lib/finance/format";
import { buildLoanSummary, type LoanRow } from "@/lib/finance/loans";

export function EmpresteiView({ items }: { items: LoanRow[] }) {
  const summary = buildLoanSummary(items);

  return (
    <div className="space-y-6 sm:space-y-8">
      <PageHeader
        title="Emprestei"
        description="Controle quem pegou emprestado, juros mensais, parcelas e pagamentos recebidos."
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total em aberto"
          value={brl(summary.totalOutstanding)}
          change={`${summary.activeCount} empréstimo(s) ativo(s)`}
        />
        <StatCard
          label="A receber este mês"
          value={brl(summary.dueThisMonth)}
          change="juros e parcelas previstas"
        />
        <StatCard
          label="Em atraso"
          value={String(summary.overdueCount)}
          change={summary.overdueCount === 0 ? "nenhum" : "precisa cobrar"}
        />
        <StatCard
          label="Total recebido"
          value={brl(summary.totalReceived)}
          change="histórico de pagamentos"
        />
      </div>

      {items.length === 0 && (
        <EmptyState
          title="Nenhum empréstimo cadastrado"
          description="Registre quem pegou dinheiro emprestado, a taxa de juros e quando deve pagar."
        />
      )}
    </div>
  );
}
