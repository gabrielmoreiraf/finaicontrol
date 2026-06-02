export type UsageMode = "personal";

export type UserRole = "user" | "admin";

export type SubscriptionPlan = "free" | "plus" | "premium";

export type IncomeType = "fixed" | "variable" | "extra" | "temporary";

export interface TemporaryIncome {
  id: string;
  label: string;
  amount: number;
  dayOfMonth: number;
  endDate: string;
  type: IncomeType;
}

export interface FixedBill {
  id: string;
  name: string;
  amount: number;
  category: string;
}

export interface DebtItem {
  id: string;
  name: string;
  balance: number;
  monthlyPayment: number;
}

export interface FinancialGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
}

export interface OnboardingProfile {
  profession: string;
  fixedMonthlyIncome: number;
  hasVariableIncome: boolean;
  hasExtraIncome: boolean;
  temporaryIncomes: TemporaryIncome[];
  expenseCategories: string[];
  fixedBills: FixedBill[];
  debts: DebtItem[];
  goals: FinancialGoal[];
}

export interface UserSession {
  id: string;
  name: string;
  email: string;
  mode: UsageMode;
  onboardingComplete: boolean;
  profile: OnboardingProfile | null;
  createdAt: string;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  mode: UsageMode;
  role: UserRole;
  /** Plano efetivo para gating: admins recebem acesso premium. */
  plan: SubscriptionPlan | null;
  onboardingComplete: boolean;
  createdAt: string;
  avatarUrl: string | null;
  fixedMonthlyIncome: number;
}
