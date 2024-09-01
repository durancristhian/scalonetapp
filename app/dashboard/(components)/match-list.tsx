import { MatchItem } from "@/app/dashboard/(components)/match-item";
import { Match } from "@prisma/client";
import { FC } from "react";

type MatchListProps = {
  matches: Match[];
};

export const MatchList: FC<MatchListProps> = ({ matches }) => {
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
