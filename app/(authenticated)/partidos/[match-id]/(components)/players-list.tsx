"use client";

import { PlayerAvatar } from "@/components/player-avatar";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Toggle } from "@/components/ui/toggle";
import { Team } from "@/types/team";
import { Player } from "@prisma/client";
import clsx from "clsx";
import { FC, useState } from "react";

type PlayersListProps = {
  assignSelectionToTeam: (teamId: string) => void;
  canAssignSelection: boolean;
  players: Player[];
  selectedIds: number[];
  teams: Team[];
  togglePlayer: (id: number) => void;
};

/* TODO: rename this component */
export const PlayersList: FC<PlayersListProps> = ({
  assignSelectionToTeam,
  canAssignSelection,
  players,
  selectedIds,
  teams,
  togglePlayer,
}) => {
  const [selectedTeamId, setSelectedTeamId] = useState("");

  return (
    <div className="space-y-4">
      <p>Elige alguno de los jugadores que aparecen a continuación:</p>
      <div className="flex flex-wrap gap-2">
        {players.map((player) => (
          <Toggle
            key={player.id}
            onPressedChange={() => {
              togglePlayer(player.id);
            }}
            pressed={selectedIds.includes(player.id)}
            variant="outline"
            className={clsx(
              selectedIds.includes(player.id)
                ? "data-[state=on]:bg-white"
                : undefined
            )}
          >
            <PlayerAvatar src={player.avatar} name={player.name} size="sm" />
            <p className="ml-2">{player.name}</p>
          </Toggle>
        ))}
      </div>
      <p>Luego selecciona el equipo al que estos jugadores se unirán.</p>
      <Select
        value={selectedTeamId}
        disabled={canAssignSelection}
        onValueChange={(selectedTeamId) => {
          assignSelectionToTeam(selectedTeamId);

          setSelectedTeamId("");
        }}
      >
        <SelectTrigger className="bg-white">
          <SelectValue
            placeholder={
              canAssignSelection
                ? "Selecciona al menos un jugador"
                : "Elegí un equipo"
            }
          />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {teams.map((team) => (
              <SelectItem key={team.id} value={team.id}>
                {team.name}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
};
