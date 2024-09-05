"use client";

import { TeamForm } from "@/app/(authenticated)/matches/[match-id]/(components)/team-form";
import { Team } from "@/app/(authenticated)/matches/[match-id]/hooks/use-team-builder-state";
import { AnimatedListItem } from "@/components/animated-list-item";
import { EmptyState } from "@/components/empty-state";
import { SpicyTooltips } from "@/components/spicy-tooltips";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { TeamSchema } from "@/schemas/team";
import { default as BoringAvatar } from "boring-avatars";
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
    <Card className="bg-slate-50">
      <CardContent className="pt-6">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
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
                      <TrashIcon className="h-4 text-red-700 w-4" />
                    </Button>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    {canBeDeleted
                      ? "Eliminar"
                      : "No se puede eliminar este equipo porque mínimo tienen que ser 2"}
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
              <div className="grid gap-2">
                {team.players.map((player, idx) => (
                  <AnimatedListItem key={player.id} listIndex={idx}>
                    <div className="flex items-center gap-2">
                      <div className="grow">
                        <div className="flex gap-2 items-center">
                          <SpicyTooltips>
                            <BoringAvatar
                              variant="beam"
                              name={player.name}
                              size={24}
                            />
                          </SpicyTooltips>
                          <p>{player.name}</p>
                        </div>
                      </div>
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
                              <XIcon className="h-4 text-red-700 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Eliminar del equipo</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
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
