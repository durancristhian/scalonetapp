import { PlayerAvatar } from "@/components/player-avatar";
import type { Team } from "@/types/team";
import type { ColorPaletteId } from "@/utils/color-palettes";
import type { ImageExportOptions } from "@/utils/image-export-options";
import type { ImageExportPlayerRole } from "@/utils/image-export-player-roles";
import { PlayerRoleBadges } from "./player-role-badges";
import styles from "./export-player-cell.module.css";

type Props = {
  player: Team["players"][number];
  options: ImageExportOptions;
  palette: ColorPaletteId;
  roles: ImageExportPlayerRole[];
};

export function ExportPlayerCell({ player, options, palette, roles }: Props) {
  const showAvatar = options.avatarShape !== "none";
  return (
    <div
      className={styles.cell}
      data-player-id={player.id}
      data-export-player-cell
      data-alignment={options.alignment}
    >
      {options.avatarShape !== "none" ? (
        <div className={styles.portrait}>
          <PlayerAvatar
            name={player.name}
            src={player.avatar}
            size="xl"
            shape={options.avatarShape}
            palette={palette}
            className={styles.avatar}
          />
          <PlayerRoleBadges
            roles={roles}
            placement="image"
            shape={options.avatarShape}
          />
        </div>
      ) : null}
      <div className={styles.label} data-export-player-label>
        {!showAvatar ? (
          <PlayerRoleBadges roles={roles} placement="inline" />
        ) : null}
        <p className={styles.name} title={player.name} data-export-player-name>
          {player.name}
        </p>
      </div>
    </div>
  );
}
