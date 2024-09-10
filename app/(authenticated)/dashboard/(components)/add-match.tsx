"use client";

import { useAlerts } from "@/app/(authenticated)/(hooks)/use-alerts";
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
import { FC } from "react";

export const AddMatch: FC = () => {
  const { errorAlert, successAlert } = useAlerts();

  const onMatchSubmit: (values: MatchSchema) => Promise<void> = (values) => {
    return new Promise(async (resolve, reject) => {
      try {
        await addMatch(values);

        successAlert({
          title: "¡Partido creado!",
          description:
            "Está todo listo para que el fútbol comience. ¡Adelante, entrenador!",
        });

        resolve();
      } catch (error) {
        console.error(error);

        errorAlert({
          title: "Error en la creación del partido",
          description: "Por favor, verifica la información y prueba otra vez.",
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
