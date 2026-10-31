export const MAX_MATCH_NAME_LENGTH = 40;

export function getDuplicatedMatchName(
  name: string,
  timestamp: string,
): string {
  const prefix = "Copia de ";
  const suffix = ` (${timestamp})`;
  const available = MAX_MATCH_NAME_LENGTH - prefix.length - suffix.length;
  return `${prefix}${name.trim().slice(0, available).trimEnd()}${suffix}`;
}
