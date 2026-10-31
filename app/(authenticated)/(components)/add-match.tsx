"use client";

import {
  unwrapActionResult,
  getActionErrorMessage,
} from "@/utils/action-result";

import { trackAnalytics } from "@/utils/analytics";
import { useAlerts } from "@/app/(authenticated)/(hooks)/use-alerts";
import { MatchForm } from "@/app/(authenticated)/(components)/match-form";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { type MatchSchema } from "@/schemas/match";
import { addMatchAction } from "@/server/actions/match";
import { ERROR_MESSAGES } from "@/utils/error-messages";
import { InfoIcon } from "lucide-react";
import { type FC, useState } from "react";

type AddMatchProps = {
  disabled?: boolean;
};

export const AddMatch: FC<AddMatchProps> = ({ disabled }) => {
  if (disabled) {
    return <Button disabled>Agregar</Button>;
  }

  return <EnabledContent />;
};

export const MatchLimitAlert = () => (
  <Alert>
    <InfoIcon aria-hidden="true" />
    <AlertTitle>¡Alto ahí, entrenador! ¡Llegaste al límite!</AlertTitle>
    <AlertDescription>
      Ya tienes {process.env.NEXT_PUBLIC_MAX_MATCHES_PER_USER} partidos creados.
      Te sugerimos eliminar alguno para darle lugar a nuevas glorias
      futbolísticas!
    </AlertDescription>
  </Alert>
);

const EnabledContent: FC = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { successAlert, errorAlert } = useAlerts();

  const onMatchSubmit: (values: MatchSchema) => Promise<void> = async (
    values,
  ) => {
    return new Promise(async (resolve, reject) => {
      try {
        unwrapActionResult(await addMatchAction(values));
        trackAnalytics("match_created");

        successAlert({
          title: "¡Partido creado!",
        });

        setDialogOpen(false);

        resolve();
      } catch (error) {
        if (error instanceof Error) {
          errorAlert({
            title: getActionErrorMessage(error, ERROR_MESSAGES.match_add_error),
          });
        }

        reject(error);
      }
    });
  };

  return (
    <Dialog
      open={dialogOpen}
      onOpenChange={(open) => {
        setDialogOpen(open);
        if (open) trackAnalytics("match_create_opened");
      }}
    >
      <DialogTrigger asChild>
        <Button>Agregar</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>El primer paso hacia la gloria</DialogTitle>
          <DialogDescription className="max-md:text-balance">
            Todo DT necesita de un partido para demostrar su habilidad. Empieza
            por crear uno.
          </DialogDescription>
        </DialogHeader>
        <MatchForm onSubmit={onMatchSubmit} />
      </DialogContent>
    </Dialog>
  );
};
