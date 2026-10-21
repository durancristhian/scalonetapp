import { IMAGE_EXPORT_PLAYER_ROLES, type ImageExportPlayerRole } from "@/utils/image-export-player-roles";
import styles from "./player-role-badges.module.css";

function GoalkeeperGlove() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path fill="currentColor" d="M8.2 19.5c-.8-2-1.5-2.8-2.8-4.3l-2-2.5a1.5 1.5 0 0 1 2.2-2l1.8 1.8V5.8a1.25 1.25 0 0 1 2.5 0v4.7h.6V3.7a1.25 1.25 0 0 1 2.5 0v6.8h.6V4.4a1.25 1.25 0 0 1 2.5 0v6.1h.6V6.4a1.25 1.25 0 0 1 2.5 0v7.1c0 2.2-.5 4.1-1.5 6H8.2Z" />
      <path fill="currentColor" d="M8.1 20.3h9.7v2.2H8.1z" />
      <path d="M10 15h6M10 17h6" fill="none" stroke="var(--export-frame-color)" strokeWidth=".9" strokeLinecap="round" />
    </svg>
  );
}

function CaptainMark() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M17 7.5a6.5 6.5 0 1 0 0 9" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" />
    </svg>
  );
}

// Keep role content independent of placement. More roles can share these slots
// without adding badges inside the avatar's clipping box.
const roleIcons = { goalkeeper: GoalkeeperGlove, captain: CaptainMark };

type Props = {
  roles: ImageExportPlayerRole[];
  placement: "image" | "inline";
  shape?: "circle" | "square";
};

export function PlayerRoleBadges({ roles, placement, shape }: Props) {
  if (!roles.length) return null;
  return (
    <span className={`${styles.badges} ${styles[placement]} ${shape === "circle" ? styles.circle : ""}`}>
      {roles.map((role) => {
        const Icon = roleIcons[role];
        const label = IMAGE_EXPORT_PLAYER_ROLES.find(({ id }) => id === role)!.label;
        return (
          <span key={role} className={styles.badge} role="img" aria-label={label} title={label} data-player-role={role}>
            <Icon />
          </span>
        );
      })}
    </span>
  );
}
