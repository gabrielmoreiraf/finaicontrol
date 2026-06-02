/** Até duas iniciais: primeiro nome + segundo nome. */
export function getUserInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("")
    .slice(0, 2);
}

/** Nome curto para menus, ex.: "João Gabriel Fonseca Moreira" → "João Gabriel". */
export function getUserShortName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length <= 2) return parts.join(" ");
  return parts.slice(0, 2).join(" ");
}
