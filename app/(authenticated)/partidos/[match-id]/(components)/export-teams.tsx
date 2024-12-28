"use client";

import { useAlerts } from "@/app/(authenticated)/(hooks)/use-alerts";
import { SoccerBall } from "@/components/soccer-ball";
import { Button } from "@/components/ui/button";
import { downloadBlob } from "@/utils/download-blob";
import { ERROR_MESSAGES } from "@/utils/error-messages";
import { type FC, useState } from "react";

type ExportTeamsProps = {
  matchId: number;
};

export const ExportTeams: FC<ExportTeamsProps> = ({ matchId }) => {
  const { errorAlert, successAlert } = useAlerts();
  const [processing, setIsProcessing] = useState(false);

  const exportTeams = async () => {
    setIsProcessing(true);

    try {
      const blob = await fetch(`/download/${matchId}`).then((response) =>
        response.blob()
      );

      downloadBlob(blob, "equipos.png");

      setIsProcessing(false);

      successAlert({
        title: "¡Equipos descargados!",
      });
    } catch (error) {
      if (error instanceof Error) {
        errorAlert({
          title: error.message || ERROR_MESSAGES.export_failed,
        });
      }

      setIsProcessing(false);
    }
  };

  return (
    <Button onClick={exportTeams} disabled={processing} variant="outline">
      {processing ? (
        <SoccerBall className="animate-spin h-4 mr-2 opacity-50 w-4" />
      ) : null}
      {processing ? "Exportando..." : "Exportar"}
    </Button>
  );
};
