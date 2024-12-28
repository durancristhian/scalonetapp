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
import { type FC, useState } from "react";

type Preset = "random" | "balanced";

type BuildTeamsProps = {
  onSave: (preset: Preset) => void;
  showConfirmation: boolean;
  showPing: boolean;
};

export const BuildTeams: FC<BuildTeamsProps> = ({
  onSave,
  showConfirmation,
  showPing,
}) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [preset, setPreset] = useState<Preset>("random");

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="relative">
          Armar equipos
          {showPing ? (
            <span className="absolute flex h-3 -right-1.5 -top-1.5 w-3">
              <span className="absolute animate-ping bg-amber-400 h-full inline-flex opacity-75 rounded-full w-full" />
              <span className="bg-amber-500 h-3 inline-flex relative rounded-full w-3" />
            </span>
          ) : null}
        </Button>
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
                  Distribuir jugadores 100% al azar en los equipos.
                </p>
              </Label>
            </div>
            <div className="flex gap-2">
              <div className="flex-shrink-0 mt-[2px]">
                <RadioGroupItem value="balanced" id="balanced" />
              </div>
              <Label htmlFor="balanced">
                <p className="font-semibold text-base">
                  Balancear por posición y nivel
                </p>
                <p className="font-normal text-sm">
                  Haremos los equipos lo más parejo posible teniendo en cuenta
                  la posición y el nivel de los jugadores.
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
