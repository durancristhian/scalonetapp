import { type MatchWithPlayers } from "@/types/match";
import { type Team } from "@/types/team";
import { type Player } from "@prisma/client";
import { byName } from "@/utils/by-name";
import { hydrateTeams } from "@/utils/hydrate-teams";
import { readSavedTeams } from "@/utils/read-saved-teams";
import { getTeamsToSave } from "@/utils/get-teams-to-save";
import { haveTeamsChanged } from "@/utils/have-teams-changed";
import { v4 as uuidv4 } from "uuid";

export type TeamBuilderState = {
  teams: Team[];
  baseTeams: string;
  matchId: number;
};

export const createEmptyTeam: (name: string) => Team = (name) => ({
  id: uuidv4(),
  name,
  players: [],
});

const DEFAULT_TEAMS: Team[] = [
  createEmptyTeam("Equipo 1"),
  createEmptyTeam("Equipo 2"),
];

const getInitialTeams: (match: MatchWithPlayers) => Team[] = (match) => {
  const formattedTeams = readSavedTeams(match.teams);

  if (!formattedTeams.length) {
    return DEFAULT_TEAMS;
  }

  return hydrateTeams(formattedTeams, match.players);
};

export function getComparisonTeams(baseTeams: string): string {
  return haveTeamsChanged(baseTeams, "[]")
    ? baseTeams
    : getTeamsToSave(DEFAULT_TEAMS);
}

export function createBuilderState(match: MatchWithPlayers): TeamBuilderState {
  return {
    teams: getInitialTeams(match),
    baseTeams: match.teams,
    matchId: match.id,
  };
}

export function reconcileBuilderState(
  current: TeamBuilderState,
  match: MatchWithPlayers,
): TeamBuilderState {
  const reconciled = hydrateTeams(
    current.teams.map((team) => ({
      ...team,
      players: team.players.map((player) => player.id),
    })),
    match.players,
  );
  const baseline = getInitialTeams({ ...match, teams: current.baseTeams });
  const incoming = getInitialTeams(match);
  const currentTeams = getTeamsToSave(reconciled);
  const baselineTeams = getTeamsToSave(baseline);
  const incomingTeams = getTeamsToSave(incoming);
  const clean = !haveTeamsChanged(currentTeams, baselineTeams);
  const rosterOnly = !haveTeamsChanged(baselineTeams, incomingTeams);
  const acknowledged = !haveTeamsChanged(currentTeams, incomingTeams);
  const changedMatch = current.matchId !== match.id;
  return {
    teams: changedMatch || clean ? incoming : reconciled,
    baseTeams:
      changedMatch || clean || rosterOnly || acknowledged
        ? match.teams
        : current.baseTeams,
    matchId: match.id,
  };
}

export const createBalancedTeams: (
  players: Player[],
  numberOfChunks: number,
) => Player[][] = (players, numberOfChunks) => {
  const teams: Player[][] = Array.from(
    {
      length: numberOfChunks,
    },
    () => [],
  );

  const playerPositionsInUse = Array.from(
    new Set(players.map((player) => player.position)),
  );

  const playersByPosition: Record<string, Player[]> =
    playerPositionsInUse.reduce(
      (acc, curr) => ({
        ...acc,
        [curr]: players.filter((player) => player.position === curr),
      }),
      {},
    );

  const teamLevels: number[] = Array(numberOfChunks).fill(0);
  const teamSizes: number[] = Array(numberOfChunks).fill(0);

  function distributePlayers(positionPlayers: Player[]) {
    positionPlayers.sort((playerA, playerB) => playerB.level - playerA.level);

    positionPlayers.forEach((player) => {
      let targetGroupIndex = teamSizes.reduce((minIndex, size, index) => {
        if (
          size < teamSizes[minIndex] ||
          (size === teamSizes[minIndex] &&
            teamLevels[index] < teamLevels[minIndex])
        ) {
          return index;
        }

        return minIndex;
      }, 0);

      teams[targetGroupIndex].push(player);
      teamLevels[targetGroupIndex] += player.level;
      teamSizes[targetGroupIndex] += 1;
    });
  }

  playerPositionsInUse.forEach((position) =>
    distributePlayers(playersByPosition[position]),
  );

  return teams;
};

const chunkArray: <T>(array: T[], numberOfChunks: number) => T[][] = (
  array,
  numberOfChunks,
) => {
  const chunkSize = Math.floor(array.length / numberOfChunks);
  const remainder = array.length % numberOfChunks;

  const result = [];
  let start = 0;

  for (let i = 0; i < numberOfChunks; i++) {
    const size = chunkSize + (i < remainder ? 1 : 0);
    const chunk = array.slice(start, start + size);
    result.push(chunk);
    start += size;
  }

  return result;
};

export function distributePlayerChunks(
  teams: Team[],
  players: Player[],
): Team[] {
  const chunks = chunkArray(players, teams.length);
  return teams.map((team, index) => ({
    ...team,
    players: chunks[index].sort(byName),
  }));
}
