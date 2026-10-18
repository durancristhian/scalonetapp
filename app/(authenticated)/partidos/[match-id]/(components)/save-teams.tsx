"use client";

import { SoccerBall } from "@/components/soccer-ball";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { InfoIcon } from "lucide-react";
import { type FC, useState } from "react";

type SaveTeamsProps = {
  disabled: boolean;
  invalid: boolean;
  processing: boolean;
  onSave: () => void;
};

export const SaveTeams: FC<SaveTeamsProps> = ({
  disabled,
  invalid,
  processing,
  onSave,
}) => (
  <div className="inline-flex gap-2">
    <Button onClick={onSave} disabled={disabled} variant="outline">
      {processing ? (
        <SoccerBall className="animate-spin h-4 [margin-inline-end:0.5rem] opacity-50 w-4" />
      ) : null}
      {processing ? "Guardando..." : "Guardar"}
    </Button>
    {invalid ? <DisabledContent /> : null}
  </div>
);

const DisabledContent = () => {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <>
      <Button
        onClick={() => {
          setDialogOpen(true);
        }}
        variant="ghost"
        size="icon"
      >
        <InfoIcon className="h-4 text-destructive w-4" />
        <span className="sr-only">Requisitos para guardar o exportar</span>
      </Button>
      <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              No se cumple alguno de estos requisitos:
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <ul className="list-disc list-inside text-left">
                <li>Los nombres de los equipos deben tener entre 1 y 40 caracteres.</li>
                <li>No puedes tener jugadores sin equipo.</li>
              </ul>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction>Entendido</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
