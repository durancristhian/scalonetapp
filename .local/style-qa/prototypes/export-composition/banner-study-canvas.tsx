// PROTOTYPE: two small banner treatments, keeping the approved signs and field.
"use client";

import { PlayerAvatar } from "@/components/player-avatar";
import { type Team } from "@/types/team";
import { byName } from "@/utils/by-name";
import { type ImageExportOptions } from "@/utils/image-export-options";
import {
  getImageExportBackground,
  getImageExportBackgroundStyle,
} from "@/utils/image-export-background";
import { ExportBackground } from "@/components/team-export/export-background";
import { FieldDivider } from "@/components/team-export/field-divider";
import { workSans } from "@/utils/fonts";
import { cn } from "@/utils/cn";
import {
  getImageExportPlayerRoles,
  reconcileImageExportTeamSelections,
  type ImageExportTeamSelections,
} from "@/utils/image-export-player-roles";
import { PlayerRoleBadges } from "@/components/team-export/player-role-badges";
import { TeamBillboard } from "@/components/team-export/team-billboard";
import { BannerStudyGrandstand } from "./banner-study-grandstand";
import { useId } from "react";

export type TeamExportProps = {
  name: string;
  teams: Team[];
  options: ImageExportOptions;
  playerRoles?: ImageExportTeamSelections;
};

// A fixed canvas shared by the live preview and the server-side PNG renderer.
export function BannerStudyExport({
  name,
  teams,
  options,
  playerRoles = {},
  treatment,
  hideTies = false,
}: TeamExportProps & { treatment: "fabric" | "ties"; hideTies?: boolean }) {
  const headingId = useId();
  const palette = getImageExportBackground(options.background)!.palette;
  const selections = reconcileImageExportTeamSelections(teams, playerRoles);
  const showImages = options.avatarShape !== "none";
  return (
    <div
      data-team-export
      className={cn(
        "relative isolate box-border flex w-[1280px] flex-col break-words bg-[var(--export-frame-color)] text-xl leading-7 text-white uppercase",
        workSans.className,
      )}
      style={getImageExportBackgroundStyle(options.background)}
    >
      <BannerStudyGrandstand
        treatment={treatment}
        hideTies={hideTies}
        name={name}
        background={options.background}
        weather={options.weather}
      />
      <div
        className="relative bg-[var(--export-surface-color)] px-8 [padding-block-start:theme(spacing.6)] [padding-block-end:theme(spacing.4)]"
        data-field-outside
      >
        <ExportBackground
          background={options.background}
          weather={options.weather}
          outside
        />
        <div className="relative grid grid-cols-2 gap-8">
          {teams.map((team) => (
            <TeamBillboard
              key={team.id}
              id={`${headingId}-${team.id}`}
              name={team.name.trim()}
              background={options.background}
            />
          ))}
        </div>
      </div>
      <div className="relative grid min-h-[calc(1280px/3)] content-center bg-[var(--export-surface-color)] p-8">
        <ExportBackground
          background={options.background}
          weather={options.weather}
        />
        <FieldDivider background={options.background} />
        <div className="relative grid grid-cols-2 gap-8">
          {teams.map((team) => (
            <section
              className="relative min-w-0"
              key={team.id}
              aria-labelledby={`${headingId}-${team.id}`}
            >
              <div
                className={cn(
                  "grid grid-cols-2 p-6",
                  showImages ? "gap-4" : "items-start gap-3",
                )}
              >
                {[...team.players].sort(byName).map((player) => {
                  const roles = getImageExportPlayerRoles(
                    selections[team.id],
                    player.id,
                  );
                  return (
                    <div
                      className={cn(
                        "flex min-w-0 flex-col gap-2",
                        showImages && "min-h-24",
                        options.alignment === "center"
                          ? "items-center text-center"
                          : "items-start text-start",
                      )}
                      key={player.id}
                      data-player-id={player.id}
                    >
                      {options.avatarShape !== "none" ? (
                        <div className="relative size-24">
                          <PlayerAvatar
                            name={player.name}
                            src={player.avatar}
                            size="xl"
                            shape={options.avatarShape}
                            palette={palette}
                            className={cn(
                              "border-black/60",
                              options.avatarShape === "square" && "rounded-xl",
                            )}
                          />
                          <PlayerRoleBadges
                            roles={roles}
                            placement="image"
                            shape={options.avatarShape}
                          />
                        </div>
                      ) : null}
                      <div className="flex w-fit min-w-0 max-w-full items-center gap-2 rounded-xl bg-[color-mix(in_oklch,var(--export-frame-color)_80%,transparent)] px-2 py-1 font-bold leading-tight text-white">
                        {!showImages ? (
                          <PlayerRoleBadges roles={roles} placement="inline" />
                        ) : null}
                        <p className="min-w-0 truncate" title={player.name}>
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
