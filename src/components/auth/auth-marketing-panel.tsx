import { Goal, PieChart, Sparkles, Wallet } from "lucide-react";

const features = [
  {
    icon: Wallet,
    title: "Receitas e despesas",
    description: "Registre entradas e saídas e veja para onde seu dinheiro está indo.",
  },
  {
    icon: PieChart,
    title: "Dívidas sob controle",
    description: "Acompanhe parcelas e quite seus compromissos no tempo certo.",
  },
  {
    icon: Goal,
    title: "Metas financeiras",
    description: "Defina objetivos e monitore seu progresso até alcançá-los.",
  },
  {
    icon: Sparkles,
    title: "Assistente com IA",
    description: "Receba insights e projeções inteligentes sobre suas finanças.",
  },
];

export function AuthMarketingPanel() {
  return (
    <div className="flex w-full max-w-md flex-col items-start gap-5 lg:gap-6">
      <div className="flex flex-col gap-3">
        <span className="inline-flex items-center self-start rounded-full border border-emerald-400/30 bg-emerald-400/5 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.15em] text-emerald-400 sm:text-[11px]">
          Controle financeiro com IA
        </span>

        <h2 className="text-2xl font-bold leading-tight text-white lg:text-3xl">
          Suas finanças pessoais,
          <br />
          <span className="text-emerald-400">organizadas e inteligentes.</span>
        </h2>

        <p className="max-w-md text-sm leading-relaxed text-white/55 lg:text-base">
          O FinIA Control reúne receitas, despesas, dívidas e metas em um só painel, com a ajuda da
          inteligência artificial para você decidir melhor.
        </p>
      </div>

      <div className="grid w-full grid-cols-2 gap-3 border-t border-white/10 pt-5 lg:gap-4 lg:pt-6">
        {features.map((f) => (
          <div key={f.title} className="flex flex-col gap-1.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-400/10 text-emerald-400 lg:h-9 lg:w-9">
              <f.icon className="size-4" aria-hidden />
            </div>
            <h3 className="text-xs font-semibold text-white sm:text-sm">{f.title}</h3>
            <p className="text-[11px] leading-snug text-white/45 sm:text-xs">{f.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
