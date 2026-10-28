export const getLinesFromString: (str: string) => string[] = (str) =>
  str.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
