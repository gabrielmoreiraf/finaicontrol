"use server";

import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { users } from "@/lib/db/schema";
import { destroySession, getCurrentUser } from "@/lib/auth/session";
import { verifyPassword } from "@/lib/auth/password";
import { TOAST_URL_KEYS } from "@/lib/toast/messages";

export type DeleteAccountState = { error?: string };

/**
 * LGPD (Art. 18 VI) — Direito ao esquecimento: exclui definitivamente a conta.
 * Exige re-autenticação por senha. Os FKs `onDelete: cascade` removem perfil,
 * receitas, despesas, dívidas, metas, empréstimos, pagamentos, sessões e tokens.
 */
export async function deleteAccountAction(
  _prev: DeleteAccountState,
  formData: FormData,
): Promise<DeleteAccountState> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const password = String(formData.get("password") ?? "");
  if (!password) return { error: "Informe sua senha para confirmar a exclusão." };

  const [row] = await db
    .select({ hash: users.passwordHash })
    .from(users)
    .where(eq(users.id, user.id))
    .limit(1);

  if (!row || !(await verifyPassword(password, row.hash))) {
    return { error: "Senha incorreta." };
  }

  await db.delete(users).where(eq(users.id, user.id));
  await destroySession();

  redirect(`/?toast=${TOAST_URL_KEYS.accountDeleted}`);
}
