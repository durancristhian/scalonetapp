"use client";

import { PlayerAvatar } from "@/components/player-avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { FC, useState } from "react";

type AssignPlayersProps = {
  assignSelectionToTeam: (teamId: string) => void;
  canAssignSelection: boolean;
  players: Player[];
  selectedIds: number[];
  teams: Team[];
  togglePlayer: (id: number) => void;
};

export const AssignPlayers: FC<AssignPlayersProps> = ({
  assignSelectionToTeam,
  canAssignSelection,
  players,
  selectedIds,
  teams,
  togglePlayer,
}) => {
  const [selectedTeamId, setSelectedTeamId] = useState("");

  return (
    <Card>
      <CardHeader>
        <CardTitle>Esperan un lugar</CardTitle>
        <CardDescription>
          Selecciona jugadores para asignalos a uno de los equipos.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
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
                <PlayerAvatar
                  src={player.avatar}
                  name={player.name}
                  size="sm"
                />
                <p className="ml-2">{player.name}</p>
              </Toggle>
            ))}
          </div>
          {canAssignSelection ? (
            <Select
              value={selectedTeamId}
              onValueChange={(selectedTeamId) => {
                assignSelectionToTeam(selectedTeamId);

                setSelectedTeamId("");
              }}
            >
              <SelectTrigger className="bg-white">
                <SelectValue placeholder="Elige un equipo..." />
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
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
};
