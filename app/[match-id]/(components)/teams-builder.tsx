"use client";

import { PlayersList } from "@/app/[match-id]/(components)/players-list";
import { TeamCard } from "@/app/[match-id]/(components)/team-card";
import { useTeamsBuilderState } from "@/app/[match-id]/hooks/use-team-builder-state";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Player } from "@prisma/client";
import copy from "copy-to-clipboard";
import { PartyPopper } from "lucide-react";
import { FC } from "react";
import { toast } from "sonner";

type TeamsBuilderProps = {
  players: Player[];
};

export const TeamsBuilder: FC<TeamsBuilderProps> = ({ players }) => {
  const {
    assignSelectionToTeam,
    createNewTeam,
    removePlayerFromTeam,
    removeTeam,
    selectedIds,
    teams,
    togglePlayer,
    unselectedPlayers,
    updateTeamName,
  } = useTeamsBuilderState(players);

  const copyTeams = () => {
    const text = `${teams
      .map((team) => {
        const players = team.players
          .sort((playerA, playerB) => playerA.name.localeCompare(playerB.name))
          .map((player) => `- ${player.name}`)
          .join("\n");

        return `${team.name}:\n${players}`;
      })
      .join("\n\n")}`;

    copy(text);

    toast("Equipos copiados al portapapeles.", {
      icon: <PartyPopper className="h-4 opacity-50 w-4" />,
    });
  };

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
            players={unselectedPlayers}
            selectedIds={selectedIds}
            togglePlayer={togglePlayer}
          />
          <div className="gap-4 grid md:grid-cols-2">
            {teams.map((team) => (
              <div key={team.id} className="grow">
                <TeamCard
                  assignSelectionToTeam={assignSelectionToTeam}
                  canAssignSelection={!selectedIds.length}
                  removePlayerFromTeam={removePlayerFromTeam}
                  removeTeam={removeTeam}
                  team={team}
                  updateTeamName={updateTeamName}
                />
              </div>
            ))}
          </div>
          <div className="flex justify-between gap-4">
            <div>
              <Button
                onClick={() => {
                  createNewTeam();
                }}
                variant="outline"
              >
                Agregar otro equipo
              </Button>
            </div>
            <div>
              <Button
                onClick={() => {
                  copyTeams();
                }}
              >
                Copiar equipos
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
