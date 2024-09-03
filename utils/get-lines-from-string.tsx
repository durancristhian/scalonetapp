export const getLinesFromString: (str: string) => string[] = (str) =>
  str.split(/\r?\n/).filter(Boolean);
