const getNameKey = (name: string): string =>
  name.trim().normalize("NFC").toLowerCase();

export function findRepeatedNames(
  names: readonly string[],
  existing: readonly string[] = [],
): string[] {
  const seen = new Set(existing.map(getNameKey));
  const repeated = new Map<string, string>();
  for (const name of names) {
    const key = getNameKey(name);
    if (!seen.has(key)) seen.add(key);
    else if (!repeated.has(key)) repeated.set(key, name);
  }
  return [...repeated.values()];
}

export const isRepeatedName = (
  name: string,
  existing: readonly string[],
): boolean => findRepeatedNames([name], existing).length > 0;
