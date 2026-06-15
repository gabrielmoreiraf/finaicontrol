import { desc, eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { EmpresteiManager } from "@/components/app/modules/emprestei-manager";
import { EmpresteiView } from "@/components/app/modules/emprestei-view";
import {
  createLoan,
  deleteLoan,
  registerLoanPayment,
  updateLoan,
} from "@/lib/actions/loans";
import { getCurrentUser } from "@/lib/auth/session";
import { db } from "@/lib/db/client";
import { loanPayments, loans } from "@/lib/db/schema";
import {
  buildLoanRow,
  type LoanPaymentMode,
  type LoanPaymentRecord,
  type LoanPaymentType,
  type LoanRecord,
  type LoanStatus,
} from "@/lib/finance/loans";

function mapLoan(row: typeof loans.$inferSelect): LoanRecord {
  return {
    id: row.id,
    borrowerName: row.borrowerName,
    principalAmount: Number(row.principalAmount),
    remainingPrincipal: Number(row.remainingPrincipal),
    interestRatePercent: row.interestRatePercent ? Number(row.interestRatePercent) : null,
    paymentMode: row.paymentMode as LoanPaymentMode,
    installmentAmount: row.installmentAmount ? Number(row.installmentAmount) : null,
    installmentCount: row.installmentCount,
    dayOfMonth: row.dayOfMonth,
    startDate: row.startDate,
    expectedEndDate: row.expectedEndDate,
    status: row.status as LoanStatus,
    notes: row.notes,
  };
}

function mapPayment(row: typeof loanPayments.$inferSelect): LoanPaymentRecord {
  return {
    id: row.id,
    loanId: row.loanId,
    paidAt: row.paidAt,
    amount: Number(row.amount),
    paymentType: row.paymentType as LoanPaymentType,
    note: row.note,
  };
}

export default async function EmpresteiPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  // #10: módulo oculto por padrão — só acessível se o admin liberou para o usuário.
  if (!user.loansEnabled) redirect("/dashboard");

  const loanRows = await db
    .select()
    .from(loans)
    .where(eq(loans.userId, user.id))
    .orderBy(desc(loans.createdAt));

  const paymentRows =
    loanRows.length > 0
      ? await db
          .select()
          .from(loanPayments)
          .where(eq(loanPayments.userId, user.id))
          .orderBy(desc(loanPayments.paidAt))
      : [];

  const paymentsByLoan = new Map<string, LoanPaymentRecord[]>();
  for (const payment of paymentRows) {
    const list = paymentsByLoan.get(payment.loanId) ?? [];
    list.push(mapPayment(payment));
    paymentsByLoan.set(payment.loanId, list);
  }

  const items = loanRows.map((row) =>
    buildLoanRow(mapLoan(row), paymentsByLoan.get(row.id) ?? []),
  );

  return (
    <div className="space-y-10">
      <EmpresteiView items={items} />
      <div id="cadastro-emprestei">
        <EmpresteiManager
          items={items}
          planId={user.plan!}
          createAction={createLoan}
          updateAction={updateLoan}
          deleteAction={deleteLoan}
          registerPaymentAction={registerLoanPayment}
        />
      </div>
    </div>
  );
}
