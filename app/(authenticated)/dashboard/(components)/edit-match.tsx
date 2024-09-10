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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { MatchSchema } from "@/schemas/match";
import { editMatch } from "@/server/actions/match";
import { Match } from "@prisma/client";
import { PencilIcon } from "lucide-react";
import { FC, useState } from "react";
import { ZodError } from "zod";

type EditMatchProps = {
  match: Match;
};

export const EditMatch: FC<EditMatchProps> = ({ match }) => {
  const { errorAlert } = useAlerts();
  const [dialogOpen, setDialogOpen] = useState(false);

  const onMatchSubmit: (values: MatchSchema) => Promise<void> = (values) => {
    return new Promise(async (resolve, reject) => {
      try {
        await editMatch(match.id, values, "/dashboard");

        setDialogOpen(false);

        resolve();
      } catch (error) {
        console.error(error);

        if (error instanceof ZodError) {
          errorAlert({
            title: "Ups!, parece que algo anda mal",
            description: (
              <ul className="list-disc list-inside">
                {error.errors.map(({ message }, idx) => (
                  <li key={idx}>{message}</li>
                ))}
              </ul>
            ),
          });
        } else {
          errorAlert({
            title: "Error en la edición del partido",
            description:
              "Por favor, verifica la información y prueba otra vez.",
          });
        }

        reject(error);
      }
    });
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon">
                <PencilIcon className="h-4 text-slate-500 w-4" />
              </Button>
            </DialogTrigger>
          </TooltipTrigger>
          <TooltipContent>
            <p>Editar</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>¿Listo para un cambio?</DialogTitle>
          <DialogDescription>
            Tómate un momento para hacer este ajuste y optimizar tu gestión. ¡A
            Lionel no se le escapa una!
          </DialogDescription>
        </DialogHeader>
        <MatchForm
          onSubmit={onMatchSubmit}
          values={{
            name: match.name,
          }}
        />
      </DialogContent>
    </Dialog>
  );
};
