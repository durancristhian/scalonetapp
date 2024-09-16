import { ConfirmTeamsUpdate } from "@/app/(authenticated)/partidos/[match-id]/(components)/confirm-teams-update";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import clsx from "clsx";
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
            <div className="grid gap-4">
              <DialogTitle>Armar equipos</DialogTitle>
              <Card
                className={clsx(
                  "cursor-pointer hover:bg-accent",
                  preset === "random" ? "bg-accent" : undefined
                )}
                onClick={() => {
                  setPreset(preset === "random" ? null : "random");
                }}
              >
                <CardHeader>
                  <CardTitle>Equipos aleatorios</CardTitle>
                  <CardDescription>
                    Usa esta opción para separar a los jugadores al azar. ¡La
                    suerte está echada!
                  </CardDescription>
                </CardHeader>
              </Card>
              <Card
                className={clsx(
                  "cursor-pointer hover:bg-accent",
                  preset === "balanced" ? "bg-accent" : undefined
                )}
                onClick={() => {
                  setPreset(preset === "balanced" ? null : "balanced");
                }}
              >
                <CardHeader>
                  {/* TODO: make sure this is enabled only when at leaast 1 player has different level from the default player level */}
                  <CardTitle>Equipos balanceados</CardTitle>
                  <CardDescription>
                    Haremos los equipos teniendo en cuenta el nivel de los
                    jugadores. ¡Prepárate para el desafío!
                  </CardDescription>
                </CardHeader>
              </Card>
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
