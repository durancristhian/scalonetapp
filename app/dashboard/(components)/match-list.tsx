import { MatchItem } from "@/app/dashboard/(components)/match-item";
import { EmptyState } from "@/components/empty-state";
import { CardTitle } from "@/components/ui/card";
import { Match } from "@prisma/client";
import { FC } from "react";

type MatchListProps = {
  matches: Match[];
};

export const MatchList: FC<MatchListProps> = ({ matches }) => {
  const canListMatches = Array.isArray(matches) && matches.length;

  return (
    <div className="grid gap-4">
      <CardTitle>Tus partidos</CardTitle>
      {canListMatches ? (
        matches.map((match, idx) => (
          <MatchItem key={match.id} listIndex={idx} match={match} />
        ))
      ) : (
        <EmptyState>
          A medida que crees partidos van a aparecer listados acá.
        </EmptyState>
      )}
    </div>
  );
};
