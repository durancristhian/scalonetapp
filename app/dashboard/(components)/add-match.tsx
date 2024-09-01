"use client";

import { MatchForm } from "@/app/dashboard/(components)/match-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MatchSchema } from "@/schemas/match";
import { addMatch } from "@/server/actions/match";
import { PartyPopper } from "lucide-react";
import { FC } from "react";
import { toast } from "sonner";

export const AddMatch: FC = () => {
  const onMatchSubmit: (values: MatchSchema) => Promise<void> = (values) => {
    return new Promise(async (resolve, reject) => {
      try {
        await addMatch(values);

        toast("Se ha creado tu partido.", {
          icon: <PartyPopper className="h-4 opacity-50 w-4" />,
        });

        resolve();
      } catch (error) {
        reject(error);
      }
    });
  };

  return (
    <Card className="bg-slate-50">
      <CardHeader>
        <CardTitle>Nuevo partido</CardTitle>
      </CardHeader>
      <CardContent>
        <MatchForm onSubmit={onMatchSubmit} />
      </CardContent>
    </Card>
  );
};
