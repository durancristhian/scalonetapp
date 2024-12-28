import { type PlayerSchema } from "@/schemas/player";

export const getPlayersFromLines: (lines: string[]) => PlayerSchema[] = (
  lines
) => {
  return lines.map((line) => ({
    name: line,
    level: Number(process.env.NEXT_PUBLIC_DEFAULT_PLAYER_LEVEL),
    position: "mid",
  }));
};
