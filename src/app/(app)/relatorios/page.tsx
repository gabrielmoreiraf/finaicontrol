import { redirect } from "next/navigation";
import { RelatoriosView } from "@/components/app/modules/relatorios-view";
import { PlanLockedScreen } from "@/components/app/plan-locked-screen";
import { getCurrentUser } from "@/lib/auth/session";
import { hasPlanAccess } from "@/lib/plans/features";

export default async function RelatoriosPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!hasPlanAccess(user.plan!, "reports")) {
    return <PlanLockedScreen feature="reports" planId={user.plan!} />;
  }

  return <RelatoriosView />;
}
