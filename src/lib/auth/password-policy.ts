/**
 * Política de senha (compartilhada cliente + servidor).
 * Regras: tamanho mínimo, maiúscula, minúscula, número e caractere especial.
 */
export const PASSWORD_MIN_LENGTH = 8;

export type PasswordRule = {
  id: string;
  label: string;
  test: (password: string) => boolean;
};

export const PASSWORD_RULES: PasswordRule[] = [
  { id: "length", label: `Pelo menos ${PASSWORD_MIN_LENGTH} caracteres`, test: (p) => p.length >= PASSWORD_MIN_LENGTH },
  { id: "upper", label: "Uma letra maiúscula (A-Z)", test: (p) => /[A-Z]/.test(p) },
  { id: "lower", label: "Uma letra minúscula (a-z)", test: (p) => /[a-z]/.test(p) },
  { id: "number", label: "Um número (0-9)", test: (p) => /[0-9]/.test(p) },
  { id: "special", label: "Um caractere especial (!@#$...)", test: (p) => /[^A-Za-z0-9]/.test(p) },
];

/** Lista das regras AINDA NÃO atendidas pela senha. */
export function getUnmetPasswordRules(password: string): PasswordRule[] {
  return PASSWORD_RULES.filter((rule) => !rule.test(password));
}

/** Mensagem única dizendo o que falta (ou null se a senha é válida). */
export function getPasswordError(password: string): string | null {
  const unmet = getUnmetPasswordRules(password);
  if (unmet.length === 0) return null;
  return `A senha precisa de: ${unmet.map((r) => r.label.toLowerCase()).join("; ")}.`;
}

export function isPasswordValid(password: string): boolean {
  return getUnmetPasswordRules(password).length === 0;
}
