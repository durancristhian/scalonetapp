"use client";

import { trackAnalytics } from "@/utils/analytics";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { type Team } from "@/types/team";
import { type ImageExportOptions } from "@/utils/image-export-options";
import dynamic from "next/dynamic";
import { loadModule } from "@/utils/load-module";
import { useState } from "react";
import { type ImageExportTeamSelections } from "@/utils/image-export-player-roles";
import { getTeamCountError } from "@/utils/team-count";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const ExportEditor = dynamic(() => loadModule(() => import("./export-editor")));

type ExportTeamsProps = {
  matchId: number;
  disabled: boolean;
  processing: boolean;
  name: string;
  teams: Team[];
  onExport: (options: ImageExportOptions, selections: ImageExportTeamSelections) => Promise<string | null>;
};

export function ExportTeams({
  matchId,
  disabled,
  processing,
  name,
  teams,
  onExport,
}: ExportTeamsProps) {
  const [open, setOpen] = useState(false);
  const teamCountError = getTeamCountError(teams.length);

  if (teamCountError) {
    return (
      <TooltipProvider delayDuration={200}>
        <Tooltip>
          <TooltipTrigger asChild>
            <span tabIndex={0} aria-label="Exportación no disponible" className="inline-flex rounded-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring">
              <Button disabled variant="outline">Exportar</Button>
            </span>
          </TooltipTrigger>
          <TooltipContent className="max-w-[min(18rem,calc(100vw-2rem))]">{teamCountError}</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!processing) {
          setOpen(nextOpen);
          if (nextOpen) trackAnalytics("export_opened");
        }
      }}
    >
      <DialogTrigger asChild>
        <Button disabled={disabled} variant="outline">
          Exportar
        </Button>
      </DialogTrigger>
      {open ? (
        <ExportEditor
          matchId={matchId}
          name={name}
          teams={teams}
          processing={processing}
          disabled={disabled}
          onExport={onExport}
        />
      ) : null}
    </Dialog>
  );
}
