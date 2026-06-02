import { redirect } from "next/navigation";
import { InvestimentosView } from "@/components/app/modules/investimentos-view";
import { PlanGate } from "@/components/app/plan-gate";
import { getCurrentUser } from "@/lib/auth/session";

export default async function InvestimentosPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <PlanGate feature="investments" planId={user.plan!} fullPage>
      <InvestimentosView />
    </PlanGate>
  );
}
