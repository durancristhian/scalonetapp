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
import { DEFAULT_IMAGE_EXPORT_STYLE, IMAGE_EXPORT_STYLES, isImageExportStyle, type ImageExportStyle } from "@/utils/image-export-style";
import { type FC, useId, useState } from "react";

type ExportTeamsProps = {
  disabled: boolean;
  processing: boolean;
  onExport: (style: ImageExportStyle) => void;
};

export const ExportTeams: FC<ExportTeamsProps> = ({
  disabled,
  processing,
  onExport,
}) => {
  const [open, setOpen] = useState(false);
  const styleId = useId();
  const [style, setStyle] = useState<ImageExportStyle>(DEFAULT_IMAGE_EXPORT_STYLE);

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => {
      if (nextOpen) setStyle(DEFAULT_IMAGE_EXPORT_STYLE);
      setOpen(nextOpen);
    }}>
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
        <RadioGroup
          value={style}
          onValueChange={(value) => { if (isImageExportStyle(value)) setStyle(value); }}
          aria-label="Estilo de la imagen"
        >
          {IMAGE_EXPORT_STYLES.map((option) => (
            <Label
              key={option.id}
              htmlFor={`${styleId}-${option.id}`}
              className="flex cursor-pointer items-center gap-3 rounded-lg border p-4 text-base active:bg-muted has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-muted/50 has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-ring"
            >
              <RadioGroupItem id={`${styleId}-${option.id}`} value={option.id} />
              {option.label}
            </Label>
          ))}
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
              onExport(style);
            }}
          >
            Exportar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
