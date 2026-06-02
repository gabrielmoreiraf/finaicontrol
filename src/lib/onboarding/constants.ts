/**
 * Onboarding atual: tela única em `/onboarding` (profissão + renda fixa).
 * ONBOARDING_STEPS abaixo é legado do wizard multi-step, não usado na UI.
 */
export const EXPENSE_CATEGORY_OPTIONS = [
  "Moradia",
  "Alimentação",
  "Transporte",
  "Saúde",
  "Educação",
  "Lazer",
  "Assinaturas",
  "Investimentos",
  "Outros",
] as const;

export const ONBOARDING_STEPS = [
  { id: "mode", title: "Modo de uso", description: "Como você vai usar o FinIA Control?" },
  {
    id: "profile",
    title: "Seu perfil",
    description: "Profissão e renda fixa mensal.",
  },
  {
    id: "income",
    title: "Rendas variáveis e extras",
    description: "Inclua prazos. O sistema projeta até a data de fim.",
  },
  {
    id: "categories",
    title: "Categorias de gastos",
    description: "Selecione onde você mais gasta.",
  },
  {
    id: "bills",
    title: "Contas fixas",
    description: "Despesas que se repetem todo mês.",
  },
  {
    id: "goals",
    title: "Dívidas e metas",
    description: "Opcional. Você pode completar depois.",
  },
] as const;
