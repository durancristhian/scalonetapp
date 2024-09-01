"use client";

import { MatchForm } from "@/app/dashboard/(components)/match-form";
import { MatchList } from "@/app/dashboard/(components)/match-list";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MatchSchema } from "@/schemas/match";
import { addMatch } from "@/server/actions/match";
import { PartyPopper } from "lucide-react";
import { FC } from "react";
import { toast } from "sonner";

const Page: FC = () => {
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
    <div className="py-4 md:py-8">
      <div className="max-w-7xl mx-auto px-4 w-full">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-1">
            <Card className="bg-slate-50">
              <CardHeader>
                <CardTitle>Nuevo partido</CardTitle>
              </CardHeader>
              <CardContent>
                <MatchForm onSubmit={onMatchSubmit} />
              </CardContent>
            </Card>
          </div>
          <div className="md:col-span-2">
            <div className="grid gap-4">
              <CardTitle>Tus partidos</CardTitle>
              <MatchList />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
