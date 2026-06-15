import { redirect } from "next/navigation";
import { InvestimentosView } from "@/components/app/modules/investimentos-view";
import { PlanLockedScreen } from "@/components/app/plan-locked-screen";
import { getCurrentUser } from "@/lib/auth/session";
import { hasPlanAccess } from "@/lib/plans/features";

export default async function InvestimentosPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!hasPlanAccess(user.plan!, "investments")) {
    return <PlanLockedScreen feature="investments" planId={user.plan!} />;
  }

  return <InvestimentosView />;
}
