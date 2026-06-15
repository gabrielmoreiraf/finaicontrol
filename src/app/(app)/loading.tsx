import { Skeleton } from "@/components/ui/skeleton";

/** Skeleton genérico das telas do app (título + indicadores + toolbar + tabela). */
export default function AppLoading() {
  return (
    <div className="space-y-8" role="status" aria-label="Carregando conteúdo">
      {/* Cabeçalho */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-80 max-w-full" />
      </div>

      {/* Indicadores (stat cards) */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-2xl border border-border bg-card p-4 dark:border-white/[0.06] sm:p-5"
          >
            <Skeleton className="h-4 w-24" />
            <Skeleton className="mt-3 h-7 w-32" />
            <Skeleton className="mt-2 h-3 w-20" />
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="space-y-3">
        <Skeleton className="h-5 w-40" />
        <div className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-card/60 p-2 dark:border-white/[0.06]">
          <Skeleton className="h-9 w-64 max-w-[55%] rounded-lg" />
          <Skeleton className="h-9 w-36 rounded-lg" />
        </div>
      </div>

      {/* Tabela */}
      <div className="overflow-hidden rounded-2xl border border-border bg-card dark:border-white/[0.06]">
        <div className="border-b border-border bg-muted/50 px-4 py-3.5 dark:border-white/[0.06]">
          <Skeleton className="h-4 w-full max-w-md" />
        </div>
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 border-b border-border/60 px-4 py-4 last:border-0 dark:border-white/[0.04]"
          >
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-5 w-16 rounded-md" />
            <Skeleton className="hidden h-4 w-24 sm:block" />
            <Skeleton className="ml-auto h-4 w-20" />
          </div>
        ))}
      </div>

      <span className="sr-only" aria-live="polite">
        Carregando conteúdo
      </span>
    </div>
  );
}
