"use client";

import { SoccerBall } from "@/components/soccer-ball";
import { Button } from "@/components/ui/button";
import { type FC } from "react";

type ExportTeamsProps = {
  disabled: boolean;
  processing: boolean;
  onExport: () => void;
};

export const ExportTeams: FC<ExportTeamsProps> = ({
  disabled,
  processing,
  onExport,
}) => (
  <Button onClick={onExport} disabled={disabled} variant="outline">
    {processing ? (
      <SoccerBall className="animate-spin h-4 [margin-inline-end:0.5rem] opacity-50 w-4" />
    ) : null}
    {processing ? "Exportando..." : "Exportar"}
  </Button>
);
