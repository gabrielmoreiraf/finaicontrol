import { Suspense } from "react";
import { redirect } from "next/navigation";
import { IaAssistantView } from "@/components/app/modules/ia-assistant-view";
import { PlanLockedScreen } from "@/components/app/plan-locked-screen";
import { getCurrentUser } from "@/lib/auth/session";
import { hasPlanAccess } from "@/lib/plans/features";

export default async function IaPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!hasPlanAccess(user.plan!, "ai_assistant")) {
    return <PlanLockedScreen feature="ai_assistant" planId={user.plan!} />;
  }

  return (
    <Suspense fallback={<div className="h-96 animate-pulse rounded-2xl bg-muted/30" />}>
      <IaAssistantView />
    </Suspense>
  );
}
