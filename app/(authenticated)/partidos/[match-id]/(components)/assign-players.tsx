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
import { canAssignPlayersToTeam, MAX_PLAYERS_PER_TEAM } from "@/utils/player-limits";
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
        <CardTitle>Esperan un lugar</CardTitle>
        <CardDescription>
          Selecciona jugadores para asignalos a uno de los equipos.
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
              >
                <PlayerAvatar
                  src={player.avatar}
                  name={player.name}
                  size="sm"
                />
                <span className="ms-2">{player.name}</span>
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
                className="bg-white"
                aria-label="Asignar jugadores al equipo"
              >
                <SelectValue placeholder="Elige un equipo..." />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {teams.map((team) => {
                    const hasRoom = canAssignPlayersToTeam(team.players.map(player => player.id), selectedIds);
                    return (
                      <SelectItem key={team.id} value={team.id} disabled={!hasRoom}>
                        {team.name}{hasRoom ? "" : ` (máximo ${MAX_PLAYERS_PER_TEAM} jugadores)`}
                      </SelectItem>
                    );
                  })}
                </SelectGroup>
              </SelectContent>
            </Select>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
};
