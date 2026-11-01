"use client";

import {
  unwrapActionResult,
  getActionErrorMessage,
} from "@/utils/action-result";
import { useAlerts } from "@/app/(authenticated)/(hooks)/use-alerts";
import { ActionConfirmationDialog } from "@/components/action-confirmation-dialog";
import { deletePlayerAction } from "@/server/actions/player";
import { ERROR_MESSAGES } from "@/utils/error-messages";
import { type ComponentProps, type FC } from "react";

type DeletePlayerProps = {
  id: number;
  onClose: () => void;
  onCloseAutoFocus?: ComponentProps<
    typeof ActionConfirmationDialog
  >["onCloseAutoFocus"];
};

export const DeletePlayer: FC<DeletePlayerProps> = ({
  id,
  onClose,
  onCloseAutoFocus,
}) => {
  const { errorAlert } = useAlerts();

  const onDeletePlayer = async () => {
    try {
      unwrapActionResult(await deletePlayerAction(id));

      onClose();
    } catch (error) {
      if (error instanceof Error) {
        errorAlert({
          title: getActionErrorMessage(
            error,
            ERROR_MESSAGES.player_delete_error,
          ),
        });
      }
    }
  };

  return (
    <ActionConfirmationDialog
      title="¿Eliminar este jugador?"
      description="Ten en cuenta que se eliminará toda su información asociada. Esta acción no tiene vuelta atrás."
      confirmLabel="Sí, eliminar"
      pendingLabel="Eliminando..."
      onConfirm={onDeletePlayer}
      onClose={onClose}
      onCloseAutoFocus={onCloseAutoFocus}
    />
  );
};
