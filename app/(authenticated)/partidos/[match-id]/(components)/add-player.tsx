"use client";

import { MultiplePlayersForm } from "@/app/(authenticated)/partidos/[match-id]/(components)/multiple-players-form";
import { PlayerForm } from "@/app/(authenticated)/partidos/[match-id]/(components)/player-form";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
import { PlayerSchema } from "@/schemas/player";
import { addMultiplePlayers, addPlayer } from "@/server/actions/player";
import { InfoIcon } from "lucide-react";
import { useParams } from "next/navigation";
import { FC, useState } from "react";

type AddPlayerProps = {
  disabled?: boolean;
};

export const AddPlayer: FC<AddPlayerProps> = ({ disabled }) => {
  if (disabled) {
    return <DisabledContent />;
  }

  return <EnabledContent />;
};

const DisabledContent = () => {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <>
      <div className="inline-flex gap-2">
        <Button disabled>Agregar</Button>
        <Button
          onClick={() => {
            setDialogOpen(true);
          }}
          variant="ghost"
          size="icon"
        >
          <InfoIcon className="h-4 text-destructive w-4" />
        </Button>
      </div>
      <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              ¡No hay más espacio en el banco!
            </AlertDialogTitle>
            <AlertDialogDescription className="max-md:text-balance">
              ¡Has alcanzado el máximo de{" "}
              {process.env.NEXT_PUBLIC_MAX_PLAYERS_PER_MATCH} jugadores! Si
              necesitas añadir más estrellas, considera liberar espacio
              eliminando un jugador existente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction>Ok, entendido</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

const EnabledContent: FC = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const params = useParams();
  const matchId = Number(params["match-id"]);

  const onPlayerSubmit: (values: PlayerSchema) => Promise<void> = (values) => {
    return addPlayer(matchId, values);
  };

  const onMultiplePlayersSubmit: (values: PlayerSchema[]) => Promise<void> = (
    values
  ) => {
    return addMultiplePlayers(matchId, values);
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button>Agregar</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>¡Convoca a los galácticos!</DialogTitle>
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
            <MultiplePlayersForm onSubmit={onMultiplePlayersSubmit} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
