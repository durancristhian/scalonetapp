"use client";

import { MatchForm } from "@/app/(authenticated)/dashboard/(components)/match-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

        toast("Se ha creado tu partido.", {
          icon: <PartyPopperIcon className="h-4 opacity-50 w-4" />,
        });

        resolve();
      } catch (error) {
        console.error(error);

        toast("Ha ocurrido un error.", {
          description:
            "No pudimos crear el partido. ¿Podrías volver a intentarlo?.",
          icon: <BugIcon className="h-4 opacity-50 w-4" />,
        });

        reject(error);
      }
    });
  };

  return (
    <Card className="bg-slate-50">
      <CardHeader>
        <CardTitle>Crear un partido</CardTitle>
      </CardHeader>
      <CardContent>
        <MatchForm onSubmit={onMatchSubmit} />
      </CardContent>
    </Card>
  );
};
