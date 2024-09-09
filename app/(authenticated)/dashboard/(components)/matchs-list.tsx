import { MatchItem } from "@/app/(authenticated)/dashboard/(components)/match-item";
import { AnimatedListItem } from "@/components/animated-list-item";
import { EmptyState } from "@/components/empty-state";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CardDescription, CardTitle } from "@/components/ui/card";
import { MAX_MATCHES_PER_USER } from "@/utils/constants";
import { Match } from "@prisma/client";
import { AlertCircleIcon } from "lucide-react";
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
          {matches.length >= MAX_MATCHES_PER_USER ? (
            <Alert variant="destructive">
              <AlertCircleIcon className="h-4 w-4" />
              <AlertTitle>Límite de partidos alcanzado.</AlertTitle>
              <AlertDescription>
                Puedes crear hasta {MAX_MATCHES_PER_USER} partidos. Para crear
                uno nuevo, deberás eliminar uno de los existentes.
              </AlertDescription>
            </Alert>
          ) : null}
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
