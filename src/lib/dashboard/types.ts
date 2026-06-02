export type DashboardGreeting = "Bom dia" | "Boa tarde" | "Boa noite";

export interface DashboardHeaderData {
  greeting: DashboardGreeting;
  userName: string;
  subtitle: string;
  projectedBalance: string;
  pendingBills: number;
  activeGoals: number;
}

export interface DashboardSummaryItem {
  id: string;
  label: string;
  value: string;
  change: string;
  trend: "up" | "down" | "neutral";
  icon: "income" | "expense" | "balance" | "goals";
}

export interface DashboardHealthData {
  score: number;
  maxScore: number;
  status: string;
  description: string;
}

export interface DashboardUpcomingIncome {
  id: string;
  label: string;
  date: string;
  amount: string;
  category?: string;
  bank?: string;
}

export interface DashboardUpcomingBill {
  id: string;
  label: string;
  date: string;
  amount: string;
  daysUntil: number;
  priority: "high" | "medium" | "low";
}

export interface DashboardTemporaryIncome {
  id: string;
  label: string;
  amount: string;
  endsAt: string;
  monthsLeft: number;
  progress: number;
}

export interface DashboardProjectionPoint {
  month: string;
  receitas: number;
  despesas: number;
  saldo: number;
}

export interface DashboardSmartAlert {
  id: string;
  message: string;
  tone: "insight" | "warning" | "success";
}

export interface DashboardViewModel {
  header: DashboardHeaderData;
  health: DashboardHealthData;
  summary: DashboardSummaryItem[];
  upcomingIncome: DashboardUpcomingIncome[];
  upcomingBills: DashboardUpcomingBill[];
  temporaryIncomes: DashboardTemporaryIncome[];
  projection: DashboardProjectionPoint[];
  alerts: DashboardSmartAlert[];
  aiSuggestions: string[];
}
