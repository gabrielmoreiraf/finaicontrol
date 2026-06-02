import { redirect } from "next/navigation";
import { DashboardView } from "@/components/app/dashboard-view";
import { getCurrentUser } from "@/lib/auth/session";
import { getDashboardData } from "@/lib/dashboard";
import { buildDashboardViewModel } from "@/lib/dashboard/view-model";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const realData = await getDashboardData(user.id);
  const viewModel = buildDashboardViewModel(user.name, realData);

  return <DashboardView data={viewModel} planId={user.plan!} />;
}
