import type { Team } from "@/types/team";
import styles from "./export-heading.module.css";

type Props = {
  name: string;
  teams: Team[];
  headingId: string;
  headingLevel: 1 | 3;
};

export function ExportHeading({ name, teams, headingId, headingLevel }: Props) {
  const [MatchTitle, TeamTitle] =
    headingLevel === 1 ? (["h1", "h2"] as const) : (["h3", "h4"] as const);
  return (
    <header className={styles.heading} data-export-heading>
      <div className={styles.matchHeading}>
        <MatchTitle className={styles.matchTitle} data-export-match-title>
          {name}
        </MatchTitle>
      </div>
      <div className={styles.teamTitles}>
        {teams.map((team) => (
          <div key={team.id} className={styles.teamTitleSlot}>
            <TeamTitle
              id={`${headingId}-${team.id}`}
              className={styles.teamTitle}
              data-export-team-title
            >
              {team.name.trim()}
            </TeamTitle>
          </div>
        ))}
      </div>
    </header>
  );
}
