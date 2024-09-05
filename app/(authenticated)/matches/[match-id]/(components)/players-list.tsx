"use client";

import { Team } from "@/app/(authenticated)/matches/[match-id]/hooks/use-team-builder-state";
import { SpicyTooltips } from "@/components/spicy-tooltips";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Toggle } from "@/components/ui/toggle";
import { Player } from "@prisma/client";
import { default as BoringAvatar } from "boring-avatars";
import { FC, useState } from "react";

type PlayersListProps = {
  assignSelectionToTeam: (teamId: string) => void;
  canAssignSelection: boolean;
  players: Player[];
  selectedIds: number[];
  teams: Team[];
  togglePlayer: (id: number) => void;
};

export const PlayersList: FC<PlayersListProps> = ({
  assignSelectionToTeam,
  canAssignSelection,
  players,
  selectedIds,
  teams,
  togglePlayer,
}) => {
  const [selectedTeamId, setSelectedTeamId] = useState("");

  if (!Array.isArray(players) || !players.length) {
    return null;
  }

  return (
    <div className="grid gap-4">
      <div className="grid gap-2">
        <p className="font-semibold">Todavía tenés jugadores libres</p>
        <p className="text-sm">
          Elegí alguno de los que aparecen a continuación:
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        {players.map((player) => (
          <Toggle
            key={player.id}
            onPressedChange={() => {
              togglePlayer(player.id);
            }}
            pressed={selectedIds.includes(player.id)}
            variant="outline"
          >
            <SpicyTooltips>
              <BoringAvatar variant="beam" name={player.name} size={24} />
            </SpicyTooltips>
            <p className="ml-2">{player.name}</p>
          </Toggle>
        ))}
      </div>
      <div className="grid gap-2">
        <p className="text-sm">Y ahora elegí el equipo al que van:</p>
        <Select
          value={selectedTeamId}
          disabled={canAssignSelection}
          onValueChange={(selectedTeamId) => {
            assignSelectionToTeam(selectedTeamId);

            setSelectedTeamId("");
          }}
        >
          <SelectTrigger>
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
    </div>
  );
};
