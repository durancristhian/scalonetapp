import { TeamForm } from "@/app/matches/[match-id]/(components)/team-form";
import { Team } from "@/app/matches/[match-id]/hooks/use-team-builder-state";
import { SpicyTooltips } from "@/components/spicy-tooltips";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { TeamSchema } from "@/schemas/team";
import { default as BoringAvatar } from "boring-avatars";
import { motion } from "framer-motion";
import { TrashIcon } from "lucide-react";
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

  return (
    <Card className="bg-slate-50">
      <CardContent className="pt-6">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <Button
              onClick={() => {
                removeTeam(team.id);
              }}
              disabled={!canBeDeleted}
              variant="ghost"
              size="icon"
            >
              <TrashIcon className="h-4 text-red-700 w-4" />
            </Button>
            <div className="grow">
              <TeamForm
                values={{ name: team.name }}
                onSubmit={onTeamNameChange}
              />
            </div>
          </div>
          <Separator />
          {Boolean(team.players.length) ? (
            <>
              <div className="grid gap-2">
                {team.players.map((player, idx) => (
                  <motion.div
                    key={player.id}
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.15, delay: idx * 0.15 }}
                  >
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          removePlayerFromTeam(player.id, team.id);
                        }}
                      >
                        <TrashIcon className="h-4 text-red-700 w-4" />
                      </Button>
                      <div className="grow">
                        <div className="border border-slate-300 px-4 py-2 rounded-md">
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
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </>
          ) : (
            <p>No hay jugadores en este equipo.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
