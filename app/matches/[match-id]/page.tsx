import { PlayersInMatchLabel } from "@/app/matches/(components)/players-in-match-label";
import { AddPlayerForm } from "@/app/matches/[match-id]/(components)/add-player-form";
import { Avatar } from "@/components/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { deletePlayer } from "@/server/actions/player";
import { getMatchById } from "@/server/queries/match";
import { TrashIcon } from "@heroicons/react/24/outline";
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
                <Card>
                  <CardHeader>
                    <CardTitle>¿Quienes juegan?</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col gap-4 md:flex-row">
                      <div className="grow">
                        <div className="flex flex-col gap-4">
                          {match.players.length ? (
                            <ul className="flex flex-col gap-4">
                              {match.players.map((player) => (
                                <li key={player.id}>
                                  <div className="border border-slate-300 flex items-center gap-4 p-2 rounded-md">
                                    <div className="inline-flex">
                                      <Avatar name={player.name} size={36} />
                                    </div>
                                    <div className="grow">
                                      <p className="font-semibold">
                                        {player.name}
                                      </p>
                                    </div>
                                    <div className="inline-flex">
                                      <form
                                        action={async () => {
                                          "use server";

                                          await deletePlayer(player.id);
                                        }}
                                        className="inline-flex"
                                      >
                                        <Button
                                          type="submit"
                                          variant="ghost"
                                          size="icon"
                                        >
                                          <TrashIcon className="h-4 text-red-700 w-4" />
                                        </Button>
                                      </form>
                                    </div>
                                  </div>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-sm text-slate-700">
                              ¿Viene floja la convocatoria?.
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="max-w-lg">
                        <Card className="bg-slate-50">
                          <CardHeader>
                            <CardTitle>¿Falta alguien?</CardTitle>
                            <CardDescription>
                              Agregalo en esta sección. Podés agregar la
                              cantidad de personas que necesites.
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <AddPlayerForm />
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="teams"></TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
