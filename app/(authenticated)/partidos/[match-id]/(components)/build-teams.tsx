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
import { FC, useState } from "react";

type Preset = "random" | "balanced";

type BuildTeamsProps = {
  onSave: (preset: Preset) => void;
  showConfirmation: boolean;
};

export const BuildTeams: FC<BuildTeamsProps> = ({
  onSave,
  showConfirmation,
}) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [preset, setPreset] = useState<Preset | null>(null);

  return (
    <>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline">Armar equipos</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <div className="space-y-8">
              <DialogTitle>Armar equipos</DialogTitle>
              <RadioGroup
                defaultValue="random"
                onValueChange={(nextPreset: Preset) => {
                  setPreset(nextPreset);
                }}
                className="space-y-4"
              >
                <div className="flex gap-2">
                  <div className="flex-shrink-0 mt-[2px]">
                    <RadioGroupItem value="random" id="random" />
                  </div>
                  <Label htmlFor="random">
                    <p className="font-semibold">Equipos aleatorios</p>
                    <p className="text-sm">
                      Usa esta opción para separar a los jugadores al azar. ¡La
                      suerte está echada!
                    </p>
                  </Label>
                </div>
                <div className="flex gap-2">
                  <div className="flex-shrink-0 mt-[2px]">
                    <RadioGroupItem value="balanced" id="balanced" />
                  </div>
                  <Label htmlFor="balanced">
                    <p className="font-semibold">Equipos balanceados</p>
                    <p className="text-sm">
                      Haremos los equipos teniendo en cuenta el nivel de los
                      jugadores. ¡Prepárate para el desafío!
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
    </>
  );
};
