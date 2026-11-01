"use client";

import { trackAnalytics } from "@/utils/analytics";
import { useAlerts } from "@/app/(authenticated)/(hooks)/use-alerts";
import { ActionConfirmationDialog } from "@/components/action-confirmation-dialog";
import { duplicateMatchAction } from "@/server/actions/match";
import { ERROR_MESSAGES } from "@/utils/error-messages";
import { type ComponentProps, type FC } from "react";

const duplicateErrors = {
  unauthorized: ERROR_MESSAGES.unauthorized,
  not_found: ERROR_MESSAGES.not_found,
  match_limit: ERROR_MESSAGES.match_limit_reached,
  player_limit: ERROR_MESSAGES.match_duplicate_player_limit,
  unexpected: ERROR_MESSAGES.match_duplicate_error,
};

type DuplicateMatchProps = {
  id: number;
  onClose: () => void;
  onCloseAutoFocus?: ComponentProps<
    typeof ActionConfirmationDialog
  >["onCloseAutoFocus"];
};

export const DuplicateMatch: FC<DuplicateMatchProps> = ({
  id,
  onClose,
  onCloseAutoFocus,
}) => {
  const { errorAlert, successAlert } = useAlerts();

  const onDuplicateMatch: () => Promise<void> = async () => {
    try {
      const result = await duplicateMatchAction(id);
      if (!result.ok) {
        errorAlert({
          title:
            duplicateErrors[result.code] ||
            ERROR_MESSAGES.match_duplicate_error,
          description: result.reference
            ? `Referencia: ${result.reference}`
            : undefined,
        });
        return;
      }
      trackAnalytics("match_duplicated");
      successAlert({
        title: "¡Partido duplicado!",
      });
      onClose();
    } catch {
      errorAlert({ title: ERROR_MESSAGES.match_duplicate_error });
    }
  };

  return (
    <ActionConfirmationDialog
      title="¿Duplicar este partido?"
      description="Se creará un nuevo partido basado en el actual con un nombre modificado."
      confirmLabel="Sí, duplicar"
      pendingLabel="Duplicando..."
      onConfirm={onDuplicateMatch}
      onClose={onClose}
      onCloseAutoFocus={onCloseAutoFocus}
    />
  );
};
