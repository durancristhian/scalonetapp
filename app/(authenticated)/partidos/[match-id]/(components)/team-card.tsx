"use client";

import { TeamForm } from "@/app/(authenticated)/partidos/[match-id]/(components)/team-form";
import { AnimatedListItem } from "@/components/animated-list-item";
import { EmptyState } from "@/components/empty-state";
import { PlayerAvatar } from "@/components/player-avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { TeamSchema } from "@/schemas/team";
import { Team } from "@/types/team";
import { PLAYER_POSITIONS } from "@/utils/player-positions";
import { Player } from "@prisma/client";
import { TrashIcon, XIcon } from "lucide-react";
import { FC } from "react";

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
    /* Players are already sorted by name, so we just group them by position */
    (acc, curr) => ({ ...acc, [curr.position]: [...acc[curr.position], curr] }),
    { goa: [], def: [], mid: [], for: [] }
  );

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="flex gap-2 items-center">
            <div className="grow">
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
                    <Button onClick={onTeamRemove} variant="ghost" size="icon">
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
                {[...goa, ...def, ...mid, ...forwards].map((player, idx) => (
                  <AnimatedListItem key={player.id} listIndex={idx}>
                    <div className="flex gap-2 items-center">
                      <div className="grow">
                        <div className="flex gap-2 items-center">
                          <PlayerAvatar
                            src={player.avatar}
                            name={player.name}
                            size="sm"
                          />
                          <p>{player.name}</p>
                        </div>
                      </div>
                      <div className="flex-shrink-0">
                        <Badge
                          variant={player.position}
                          className="justify-center uppercase w-[50px]"
                        >
                          {PLAYER_POSITIONS[player.position].substring(0, 3)}
                        </Badge>
                      </div>
                      <div className="flex-shrink-0">
                        <Badge
                          variant="secondary"
                          className="justify-center w-[38px]"
                        >
                          {player.level}
                        </Badge>
                      </div>
                      <div className="flex-shrink-0">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
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
                      </div>
                    </div>
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
