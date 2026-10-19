"use client";

import { PlayerAvatar } from "@/components/player-avatar";
import { type Team } from "@/types/team";
import { byName } from "@/utils/by-name";
import { type ImageExportOptions } from "@/utils/image-export-options";
import { getArtworkStyle } from "@/utils/color-palettes";
import { getImageExportBackgroundUrl } from "@/utils/image-export-background";
import { exportFontClasses } from "./fonts";
import styles from "./team-export.module.css";

export type TeamExportProps = {
  name: string;
  teams: Team[];
  options: ImageExportOptions;
};

// A fixed canvas shared by the live preview and the server-side PNG renderer.
export function TeamExport({ name, teams, options }: TeamExportProps) {
  const backgroundUrl = getImageExportBackgroundUrl(options.background, options.palette);

  return (
    <div
      data-team-export
      className={`${styles.canvas} ${exportFontClasses[options.font]}`}
      style={{
        ...getArtworkStyle(options.palette),
        backgroundImage: `url("${backgroundUrl}")`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <h1 className={styles.title}>{name}</h1>
      <div className={styles.teams}>
        {teams.map((team) => (
          <section className={styles.team} key={team.id}>
            <h2 className={styles.teamName}>{team.name.trim()}</h2>
            <div
              className={styles.players}
              style={{
                gridTemplateColumns: `repeat(${options.columns}, minmax(0, 1fr))`,
              }}
            >
              {[...team.players].sort(byName).map((player) => (
                <div className={styles.player} key={player.id}>
                  <PlayerAvatar
                    name={player.name}
                    src={player.avatar}
                    size="xl"
                    shape={options.avatarShape}
                    palette={options.palette}
                  />
                  <p className={styles.playerName} title={player.name}>
                    {player.name}
                  </p>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
      <p className={styles.footer}>
        Hecho con <span>scalonet.app</span>
      </p>
    </div>
  );
}
