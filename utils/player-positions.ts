import { type PlayerSchema } from "@/schemas/player";

export const PLAYER_POSITIONS: Record<PlayerSchema["position"], string> = {
  goa: "Arquero",
  def: "Defensor",
  mid: "Medio",
  for: "Delantero",
};
