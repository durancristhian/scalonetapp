"use client";

import {
  unwrapActionResult,
  getActionErrorMessage,
} from "@/utils/action-result";
import { useAlerts } from "@/app/(authenticated)/(hooks)/use-alerts";
import { ActionConfirmationDialog } from "@/components/action-confirmation-dialog";
import { deleteMatchAction } from "@/server/actions/match";
import { ERROR_MESSAGES } from "@/utils/error-messages";
import { type ComponentProps, type FC } from "react";

type DeleteMatchProps = {
  id: number;
  onClose: () => void;
  onCloseAutoFocus?: ComponentProps<
    typeof ActionConfirmationDialog
  >["onCloseAutoFocus"];
};

export const DeleteMatch: FC<DeleteMatchProps> = ({
  id,
  onClose,
  onCloseAutoFocus,
}) => {
  const { errorAlert, successAlert } = useAlerts();

  const onDeleteMatch = async () => {
    try {
      unwrapActionResult(await deleteMatchAction(id));
      successAlert({ title: "¡Partido eliminado!" });
      onClose();
    } catch (error) {
      if (error instanceof Error) {
        errorAlert({
          title: getActionErrorMessage(
            error,
            ERROR_MESSAGES.match_delete_error,
          ),
        });
      }
    }
  };

  return (
    <ActionConfirmationDialog
      title="¿Eliminar este partido?"
      description="Ten en cuenta que se eliminará toda su información asociada. Esta acción no tiene vuelta atrás."
      confirmLabel="Sí, eliminar"
      pendingLabel="Eliminando..."
      onConfirm={onDeleteMatch}
      onClose={onClose}
      onCloseAutoFocus={onCloseAutoFocus}
    />
  );
};
