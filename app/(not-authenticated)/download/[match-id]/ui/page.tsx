"use client";

import { PlayerAvatar } from "@/components/player-avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { type MatchWithPlayers } from "@/types/match";
import { type BaseTeam } from "@/types/team";
import { byName } from "@/utils/by-name";
import { type Player } from "@prisma/client";
import { type FC, useEffect, useState } from "react";

const Page: FC = () => {
  const [match, setMatch] = useState<MatchWithPlayers>();

  useEffect(() => {
    const data = window.localStorage.getItem("match");

    if (data) {
      setMatch(JSON.parse(data));
    }
  }, []);

  if (!match) {
    return null;
  }

  const formattedTeams: BaseTeam[] = JSON.parse(match.teams);

  return (
    <div className="p-8">
      <div className="space-y-8">
        <h1 className="font-bold text-4xl text-center">{match.name}</h1>
        <div className="grid grid-cols-2 gap-8">
          {formattedTeams.map((team) => (
            <Card key={team.id}>
              <CardHeader className="border-b">
                <CardTitle className="text-center text-2xl">
                  {team.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    {team.players
                      /* We look for the player data in the match */
                      .map((playerId) =>
                        match.players.find((player) => player.id === playerId)
                      )
                      /* We exclude potential empty players */
                      .filter((player): player is Player => Boolean(player))
                      /* We sort players in the team by name */
                      .sort(byName)
                      .map((player) => (
                        <div
                          key={player.id}
                          className="flex gap-4 items-center"
                        >
                          <PlayerAvatar
                            src={player.avatar}
                            name={player.name}
                            size="xl"
                          />
                          <div className="grow">
                            <p className="text-xl">{player.name}</p>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <p className="text-center text-muted-foreground text-sm">
          Hecho con{" "}
          <span className="underline underline-offset-2">scalonet.app</span>
        </p>
      </div>
    </div>
  );
};

export default Page;
