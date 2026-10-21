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
import { TeamBillboard } from "./team-billboard";
import { MatchGrandstand } from "./match-grandstand";
import { useId } from "react";

export type TeamExportProps = {
  name: string;
  teams: Team[];
  options: ImageExportOptions;
  playerRoles?: ImageExportTeamSelections;
};

// A fixed canvas shared by the live preview and the server-side PNG renderer.
export function TeamExport({ name, teams, options, playerRoles = {} }: TeamExportProps) {
  const headingId = useId();
  const palette = getImageExportBackground(options.background)!.palette;
  const selections = reconcileImageExportTeamSelections(teams, playerRoles);
  const showImages = options.avatarShape !== "none";
  return (
    <div
      data-team-export
      className={`${styles.canvas} ${workSans.className}`}
      style={getImageExportBackgroundStyle(options.background)}
    >
      <MatchGrandstand name={name} background={options.background} weather={options.weather} />
      <div className={styles.outside} data-field-outside>
        <ExportBackground background={options.background} weather={options.weather} outside />
        <div className={styles.teams}>
          {teams.map(team => <TeamBillboard key={team.id} id={`${headingId}-${team.id}`} name={team.name.trim()} background={options.background} />)}
        </div>
      </div>
      <div className={styles.field}>
        <ExportBackground background={options.background} weather={options.weather} />
        <FieldDivider background={options.background} />
        <div className={styles.teams}>
          {teams.map((team) => (
            <section className={styles.team} key={team.id} aria-labelledby={`${headingId}-${team.id}`}>
              <div
                className={`${styles.players} ${showImages ? "" : styles.withoutImages} ${options.alignment === "center" ? styles.centered : ""}`}
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
