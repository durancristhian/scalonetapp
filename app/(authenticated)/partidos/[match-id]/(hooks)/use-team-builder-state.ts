import { type MatchWithPlayers } from "@/types/match";
import { type Team } from "@/types/team";
import { byName } from "@/utils/by-name";
import { TEAMS_PER_MATCH } from "@/utils/team-count";
import { MAX_PLAYERS_PER_MATCH } from "@/utils/player-limits";
import { invalidateImageExportTeamSelections } from "@/utils/image-export-player-roles";
import { type Player } from "@prisma/client";
import shuffle from "lodash.shuffle";
import { useEffect, useState, type Dispatch, type SetStateAction } from "react";
import { readSavedTeams } from "@/utils/read-saved-teams";
import { getTeamsToSave } from "@/utils/get-teams-to-save";
import { haveTeamsChanged } from "@/utils/have-teams-changed";
import { v4 as uuidv4 } from "uuid";

const createEmptyTeam: (name: string) => Team = (name) => ({
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

  return formattedTeams.map((team) => ({
    ...team,
    players: team.players
      .map((playerId) => match.players.find((player) => player.id === playerId))
      .filter(Boolean),
  })) as Team[];
};

type UseTeamsBuilderStateResult = {
  assignSelectionToTeam: (teamId: string) => void;
  balanceTeams: () => void;
  createNewTeam: () => void;
  randomizeTeams: () => void;
  removePlayerFromTeam: (playerId: number, teamId: string) => void;
  removeTeam: (teamId: string) => void;
  selectedIds: number[];
  baseTeams: string;
  comparisonTeams: string;
  teams: Team[];
  togglePlayer: (id: number) => void;
  unselectedPlayers: Player[];
  updateTeamName: (teamId: string, newName: string) => void;
};

type UseTeamsBuilderState = (
  match: MatchWithPlayers,
) => UseTeamsBuilderStateResult;

export const useTeamsBuilderState: UseTeamsBuilderState = (match) => {
  const [builder, setBuilder] = useState(() => ({
    teams: getInitialTeams(match),
    baseTeams: match.teams,
    matchId: match.id,
  }));
  const { teams, baseTeams } = builder;
  const setTeams: Dispatch<SetStateAction<Team[]>> = (next) =>
    setBuilder((current) => ({
      ...current,
      teams: typeof next === "function" ? next(current.teams) : next,
    }));
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  useEffect(() => {
    invalidateImageExportTeamSelections(match.id, teams);
  }, [match.id, teams]);

  useEffect(() => {
    const playerIds = new Set(match.players.map((player) => player.id));

    setSelectedIds((ids) => {
      const remaining = ids.filter((id) => playerIds.has(id));
      return remaining.length === ids.length ? ids : remaining;
    });

    setBuilder((current) => {
      const currTeams = current.teams;
      const reconciled = currTeams.map((currTeam) => {
        const nextTeam = { ...currTeam };

        const playersInTeam = nextTeam.players.filter((player) =>
          playerIds.has(player.id),
        );
        const updatedPlayersInTeam = playersInTeam
          .map((player) =>
            match.players.find((matchPlayer) => matchPlayer.id === player.id),
          )
          .filter(Boolean);

        nextTeam.players = updatedPlayersInTeam as unknown as Player[];

        return nextTeam;
      });
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
    });
  }, [match]);

  const assignSelectionToTeam: UseTeamsBuilderStateResult["assignSelectionToTeam"] =
    (teamId) => {
      const target = teams.find((team) => team.id === teamId);
      if (!target) return;
      setTeams((currTeams) => {
        const currentTarget = currTeams.find((team) => team.id === teamId);
        if (!currentTarget) return currTeams;
        return currTeams.map((currTeam) => {
          const nextTeam = { ...currTeam };

          if (currTeam.id === teamId) {
            const existingIds = new Set(
              currTeam.players.map((player) => player.id),
            );
            const nextSelectedPlayers = match.players.filter((player) =>
              selectedIds.includes(player.id),
            );

            nextTeam.players = [
              ...nextTeam.players,
              ...nextSelectedPlayers.filter(
                (player) => !existingIds.has(player.id),
              ),
            ];
          } else {
            nextTeam.players = currTeam.players.filter(
              (player) => !selectedIds.includes(player.id),
            );
          }

          return nextTeam;
        });
      });

      setSelectedIds([]);
    };

  const createBalancedTeams: (
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

  const balanceTeams: UseTeamsBuilderStateResult["balanceTeams"] = () => {
    if (
      teams.length !== TEAMS_PER_MATCH ||
      match.players.length > MAX_PLAYERS_PER_MATCH
    )
      return;
    const balancedTeams = createBalancedTeams([...match.players], teams.length);

    setTeams((currTeams) => {
      return currTeams.map((currTeam, idx) => ({
        ...currTeam,
        players: balancedTeams[idx],
      }));
    });
  };

  const createNewTeam: UseTeamsBuilderStateResult["createNewTeam"] = () => {
    setTeams((currTeams) =>
      currTeams.length < TEAMS_PER_MATCH
        ? currTeams.concat([createEmptyTeam("Nuevo equipo")])
        : currTeams,
    );
  };

  const getUnselectedPlayers = () => {
    const idsInUse = teams.flatMap((team) =>
      team.players.map((player) => player.id),
    );

    return match.players.filter((player) => !idsInUse.includes(player.id));
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

  const updateTeamsWithPlayerChunks: (players: Player[]) => void = (
    players,
  ) => {
    setTeams((currTeams) => {
      const nextTeams = chunkArray<Player>([...players], currTeams.length);

      return currTeams.map((currTeam, idx) => ({
        ...currTeam,
        players: nextTeams[idx].sort(byName),
      }));
    });
  };

  const randomizeTeams: UseTeamsBuilderStateResult["randomizeTeams"] = () => {
    if (
      teams.length !== TEAMS_PER_MATCH ||
      match.players.length > MAX_PLAYERS_PER_MATCH
    )
      return;
    const shuffledPlayers = shuffle([...match.players]);

    updateTeamsWithPlayerChunks(shuffledPlayers);
  };

  const removePlayerFromTeam: UseTeamsBuilderStateResult["removePlayerFromTeam"] =
    (playerId, teamId) => {
      setTeams((currTeams) =>
        currTeams.map((currTeam) => {
          if (currTeam.id !== teamId) {
            return currTeam;
          }

          const nextPlayers = currTeam.players.filter(
            (player) => player.id !== playerId,
          );

          const nextTeam: Team = { ...currTeam, players: nextPlayers };

          return nextTeam;
        }),
      );
    };

  const removeTeam: UseTeamsBuilderStateResult["removeTeam"] = (teamId) => {
    setTeams((currTeams) =>
      currTeams.length > TEAMS_PER_MATCH
        ? currTeams.filter((team) => team.id !== teamId)
        : currTeams,
    );
  };

  const togglePlayer: UseTeamsBuilderStateResult["togglePlayer"] = (
    playerId,
  ) => {
    setSelectedIds((currSelectedIds) => {
      const nextState = [...currSelectedIds];

      if (currSelectedIds.includes(playerId)) {
        const idx = currSelectedIds.findIndex((id) => id === playerId);

        nextState.splice(idx, 1);
      } else {
        nextState.push(playerId);
      }

      return nextState;
    });
  };

  const updateTeamName: UseTeamsBuilderStateResult["updateTeamName"] = (
    teamId,
    newName,
  ) => {
    setTeams((currTeams) =>
      currTeams.map((currTeam) => {
        if (currTeam.id !== teamId) {
          return currTeam;
        }

        const nextTeam = { ...currTeam };
        nextTeam.name = newName;

        return nextTeam;
      }),
    );
  };

  return {
    baseTeams,
    comparisonTeams: haveTeamsChanged(baseTeams, "[]")
      ? baseTeams
      : getTeamsToSave(DEFAULT_TEAMS),
    assignSelectionToTeam,
    balanceTeams,
    createNewTeam,
    randomizeTeams,
    removePlayerFromTeam,
    removeTeam,
    selectedIds,
    teams,
    togglePlayer,
    unselectedPlayers: getUnselectedPlayers(),
    updateTeamName,
  };
};
