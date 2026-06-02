import "server-only";

import { desc, eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { db } from "@/lib/db/client";
import { profiles, users } from "@/lib/db/schema";
import { buildAvatarUrl } from "@/lib/avatar/process-upload";
import { getCurrentUser } from "@/lib/auth/session";
import type { SubscriptionPlan, UserRole } from "@/types/finance";

export interface AdminCustomer {
  id: string;
  name: string;
  email: string;
  plan: SubscriptionPlan | null;
  role: UserRole;
  emailVerified: boolean;
  onboardingComplete: boolean;
  createdAt: string;
  avatarUrl: string | null;
  profession: string;
  fixedMonthlyIncome: number;
  hasVariableIncome: boolean;
  hasExtraIncome: boolean;
}

export interface AdminOverview {
  total: number;
  free: number;
  plus: number;
  premium: number;
  verified: number;
  onboarded: number;
}

/** Garante que apenas a conta master (role=admin) acesse a área. */
export async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "admin") redirect("/dashboard");
  return user;
}

function buildOverview(customers: AdminCustomer[]): AdminOverview {
  return customers.reduce<AdminOverview>(
    (acc, c) => {
      acc.total += 1;
      if (c.plan === "plus") acc.plus += 1;
      else if (c.plan === "premium") acc.premium += 1;
      else acc.free += 1;
      if (c.emailVerified) acc.verified += 1;
      if (c.onboardingComplete) acc.onboarded += 1;
      return acc;
    },
    { total: 0, free: 0, plus: 0, premium: 0, verified: 0, onboarded: 0 },
  );
}

export async function getAdminData(): Promise<{
  customers: AdminCustomer[];
  overview: AdminOverview;
}> {
  const rows = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      plan: users.plan,
      role: users.role,
      emailVerified: users.emailVerified,
      onboardingComplete: users.onboardingComplete,
      createdAt: users.createdAt,
      avatarUpdatedAt: profiles.avatarUpdatedAt,
      profession: profiles.profession,
      fixedMonthlyIncome: profiles.fixedMonthlyIncome,
      hasVariableIncome: profiles.hasVariableIncome,
      hasExtraIncome: profiles.hasExtraIncome,
    })
    .from(users)
    .leftJoin(profiles, eq(profiles.userId, users.id))
    .orderBy(desc(users.createdAt));

  const customers: AdminCustomer[] = rows.map((r) => ({
    id: r.id,
    name: r.name,
    email: r.email,
    plan: (r.plan as SubscriptionPlan | null) ?? null,
    role: (r.role as UserRole) ?? "user",
    emailVerified: r.emailVerified,
    onboardingComplete: r.onboardingComplete,
    createdAt: r.createdAt.toISOString(),
    avatarUrl: buildAvatarUrl(r.id, r.avatarUpdatedAt),
    profession: r.profession ?? "",
    fixedMonthlyIncome: Number(r.fixedMonthlyIncome ?? 0),
    hasVariableIncome: r.hasVariableIncome ?? false,
    hasExtraIncome: r.hasExtraIncome ?? false,
  }));

  return { customers, overview: buildOverview(customers) };
}
