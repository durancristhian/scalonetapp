"use client";

import { MatchForm } from "@/app/dashboard/(components)/match-form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { MatchSchema } from "@/schemas/match";
import { editMatch } from "@/server/actions/match";
import { Match } from "@prisma/client";
import { BugIcon, PencilIcon } from "lucide-react";
import { FC, useState } from "react";
import { toast } from "sonner";

type EditMatchProps = {
  match: Match;
};

export const EditMatch: FC<EditMatchProps> = ({ match }) => {
  const [dialogOpen, setDialogOpen] = useState(false);

  const onMatchSubmit: (values: MatchSchema) => Promise<void> = (values) => {
    return new Promise(async (resolve, reject) => {
      try {
        await editMatch(match.id, values, "/dashboard");

        setDialogOpen(false);

        resolve();
      } catch (error) {
        console.error(error);

        toast("Ha ocurrido un error.", {
          description:
            "No pudimos actualizar el partido. ¿Podrías volver a intentarlo?.",
          icon: <BugIcon className="h-4 opacity-50 w-4" />,
        });

        reject(error);
      }
    });
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <PencilIcon className="h-4 text-slate-500 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Editar partido</DialogTitle>
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
