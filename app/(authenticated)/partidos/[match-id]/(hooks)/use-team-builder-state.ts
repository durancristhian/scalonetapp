import {
  createBuilderState,
  reconcileBuilderState,
  createBalancedTeams,
  distributePlayerChunks,
  createEmptyTeam,
  getComparisonTeams,
} from "./team-builder-model";
import { type MatchWithPlayers } from "@/types/match";
import { type Team } from "@/types/team";
import { TEAMS_PER_MATCH } from "@/utils/team-count";
import { MAX_PLAYERS_PER_MATCH } from "@/utils/player-limits";
import { invalidateImageExportTeamSelections } from "@/utils/image-export-player-roles";
import { type Player } from "@prisma/client";
import shuffle from "lodash.shuffle";
import { useEffect, useState, type Dispatch, type SetStateAction } from "react";

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
  const [builder, setBuilder] = useState(() => createBuilderState(match));
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

    setBuilder((current) => reconcileBuilderState(current, match));
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

  const balanceTeams: UseTeamsBuilderStateResult["balanceTeams"] = () => {
    if (
      teams.length !== TEAMS_PER_MATCH ||
      match.players.length > MAX_PLAYERS_PER_MATCH
    )
      return;
    const balancedTeams = createBalancedTeams([...match.players], teams.length);
    setSelectedIds([]);

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

  const randomizeTeams: UseTeamsBuilderStateResult["randomizeTeams"] = () => {
    if (
      teams.length !== TEAMS_PER_MATCH ||
      match.players.length > MAX_PLAYERS_PER_MATCH
    )
      return;
    const shuffledPlayers = shuffle([...match.players]);

    setTeams((current) => distributePlayerChunks(current, shuffledPlayers));
    setSelectedIds([]);
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
    comparisonTeams: getComparisonTeams(baseTeams),
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
