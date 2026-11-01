"use client";

import { TeamForm } from "@/app/(authenticated)/partidos/[match-id]/(components)/team-form";
import { AnimatedListItem } from "@/components/animated-list-item";
import { EmptyState } from "@/components/empty-state";
import { PlayerRow } from "@/components/player-row";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { type TeamSchema } from "@/schemas/team";
import { type Team } from "@/types/team";
import { type Player } from "@prisma/client";
import { TrashIcon, XIcon } from "lucide-react";
import { type FC } from "react";

type TeamCardProps = {
  canBeDeleted: boolean;
  removePlayerFromTeam: (playerId: number, teamId: string) => void;
  removeTeam: (teamId: string) => void;
  team: Team;
  updateTeamName: (teamId: string, newName: string) => void;
};

export const TeamCard: FC<TeamCardProps> = ({
  canBeDeleted,
  removePlayerFromTeam,
  removeTeam,
  team,
  updateTeamName,
}) => {
  const onTeamNameChange: (values: TeamSchema) => void = ({ name }) => {
    updateTeamName(team.id, name);
  };

  const onTeamRemove: () => void = () => {
    removeTeam(team.id);
  };

  const {
    goa,
    def,
    mid,
    for: forwards,
  } = team.players.reduce<{
    goa: Player[];
    def: Player[];
    mid: Player[];
    for: Player[];
  }>(
    (acc, curr) => ({ ...acc, [curr.position]: [...acc[curr.position], curr] }),
    { goa: [], def: [], mid: [], for: [] },
  );

  return (
    <Card>
      <CardContent className="p-4 sm:p-6">
        <div className="space-y-4">
          <div className="flex gap-2 items-start">
            <div className="grow min-w-0">
              <TeamForm
                onSubmit={onTeamNameChange}
                values={{
                  name: team.name,
                }}
              />
            </div>
            {canBeDeleted ? (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={onTeamRemove}
                      variant="ghost"
                      size="icon"
                      aria-label={`Eliminar equipo ${team.name}`}
                    >
                      <TrashIcon className="h-4 text-destructive w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Eliminar</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ) : null}
          </div>
          {Boolean(team.players.length) ? (
            <>
              <div className="space-y-2">
                {[...goa, ...def, ...mid, ...forwards].map((player) => (
                  <AnimatedListItem key={player.id}>
                    <PlayerRow player={player}>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              aria-label={`Sacar a ${player.name} del equipo`}
                              onClick={() => {
                                removePlayerFromTeam(player.id, team.id);
                              }}
                            >
                              <XIcon className="h-4 text-destructive w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Sacar del equipo</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </PlayerRow>
                  </AnimatedListItem>
                ))}
              </div>
            </>
          ) : (
            <EmptyState>Este equipo está vacío.</EmptyState>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
