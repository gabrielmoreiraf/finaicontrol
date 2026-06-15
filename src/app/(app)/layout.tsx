import { redirect } from "next/navigation";
import { AppShell } from "@/components/app/app-shell";
import { getCurrentUser } from "@/lib/auth/session";
import { getUserNotifications } from "@/lib/notifications";
import { getPlanDetails, getPlanLabel } from "@/lib/plans";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!user.plan) redirect("/escolher-plano");
  if (!user.onboardingComplete) redirect("/onboarding");

  const plan = getPlanDetails(user.plan);
  const notifications = await getUserNotifications(user.id, user.fixedMonthlyIncome);

  return (
    <AppShell
      userName={user.name}
      avatarUrl={user.avatarUrl}
      planLabel={getPlanLabel(user.plan)}
      planId={user.plan}
      planHighlighted={plan.highlighted}
      isAdmin={user.role === "admin"}
      loansEnabled={user.loansEnabled}
      notifications={notifications}
    >
      {children}
    </AppShell>
  );
}
