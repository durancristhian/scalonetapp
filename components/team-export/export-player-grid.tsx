import { byName } from "@/utils/by-name";
import type { Team } from "@/types/team";
import type { ImageExportOptions } from "@/utils/image-export-options";
import { getImageExportBackground } from "@/utils/image-export-background";
import { getImageExportPlayerRoles, type ImageExportTeamSelections } from "@/utils/image-export-player-roles";
import { ExportPlayerCell } from "./export-player-cell";
import styles from "./export-player-grid.module.css";

type Props = { teams: Team[]; options: ImageExportOptions; selections: ImageExportTeamSelections; headingId: string };

export function ExportPlayerGrid({ teams, options, selections, headingId }: Props) {
  const palette = getImageExportBackground(options.background)!.palette;
  return (
    <div className={styles.teams} data-export-player-grid>
      {teams.map(team => (
        <section key={team.id} className={styles.roster} aria-labelledby={`${headingId}-${team.id}`} data-export-team={team.id}>
          {[...team.players].sort(byName).map(player => (
            <ExportPlayerCell key={player.id} player={player} options={options} palette={palette} roles={getImageExportPlayerRoles(selections[team.id], player.id)} />
          ))}
        </section>
      ))}
    </div>
  );
}
