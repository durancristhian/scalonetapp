"use client";

import { MatchItem } from "@/app/(authenticated)/(components)/match-item";
import { AnimatedListItem } from "@/components/animated-list-item";
import { EmptyState } from "@/components/empty-state";
import { Match } from "@prisma/client";
import { FC } from "react";

type MatchsListProps = {
  matches: Match[];
};

export const MatchesList: FC<MatchsListProps> = ({ matches }) => {
  const canListMatches = Array.isArray(matches) && matches.length;

  if (!canListMatches) {
    return (
      <EmptyState>
        Silencio atroz... hasta que crees tu primer partido.
      </EmptyState>
    );
  }

  return (
    <div className="space-y-4">
      {matches.map((match, idx) => (
        <AnimatedListItem key={match.id} listIndex={idx}>
          <MatchItem
            match={match}
            disableDuplication={
              matches.length >=
              Number(process.env.NEXT_PUBLIC_MAX_MATCHES_PER_USER)
            }
          />
        </AnimatedListItem>
      ))}
    </div>
  );
};
