import type { DashboardViewModel } from "@/lib/dashboard/types";

/** Dados de demonstração no mesmo formato do dashboard real do app. */
export const landingDashboardDemo: DashboardViewModel = {
  header: {
    greeting: "Boa tarde",
    userName: "Maria",
    subtitle: "Seu dinheiro está sob controle.",
    projectedBalance: "R$ 2.847,00",
    pendingBills: 2,
    activeGoals: 3,
  },
  health: {
    score: 78,
    maxScore: 100,
    status: "Boa",
    description: "Poupança projetada: 12%.",
    tone: "good",
  },
  summary: [
    {
      id: "income",
      label: "Receitas do mês",
      value: "R$ 6.200,00",
      change: "3 fonte(s) cadastrada(s)",
      trend: "up",
      icon: "income",
    },
    {
      id: "expense",
      label: "Despesas previstas",
      value: "R$ 4.353,00",
      change: "12 despesa(s) prevista(s)",
      trend: "neutral",
      icon: "expense",
    },
    {
      id: "balance",
      label: "Saldo projetado",
      value: "R$ 2.847,00",
      change: "positivo",
      trend: "up",
      icon: "balance",
    },
    {
      id: "goals",
      label: "Metas ativas",
      value: "3 ativas",
      change: "em andamento",
      trend: "neutral",
      icon: "goals",
    },
  ],
  upcomingIncome: [
    {
      id: "1",
      label: "Salário",
      date: "05/06",
      amount: "R$ 4.200,00",
      category: "Fixa",
    },
    {
      id: "2",
      label: "Freela design",
      date: "10/06",
      amount: "R$ 800,00",
      category: "Extra",
    },
  ],
  upcomingBills: [
    {
      id: "1",
      label: "Aluguel",
      date: "10/06",
      amount: "R$ 1.800,00",
      daysUntil: 3,
      priority: "high",
    },
    {
      id: "2",
      label: "Cartão Nubank",
      date: "15/06",
      amount: "R$ 450,00",
      daysUntil: 8,
      priority: "medium",
    },
  ],
  temporaryIncomes: [
    {
      id: "1",
      label: "Freela design",
      amount: "R$ 500,00",
      endsAt: "Dez/2026",
      monthsLeft: 7,
      progress: 58,
    },
  ],
  projection: [
    { month: "Jun", receitas: 6200, despesas: 4353, saldo: 2847 },
    { month: "Jul", receitas: 6200, despesas: 4280, saldo: 2920 },
    { month: "Ago", receitas: 6000, despesas: 4410, saldo: 2590 },
    { month: "Set", receitas: 6200, despesas: 4300, saldo: 2900 },
    { month: "Out", receitas: 6200, despesas: 4250, saldo: 2950 },
    { month: "Nov", receitas: 6200, despesas: 4310, saldo: 2890 },
  ],
  alerts: [
    {
      id: "a1",
      message: "Alimentação em 87% do limite. Faltam R$ 78 para estourar.",
      tone: "warning",
    },
    {
      id: "a2",
      message: "Renda extra \"Freela design\" termina em dezembro/2026.",
      tone: "insight",
    },
    {
      id: "a3",
      message: "Saldo projetado positivo nos próximos meses.",
      tone: "success",
    },
  ],
  aiSuggestions: [
    "Quanto posso gastar este mês?",
    "Minhas contas do próximo mês",
    "O que acontece quando minha renda extra acabar?",
  ],
};
