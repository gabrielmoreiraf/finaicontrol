import { redirect } from "next/navigation";
import { PageHeader } from "@/components/app/premium/page-header";
import { PlanLockedScreen } from "@/components/app/plan-locked-screen";
import { UnderConstruction } from "@/components/app/premium/under-construction";
import { getCurrentUser } from "@/lib/auth/session";
import { hasPlanAccess } from "@/lib/plans/features";

export default async function DividasPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!hasPlanAccess(user.plan!, "debts")) {
    return <PlanLockedScreen feature="debts" planId={user.plan!} />;
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      <PageHeader
        title="Dívidas"
        description="Acompanhe saldos devedores, parcelas e prioridade de quitação."
      />

      <UnderConstruction description="Em breve você vai cadastrar suas dívidas e acompanhar saldos, parcelas e prioridade de quitação por aqui." />
    </div>
  );
}
