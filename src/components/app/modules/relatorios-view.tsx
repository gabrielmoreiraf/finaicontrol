import { BarChart3 } from "lucide-react";
import { EmptyState } from "@/components/app/premium/empty-state";
import { PageHeader } from "@/components/app/premium/page-header";
import { PremiumCard } from "@/components/app/premium/premium-card";
import { Button } from "@/components/ui/button";

export function RelatoriosView() {
  return (
    <div className="space-y-6 sm:space-y-8">
      <PageHeader
        title="Relatórios"
        description="Dashboard analítico com filtros por período e exportação."
        actions={
          <Button variant="outline" className="gap-2 rounded-xl border-white/[0.08]" disabled>
            Exportar (em breve)
          </Button>
        }
      />

      <PremiumCard>
        <div className="p-8 sm:p-12">
          <EmptyState
            title="Relatórios disponíveis após cadastro"
            description="Cadastre receitas e despesas para gerar análises, gráficos e resumos por período."
            className="border-none bg-transparent py-4"
          />
          <div className="mt-6 flex justify-center">
            <BarChart3 className="size-12 text-muted-foreground/30" aria-hidden />
          </div>
        </div>
      </PremiumCard>
    </div>
  );
}
