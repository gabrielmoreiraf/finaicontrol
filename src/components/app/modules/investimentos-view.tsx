import { LineChart } from "lucide-react";
import { EmptyState } from "@/components/app/premium/empty-state";
import { PageHeader } from "@/components/app/premium/page-header";
import { PremiumCard } from "@/components/app/premium/premium-card";

export function InvestimentosView() {
  return (
    <div className="space-y-6 sm:space-y-8">
      <PageHeader
        title="Investimentos"
        description="Carteira consolidada com distribuição, rentabilidade e evolução patrimonial."
      />

      <PremiumCard>
        <div className="p-8 sm:p-12">
          <EmptyState
            title="Nenhum investimento cadastrado"
            description="Este módulo será preenchido quando você cadastrar sua carteira. Por enquanto, organize receitas, despesas e metas."
            className="border-none bg-transparent py-4"
          />
          <div className="mt-6 flex justify-center">
            <LineChart className="size-12 text-muted-foreground/30" aria-hidden />
          </div>
        </div>
      </PremiumCard>
    </div>
  );
}
