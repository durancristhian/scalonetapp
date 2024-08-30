"use client";

import { PlayersList } from "@/app/matches/[match-id]/(components)/players-list";
import { TeamCard } from "@/app/matches/[match-id]/(components)/team-card";
import { useTeamsBuilderState } from "@/app/matches/[match-id]/hooks/use-team-builder-state";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Player } from "@prisma/client";
import { FC } from "react";

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
        </div>
      </CardContent>
    </Card>
  );
};
