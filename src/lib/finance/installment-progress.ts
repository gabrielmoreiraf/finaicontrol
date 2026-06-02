export type InstallmentProgress = {
  current: number;
  total: number;
  remaining: number;
  status: "upcoming" | "active" | "completed";
  label: string;
};

function parseStartDate(value: string): Date | null {
  const trimmed = value.trim();
  if (!trimmed) return null;

  const iso = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (iso) {
    const date = new Date(Number(iso[1]), Number(iso[2]) - 1, Number(iso[3]));
    return Number.isNaN(date.getTime()) ? null : date;
  }

  const br = trimmed.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (br) {
    const date = new Date(Number(br[3]), Number(br[2]) - 1, Number(br[1]));
    return Number.isNaN(date.getTime()) ? null : date;
  }

  const parsed = new Date(trimmed);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function monthIndex(date: Date) {
  return date.getFullYear() * 12 + date.getMonth();
}

function formatDateBr(date: Date) {
  return date.toLocaleDateString("pt-BR");
}

export function getInstallmentProgress(
  paymentStartDate: string | null | undefined,
  installmentCount: number | null | undefined,
  now = new Date(),
): InstallmentProgress | null {
  const total = Number(installmentCount);
  if (!total || total < 1) return null;

  const start = paymentStartDate ? parseStartDate(String(paymentStartDate)) : null;
  if (!start) return null;

  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startDay = new Date(start.getFullYear(), start.getMonth(), start.getDate());

  if (today < startDay) {
    return {
      current: 0,
      total,
      remaining: total,
      status: "upcoming",
      label: `Inicia em ${formatDateBr(startDay)} · faltam ${total} parcelas`,
    };
  }

  const monthsElapsed = monthIndex(today) - monthIndex(startDay);
  const current = Math.min(total, Math.max(1, monthsElapsed + 1));
  const remaining = Math.max(0, total - current);

  if (current >= total) {
    return {
      current: total,
      total,
      remaining: 0,
      status: "completed",
      label: `Concluída · ${total}/${total} parcelas`,
    };
  }

  return {
    current,
    total,
    remaining,
    status: "active",
    label: `Parcela ${current} de ${total} · faltam ${remaining}`,
  };
}
