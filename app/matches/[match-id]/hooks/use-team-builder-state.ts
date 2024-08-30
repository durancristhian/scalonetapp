import { Player } from "@prisma/client";
import uniqueId from "lodash.uniqueid";
import { useState } from "react";

export type Team = {
  id: string;
  name: string;
  players: Player[];
};

const getEmptyTeam: (name: string) => Team = (name) => ({
  id: uniqueId("team-"),
  name,
  players: [],
});

const DEFAULT_TEAMS: Team[] = [
  getEmptyTeam("Equipo 1"),
  getEmptyTeam("Equipo 2"),
];

type UseTeamsBuilderStateResult = {
  assignSelectionToTeam: (teamId: string) => void;
  createNewTeam: () => void;
  removePlayerFromTeam: (playerId: number, teamId: string) => void;
  removeTeam: (teamId: string) => void;
  selectedIds: number[];
  teams: Team[];
  togglePlayer: (playerId: number) => void;
  unselectedPlayers: Player[];
};

type UseTeamsBuilderState = (players: Player[]) => UseTeamsBuilderStateResult;

export const useTeamsBuilderState: UseTeamsBuilderState = (players) => {
  const [teams, setTeams] = useState<Team[]>(DEFAULT_TEAMS);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const assignSelectionToTeam: (teamId: string) => void = (teamId) => {
    setTeams((currTeams) =>
      /* We loop over all the teams since an update might include removing players from another team, not only adding them to the specified team */
      currTeams.map((currTeam) => {
        /* Making a copy so it's sage to mutate it */
        const nextTeam = { ...currTeam };

        /* If the selection is meant to be for the specified team id */
        if (currTeam.id === teamId) {
          const existingIds = new Set(
            currTeam.players.map((player) => player.id)
          );
          const nextSelectedPlayers = players.filter((player) =>
            selectedIds.includes(player.id)
          );

          /* We compute the next players array based on the current data + the new selection without the already added players */
          nextTeam.players = [
            ...nextTeam.players,
            ...nextSelectedPlayers.filter(
              (player) => !existingIds.has(player.id)
            ),
          ];
        } else {
          /* If the team is not supposed to get this selection, we remove the coincidences */
          nextTeam.players = currTeam.players.filter(
            (player) => !selectedIds.includes(player.id)
          );
        }

        return nextTeam;
      })
    );

    /* We clean the current selected ids as well so we can start over */
    setSelectedIds([]);
  };

  const createNewTeam: () => void = () => {
    setTeams((currTeams) =>
      currTeams.concat([getEmptyTeam(`Equipo ${currTeams.length + 1}`)])
    );
  };

  const getUnselectedPlayers = () => {
    const idsInUse = teams.flatMap((team) =>
      team.players.map((player) => player.id)
    );

    return players.filter((player) => !idsInUse.includes(player.id));
  };

  const removePlayerFromTeam: (playerId: number, teamId: string) => void = (
    playerId,
    teamId
  ) => {
    setTeams((currTeams) =>
      currTeams.map((currTeam) => {
        if (currTeam.id !== teamId) {
          return currTeam;
        }

        const currPlayerIdIdx = currTeam.players.findIndex(
          (player) => player.id === playerId
        );

        /* Making a copy so it's sage to mutate it */
        const nextTeam = { ...currTeam };
        nextTeam.players.splice(currPlayerIdIdx, 1);

        return nextTeam;
      })
    );
  };

  const removeTeam: (teamId: string) => void = (teamId) => {
    setTeams((currTeams) => currTeams.filter((team) => team.id !== teamId));
  };

  const togglePlayer: (playerId: number) => void = (playerId) => {
    setSelectedIds((currSelectedIds) => {
      /* Making a copy so it's safe to mutate it */
      const nextState = [...currSelectedIds];

      /* If the id is already selected, we eliminate it from the list */
      if (currSelectedIds.includes(playerId)) {
        const idx = currSelectedIds.findIndex((id) => id === playerId);

        nextState.splice(idx, 1);
      } else {
        /* We add the id to the list since it's not there yet */
        nextState.push(playerId);
      }

      return nextState;
    });
  };

  return {
    assignSelectionToTeam,
    createNewTeam,
    removePlayerFromTeam,
    removeTeam,
    selectedIds,
    teams,
    togglePlayer,
    unselectedPlayers: getUnselectedPlayers(),
  };
};
