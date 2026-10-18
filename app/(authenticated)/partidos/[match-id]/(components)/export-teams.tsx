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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Image from "next/image";
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
  const [selectedStyle, setSelectedStyle] = useState<ImageExportStyle>(DEFAULT_IMAGE_EXPORT_STYLE);
  const style = IMAGE_EXPORT_STYLES.find((option) => option.id === selectedStyle) ?? IMAGE_EXPORT_STYLES[0];
  const selectStyle = (value: string) => {
    if (isImageExportStyle(value)) setSelectedStyle(value);
  };

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => {
      if (nextOpen) setSelectedStyle(DEFAULT_IMAGE_EXPORT_STYLE);
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
        className="w-[calc(100%-2rem)] max-w-4xl max-h-[calc(100dvh-2rem)] overflow-y-auto rounded-lg"
      >
        <DialogHeader className="pe-6 text-start">
          <DialogTitle>Exportar imagen</DialogTitle>
          <DialogDescription>Elegí el estilo de la imagen.</DialogDescription>
        </DialogHeader>
        <div className="grid min-w-0 gap-4 md:grid-cols-[10rem_minmax(0,1fr)] md:gap-6">
          <div className="md:hidden">
            <Select value={selectedStyle} onValueChange={selectStyle}>
              <SelectTrigger aria-label="Estilo de la imagen" className="min-h-11 text-base">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {IMAGE_EXPORT_STYLES.map((option) => (
                  <SelectItem key={option.id} value={option.id}>{option.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <RadioGroup
            value={selectedStyle}
            onValueChange={selectStyle}
            aria-label="Estilo de la imagen"
            className="hidden content-start md:grid"
          >
            {IMAGE_EXPORT_STYLES.map((option) => (
              <Label
                key={option.id}
                htmlFor={`${styleId}-${option.id}`}
                className="flex min-h-11 cursor-pointer items-center gap-3 rounded-lg border p-4 text-base active:bg-muted has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-muted/50 has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-ring"
              >
                <RadioGroupItem id={`${styleId}-${option.id}`} value={option.id} />
                {option.label}
              </Label>
            ))}
          </RadioGroup>
          <Image
            {...style.preview}
            alt={`Ejemplo del estilo ${style.label}: Fútbol con amigos, con Ana en el Equipo A y Nico en el Equipo B.`}
            sizes="(max-width: 767px) calc(100vw - 82px), (max-width: 895px) calc(100vw - 266px), 662px"
            className="h-auto w-full min-w-0 rounded-lg border"
          />
        </div>
        <DialogFooter className="flex-row gap-2 sm:space-x-0">
          <DialogClose asChild>
            <Button type="button" variant="outline" className="min-h-11 flex-1 md:flex-none active:bg-muted">
              Cancelar
            </Button>
          </DialogClose>
          <Button
            type="button"
            disabled={disabled}
            className="min-h-11 flex-1 md:flex-none active:opacity-80"
            onClick={() => {
              if (disabled) return;
              setOpen(false);
              onExport(selectedStyle);
            }}
          >
            Exportar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
