import { PlayerAvatar } from "@/components/player-avatar";
import { type MatchWithPlayers } from "@/types/match";
import { type BaseTeam } from "@/types/team";
import { byName } from "@/utils/by-name";
import { type Player } from "@prisma/client";
import styles from "./deportivo-export.module.css";

export function DeportivoExport({ match }: { match: MatchWithPlayers }) {
  const teams: BaseTeam[] = JSON.parse(match.teams);

  return (
    <main className={styles.sheet}>
      <header className={styles.heading}>
        <p className={styles.eyebrow}>Los equipos</p>
        <h1>{match.name}</h1>
      </header>
      <div className={styles.teams}>
        {teams.map((team, index) => (
          <section key={team.id} className={styles.team}>
            <header className={styles.teamHeading}>
              <span className={styles.number}>{String(index + 1).padStart(2, "0")}</span>
              <h2>{team.name}</h2>
            </header>
            <ul className={styles.players}>
              {team.players
                .map((id) => match.players.find((player) => player.id === id))
                .filter((player): player is Player => Boolean(player))
                .sort(byName)
                .map((player) => (
                  <li key={player.id} className={styles.player}>
                    <PlayerAvatar src={player.avatar} name={player.name} size="xl" />
                    <span>{player.name}</span>
                  </li>
                ))}
            </ul>
          </section>
        ))}
      </div>
      <footer className={styles.footer}>Hecho con <span>scalonet.app</span></footer>
    </main>
  );
}
