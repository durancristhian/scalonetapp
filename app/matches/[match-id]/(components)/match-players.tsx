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
import { deletePlayer } from "@/server/queries/player";
import { Player } from "@prisma/client";
import { TrashIcon } from "lucide-react";
import { FC } from "react";

type MatchPlayersProps = {
  players: Player[];
};

export const MatchPlayers: FC<MatchPlayersProps> = ({ players }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>¿Quienes juegan?</CardTitle>
        <CardDescription>
          Estas personas se podrían quedar en su casa viendo la tele pero
          deciden ir a jugar con vos, es para destacar.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4 md:flex-row">
          <div className="grow">
            <div className="flex flex-col gap-4">
              {players.length ? (
                <ul className="flex flex-col gap-4">
                  {players.map((player) => (
                    <li key={player.id}>
                      <div className="border border-slate-300 flex items-center gap-4 p-2 rounded-md">
                        <div className="inline-flex">
                          <Avatar name={player.name} size={36} />
                        </div>
                        <div className="grow">
                          <p className="font-semibold">{player.name}</p>
                        </div>
                        <div className="inline-flex">
                          <form
                            action={async () => {
                              "use server";

                              await deletePlayer(player.id);
                            }}
                            className="inline-flex"
                          >
                            <Button type="submit" variant="ghost" size="icon">
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
                  Agregalo en esta sección. Podés agregar la cantidad de
                  personas que necesites.
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
  );
};
