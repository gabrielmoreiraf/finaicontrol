/** Valor exibido quando um campo não tem dado. */
export const EMPTY_DISPLAY = "—";

export function isEmptyDisplay(value: string): boolean {
  return value === EMPTY_DISPLAY;
}
