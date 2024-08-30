import { PlayersInMatchLabel } from "@/app/matches/(components)/players-in-match-label";
import { Team } from "@/app/matches/[match-id]/hooks/use-team-builder-state";
import { Avatar } from "@/components/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TrashIcon } from "lucide-react";
import { FC } from "react";

type TeamCardProps = {
  assignSelectionToTeam: (teamId: string) => void;
  canAssignSelection: boolean;
  removePlayerFromTeam: (playerId: number, teamId: string) => void;
  removeTeam: (teamId: string) => void;
  team: Team;
};

export const TeamCard: FC<TeamCardProps> = ({
  assignSelectionToTeam,
  canAssignSelection,
  removePlayerFromTeam,
  removeTeam,
  team,
}) => {
  return (
    <Card className="bg-slate-50">
      <CardHeader>
        <CardTitle>{team.name}</CardTitle>
        <CardDescription>
          <PlayersInMatchLabel players={team.players.length} />
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          {Boolean(team.players.length) ? (
            <div className="flex flex-col gap-2">
              {team.players.map((player) => (
                <div
                  key={player.id}
                  className="border border-slate-300 flex items-center gap-4 p-2 rounded-md"
                >
                  <div className="grow">
                    <div className="flex gap-2 items-center">
                      <Avatar name={player.name} size={24} />
                      <p className="font-semibold">{player.name}</p>
                    </div>
                  </div>
                  <div className="inline-flex">
                    <Button
                      type="submit"
                      variant="outline"
                      size="icon"
                      onClick={() => {
                        removePlayerFromTeam(player.id, team.id);
                      }}
                    >
                      <TrashIcon className="h-4 text-red-700 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : null}
          <div className="flex gap-4 justify-between">
            <Button
              onClick={() => {
                removeTeam(team.id);
              }}
              variant="outline"
              size="icon"
            >
              <TrashIcon className="h-4 text-red-700 w-4" />
            </Button>
            <Button
              disabled={canAssignSelection}
              onClick={() => {
                assignSelectionToTeam(team.id);
              }}
            >
              Asignar
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
