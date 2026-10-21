"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { type Team } from "@/types/team";
import { type ImageExportOptions } from "@/utils/image-export-options";
import dynamic from "next/dynamic";
import { useState } from "react";
import { type ImageExportTeamSelections } from "@/utils/image-export-player-roles";

const ExportEditor = dynamic(() => import("./export-editor"));

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

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!processing) setOpen(nextOpen);
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
