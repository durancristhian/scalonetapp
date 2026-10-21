"use client";

import { PlayerAvatar } from "@/components/player-avatar";
import { type Team } from "@/types/team";
import { byName } from "@/utils/by-name";
import { type ImageExportOptions } from "@/utils/image-export-options";
import { getImageExportBackground, getImageExportBackgroundStyle } from "@/utils/image-export-background";
import { ExportBackground } from "./export-background";
import { FieldDivider } from "./field-divider";
import { workSans } from "@/utils/fonts";
import styles from "./team-export.module.css";
import { getImageExportPlayerRoles, reconcileImageExportTeamSelections, type ImageExportTeamSelections } from "@/utils/image-export-player-roles";
import { PlayerRoleBadges } from "./player-role-badges";

export type TeamExportProps = {
  name: string;
  teams: Team[];
  options: ImageExportOptions;
  playerRoles?: ImageExportTeamSelections;
};

// A fixed canvas shared by the live preview and the server-side PNG renderer.
export function TeamExport({ name, teams, options, playerRoles = {} }: TeamExportProps) {
  const palette = getImageExportBackground(options.background)!.palette;
  const selections = reconcileImageExportTeamSelections(teams, playerRoles);
  const showImages = options.avatarShape !== "none";
  return (
    <div
      data-team-export
      className={`${styles.canvas} ${workSans.className}`}
      style={getImageExportBackgroundStyle(options.background)}
    >
      <h1 className={styles.title}>{name}</h1>
      <div className={styles.field}>
        <ExportBackground background={options.background} weather={options.weather} />
        <FieldDivider background={options.background} />
        <div className={styles.teams}>
          {teams.map((team) => (
            <section className={styles.team} key={team.id}>
              <h2 className={styles.teamName}>{team.name.trim()}</h2>
              <div
                className={`${styles.players} ${showImages ? "" : styles.withoutImages}`}
                style={{
                  gridTemplateColumns: `repeat(${options.columns}, minmax(0, 1fr))`,
                }}
              >
                {[...team.players].sort(byName).map((player) => {
                  const roles = getImageExportPlayerRoles(selections[team.id], player.id);
                  return (
                    <div className={styles.player} key={player.id} data-player-id={player.id}>
                      {options.avatarShape !== "none" ? (
                        <div className={styles.playerImage}>
                          <PlayerAvatar
                            name={player.name}
                            src={player.avatar}
                            size="xl"
                            shape={options.avatarShape}
                            palette={palette}
                          />
                          <PlayerRoleBadges roles={roles} placement="image" shape={options.avatarShape} />
                        </div>
                      ) : null}
                      <div className={styles.nameTag}>
                        {!showImages ? <PlayerRoleBadges roles={roles} placement="inline" /> : null}
                        <p className={styles.playerName} title={player.name}>
                          {player.name}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
