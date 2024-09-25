"use client";

import { useAlerts } from "@/app/(authenticated)/(hooks)/use-alerts";
import { MatchForm } from "@/app/(authenticated)/(components)/match-form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MatchSchema } from "@/schemas/match";
import { editMatchAction } from "@/server/actions/match";
import { ERROR_MESSAGES } from "@/utils/error-messages";
import { Match } from "@prisma/client";
import { FC } from "react";

type EditMatchProps = {
  match: Match;
  onClose: () => void;
};

export const EditMatch: FC<EditMatchProps> = ({ match, onClose }) => {
  const { errorAlert } = useAlerts();

  const onMatchSubmit: (values: MatchSchema) => Promise<void> = (values) => {
    return new Promise(async (resolve, reject) => {
      try {
        await editMatchAction(match.id, values, "/dashboard");

        onClose();

        resolve();
      } catch (error) {
        if (error instanceof Error) {
          errorAlert({
            title: error.message || ERROR_MESSAGES.match_edit_error,
          });
        }

        reject(error);
      }
    });
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
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
