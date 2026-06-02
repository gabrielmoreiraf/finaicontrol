export type DespesaRow = {
  id: string;
  name: string;
  amount: number;
  category: string;
  type: string;
  dayOfMonth: number | null;
};

export type DespesaUpcoming = {
  id: string;
  name: string;
  amount: number;
  date: string;
  days: number;
};

export type DespesaCategory = {
  name: string;
  amount: number;
  percent: number;
  color: string;
};

const COLORS = ["#00e676", "#f97316", "#8b5cf6", "#38bdf8", "#a3a3a3"];

export function buildDespesaCategories(items: DespesaRow[]): DespesaCategory[] {
  const totals = new Map<string, number>();
  for (const item of items) {
    const key = item.category?.trim() || "Sem categoria";
    totals.set(key, (totals.get(key) ?? 0) + item.amount);
  }
  const grand = Array.from(totals.values()).reduce((a, b) => a + b, 0) || 1;
  return Array.from(totals.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([name, amount], index) => ({
      name,
      amount,
      percent: Math.round((amount / grand) * 100),
      color: COLORS[index % COLORS.length] ?? "#a3a3a3",
    }));
}

export function buildDespesaUpcoming(items: DespesaRow[]): DespesaUpcoming[] {
  const now = new Date();
  return items
    .filter((item) => item.dayOfMonth && item.amount > 0)
    .map((item) => {
      const year = now.getFullYear();
      const month = now.getMonth();
      const lastDay = new Date(year, month + 1, 0).getDate();
      const day = Math.min(item.dayOfMonth!, lastDay);
      let target = new Date(year, month, day);
      if (target < now) {
        const nextMonth = month + 1;
        const nextLast = new Date(year, nextMonth + 1, 0).getDate();
        target = new Date(year, nextMonth, Math.min(item.dayOfMonth!, nextLast));
      }
      const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const end = new Date(target.getFullYear(), target.getMonth(), target.getDate());
      const days = Math.max(0, Math.round((end.getTime() - start.getTime()) / 86_400_000));
      return {
        id: item.id,
        name: item.name,
        amount: item.amount,
        date: target.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }),
        days,
      };
    })
    .sort((a, b) => a.days - b.days);
}
