import { MatchItem } from "@/app/(authenticated)/dashboard/(components)/match-item";
import { AnimatedListItem } from "@/components/animated-list-item";
import { EmptyState } from "@/components/empty-state";
import { CardDescription, CardTitle } from "@/components/ui/card";
import { Match } from "@prisma/client";
import { FC } from "react";

type MatchsListProps = {
  matches: Match[];
};

export const MatchsList: FC<MatchsListProps> = ({ matches }) => {
  const canListMatches = Array.isArray(matches) && matches.length;

  return (
    <div className="grid gap-4">
      <div className="grid gap-2">
        <CardTitle>Tus partidos</CardTitle>
      </div>
      {canListMatches ? (
        <>
          <CardDescription>Ordenados por última modificación.</CardDescription>
          {matches.map((match, idx) => (
            <AnimatedListItem key={match.id} listIndex={idx}>
              <MatchItem match={match} />
            </AnimatedListItem>
          ))}
        </>
      ) : (
        <EmptyState>
          A medida que crees partidos van a aparecer listados acá.
        </EmptyState>
      )}
    </div>
  );
};
