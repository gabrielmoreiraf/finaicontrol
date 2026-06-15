/** Lê e valida o campo "dia do mês" (1–31). Vazio é válido (retorna null). */
export function readDayOfMonth(raw: FormDataEntryValue | null): {
  day: number | null;
  error: string | null;
} {
  if (raw === null || String(raw).trim() === "") {
    return { day: null, error: null };
  }
  const value = Number(raw);
  if (!Number.isInteger(value) || value < 1 || value > 31) {
    return { day: null, error: "O dia do mês deve ser entre 1 e 31." };
  }
  return { day: value, error: null };
}
