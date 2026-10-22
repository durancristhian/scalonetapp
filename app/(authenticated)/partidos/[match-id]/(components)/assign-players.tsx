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
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import type { Team } from "@/types/team";
import type { Player } from "@prisma/client";
import { type FC, useState } from "react";

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
        <CardTitle>Jugadores libres</CardTitle>
        <CardDescription>
          Podés asignarlos a un equipo o dejarlos fuera de la imagen.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <ToggleGroup
            type="multiple"
            aria-label="Jugadores para asignar"
            value={selectedIds.map(String)}
            onValueChange={(values) => {
              const nextIds = new Set(values.map(Number));
              for (const player of players) {
                if (nextIds.has(player.id) !== selectedIds.includes(player.id)) {
                  togglePlayer(player.id);
                }
              }
            }}
          >
            {players.map((player) => (
              <ToggleGroupItem
                key={player.id}
                value={String(player.id)}
                aria-label={player.name}
                variant="outline"
                className="min-w-0 justify-start gap-2 text-start"
              >
                <PlayerAvatar
                  src={player.avatar}
                  name={player.name}
                  size="sm"
                />
                <span className="min-w-0 line-clamp-2" title={player.name}>{player.name}</span>
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
          {canAssignSelection ? (
            <Select
              value={selectedTeamId}
              onValueChange={(selectedTeamId) => {
                assignSelectionToTeam(selectedTeamId);

                setSelectedTeamId("");
              }}
            >
              <SelectTrigger
                aria-label="Asignar jugadores al equipo"
              >
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
