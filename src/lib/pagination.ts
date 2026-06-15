/** Opções de itens por página oferecidas nas tabelas. */
export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100] as const;
export const DEFAULT_PAGE_SIZE = 20;

/** Lê e valida o tamanho de página vindo da URL (`?por=`). */
export function parsePageSize(raw: string | undefined): number {
  const n = Number(raw);
  return (PAGE_SIZE_OPTIONS as readonly number[]).includes(n) ? n : DEFAULT_PAGE_SIZE;
}

/** Lê e valida o número da página vindo da URL (`?page=`). */
export function parsePage(raw: string | undefined): number {
  return Math.max(1, Math.trunc(Number(raw)) || 1);
}
