import { Activity } from "lucide-react";
import { DashboardPanel } from "@/components/app/dashboard/dashboard-panel";
import type { DashboardHealthData } from "@/lib/dashboard/types";

export function FinancialHealthCard({ data }: { data: DashboardHealthData }) {
  const percentage = Math.round((data.score / data.maxScore) * 100);
  const circumference = 2 * Math.PI * 54;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <DashboardPanel className="h-full">
      <div className="flex h-full flex-col p-6 sm:p-7">
        <div className="mb-4 flex items-center gap-2">
          <Activity className="size-5 text-brand" aria-hidden />
          <h2 className="text-lg font-semibold">Saúde Financeira</h2>
        </div>

        <div className="flex flex-1 flex-col items-center justify-center gap-5 sm:flex-row sm:gap-8">
          <div className="relative size-36 shrink-0 sm:size-40">
            <svg className="size-full -rotate-90" viewBox="0 0 120 120" aria-hidden>
              <circle
                cx="60"
                cy="60"
                r="54"
                fill="none"
                stroke="currentColor"
                strokeWidth="10"
                className="text-muted/60"
              />
              <circle
                cx="60"
                cy="60"
                r="54"
                fill="none"
                stroke="currentColor"
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                className="text-brand drop-shadow-[0_0_8px_rgba(16,185,129,0.45)]"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold sm:text-4xl">
                {data.score}
                <span className="text-lg text-muted-foreground">/{data.maxScore}</span>
              </span>
            </div>
          </div>

          <div className="text-center sm:text-left">
            <p className="text-2xl font-bold text-brand">{data.status}</p>
            <p className="mt-2 max-w-xs text-sm leading-relaxed text-muted-foreground">
              {data.description}
            </p>
          </div>
        </div>
      </div>
    </DashboardPanel>
  );
}
