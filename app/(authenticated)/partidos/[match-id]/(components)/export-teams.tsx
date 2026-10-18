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
import { type FC, useId, useState } from "react";

const exportStyles = [
  { id: "classic", name: "Clásico", preview: { src: "/images/export-styles/classic.png", width: 2560, height: 830 } },
];

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
  const styleId = useId();
  const [selectedStyle, setSelectedStyle] = useState("classic");
  const style = exportStyles.find((option) => option.id === selectedStyle) ?? exportStyles[0];

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
        className="w-[calc(100%-2rem)] max-w-4xl max-h-[calc(100dvh-2rem)] overflow-y-auto rounded-lg"
      >
        <DialogHeader className="pe-6 text-start">
          <DialogTitle>Exportar imagen</DialogTitle>
          <DialogDescription className="sr-only">Elegí el estilo de la imagen.</DialogDescription>
        </DialogHeader>
        <div className="grid min-w-0 gap-4 md:grid-cols-[10rem_minmax(0,1fr)] md:gap-6">
          <div className="md:hidden">
            <Select value={selectedStyle} onValueChange={setSelectedStyle}>
              <SelectTrigger aria-label="Estilo de la imagen" className="min-h-11 text-base">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {exportStyles.map((option) => (
                  <SelectItem key={option.id} value={option.id}>{option.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <RadioGroup
            value={selectedStyle}
            onValueChange={setSelectedStyle}
            aria-label="Estilo de la imagen"
            className="hidden content-start md:grid"
          >
            {exportStyles.map((option) => (
              <Label
                key={option.id}
                htmlFor={`${styleId}-${option.id}`}
                className="flex min-h-11 cursor-pointer items-center gap-3 rounded-lg border p-4 text-base active:bg-muted has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-muted/50 has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-ring"
              >
                <RadioGroupItem id={`${styleId}-${option.id}`} value={option.id} />
                {option.name}
              </Label>
            ))}
          </RadioGroup>
          <Image
            {...style.preview}
            alt={`Ejemplo del estilo ${style.name}: Fútbol con amigos, con Ana en el Equipo A y Nico en el Equipo B.`}
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
