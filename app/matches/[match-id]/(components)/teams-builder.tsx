"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Player } from "@prisma/client";
import uniqueId from "lodash.uniqueid";
import { FC, useState } from "react";

type Team = {
  id: string;
  name: string;
  players: Player[];
};

type TeamsBuilderProps = {
  players: Player[];
};

export const TeamsBuilder: FC<TeamsBuilderProps> = ({ players }) => {
  const [teams] = useState<Team[]>([
    { id: uniqueId("team-"), name: "Equipo 1", players: [] },
    { id: uniqueId("team-"), name: "Equipo 2", players: [] },
  ]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>A lo que vinimos</CardTitle>
        <CardDescription>Vamos a armar los equipos de una vez.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex gap-4">
          {teams.map((team) => (
            <div key={team.id} className="grow">
              <Team team={team} />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

type TeamProps = {
  team: Team;
};

const Team: FC<TeamProps> = ({ team }) => {
  return (
    <Card className="bg-slate-50">
      <CardHeader>
        <CardTitle>{team.name}</CardTitle>
      </CardHeader>
      <CardContent></CardContent>
    </Card>
  );
};
