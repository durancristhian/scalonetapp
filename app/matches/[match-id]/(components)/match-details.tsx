"use client";

import { MatchPlayers } from "@/app/matches/[match-id]/(components)/match-players";
import { PlayerForm } from "@/app/matches/[match-id]/(components)/player-form";
import { PlayersList } from "@/app/matches/[match-id]/(components)/players-list";
import { TeamCard } from "@/app/matches/[match-id]/(components)/team-card";
import { useTeamsBuilderState } from "@/app/matches/[match-id]/hooks/use-team-builder-state";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { PlayerSchema } from "@/schemas/player";
import { editMatch } from "@/server/actions/match";
import { addPlayer } from "@/server/actions/player";
import { getMatchById } from "@/server/queries/match";
import { Prisma } from "@prisma/client";
import copy from "copy-to-clipboard";
import { BugIcon, LoaderCircle, PartyPopper } from "lucide-react";
import { useParams } from "next/navigation";
import { FC, useCallback } from "react";
import { toast } from "sonner";

/* We create this type since Prisma doesn't return relationships in the generated types */
type Match = NonNullable<Prisma.PromiseReturnType<typeof getMatchById>>;

type MatchDetailsProps = {
  match: Match;
};

export const MatchDetails: FC<MatchDetailsProps> = ({ match }) => {
  const params = useParams();
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

  /* We consider teams are valid when there is no unselected players AND all teams have a valid name */
  const areTeamsValid: () => boolean = useCallback(() => {
    const validTeamNames = teams.every((team) => Boolean(team.name));

    return !unselectedPlayers.length && validTeamNames;
  }, [teams, unselectedPlayers]);

  const onPlayerSubmit: (values: PlayerSchema) => Promise<void> = (values) => {
    return addPlayer(values, Number(params["match-id"]));
  };

  const exportTeams: () => Promise<void> = () => {
    return new Promise(async (resolve, reject) => {
      try {
        const formattedTeams = teams.map((team) => ({
          ...team,
          /* We only store the player ids */
          players: team.players.map((player) => player.id),
        }));

        await editMatch(
          match.id,
          {
            teams: JSON.stringify(formattedTeams),
          },
          "/matches/[match-id]"
        );

        toast(
          "Equipos guardados con éxito. En instantes comienza la descarga...",
          {
            icon: <LoaderCircle className="animate-spin h-4 opacity-50 w-4" />,
          }
        );

        /* TODO: Move this to a util fn */
        fetch(`/download/${match.id}`)
          .then((response) => response.blob())
          .then((blob) => {
            const url = window.URL.createObjectURL(new Blob([blob]));

            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", "equipos.png");

            document.body.appendChild(link);

            link.click();

            window.URL.revokeObjectURL(url);
          });

        resolve();
      } catch (error) {
        toast("Ha ocurrido un error.", {
          description:
            "No pudimos guardar los equipos. ¿Podrías volver a intentarlo?.",
          icon: <BugIcon className="h-4 opacity-50 w-4" />,
        });

        reject();
      }
    });
  };

  return (
    <div className="grid md:grid-cols-3 gap-8">
      <div className="md:col-span-1">
        <Card className="bg-slate-50">
          <CardHeader>
            <CardTitle>{playersTitle}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <PlayerForm onSubmit={onPlayerSubmit} />
              <Separator />
              <MatchPlayers players={match.players} />
            </div>
          </CardContent>
        </Card>
      </div>
      <div className="md:col-span-2">
        <div className="grid gap-8">
          <div>
            <CardTitle className="mb-1.5">Los equipos</CardTitle>
            <CardDescription>
              {unselectedPlayers.length
                ? "Seleccioná jugadores de la siguiente para luego agregarlos a uno de los equipos."
                : "Listo! Ya agregaste a todos los jugadores en algún equipo. Ahora podés guardarlos."}
            </CardDescription>
          </div>
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
          <div className="flex justify-between gap-2">
            <Button onClick={createNewTeam} variant="outline" size="sm">
              Agregar otro equipo
            </Button>
            <div className="flex gap-2">
              <Button onClick={copyTeams} variant="outline" size="sm">
                Copiar
              </Button>
              {/* TODO: Wrap this in a tooltip explaining why is disabled */}
              <Button
                onClick={exportTeams}
                disabled={!areTeamsValid()}
                size="sm"
              >
                Exportar
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
