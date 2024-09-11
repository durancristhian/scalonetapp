"use client";

import { ConfirmTeamsUpdate } from "@/app/(authenticated)/partidos/[match-id]/(components)/confirm-teams-update";
import { CopyTeams } from "@/app/(authenticated)/partidos/[match-id]/(components)/copy-teams";
import { ExportTeams } from "@/app/(authenticated)/partidos/[match-id]/(components)/export-teams";
import { MatchPlayers } from "@/app/(authenticated)/partidos/[match-id]/(components)/match-players";
import { PlayerTabs } from "@/app/(authenticated)/partidos/[match-id]/(components)/player-tabs";
import { PlayersList } from "@/app/(authenticated)/partidos/[match-id]/(components)/players-list";
import { SaveTeams } from "@/app/(authenticated)/partidos/[match-id]/(components)/save-teams";
import { TeamCard } from "@/app/(authenticated)/partidos/[match-id]/(components)/team-card";
import { useTeamsBuilderState } from "@/app/(authenticated)/partidos/[match-id]/(hooks)/use-team-builder-state";
import { EmptyState } from "@/components/empty-state";
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
import { MatchWithPlayers } from "@/types/match";
import { getTeamsToSave } from "@/utils/get-teams-to-save";
import { FC, useMemo } from "react";

type MatchDetailsProps = {
  match: MatchWithPlayers;
};

export const MatchDetails: FC<MatchDetailsProps> = ({ match }) => {
  const {
    assignSelectionToTeam,
    balanceTeams,
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
  const areTeamsValid = useMemo(() => {
    const validTeamNames = teams.every((team) => Boolean(team.name));

    return !unselectedPlayers.length && validTeamNames;
  }, [teams, unselectedPlayers]);

  /* We check if there is a difference between the local state and the db state */
  const areTeamsSaved = useMemo(() => {
    return match.teams === getTeamsToSave(teams);
  }, [match, teams]);

  return (
    <div className="grid md:grid-cols-3 gap-8">
      <div className="md:col-span-1">
        <div className="grid gap-8">
          <Card>
            <CardHeader>
              <CardTitle>¡Convoca a los galácticos!</CardTitle>
              <CardDescription>
                Es el momento de traer a los mejores jugadores al campo de
                juego.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PlayerTabs />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>
                Jugadores fichados
                {match.players.length
                  ? `: ${match.players.length} de ${process.env.NEXT_PUBLIC_MAX_PLAYERS_PER_MATCH}`
                  : ""}
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
          {match.players.length ? (
            <>
              <div className="grid gap-2">
                <h1 className="font-bold text-xl">
                  ¡Es hora de armar los equipos!
                </h1>
                <p>
                  ¡Puedes comenzar con uno de nuestros equipos sugeridos y luego
                  jugar al entrenador a tu manera! Ajusta y cambia lo que
                  quieras, porque en el fútbol, ¡siempre hay espacio para una
                  jugada maestra!
                </p>
              </div>
              <Tabs
                defaultValue="suggested-teams"
                value={
                  !unselectedPlayers.length ? "suggested-teams" : undefined
                }
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
                  <div className="grid gap-8 md:grid-cols-2 md:items-start">
                    <div className="grid gap-2">
                      <p className="font-semibold">Lo que toca, toca</p>
                      <p>
                        Usa esta opción para separar a los jugadores al azar.
                        ¡La suerte está echada!
                      </p>
                      <ConfirmTeamsUpdate
                        onConfirm={randomizeTeams}
                        showConfirmation={
                          unselectedPlayers.length !== match.players.length
                        }
                        disableTrigger={!match.players.length}
                        triggerText="Armar equipos aleatorios"
                      />
                    </div>
                    <div className="grid gap-2">
                      <p className="font-semibold">Usando la razón</p>
                      <p>
                        Haremos los equipos teniendo en cuenta el nivel de los
                        jugadores. ¡Prepárate para el desafío!
                      </p>
                      <ConfirmTeamsUpdate
                        onConfirm={balanceTeams}
                        showConfirmation={
                          unselectedPlayers.length !== match.players.length
                        }
                        disableTrigger={!match.players.length}
                        triggerText="Armar equipos balanceados"
                      />
                    </div>
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
                <p className="font-semibold">Los equipos</p>
                <div className="grid md:grid-cols-2 gap-4">
                  {teams.map((team) => (
                    <TeamCard
                      key={team.id}
                      canBeDeleted={teams.length > 2}
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
              <div className="grid gap-4 place-items-center">
                <p className="font-semibold">¿Listo para la acción?</p>
                <div className="flex gap-4 items-center justify-center">
                  <SaveTeams
                    disabled={!areTeamsValid}
                    matchId={match.id}
                    teams={teams}
                  />
                  <ExportTeams
                    disabled={!areTeamsValid || !areTeamsSaved}
                    matchId={match.id}
                    teams={teams}
                  />
                </div>
              </div>
            </>
          ) : (
            <div className="grid gap-2">
              <h1 className="font-bold text-xl">
                Sin jugadores, ni Messi podría ganar...
              </h1>
              <EmptyState>
                Convoca a tus cracks para que esto no sea un solitario. ¡No se
                puede armar el picadito con fantasmas!
              </EmptyState>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
