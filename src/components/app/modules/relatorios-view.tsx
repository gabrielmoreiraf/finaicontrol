import { PageHeader } from "@/components/app/premium/page-header";
import { UnderConstruction } from "@/components/app/premium/under-construction";

export function RelatoriosView() {
  return (
    <div className="space-y-6 sm:space-y-8">
      <PageHeader
        title="Relatórios"
        description="Dashboard analítico com filtros por período e exportação."
      />

      <UnderConstruction description="Em breve você vai gerar gráficos, análises e resumos por período, com exportação, por aqui." />
    </div>
  );
}
