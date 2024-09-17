"use client";

import { useAlerts } from "@/app/(authenticated)/(hooks)/use-alerts";
import { SoccerBall } from "@/components/soccer-ball";
import { Button } from "@/components/ui/button";
import { ERROR_MESSAGES } from "@/utils/error-messages";
import { FC, useState } from "react";

type ExportTeamsProps = {
  matchId: number;
};

export const ExportTeams: FC<ExportTeamsProps> = ({ matchId }) => {
  const { errorAlert, successAlert } = useAlerts();
  const [processing, setIsProcessing] = useState(false);

  const exportTeams = () => {
    setIsProcessing(true);

    /* TODO: This should be a util fn */
    fetch(`/download/${matchId}`)
      .then((response) => response.blob())
      .then((blob) => {
        const url = window.URL.createObjectURL(new Blob([blob]));

        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", "equipos.png");

        document.body.appendChild(link);

        link.click();

        window.URL.revokeObjectURL(url);

        setIsProcessing(false);

        successAlert({
          title: "¡Equipos descargados!",
        });
      })
      .catch((error) => {
        setIsProcessing(false);

        if (error instanceof Error) {
          errorAlert({
            title: error.message || ERROR_MESSAGES.export_failed,
          });
        }
      });
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
