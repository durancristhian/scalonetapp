"use client";

import { AddPlayerForm } from "@/app/[match-id]/(components)/add-player-form";
import { MatchPlayers } from "@/app/[match-id]/(components)/match-players";
import { PlayersList } from "@/app/[match-id]/(components)/players-list";
import { TeamCard } from "@/app/[match-id]/(components)/team-card";
import { useTeamsBuilderState } from "@/app/[match-id]/hooks/use-team-builder-state";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { getMatchById } from "@/server/queries/match";
import { Prisma } from "@prisma/client";
import copy from "copy-to-clipboard";
import { PartyPopper } from "lucide-react";
import { FC } from "react";
import { toast } from "sonner";

/* We create this type since Prisma doesn't return relationships in the generated types */
type Match = NonNullable<Prisma.PromiseReturnType<typeof getMatchById>>;

type MatchDetailsProps = {
  match: Match;
};

export const MatchDetails: FC<MatchDetailsProps> = ({ match }) => {
  const {
    assignSelectionToTeam,
    createNewTeam,
    removePlayerFromTeam,
    removeTeam,
    selectedIds,
    teams,
    togglePlayer,
    unselectedPlayers,
    updateTeamName,
  } = useTeamsBuilderState(match.players);

  const playersTitle = match.players.length
    ? `Jugadores (${match.players.length})`
    : "Agregar jugadores";

  const copyTeams = () => {
    const text = `${teams
      .map((team) => {
        const players = team.players
          .sort((playerA, playerB) => playerA.name.localeCompare(playerB.name))
          .map((player) => `- ${player.name}`)
          .join("\n");

        return `${team.name}:\n${players}`;
      })
      .join("\n\n")}`;

    copy(text);

    toast("Equipos copiados al portapapeles.", {
      icon: <PartyPopper className="h-4 opacity-50 w-4" />,
    });
  };

  return (
    <div className="grid md:grid-cols-3 gap-4">
      <div className="md:col-span-1">
        <Card className="bg-slate-50">
          <CardHeader>
            <CardTitle>{playersTitle}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <AddPlayerForm />
              <Separator />
              <MatchPlayers players={match.players} />
            </div>
          </CardContent>
        </Card>
      </div>
      <div className="md:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>Equipos</CardTitle>
            <CardDescription>
              {unselectedPlayers.length
                ? "Seleccioná jugadores de la lista a continuación para luego agregarlos a uno de los equipos."
                : "Listo! Ya agregaste a todos los jugadores en un equipo. Ahora podés guardar tus equipos."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <PlayersList
                assignSelectionToTeam={assignSelectionToTeam}
                canAssignSelection={!selectedIds.length}
                players={unselectedPlayers}
                selectedIds={selectedIds}
                teams={teams}
                togglePlayer={togglePlayer}
              />
              <div className="grid md:grid-cols-2 gap-4">
                {teams.map((team) => (
                  <TeamCard
                    key={team.id}
                    canBeDeleted={teams.length > 1}
                    removePlayerFromTeam={removePlayerFromTeam}
                    removeTeam={removeTeam}
                    team={team}
                    updateTeamName={updateTeamName}
                  />
                ))}
              </div>
              <div className="flex justify-between gap-4">
                <Button variant="outline" size="sm" onClick={createNewTeam}>
                  Agregar otro equipo
                </Button>
                <Button
                  size="sm"
                  onClick={copyTeams}
                  disabled={!!unselectedPlayers.length}
                >
                  Copiar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
