import { PageHeader } from "@/components/app/premium/page-header";
import { UnderConstruction } from "@/components/app/premium/under-construction";

export function InvestimentosView() {
  return (
    <div className="space-y-6 sm:space-y-8">
      <PageHeader
        title="Investimentos"
        description="Carteira consolidada com distribuição, rentabilidade e evolução patrimonial."
      />

      <UnderConstruction description="Em breve você vai acompanhar sua carteira, com distribuição, rentabilidade e evolução patrimonial por aqui." />
    </div>
  );
}
