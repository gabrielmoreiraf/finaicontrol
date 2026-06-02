export const brl = (value: number) =>
  value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export const brlCompact = (value: number) =>
  value.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });

export const INCOME_TYPE_LABELS: Record<string, string> = {
  fixed: "Fixa",
  variable: "Variável",
  extra: "Extra",
  temporary: "Temporária",
};

export const EXPENSE_TYPE_LABELS: Record<string, string> = {
  fixed: "Fixa",
  variable: "Variável",
  installment: "Parcelada",
};

export const AI_SUGGESTIONS = [
  "Quanto gastei este mês?",
  "Posso comprar um notebook?",
  "Como quitar minhas dívidas?",
  "Quanto sobra até o fim do mês?",
] as const;

export const IA_SUGGESTIONS = [
  "Analisar meus gastos com alimentação",
  "Simular quitação de dívidas",
  "Projetar economia nos próximos 3 meses",
  "Verificar impacto da renda temporária",
] as const;
