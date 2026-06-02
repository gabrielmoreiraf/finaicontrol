export function uniqueCategoryNames(names: string[]): string[] {
  const seen = new Set<string>();
  const unique: string[] = [];

  for (const name of names) {
    const trimmed = name.trim();
    const key = trimmed.toLowerCase();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    unique.push(trimmed);
  }

  return unique.sort((a, b) => a.localeCompare(b, "pt-BR"));
}
