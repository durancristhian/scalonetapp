import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { getMatchForDownload } from "@/server/queries/match";
import { default as BoringAvatar } from "boring-avatars";
import { notFound } from "next/navigation";
import { FC } from "react";

type FormattedTeam = {
  id: string;
  name: string;
  players: number[];
};

type PageProps = {
  params: {
    ["match-id"]: string;
  };
};

const Page: FC<PageProps> = async ({ params }) => {
  const match = await getMatchForDownload(Number(params["match-id"]));

  if (!match) {
    return notFound();
  }

  const formattedTeams: FormattedTeam[] = JSON.parse(match.teams);

  return (
    <div className="p-8">
      <div className="grid gap-8">
        <p className="font-semibold text-4xl text-center">{match.name}</p>
        <div className="grid grid-cols-2 gap-8">
          {formattedTeams.map((team) => (
            <Card key={team.id}>
              <CardHeader>
                <CardTitle className="text-center">{team.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6">
                  <Separator />
                  <div className="grid grid-cols-2 gap-4">
                    {team.players.map((playerId) => {
                      /* We look for the player data in the match */
                      const player = match.players.find(
                        (player) => player.id === playerId
                      );

                      if (!player) {
                        return null;
                      }

                      return (
                        <div key={playerId} className="flex gap-4 items-center">
                          <BoringAvatar
                            variant="beam"
                            name={player.name}
                            size={48}
                          />
                          <div className="grow">
                            <p className="text-xl">{player.name}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <p className="text-center text-slate-500 text-sm">
          Hecho con&nbsp;
          <span className="underline underline-offset-2">scalonet.app</span>
        </p>
      </div>
    </div>
  );
};

export default Page;
