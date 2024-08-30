"use client";

import { PlayersInMatchLabel } from "@/app/matches/(components)/players-in-match-label";
import { Avatar } from "@/components/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Toggle } from "@/components/ui/toggle";
import { Player } from "@prisma/client";
import uniqueId from "lodash.uniqueid";
import { TrashIcon } from "lucide-react";
import { FC, useState } from "react";

type TeamsBuilderProps = {
  players: Player[];
};

export const TeamsBuilder: FC<TeamsBuilderProps> = ({ players }) => {
  const { selectedIds, togglePlayer, teams, assignSelectionToTeam } =
    useTeamsBuilderState(players);

  return (
    <Card>
      <CardHeader>
        <CardTitle>A lo que vinimos</CardTitle>
        <CardDescription>
          Seleccioná personas y asignalas a los equipos que quieras.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          <PlayersList
            players={players}
            selectedIds={selectedIds}
            togglePlayer={togglePlayer}
          />
          <div className="flex gap-4">
            {teams.map((team) => (
              <div key={team.id} className="grow">
                <Team
                  team={team}
                  canAssignSelection={!selectedIds.length}
                  assignSelectionToTeam={assignSelectionToTeam}
                />
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

type Team = {
  id: string;
  name: string;
  players: Player[];
};

type UseTeamsBuilderStateResult = {
  selectedIds: number[];
  togglePlayer: (playerId: number) => void;
  teams: Team[];
  assignSelectionToTeam: (teamId: string) => void;
};

type UseTeamsBuilderState = (players: Player[]) => UseTeamsBuilderStateResult;

const useTeamsBuilderState: UseTeamsBuilderState = (players) => {
  const [teams, setTeams] = useState<Team[]>([
    { id: uniqueId("team-"), name: "Equipo 1", players: [] },
    { id: uniqueId("team-"), name: "Equipo 2", players: [] },
  ]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const togglePlayer: (playerId: number) => void = (playerId) => {
    setSelectedIds((currSelectedIds) => {
      /* Grabbing the idx of the player in case is already selected */
      const idx = currSelectedIds.findIndex((id) => id === playerId);

      /* Making a copy so it's safe to mutate it */
      const nextState = [...currSelectedIds];

      /* If the id is already selected, we eliminate it from the list */
      if (currSelectedIds.includes(playerId)) {
        nextState.splice(idx, 1);
      } else {
        /* We add the id to the list since it's not there yet */
        nextState.push(playerId);
      }

      return nextState;
    });
  };

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

  return {
    selectedIds,
    togglePlayer,
    teams,
    assignSelectionToTeam,
  };
};

type PlayersListProps = {
  players: Player[];
  selectedIds: number[];
  togglePlayer: (playerId: number) => void;
};

const PlayersList: FC<PlayersListProps> = ({
  players,
  selectedIds,
  togglePlayer,
}) => {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-2">
        {players.map((player) => (
          <Toggle
            key={player.id}
            aria-label={player.name}
            variant="outline"
            pressed={selectedIds.includes(player.id)}
            onPressedChange={() => {
              togglePlayer(player.id);
            }}
          >
            <Avatar name={player.name} size={24} />
            <p className="ml-2">{player.name}</p>
          </Toggle>
        ))}
      </div>
    </div>
  );
};

type TeamProps = {
  assignSelectionToTeam: (teamId: string) => void;
  canAssignSelection: boolean;
  team: Team;
};

const Team: FC<TeamProps> = ({
  assignSelectionToTeam,
  canAssignSelection,
  team,
}) => {
  return (
    <Card className="bg-slate-50">
      <CardHeader>
        <CardTitle>{team.name}</CardTitle>
        <CardDescription>
          <PlayersInMatchLabel players={team.players.length} />
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          {Boolean(team.players.length) ? (
            <div className="flex flex-col gap-2">
              {team.players.map((player) => (
                <div
                  key={player.id}
                  className="border border-slate-300 flex items-center gap-4 p-2 rounded-md"
                >
                  <div className="grow">
                    <div className="flex gap-2 items-center">
                      <Avatar name={player.name} size={24} />
                      <p className="font-semibold">{player.name}</p>
                    </div>
                  </div>
                  <div className="inline-flex">
                    <Button type="submit" variant="ghost" size="icon">
                      <TrashIcon className="h-4 text-red-700 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : null}
          <div className="flex gap-4 justify-between">
            <Button
              onClick={() => {
                console.log("Delete");
              }}
              variant="ghost"
              size="icon"
            >
              <TrashIcon className="h-4 text-red-700 w-4" />
            </Button>
            <Button
              disabled={canAssignSelection}
              onClick={() => {
                assignSelectionToTeam(team.id);
              }}
            >
              Asignar
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};