/* Fn to alphabetically sort objects by their name property */
export const byName: <
  T extends {
    name: string;
  }
>(
  itemA: T,
  itemB: T
) => number = (itemA, itemB) => itemA.name.localeCompare(itemB.name);
