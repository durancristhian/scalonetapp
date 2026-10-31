"use client";

import {
  unwrapActionResult,
  getActionErrorMessage,
} from "@/utils/action-result";

import { useAlerts } from "@/app/(authenticated)/(hooks)/use-alerts";
import { MatchForm } from "@/app/(authenticated)/(components)/match-form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { type MatchSchema } from "@/schemas/match";
import { editMatchAction } from "@/server/actions/match";
import { ERROR_MESSAGES } from "@/utils/error-messages";
import { type Match } from "@prisma/client";
import { type FC } from "react";

type EditMatchProps = {
  match: Match;
  onClose: () => void;
  onCloseAutoFocus?: (event: Event) => void;
};

export const EditMatch: FC<EditMatchProps> = ({
  match,
  onClose,
  onCloseAutoFocus,
}) => {
  const { errorAlert } = useAlerts();

  const onMatchSubmit: (values: MatchSchema) => Promise<void> = (values) => {
    return new Promise(async (resolve, reject) => {
      try {
        unwrapActionResult(
          await editMatchAction(match.id, values, "/dashboard"),
        );

        onClose();

        resolve();
      } catch (error) {
        if (error instanceof Error) {
          errorAlert({
            title: getActionErrorMessage(
              error,
              ERROR_MESSAGES.match_edit_error,
            ),
          });
        }

        reject(error);
      }
    });
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent
        className="sm:max-w-lg"
        onCloseAutoFocus={onCloseAutoFocus}
      >
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
