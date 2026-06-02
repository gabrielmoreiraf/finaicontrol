"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { users } from "@/lib/db/schema";
import { requireAdmin } from "@/lib/admin/customers";
import { actionError, actionSuccess, type ActionResult } from "@/lib/actions/result";
import type { SubscriptionPlan, UserRole } from "@/types/finance";

const PLANS: SubscriptionPlan[] = ["free", "plus", "premium"];
const ROLES: UserRole[] = ["user", "admin"];

export async function updateCustomerAccessAction(
  formData: FormData,
): Promise<ActionResult> {
  const admin = await requireAdmin();

  const userId = String(formData.get("userId") ?? "");
  const plan = String(formData.get("plan") ?? "");
  const role = String(formData.get("role") ?? "");

  if (!userId) return actionError("Cliente inválido.");
  if (!PLANS.includes(plan as SubscriptionPlan)) return actionError("Plano inválido.");
  if (!ROLES.includes(role as UserRole)) return actionError("Papel inválido.");

  // Salvaguarda: admin não pode remover o próprio acesso master (evita auto-bloqueio).
  if (userId === admin.id && role !== "admin") {
    return actionError("Você não pode remover seu próprio acesso admin.");
  }

  await db
    .update(users)
    .set({ plan, role })
    .where(eq(users.id, userId));

  revalidatePath("/admin");
  return actionSuccess("Cliente atualizado com sucesso.");
}
