export type DividaRow = {
  id: string;
  name: string;
  balance: number;
  monthlyPayment: number;
  priority: "Alta" | "Média" | "Baixa";
};

export function debtPriority(balance: number, monthlyPayment: number): DividaRow["priority"] {
  const ratio = monthlyPayment > 0 ? balance / monthlyPayment : balance;
  if (ratio <= 6 || monthlyPayment >= balance * 0.15) return "Alta";
  if (ratio <= 12) return "Média";
  return "Baixa";
}
