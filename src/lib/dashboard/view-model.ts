import type { DashboardData } from "@/lib/dashboard";
import type { DashboardGreeting, DashboardViewModel } from "@/lib/dashboard/types";
import { AI_SUGGESTIONS, brl } from "@/lib/finance/format";

function getGreeting(): DashboardGreeting {
  const hour = new Date().getHours();
  if (hour < 12) return "Bom dia";
  if (hour < 18) return "Boa tarde";
  return "Boa noite";
}

function emptyViewModel(userName: string, realData: DashboardData): DashboardViewModel {
  const firstName = userName.split(" ")[0] || userName;
  const hasData = realData.monthlyIncome > 0 || realData.monthlyExpenses > 0;

  return {
    header: {
      greeting: getGreeting(),
      userName: firstName,
      subtitle: hasData
        ? "Seu dinheiro está sob controle."
        : "Cadastre receitas e despesas para começar.",
      projectedBalance: brl(realData.balance),
      pendingBills: realData.upcomingBills.length,
      activeGoals: realData.goalCount,
    },
    health: realData.health,
    summary: realData.summary,
    upcomingIncome: realData.upcomingIncome,
    upcomingBills: realData.upcomingBills,
    temporaryIncomes: realData.temporaryIncomes,
    projection: realData.projection,
    alerts: realData.smartAlerts,
    aiSuggestions: [...AI_SUGGESTIONS],
  };
}

export function buildDashboardViewModel(
  userName: string,
  realData: DashboardData,
): DashboardViewModel {
  return emptyViewModel(userName, realData);
}
