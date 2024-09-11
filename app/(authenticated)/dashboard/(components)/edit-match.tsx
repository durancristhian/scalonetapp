"use client";

import { useAlerts } from "@/app/(authenticated)/(hooks)/use-alerts";
import { MatchForm } from "@/app/(authenticated)/dashboard/(components)/match-form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MatchSchema } from "@/schemas/match";
import { editMatch } from "@/server/actions/match";
import { Match } from "@prisma/client";
import { FC } from "react";
import { ZodError } from "zod";

type EditMatchProps = {
  match: Match;
  onClose: () => void;
};

export const EditMatch: FC<EditMatchProps> = ({ match, onClose }) => {
  const { errorAlert } = useAlerts();

  const onMatchSubmit: (values: MatchSchema) => Promise<void> = (values) => {
    return new Promise(async (resolve, reject) => {
      try {
        await editMatch(match.id, values, "/dashboard");

        onClose();

        resolve();
      } catch (error) {
        console.error(error);

        if (error instanceof ZodError) {
          errorAlert({
            title: "Error en la edición del partido",
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
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>¿Listo para un cambio?</DialogTitle>
          <DialogDescription className="max-md:text-balance">
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
