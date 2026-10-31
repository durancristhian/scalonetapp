"use client";

import { MatchItem } from "@/app/(authenticated)/(components)/match-item";
import { AnimatedListItem } from "@/components/animated-list-item";
import { EmptyState } from "@/components/empty-state";
import { type Match } from "@prisma/client";
import { type FC } from "react";

type MatchsListProps = {
  matches: Match[];
  atMatchLimit: boolean;
};

export const MatchesList: FC<MatchsListProps> = ({ matches, atMatchLimit }) => {
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
          <MatchItem match={match} disableDuplication={atMatchLimit} />
        </AnimatedListItem>
      ))}
    </div>
  );
};
