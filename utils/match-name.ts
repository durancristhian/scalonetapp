import { isRepeatedName } from "./repeated-names.ts";

export const MAX_MATCH_NAME_LENGTH = 40;

const COPY_PREFIX = "Copia de ";

function fitCopyName(name: string, suffix: string): string {
  const available = MAX_MATCH_NAME_LENGTH - COPY_PREFIX.length - suffix.length;
  const base =
    name.length <= available
      ? name
      : `${name
          .slice(0, available - 1)
          .replace(/[\uD800-\uDBFF]$/, "")
          .trimEnd()}…`;
  return `${COPY_PREFIX}${base}${suffix}`;
}

export function getDuplicatedMatchName(
  name: string,
  existing: readonly string[],
): string {
  for (let copy = 1; ; copy++) {
    const candidate = fitCopyName(name.trim(), copy > 1 ? ` (${copy})` : "");
    if (!isRepeatedName(candidate, existing)) return candidate;
  }
}
