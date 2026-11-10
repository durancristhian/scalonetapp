import type { Player } from "@prisma/client";
import { byName } from "./by-name.ts";
import type { ImageExportOptions } from "./image-export-options.ts";
import { getPlayerPositionOrder } from "./player-options.ts";

export function sortExportPlayers(
  players: readonly Player[],
  order: ImageExportOptions["playerOrder"],
): Player[] {
  return [...players].sort((a, b) => {
    if (order === "position") {
      const position =
        getPlayerPositionOrder(a.position) - getPlayerPositionOrder(b.position);
      if (position) return position;
    }
    return byName(a, b);
  });
}
