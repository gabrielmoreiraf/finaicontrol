export function digitsToCents(digits: string): number {
  const normalized = digits.replace(/\D/g, "");
  if (!normalized) return 0;
  return parseInt(normalized, 10);
}

export function numberToCents(value: number): number {
  if (!Number.isFinite(value) || value <= 0) return 0;
  return Math.round(value * 100);
}

export function centsToNumber(cents: number): number {
  return cents / 100;
}

export function formatCentsAsBrl(cents: number): string {
  return centsToNumber(cents).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export function parseBrlInput(value: string): number {
  return centsToNumber(digitsToCents(value));
}
