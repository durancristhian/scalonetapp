import { type Team } from "@/types/team";

export const getTeamsToSave: (teams: Team[]) => string = (teams) => {
  const formattedTeams = teams.map((team) => ({
    ...team,
    players: team.players.map((player) => player.id),
  }));

  return JSON.stringify(formattedTeams);
};
