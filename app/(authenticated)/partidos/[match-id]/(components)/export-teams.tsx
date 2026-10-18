"use client";

import { SoccerBall } from "@/components/soccer-ball";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { type FC, useId, useState } from "react";

type ExportTeamsProps = {
  disabled: boolean;
  processing: boolean;
  onExport: () => void;
};

export const ExportTeams: FC<ExportTeamsProps> = ({
  disabled,
  processing,
  onExport,
}) => {
  const [open, setOpen] = useState(false);
  const classicId = useId();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button disabled={disabled} variant="outline">
          {processing ? (
            <SoccerBall className="animate-spin h-4 me-2 opacity-50 w-4" />
          ) : null}
          {processing ? "Exportando..." : "Exportar"}
        </Button>
      </DialogTrigger>
      <DialogContent
        closeLabel="Cerrar"
        className="w-[calc(100%-2rem)] max-w-sm max-h-[calc(100dvh-2rem)] overflow-y-auto rounded-lg"
      >
        <DialogHeader className="pe-6 text-start">
          <DialogTitle>Exportar imagen</DialogTitle>
          <DialogDescription>Elegí el estilo de la imagen.</DialogDescription>
        </DialogHeader>
        <RadioGroup defaultValue="classic" aria-label="Estilo de la imagen">
          <Label
            htmlFor={classicId}
            className="flex cursor-pointer items-center gap-3 rounded-lg border border-primary bg-muted/50 p-4 text-base active:bg-muted has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-ring"
          >
            <RadioGroupItem id={classicId} value="classic" />
            Clásico
          </Label>
        </RadioGroup>
        <DialogFooter className="flex-row gap-2 sm:space-x-0">
          <DialogClose asChild>
            <Button type="button" variant="outline" className="min-h-11 flex-1 active:bg-muted">
              Cancelar
            </Button>
          </DialogClose>
          <Button
            type="button"
            disabled={disabled}
            className="min-h-11 flex-1 active:opacity-80"
            onClick={() => {
              if (disabled) return;
              setOpen(false);
              onExport();
            }}
          >
            Exportar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
