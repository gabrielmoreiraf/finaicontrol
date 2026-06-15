import { Construction, HardHat } from "lucide-react";
import { PremiumCard } from "@/components/app/premium/premium-card";

/**
 * Estado de módulo "em construção" — usado nas telas marcadas como "Em breve".
 */
export function UnderConstruction({ description }: { description: string }) {
  return (
    <PremiumCard>
      <div className="flex flex-col items-center gap-4 px-6 py-16 text-center sm:py-24">
        {/* Ícone de obra com um "capacete" girando suave */}
        <div className="relative flex size-20 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-500">
          <Construction className="size-10" aria-hidden />
          <HardHat
            className="absolute -right-2 -top-2 size-7 animate-bounce rounded-full bg-amber-500/15 p-1 text-amber-500"
            aria-hidden
          />
        </div>

        <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-600 dark:text-amber-400">
          🚧 Em construção
        </span>

        <div className="space-y-1.5">
          <h2 className="text-lg font-semibold tracking-tight">
            Estamos construindo este módulo
          </h2>
          <p className="mx-auto max-w-md text-sm text-muted-foreground">{description}</p>
        </div>

        <p className="text-xs text-muted-foreground">
          Nossa equipe está trabalhando nisso — em breve por aqui. 🛠️
        </p>
      </div>
    </PremiumCard>
  );
}
