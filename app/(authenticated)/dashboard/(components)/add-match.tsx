"use client";

import { useAlerts } from "@/app/(authenticated)/(hooks)/use-alerts";
import { MatchForm } from "@/app/(authenticated)/dashboard/(components)/match-form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { MatchSchema } from "@/schemas/match";
import { addMatch } from "@/server/actions/match";
import { FC, useState } from "react";

export const AddMatch: FC = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { errorAlert, successAlert } = useAlerts();

  const onMatchSubmit: (values: MatchSchema) => Promise<void> = (values) => {
    return new Promise(async (resolve, reject) => {
      try {
        await addMatch(values);

        successAlert({
          title: "¡Partido creado!",
        });

        setDialogOpen(false);

        resolve();
      } catch (error) {
        console.error(error);

        if (error instanceof Error) {
          errorAlert({
            title: "Error en la creación del partido",
            description: error.message,
          });
        }

        reject(error);
      }
    });
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button>Add match</Button>
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
