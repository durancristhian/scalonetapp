import { PlayerSchema } from "@/schemas/player";
import { MatchWithPlayers } from "@/types/match";
import { BaseTeam, Team } from "@/types/team";
import { byName } from "@/utils/by-name";
import { Player } from "@prisma/client";
import shuffle from "lodash.shuffle";
import { useEffect, useState } from "react";
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
  const formattedTeams: BaseTeam[] = JSON.parse(match.teams);

  if (!formattedTeams.length) {
    return DEFAULT_TEAMS;
  }

  return formattedTeams.map((team) => ({
    ...team,
    players: team.players
      /* We look for the player data based on the id. Since you can save teams and after that remove them from the match, it's important to filter potentical empty values after the map */
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
  teams: Team[];
  togglePlayer: (id: number) => void;
  unselectedPlayers: Player[];
  updateTeamName: (teamId: string, newName: string) => void;
};

type UseTeamsBuilderState = (
  match: MatchWithPlayers
) => UseTeamsBuilderStateResult;

export const useTeamsBuilderState: UseTeamsBuilderState = (match) => {
  const [teams, setTeams] = useState<Team[]>(() => getInitialTeams(match));
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  /*
    When players change we check:
    - there is no assigned players that were deleted
    - player names are updated
  */
  useEffect(() => {
    const playerIds = new Set(match.players.map((player) => player.id));

    setTeams((currTeams) =>
      currTeams.map((currTeam) => {
        const nextTeam = { ...currTeam };

        const playersInTeam = nextTeam.players.filter((player) =>
          playerIds.has(player.id)
        );
        const updatedPlayersInTeam = playersInTeam
          .map((player) =>
            match.players.find((matchPlayer) => matchPlayer.id === player.id)
          )
          .filter(Boolean);

        /* This "as unknown as" is ugly but typescript doesn't know how to properly understand what I'm doing (looping over an array of players that I'm sure won't be undefined after .find because of the previous check) */
        nextTeam.players = updatedPlayersInTeam as unknown as Player[];

        return nextTeam;
      })
    );
  }, [match.players]);

  const assignSelectionToTeam: UseTeamsBuilderStateResult["assignSelectionToTeam"] =
    (teamId) => {
      setTeams((currTeams) =>
        /* We loop over all the teams since an update might include removing players from another team, not only adding them to the specified team */
        currTeams.map((currTeam) => {
          const nextTeam = { ...currTeam };

          /* If the selection is meant to be for the specified team id */
          if (currTeam.id === teamId) {
            const existingIds = new Set(
              currTeam.players.map((player) => player.id)
            );
            const nextSelectedPlayers = match.players.filter((player) =>
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

  const createBalancedTeams: (
    players: Player[],
    numberOfChunks: number
  ) => Player[] = (players, numberOfChunks) => {
    const getEmptyLevels = () => ({
      1: [],
      2: [],
      3: [],
      4: [],
      5: [],
      6: [],
      7: [],
      8: [],
      9: [],
      10: [],
    });

    const playersByPositionAndLevel = [...players].reduce<
      Record<PlayerSchema["position"], Record<PlayerSchema["level"], Player[]>>
    >(
      (acc, curr) => {
        acc[curr.position][curr.level].push(curr);

        return acc;
      },
      {
        goa: getEmptyLevels(),
        def: getEmptyLevels(),
        mid: getEmptyLevels(),
        for: getEmptyLevels(),
      }
    );

    /* We loop over each player position and level to shuffle players within that group. The result is an array of players sorted by position (goa, def, mid, for) and level (1 to 10). Players within the same position and level are randomized so we get different combinations each time */
    const shuffledPlayersByPositionAndLevel = Object.values(
      playersByPositionAndLevel
    ).flatMap((playersByLevel) =>
      Object.values(playersByLevel).flatMap((sortedPlayers) =>
        shuffle([...sortedPlayers])
      )
    );

    const teams: Player[][] = Array.from({ length: numberOfChunks }).map(
      () => []
    );
    let teamIdx = 0;

    /* We loop over the players and we split them in teams based on the teamIdx which is increasing on each loop run. By doing this we're distributing players sorted by position and level one by one on each different team */
    for (
      let playerIdx = 0;
      playerIdx < shuffledPlayersByPositionAndLevel.length;
      playerIdx++
    ) {
      teams[teamIdx].push(shuffledPlayersByPositionAndLevel[playerIdx]);

      teamIdx = teamIdx + 1 === numberOfChunks ? 0 : teamIdx + 1;
    }

    return teams.flatMap((team) => team);
  };

  const balanceTeams: UseTeamsBuilderStateResult["balanceTeams"] = () => {
    const balancedTeams = createBalancedTeams([...match.players], teams.length);

    updateTeamsWithPlayerChunks(balancedTeams);
  };

  const createNewTeam: UseTeamsBuilderStateResult["createNewTeam"] = () => {
    setTeams((currTeams) =>
      currTeams.concat([createEmptyTeam("Nuevo equipo")])
    );
  };

  const getUnselectedPlayers = () => {
    const idsInUse = teams.flatMap((team) =>
      team.players.map((player) => player.id)
    );

    return match.players.filter((player) => !idsInUse.includes(player.id));
  };

  /* Thank you ChatGPT */
  const chunkArray: <T>(array: T[], numberOfChunks: number) => T[][] = (
    array,
    numberOfChunks
  ) => {
    /* Base chunk size */
    const chunkSize = Math.floor(array.length / numberOfChunks);
    /* Extra elements that need to be distributed */
    const remainder = array.length % numberOfChunks;

    const result = [];
    let start = 0;

    for (let i = 0; i < numberOfChunks; i++) {
      /* Distribute remainder as +1 to the first remainder number of chunks */
      const size = chunkSize + (i < remainder ? 1 : 0);
      /* We take a group of {size} elements from the array */
      const chunk = array.slice(start, start + size);
      /* We append them as an array to the result array */
      result.push(chunk);
      /* We move the index {size} positions further */
      start += size;
    }

    return result;
  };

  const updateTeamsWithPlayerChunks: (players: Player[]) => void = (
    players
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
            (player) => player.id !== playerId
          );

          const nextTeam: Team = { ...currTeam, players: nextPlayers };

          return nextTeam;
        })
      );
    };

  const removeTeam: UseTeamsBuilderStateResult["removeTeam"] = (teamId) => {
    setTeams((currTeams) => currTeams.filter((team) => team.id !== teamId));
  };

  const togglePlayer: UseTeamsBuilderStateResult["togglePlayer"] = (
    playerId
  ) => {
    setSelectedIds((currSelectedIds) => {
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

  const updateTeamName: UseTeamsBuilderStateResult["updateTeamName"] = (
    teamId,
    newName
  ) => {
    setTeams((currTeams) =>
      currTeams.map((currTeam) => {
        if (currTeam.id !== teamId) {
          return currTeam;
        }

        const nextTeam = { ...currTeam };
        nextTeam.name = newName;

        return nextTeam;
      })
    );
  };

  return {
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
