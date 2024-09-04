"use client";

import { CopyTeams } from "@/app/(authenticated)/matches/[match-id]/(components)/copy-teams";
import { ExportTeams } from "@/app/(authenticated)/matches/[match-id]/(components)/export-teams";
import { MatchPlayers } from "@/app/(authenticated)/matches/[match-id]/(components)/match-players";
import { PlayerTabs } from "@/app/(authenticated)/matches/[match-id]/(components)/player-tabs";
import { PlayersList } from "@/app/(authenticated)/matches/[match-id]/(components)/players-list";
import { RandomizeTeams } from "@/app/(authenticated)/matches/[match-id]/(components)/randomize-teams";
import { TeamCard } from "@/app/(authenticated)/matches/[match-id]/(components)/team-card";
import { useTeamsBuilderState } from "@/app/(authenticated)/matches/[match-id]/hooks/use-team-builder-state";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MatchWithPlayers } from "@/server/queries/match";
import { FC, useCallback } from "react";

type MatchDetailsProps = {
  match: MatchWithPlayers;
};

export const MatchDetails: FC<MatchDetailsProps> = ({ match }) => {
  const {
    assignSelectionToTeam,
    createNewTeam,
    randomizeTeams,
    removePlayerFromTeam,
    removeTeam,
    selectedIds,
    teams,
    togglePlayer,
    unselectedPlayers,
    updateTeamName,
  } = useTeamsBuilderState(match);

  /* We consider teams are valid when there is no unselected players AND all teams have a valid name */
  const areTeamsValid: () => boolean = useCallback(() => {
    const validTeamNames = teams.every((team) => Boolean(team.name));

    return !unselectedPlayers.length && validTeamNames;
  }, [teams, unselectedPlayers]);

  return (
    <div className="grid md:grid-cols-3 gap-4">
      <div className="md:col-span-1">
        <div className="grid gap-4">
          <Card className="bg-slate-50">
            <CardHeader>
              <CardTitle>Agregar jugadores</CardTitle>
            </CardHeader>
            <CardContent>
              <PlayerTabs />
            </CardContent>
          </Card>
          <Card className="bg-slate-50">
            <CardHeader>
              <CardTitle>
                Jugadores
                {match.players.length ? `: ${match.players.length}` : ""}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <MatchPlayers players={match.players} />
            </CardContent>
          </Card>
        </div>
      </div>
      <div className="md:col-span-2">
        <div className="grid gap-8">
          <div className="grid gap-2">
            <CardTitle>A agarrar la pala</CardTitle>
            <CardDescription>
              Podés arrancar con uno de los equipos sugeridos y luego ir
              actualizando a mano en base a lo que prefieras.
            </CardDescription>
          </div>
          <Tabs
            defaultValue="suggested-teams"
            value={!unselectedPlayers.length ? "suggested-teams" : undefined}
          >
            <TabsList className="grid grid-cols-2 mb-4">
              <TabsTrigger value="suggested-teams">
                Equipos sugeridos
              </TabsTrigger>
              <TabsTrigger
                value="custom-teams"
                disabled={!unselectedPlayers.length}
              >
                Personalizar equipos
              </TabsTrigger>
            </TabsList>
            <TabsContent value="suggested-teams">
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <p className="font-semibold">
                    Separar a la gente aleatoriamente
                  </p>
                  <p className="text-sm">
                    Separar a la gente aleatoriamente. Esta opción es útil
                    cuando no conoces el nivel de los jugadores o simplemente
                    necesitás armar algo sin importar que el partido esté
                    parejo.
                  </p>
                  <div>
                    <RandomizeTeams
                      onClick={randomizeTeams}
                      showConfirmation={
                        unselectedPlayers.length !== match.players.length
                      }
                    />
                  </div>
                </div>
                {/* <div className="grid gap-2">
                  <p className="font-semibold">Separar a la gente por nivel</p>
                  <p className="text-sm">
                    Teniendo en cuenta el nivel de los jugadores, podemos
                    separar a la gente para que los equipos queden lo más
                    balanceados posibles.
                  </p>
                  <div>
                    <Button>Usar equipos balanceados</Button>
                  </div>
                </div> */}
              </div>
            </TabsContent>
            <TabsContent value="custom-teams">
              <PlayersList
                assignSelectionToTeam={assignSelectionToTeam}
                canAssignSelection={!selectedIds.length}
                players={unselectedPlayers}
                selectedIds={selectedIds}
                teams={teams}
                togglePlayer={togglePlayer}
              />
            </TabsContent>
          </Tabs>
          <Separator />
          <div className="grid gap-4">
            <CardTitle>Los equipos</CardTitle>
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
            <div className="flex gap-2 items-center justify-between">
              <Button onClick={createNewTeam} variant="outline">
                Nuevo equipo
              </Button>
              <CopyTeams teams={teams} />
            </div>
          </div>
          <Separator />
          <div className="flex gap-4 items-center justify-center">
            <p>¿Terminaste?</p>
            <ExportTeams
              disabled={!areTeamsValid()}
              matchId={match.id}
              teams={teams}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
