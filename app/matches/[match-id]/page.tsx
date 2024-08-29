import { PlayersInMatchLabel } from "@/app/matches/(components)/players-in-match-label";
import { MatchPlayers } from "@/app/matches/[match-id]/(components)/match-players";
import { TeamsBuilder } from "@/app/matches/[match-id]/(components)/teams-builder";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getMatchById } from "@/server/queries/match";
import { notFound } from "next/navigation";

type PageProps = {
  params: {
    ["match-id"]: string;
  };
};

export default async function Page({ params }: PageProps) {
  const match = await getMatchById(Number(params["match-id"]));

  if (!match) {
    return notFound();
  }

  return (
    <div className="py-8">
      <div className="container mx-auto">
        <div className="flex flex-col gap-4">
          <div>
            <h2 className="font-semibold text-2xl">{match.name}</h2>
            <PlayersInMatchLabel players={match.players.length} />
          </div>
          <div>
            <Tabs defaultValue="players">
              <TabsList className="grid grid-cols-2 w-full">
                <TabsTrigger value="players">Personas</TabsTrigger>
                <TabsTrigger value="teams">Equipos</TabsTrigger>
              </TabsList>
              <TabsContent value="players">
                <MatchPlayers players={match.players} />
              </TabsContent>
              <TabsContent value="teams">
                <TeamsBuilder players={match.players} />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
