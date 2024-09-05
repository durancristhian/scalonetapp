import { PlayerSchema } from "@/schemas/player";
import { DEFAULT_PLAYER_LEVEL } from "@/utils/constants";

export const getPlayersFromLines: (lines: string[]) => PlayerSchema[] = (
  lines
) => {
  return lines.map((line) => {
    const lastCommaIdx = line.lastIndexOf(",");

    /* If we didn't find any comma, we understand we only have the name, so we return a player with default level */
    if (lastCommaIdx === -1) {
      return {
        name: line,
        level: DEFAULT_PLAYER_LEVEL,
      };
    }

    const levelStr = line.substring(lastCommaIdx + 1).trim();
    let level = Number.parseInt(levelStr);

    /* We check the level is a valid number. If not, we assign 0 so the zod validation fails later */
    if (Number.isNaN(level)) {
      level = 0;
    }

    return {
      name: line.substring(0, lastCommaIdx).trim(),
      level,
    };
  });
};
