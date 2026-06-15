/**
 * Converte uma data salva como texto (`YYYY-MM-DD`) numa `Date` no fuso LOCAL.
 *
 * `new Date("2026-08-01")` interpreta a string como UTC (meia-noite), o que em
 * fusos negativos (ex.: Brasil, UTC-3) "volta" para 31/07 21h — causando um
 * off-by-one que exibe o mês/dia errado. Parsear os componentes evita isso.
 */
export function parseLocalDate(value: string): Date {
  const [year, month, day] = value.split("-").map(Number);
  if (year && month && day) {
    return new Date(year, month - 1, day);
  }
  // Fallback: meio-dia local evita virada de fuso ao normalizar datas com hora.
  return new Date(`${value}T12:00:00`);
}

/** Próxima ocorrência de um "dia do mês" (1–31) a partir de `from`. */
export function nextOccurrence(dayOfMonth: number, from = new Date()): Date {
  const year = from.getFullYear();
  const month = from.getMonth();
  const lastDay = new Date(year, month + 1, 0).getDate();
  const day = Math.min(dayOfMonth, lastDay);
  let target = new Date(year, month, day);
  if (target < from) {
    const nextMonth = month + 1;
    const nextLast = new Date(year, nextMonth + 1, 0).getDate();
    target = new Date(year, nextMonth, Math.min(dayOfMonth, nextLast));
  }
  return target;
}

/** Dias (>= 0) entre `from` e `date`, ignorando horas. */
export function daysUntil(date: Date, from = new Date()): number {
  const start = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  const end = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  return Math.max(0, Math.round((end.getTime() - start.getTime()) / 86_400_000));
}

/** Data curta dd/mm em pt-BR. */
export function formatShortDate(date: Date): string {
  return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
}
