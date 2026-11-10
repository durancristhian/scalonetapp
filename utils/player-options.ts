export const PLAYER_POSITION_IDS = ["goa", "def", "mid", "for"] as const;
export type PlayerPosition = (typeof PLAYER_POSITION_IDS)[number];

export const PLAYER_POSITIONS: Record<PlayerPosition, string> = {
  goa: "Arquero",
  def: "Defensor",
  mid: "Medio",
  for: "Delantero",
};

export const PLAYER_LEVELS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const;
export const MIN_PLAYER_LEVEL = PLAYER_LEVELS[0];
export const MAX_PLAYER_LEVEL = PLAYER_LEVELS[PLAYER_LEVELS.length - 1];

export function getPlayerPositionOrder(position: string): number {
  const index = PLAYER_POSITION_IDS.findIndex((id) => id === position);
  return index < 0 ? PLAYER_POSITION_IDS.length : index;
}
