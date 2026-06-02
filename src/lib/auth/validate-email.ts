const EMAIL_REGEX =
  /^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)+$/;

const DISPOSABLE_DOMAINS = new Set([
  "mailinator.com",
  "guerrillamail.com",
  "tempmail.com",
  "throwaway.email",
  "yopmail.com",
  "10minutemail.com",
]);

export function normalizeEmail(raw: string): string {
  return raw.trim().toLowerCase();
}

export function isValidEmail(raw: string): boolean {
  const email = normalizeEmail(raw);

  if (!email || email.length > 254) return false;
  if (!EMAIL_REGEX.test(email)) return false;
  if (email.includes("..")) return false;

  const [, domain] = email.split("@");
  if (!domain || domain.startsWith("-") || domain.endsWith("-")) return false;
  if (DISPOSABLE_DOMAINS.has(domain)) return false;

  return true;
}

export function getEmailValidationError(raw: string): string | null {
  const email = normalizeEmail(raw);

  if (!email) return "Informe um e-mail válido.";
  if (email.length > 254) return "O e-mail informado é muito longo.";
  if (!EMAIL_REGEX.test(email)) return "Informe um e-mail válido (ex.: seu@email.com).";
  if (email.includes("..")) return "Informe um e-mail válido.";

  const [, domain] = email.split("@");
  if (domain && DISPOSABLE_DOMAINS.has(domain)) {
    return "Use um e-mail permanente. E-mails temporários não são aceitos.";
  }

  return null;
}
