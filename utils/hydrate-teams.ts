import type { BaseTeam, Team } from "@/types/team";
import type { Player } from "@prisma/client";

export function hydrateTeams(
  teams: readonly BaseTeam[],
  players: readonly Player[],
): Team[] {
  const playersById = new Map(players.map((player) => [player.id, player]));
  return teams.map((team) => ({
    ...team,
    players: team.players.flatMap((id) => {
      const player = playersById.get(id);
      return player ? [player] : [];
    }),
  }));
}
