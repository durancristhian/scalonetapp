import { ConfirmTeamsUpdate } from "@/app/(authenticated)/partidos/[match-id]/(components)/confirm-teams-update";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import clsx from "clsx";
import { FC, useEffect, useState } from "react";

type Preset = "random" | "balanced";

type BuildTeamsProps = {
  disableBalanceTeams: boolean;
  onSave: (preset: Preset) => void;
  showConfirmation: boolean;
};

export const BuildTeams: FC<BuildTeamsProps> = ({
  disableBalanceTeams,
  onSave,
  showConfirmation,
}) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [preset, setPreset] = useState<Preset>("random");

  useEffect(() => {
    if (disableBalanceTeams && preset === "balanced") {
      setPreset("random");
    }
  }, [disableBalanceTeams, preset]);

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Armar equipos</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Armar equipos</DialogTitle>
          <div className="hidden">
            <DialogDescription />
          </div>
        </DialogHeader>
        <div className="space-y-4">
          <RadioGroup
            value={preset}
            onValueChange={(nextPreset: Preset) => {
              setPreset(nextPreset);
            }}
            className="space-y-2"
          >
            <div className="flex gap-2">
              <div className="flex-shrink-0 mt-[2px]">
                <RadioGroupItem value="random" id="random" />
              </div>
              <Label htmlFor="random">
                <p className="font-semibold text-base">Lo que toca, toca</p>
                <p className="font-normal text-sm">
                  Usa esta opción para separar a los jugadores al azar.
                </p>
              </Label>
            </div>
            <div className="flex gap-2">
              <div className="flex-shrink-0 mt-[2px]">
                <RadioGroupItem
                  value="balanced"
                  disabled={disableBalanceTeams}
                  id="balanced"
                />
              </div>
              <Label htmlFor="balanced">
                <p
                  className={clsx(
                    "font-semibold text-base",
                    disableBalanceTeams && "text-muted-foreground"
                  )}
                >
                  Balancear los equipos
                </p>
                <p
                  className={clsx(
                    "font-normal text-sm",
                    disableBalanceTeams && "text-muted-foreground"
                  )}
                >
                  {disableBalanceTeams
                    ? `Esta opción está deshabilitada porque todos tus jugadores tienen el nivel asignado por defecto (${process.env.NEXT_PUBLIC_DEFAULT_PLAYER_LEVEL}), dejando sin efecto su uso.`
                    : "Haremos los equipos lo más parejo posible teniendo en cuenta la posición y el nivel de los jugadores."}
                </p>
              </Label>
            </div>
          </RadioGroup>
        </div>
        <DialogFooter>
          <ConfirmTeamsUpdate
            disabled={!preset}
            onSave={() => {
              if (!preset) {
                return;
              }

              onSave(preset);

              setDialogOpen(false);
            }}
            showConfirmation={showConfirmation}
          />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
