"use client";

import { MatchForm } from "@/app/(authenticated)/dashboard/(components)/match-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MatchSchema } from "@/schemas/match";
import { addMatch } from "@/server/actions/match";
import { BugIcon, PartyPopperIcon } from "lucide-react";
import { FC } from "react";
import { toast } from "sonner";

export const AddMatch: FC = () => {
  const onMatchSubmit: (values: MatchSchema) => Promise<void> = (values) => {
    return new Promise(async (resolve, reject) => {
      try {
        await addMatch(values);

        toast("¡Partido creado!", {
          description:
            "Está todo listo para que el fútbol comience. ¡Adelante, entrenador!",
          icon: <PartyPopperIcon className="h-4 opacity-50 w-4" />,
        });

        resolve();
      } catch (error) {
        console.error(error);

        toast("Error en la creación del partido", {
          description: "Por favor, verifica la información y prueba otra vez.",
          icon: <BugIcon className="h-4 opacity-50 w-4" />,
        });

        reject(error);
      }
    });
  };

  return (
    <Card className="bg-slate-50">
      <CardHeader>
        <CardTitle>El primer paso hacia la gloria</CardTitle>
        <CardDescription>
          Antes de demostrar tu habilidad como DT, necesitas decirnos como se
          llama el partido.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <MatchForm onSubmit={onMatchSubmit} />
      </CardContent>
    </Card>
  );
};
