import { redirect } from "next/navigation";
import { RelatoriosView } from "@/components/app/modules/relatorios-view";
import { PlanGate } from "@/components/app/plan-gate";
import { getCurrentUser } from "@/lib/auth/session";

export default async function RelatoriosPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <PlanGate feature="reports" planId={user.plan!} fullPage>
      <RelatoriosView />
    </PlanGate>
  );
}
