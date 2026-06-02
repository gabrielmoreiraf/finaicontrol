import { Suspense } from "react";
import { redirect } from "next/navigation";
import { IaAssistantView } from "@/components/app/modules/ia-assistant-view";
import { PlanGate } from "@/components/app/plan-gate";
import { getCurrentUser } from "@/lib/auth/session";

export default async function IaPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <PlanGate feature="ai_assistant" planId={user.plan!} fullPage>
      <Suspense fallback={<div className="h-96 animate-pulse rounded-2xl bg-muted/30" />}>
        <IaAssistantView />
      </Suspense>
    </PlanGate>
  );
}
