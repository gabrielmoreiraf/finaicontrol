"use server";

import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { profiles, users } from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/auth/session";
import { TOAST_URL_KEYS } from "@/lib/toast/messages";

export async function completeOnboardingAction(formData: FormData): Promise<void> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const fixedMonthlyIncome = Number(formData.get("fixedMonthlyIncome") ?? 0) || 0;
  const profession = String(formData.get("profession") ?? "").trim();

  await db
    .update(profiles)
    .set({ fixedMonthlyIncome: fixedMonthlyIncome.toFixed(2), profession })
    .where(eq(profiles.userId, user.id));

  await db.update(users).set({ onboardingComplete: true }).where(eq(users.id, user.id));

  redirect(`/dashboard?toast=${TOAST_URL_KEYS.onboarding}`);
}
