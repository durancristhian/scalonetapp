"use client";

import { TeamForm } from "@/app/(authenticated)/partidos/[match-id]/(components)/team-form";
import { AnimatedListItem } from "@/components/animated-list-item";
import { EmptyState } from "@/components/empty-state";
import { PlayerAvatar } from "@/components/player-avatar";
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
import { byName } from "@/utils/by-name";
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

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="flex gap-2 items-center">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  {/* Putting this empty div here so the tooltip works even if the button is disabled (it can't receive focus hence the tooltip won't be shown) */}
                  <div>
                    <Button
                      onClick={onTeamRemove}
                      disabled={!canBeDeleted}
                      variant="ghost"
                      size="icon"
                    >
                      <TrashIcon className="h-4 text-destructive w-4" />
                    </Button>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    {canBeDeleted
                      ? "Eliminar"
                      : "Se necesitan al menos 2 equipos para armar una buena competencia"}
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <div className="grow">
              <TeamForm
                onSubmit={onTeamNameChange}
                values={{
                  name: team.name,
                }}
              />
            </div>
          </div>
          {Boolean(team.players.length) ? (
            <>
              <div className="space-y-2">
                {team.players.sort(byName).map((player, idx) => (
                  <AnimatedListItem key={player.id} listIndex={idx}>
                    <div className="flex gap-2 items-center">
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
                          <TooltipContent>
                            <p>Sacar del equipo</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
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
