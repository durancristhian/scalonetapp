"use client";

import { unwrapActionResult, getActionErrorMessage } from "@/utils/action-result";


import { savePlayerPhoto } from "@/utils/save-player-photo";
import { trackAnalytics } from "@/utils/analytics";

import { useAlerts } from "@/app/(authenticated)/(hooks)/use-alerts";
import { MultiplePlayersForm } from "@/app/(authenticated)/partidos/[match-id]/(components)/multiple-players-form";
import { PlayerForm } from "@/app/(authenticated)/partidos/[match-id]/(components)/player-form";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { type PlayerSchema } from "@/schemas/player";
import {
  addMultiplePlayersAction,
  addPlayerAction,
} from "@/server/actions/player";
import { ERROR_MESSAGES } from "@/utils/error-messages";
import { MAX_PLAYERS_PER_MATCH } from "@/utils/player-limits";
import { InfoIcon } from "lucide-react";
import { useParams } from "next/navigation";
import { type FC, useState } from "react";

type AddPlayerProps = {
  currentPlayerCount: number;
  disabled?: boolean;
};

export const AddPlayer: FC<AddPlayerProps> = ({ currentPlayerCount, disabled }) => {
  if (disabled) {
    return <Button disabled>Agregar</Button>;
  }

  return <EnabledContent currentPlayerCount={currentPlayerCount} />;
};

export const PlayerLimitAlert = () => (
  <Alert>
    <InfoIcon aria-hidden="true" />
    <AlertTitle>¡No hay más espacio en el banco!</AlertTitle>
    <AlertDescription>
      ¡Has alcanzado el máximo de{" "}
      {MAX_PLAYERS_PER_MATCH} jugadores! Si
      necesitas añadir más estrellas, considera liberar espacio
      eliminando un jugador existente.
    </AlertDescription>
  </Alert>
);

const EnabledContent: FC<{ currentPlayerCount: number }> = ({ currentPlayerCount }) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const params = useParams();
  const matchId = Number(params["match-id"]);
  const { errorAlert } = useAlerts();

  const onPlayerSubmit: (values: PlayerSchema, photo?: Blob | null) => Promise<void> = (values, photo) => {
    return new Promise(async (resolve, reject) => {
      try {
        const id = unwrapActionResult(await addPlayerAction(matchId, values));
        trackAnalytics("players_added", { method: "single", count: 1 });
        const photoError = await savePlayerPhoto(id, photo);
        if (photoError) errorAlert({ title: photoError });

        setDialogOpen(false);

        resolve();
      } catch (error) {
        if (error instanceof Error) {
          errorAlert({
            title: getActionErrorMessage(error, ERROR_MESSAGES.player_add_error),
          });
        }

        reject(error);
      }
    });
  };

  const onMultiplePlayersSubmit: (values: PlayerSchema[]) => Promise<void> = (
    values
  ) => {
    return new Promise(async (resolve, reject) => {
      try {
        unwrapActionResult(await addMultiplePlayersAction(matchId, values));
        trackAnalytics("players_added", { method: "bulk", count: values.length });

        setDialogOpen(false);

        resolve();
      } catch (error) {
        if (error instanceof Error) {
          errorAlert({
            title: getActionErrorMessage(error, ERROR_MESSAGES.player_multiple_add_error),
          });
        }

        reject(error);
      }
    });
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button>Agregar</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg [max-block-size:90dvh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Convocando a los galácticos</DialogTitle>
          <DialogDescription className="max-md:text-balance">
            Es el momento de traer a los mejores jugadores al campo de juego.
          </DialogDescription>
        </DialogHeader>
        <Tabs defaultValue="single">
          <TabsList className="grid grid-cols-2">
            <TabsTrigger value="single">Agregar uno</TabsTrigger>
            <TabsTrigger value="multiple">Agregar muchos</TabsTrigger>
          </TabsList>
          <TabsContent value="single">
            <PlayerForm onSubmit={onPlayerSubmit} />
          </TabsContent>
          <TabsContent value="multiple">
            <MultiplePlayersForm currentPlayerCount={currentPlayerCount} onSubmit={onMultiplePlayersSubmit} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
