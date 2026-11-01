import type { Player } from "@prisma/client";
import { byName } from "./by-name.ts";
import type { ImageExportOptions } from "./image-export-options.ts";

const POSITION_ORDER: Readonly<Record<string, number>> = {
  goa: 0,
  def: 1,
  mid: 2,
  for: 3,
};

export function sortExportPlayers(
  players: readonly Player[],
  order: ImageExportOptions["playerOrder"],
): Player[] {
  return [...players].sort((a, b) => {
    if (order === "position") {
      const position =
        (POSITION_ORDER[a.position] ?? 4) - (POSITION_ORDER[b.position] ?? 4);
      if (position) return position;
    }
    return byName(a, b);
  });
}
