import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import {
  debts,
  expenseCategories,
  expenses,
  goals,
  incomes,
  loanPayments,
  loans,
  profiles,
} from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/auth/session";

/**
 * LGPD (Art. 18 V) — Portabilidade: exporta todos os dados do titular em JSON.
 * Escopado pela sessão; cada consulta filtra por `user.id` (isolamento).
 */
export async function GET() {
  const user = await getCurrentUser();
  if (!user) return new NextResponse(null, { status: 401 });

  const uid = user.id;
  const [profile, inc, exp, cats, deb, gol, loa, pay] = await Promise.all([
    // Exclui o avatar (blob base64) — não é dado útil de portabilidade.
    db
      .select({
        profession: profiles.profession,
        fixedMonthlyIncome: profiles.fixedMonthlyIncome,
      })
      .from(profiles)
      .where(eq(profiles.userId, uid))
      .limit(1),
    db.select().from(incomes).where(eq(incomes.userId, uid)),
    db.select().from(expenses).where(eq(expenses.userId, uid)),
    db.select().from(expenseCategories).where(eq(expenseCategories.userId, uid)),
    db.select().from(debts).where(eq(debts.userId, uid)),
    db.select().from(goals).where(eq(goals.userId, uid)),
    db.select().from(loans).where(eq(loans.userId, uid)),
    db.select().from(loanPayments).where(eq(loanPayments.userId, uid)),
  ]);

  const payload = {
    exportedAt: new Date().toISOString(),
    titular: {
      id: user.id,
      name: user.name,
      email: user.email,
      plan: user.plan,
      createdAt: user.createdAt,
    },
    perfil: profile[0] ?? null,
    receitas: inc,
    despesas: exp,
    categorias: cats,
    dividas: deb,
    metas: gol,
    emprestimos: loa,
    pagamentosEmprestimo: pay,
  };

  return new NextResponse(JSON.stringify(payload, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": 'attachment; filename="finia-control-meus-dados.json"',
      "Cache-Control": "no-store",
    },
  });
}
