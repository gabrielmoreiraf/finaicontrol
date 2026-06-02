import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  Bot,
  CreditCard,
  HandCoins,
  LayoutDashboard,
  LineChart,
  Target,
  TrendingUp,
  Wallet,
} from "lucide-react";
import type { PlanFeature } from "@/lib/plans/features";

export type AppNavLink = {
  href: string;
  label: string;
  shortLabel?: string;
  icon: LucideIcon;
  feature: PlanFeature;
};

export const APP_NAV_LINKS: AppNavLink[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, feature: "dashboard_basic" },
  { href: "/receitas", label: "Receitas", icon: TrendingUp, feature: "incomes" },
  { href: "/despesas", label: "Despesas", icon: CreditCard, feature: "expenses" },
  { href: "/metas", label: "Metas", icon: Target, feature: "goals" },
  { href: "/dividas", label: "Dívidas", icon: Wallet, feature: "debts" },
  { href: "/emprestei", label: "Emprestei", icon: HandCoins, feature: "loans" },
  { href: "/investimentos", label: "Investimentos", icon: LineChart, feature: "investments" },
  { href: "/relatorios", label: "Relatórios", icon: BarChart3, feature: "reports" },
  { href: "/ia", label: "Assistente IA", shortLabel: "IA", icon: Bot, feature: "ai_assistant" },
];
