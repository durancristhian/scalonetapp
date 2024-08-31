import { PlayersInMatchLabel } from "@/app/matches/(components)/players-in-match-label";
import { Team } from "@/app/matches/[match-id]/hooks/use-team-builder-state";
import { SpicyTooltips } from "@/components/spicy-tooltips";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { default as BoringAvatar } from "boring-avatars";
import { TrashIcon } from "lucide-react";
import { ChangeEventHandler, FC } from "react";

type TeamCardProps = {
  assignSelectionToTeam: (teamId: string) => void;
  canAssignSelection: boolean;
  removePlayerFromTeam: (playerId: number, teamId: string) => void;
  removeTeam: (teamId: string) => void;
  team: Team;
  updateTeamName: (teamId: string, newName: string) => void;
};

export const TeamCard: FC<TeamCardProps> = ({
  assignSelectionToTeam,
  canAssignSelection,
  removePlayerFromTeam,
  removeTeam,
  team,
  updateTeamName,
}) => {
  const onTeamNameChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    updateTeamName(team.id, event.target.value);
  };

  return (
    <Card className="bg-slate-50">
      <CardContent>
        <div className="py-6">
          <div className="grid grid-rows-1 gap-2">
            <Input value={team.name} onChange={onTeamNameChange} />
            <p className="text-sm text-slate-700">
              <PlayersInMatchLabel players={team.players.length} />
            </p>
          </div>
        </div>
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
                      <SpicyTooltips>
                        <BoringAvatar
                          variant="beam"
                          name={player.name}
                          size={24}
                        />
                      </SpicyTooltips>
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
