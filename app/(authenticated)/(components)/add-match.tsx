"use client";

import { useAlerts } from "@/app/(authenticated)/(hooks)/use-alerts";
import { MatchForm } from "@/app/(authenticated)/(components)/match-form";
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
import { type MatchSchema } from "@/schemas/match";
import { addMatchAction } from "@/server/actions/match";
import { ERROR_MESSAGES } from "@/utils/error-messages";
import { InfoIcon } from "lucide-react";
import { type FC, useState } from "react";

type AddMatchProps = {
  disabled?: boolean;
};

export const AddMatch: FC<AddMatchProps> = ({ disabled }) => {
  if (disabled) {
    return <DisabledContent />;
  }

  return <EnabledContent />;
};

const DisabledContent = () => {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <>
      <div className="inline-flex space-x-2">
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
              ¡Alto ahí, entrenador! ¡Llegaste al límite!
            </AlertDialogTitle>
            <AlertDialogDescription className="max-md:text-balance">
              Ya tienes {process.env.NEXT_PUBLIC_MAX_MATCHES_PER_USER} partidos
              creados. Te sugerimos eliminar alguno para darle lugar a nuevas
              glorias futbolísticas!
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction>Entendido</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

const EnabledContent: FC = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { successAlert, errorAlert } = useAlerts();

  const onMatchSubmit: (values: MatchSchema) => Promise<void> = async (
    values
  ) => {
    return new Promise(async (resolve, reject) => {
      try {
        await addMatchAction(values);

        successAlert({
          title: "¡Partido creado!",
        });

        setDialogOpen(false);

        resolve();
      } catch (error) {
        if (error instanceof Error) {
          errorAlert({
            title: error.message || ERROR_MESSAGES.match_add_error,
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
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>El primer paso hacia la gloria</DialogTitle>
          <DialogDescription className="max-md:text-balance">
            Todo DT necesita de un partido para demostrar su habilidad. Empieza
            por crear uno.
          </DialogDescription>
        </DialogHeader>
        <MatchForm onSubmit={onMatchSubmit} />
      </DialogContent>
    </Dialog>
  );
};
