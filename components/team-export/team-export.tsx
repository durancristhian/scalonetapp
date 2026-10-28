"use client";

import { useId, type CSSProperties } from "react";
import type { Team } from "@/types/team";
import type { ImageExportOptions } from "@/utils/image-export-options";
import { getImageExportBackgroundStyle } from "@/utils/image-export-background";
import { reconcileImageExportTeamSelections, type ImageExportTeamSelections } from "@/utils/image-export-player-roles";
import { workSans } from "@/utils/fonts";
import { cn } from "@/utils/cn";
import { ExportHeading } from "./export-heading";
import { ExportPlayerGrid } from "./export-player-grid";
import { getExportLayout } from "./export-layout";
import { PitchScene } from "./pitch-scene";
import styles from "./team-export.module.css";

export type TeamExportProps = {
  name: string;
  teams: Team[];
  options: ImageExportOptions;
  playerRoles?: ImageExportTeamSelections;
};

// The editor preview and the PNG route both render this composition.
export function TeamExport({ name, teams, options, playerRoles = {} }: TeamExportProps) {
  const headingId = useId();
  const layout = getExportLayout(teams, options);
  const selections = reconcileImageExportTeamSelections(teams, playerRoles);
  const style = {
    ...getImageExportBackgroundStyle(options.background),
    "--export-width": `${layout.width}px`,
    "--export-stand-height": `${layout.standHeight}px`,
    "--export-team-inset": `${layout.teamInset}px`,
    "--export-column-gap": `${layout.columnGap}px`,
    "--export-field-inset": `${layout.fieldInset}px`,
    "--export-cell-height": `${layout.cellHeight}px`,
    "--export-row-count": layout.rows,
    "--export-field-height": `${layout.fieldHeight}px`,
    "--export-scene-height": `${layout.sceneHeight}px`,
  } as CSSProperties;

  return (
    <div data-team-export data-export-layout="stadium" data-background={options.background} className={cn(styles.canvas, workSans.className)} style={style}>
      <ExportHeading name={name} teams={teams} headingId={headingId} />
      <PitchScene options={options} layout={layout}>
        <ExportPlayerGrid teams={teams} options={options} selections={selections} headingId={headingId} />
      </PitchScene>
    </div>
  );
}
