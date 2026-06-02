"use client";

import dynamic from "next/dynamic";
import { AiAssistantCard } from "@/components/app/dashboard/ai-assistant-card";
import { DashboardHeader } from "@/components/app/dashboard/dashboard-header";

const ProjectionChart = dynamic(
  () =>
    import("@/components/app/dashboard/projection-chart").then((m) => m.ProjectionChart),
  { loading: () => null },
);
import { SmartAlerts } from "@/components/app/dashboard/smart-alerts";
import { SummaryCards } from "@/components/app/dashboard/summary-cards";
import { TemporaryIncomeCard } from "@/components/app/dashboard/temporary-income-card";
import { UpcomingBillsCard } from "@/components/app/dashboard/upcoming-bills-card";
import { UpcomingIncomeCard } from "@/components/app/dashboard/upcoming-income-card";
import { PlanFeatureUpsell } from "@/components/app/plan-feature-upsell";
import { hasPlanAccess, type PlanFeature } from "@/lib/plans/features";
import type { DashboardViewModel } from "@/lib/dashboard/types";
import type { SubscriptionPlan } from "@/types/finance";

export function DashboardView({
  data,
  planId = "free",
}: {
  data: DashboardViewModel;
  planId?: SubscriptionPlan;
}) {
  const canAi = hasPlanAccess(planId, "ai_assistant");
  const canUpcoming = hasPlanAccess(planId, "upcoming_overview");
  const canProjections = hasPlanAccess(planId, "projections");
  const canAlerts = hasPlanAccess(planId, "smart_alerts");

  const lockedFeatures: PlanFeature[] = [];
  if (!canAi) lockedFeatures.push("ai_assistant");
  if (!canUpcoming) lockedFeatures.push("upcoming_overview");
  if (!canProjections) lockedFeatures.push("projections");
  if (!canAlerts) lockedFeatures.push("smart_alerts");

  return (
    <div className="flex w-full flex-col gap-6 sm:gap-7 lg:gap-8">
      <DashboardHeader
        greeting={data.header.greeting}
        userName={data.header.userName}
        subtitle={data.header.subtitle}
      />

      <SummaryCards items={data.summary} health={data.health} />

      {canAi && <AiAssistantCard suggestions={data.aiSuggestions} />}

      {canUpcoming && (
        <>
          <div className="grid gap-4 lg:grid-cols-2">
            <UpcomingIncomeCard items={data.upcomingIncome} />
            <UpcomingBillsCard items={data.upcomingBills} />
          </div>
          <TemporaryIncomeCard items={data.temporaryIncomes} />
        </>
      )}

      {canProjections && <ProjectionChart data={data.projection} />}

      {canAlerts && <SmartAlerts items={data.alerts} />}

      {lockedFeatures.length > 0 && (
        <PlanFeatureUpsell features={lockedFeatures} planId={planId} />
      )}
    </div>
  );
}
