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
    <Button onClick={onSave} disabled={disabled}>
      {processing ? (
        <SoccerBall className="animate-spin h-4 mr-2 opacity-50 w-4" />
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
        <span className="sr-only">Información</span>
      </Button>
      <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              No se cumple alguno de estos requisitos:
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <ul className="list-disc list-inside text-left">
                <li>Los nombres de los equipos no pueden estar vacíos.</li>
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
