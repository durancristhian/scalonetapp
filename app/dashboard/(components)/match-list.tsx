import { MatchItem } from "@/app/dashboard/(components)/match-item";
import { getMatches } from "@/server/queries/match";

export const MatchList = async () => {
  const matches = await getMatches();

  if (!Array.isArray(matches) || !matches.length) {
    return <p>A medida que crees partidos van a aparecer listados acá.</p>;
  }

  return (
    <div className="grid gap-4">
      {matches.map((match, idx) => (
        <MatchItem key={match.id} listIndex={idx} match={match} />
      ))}
    </div>
  );
};
