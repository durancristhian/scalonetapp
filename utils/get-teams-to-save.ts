import { type Team } from "@/types/team";

export const getTeamsToSave: (teams: Team[]) => string = (teams) => {
  const formattedTeams = teams.map((team) => ({
    ...team,
    /* We only store the player ids */
    players: team.players.map((player) => player.id),
  }));

  return JSON.stringify(formattedTeams);
};
