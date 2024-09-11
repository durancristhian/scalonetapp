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
        });

        resolve();
      } catch (error) {
        console.error(error);

        errorAlert({
          title: "Error en la creación del partido",
        });

        reject(error);
      }
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>El primer paso hacia la gloria</CardTitle>
        <CardDescription>
          Todo DT necesita de un partido para demostrar su habilidad. Empieza
          por crear uno.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <MatchForm onSubmit={onMatchSubmit} />
      </CardContent>
    </Card>
  );
};
