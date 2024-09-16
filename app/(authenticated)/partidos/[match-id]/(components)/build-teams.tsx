import { ConfirmTeamsUpdate } from "@/app/(authenticated)/partidos/[match-id]/(components)/confirm-teams-update";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@radix-ui/react-label";
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
          <div className="space-y-4">
            <DialogTitle>Armar equipos</DialogTitle>
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
                  <p className="font-semibold">Equipos aleatorios</p>
                  <p className="text-sm">
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
                      "font-semibold",
                      disableBalanceTeams && "text-muted-foreground"
                    )}
                  >
                    Equipos balanceados
                  </p>
                  <p
                    className={clsx(
                      "text-sm",
                      disableBalanceTeams && "text-muted-foreground"
                    )}
                  >
                    {disableBalanceTeams
                      ? `Esta opción está deshabilitada porque todos tus jugadores tienen el nivel asignado por defecto (${process.env.NEXT_PUBLIC_DEFAULT_PLAYER_LEVEL}), dejando sin efecto su uso.`
                      : "Haremos los equipos teniendo en cuenta el nivel de los jugadores."}
                  </p>
                </Label>
              </div>
            </RadioGroup>
            <div className="text-right">
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
            </div>
          </div>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};
