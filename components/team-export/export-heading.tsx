import type { Team } from "@/types/team";
import styles from "./export-heading.module.css";

type Props = { name: string; teams: Team[]; headingId: string };

export function ExportHeading({ name, teams, headingId }: Props) {
  return (
    <header className={styles.heading} data-export-heading>
      <div className={styles.matchHeading}>
        <h1 className={styles.matchTitle} data-export-match-title>
          {name}
        </h1>
      </div>
      <div className={styles.teamTitles}>
        {teams.map((team) => (
          <div key={team.id} className={styles.teamTitleSlot}>
            <h2
              id={`${headingId}-${team.id}`}
              className={styles.teamTitle}
              data-export-team-title
            >
              {team.name.trim()}
            </h2>
          </div>
        ))}
      </div>
    </header>
  );
}
