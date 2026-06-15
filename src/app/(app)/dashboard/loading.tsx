import { Skeleton } from "@/components/ui/skeleton";

/** Skeleton do dashboard (saudação + 5 indicadores + assistente + 2 colunas). */
export default function DashboardLoading() {
  return (
    <div className="space-y-8" role="status" aria-label="Carregando dashboard">
      {/* Saudação */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-64 max-w-[80%]" />
        <Skeleton className="h-4 w-52 max-w-[60%]" />
      </div>

      {/* Indicadores + saúde (5 cards) */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="rounded-2xl border border-border bg-card p-4 dark:border-white/[0.06] sm:p-5"
          >
            <Skeleton className="size-9 rounded-xl" />
            <Skeleton className="mt-3 h-4 w-20" />
            <Skeleton className="mt-2 h-6 w-28" />
            <Skeleton className="mt-2 h-3 w-16" />
          </div>
        ))}
      </div>

      {/* Assistente IA */}
      <Skeleton className="h-40 w-full rounded-2xl" />

      {/* Próximos recebimentos / pagamentos */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Skeleton className="h-72 w-full rounded-2xl" />
        <Skeleton className="h-72 w-full rounded-2xl" />
      </div>

      <span className="sr-only" aria-live="polite">
        Carregando dashboard
      </span>
    </div>
  );
}
