import { Activity } from "lucide-react";
import { DashboardPanel } from "@/components/app/dashboard/dashboard-panel";
import type { DashboardHealthData } from "@/lib/dashboard/types";
import { cn } from "@/lib/utils";

const TONE_STYLES: Record<
  DashboardHealthData["tone"],
  { ring: string; text: string }
> = {
  good: {
    ring: "text-brand drop-shadow-[0_0_8px_rgba(16,185,129,0.45)]",
    text: "text-brand",
  },
  regular: {
    ring: "text-amber-500 drop-shadow-[0_0_8px_rgba(245,158,11,0.45)] dark:text-amber-400",
    text: "text-amber-600 dark:text-amber-400",
  },
  bad: {
    ring: "text-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.45)] dark:text-red-400",
    text: "text-red-600 dark:text-red-400",
  },
  empty: {
    ring: "text-muted-foreground/50",
    text: "text-muted-foreground",
  },
};

export function FinancialHealthCard({ data }: { data: DashboardHealthData }) {
  const percentage = Math.round((data.score / data.maxScore) * 100);
  const circumference = 2 * Math.PI * 54;
  const offset = circumference - (percentage / 100) * circumference;
  const tone = TONE_STYLES[data.tone];

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
                className={cn("transition-colors", tone.ring)}
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
            <p className={cn("text-2xl font-bold", tone.text)}>{data.status}</p>
            <p className="mt-2 max-w-xs text-sm leading-relaxed text-muted-foreground">
              {data.description}
            </p>
          </div>
        </div>
      </div>
    </DashboardPanel>
  );
}
