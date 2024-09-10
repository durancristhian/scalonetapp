import { MatchItem } from "@/app/(authenticated)/dashboard/(components)/match-item";
import { AnimatedListItem } from "@/components/animated-list-item";
import { EmptyState } from "@/components/empty-state";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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
      <h2 className="font-bold text-xl">Tus partidos</h2>
      {canListMatches ? (
        <>
          {matches.length >=
          Number(process.env.NEXT_PUBLIC_MAX_MATCHES_PER_USER) ? (
            <Alert variant="destructive">
              <AlertCircleIcon className="h-4 w-4" />
              <AlertTitle>
                ¡Alto ahí, entrenador! ¡Llegaste al límite!
              </AlertTitle>
              <AlertDescription>
                Parece que ya tienes{" "}
                {process.env.NEXT_PUBLIC_MAX_MATCHES_PER_USER} partidos creados.
                Antes de añadir otro, te sugerimos despedir a uno de tus
                encuentros más viejitos. ¡Elimina un partido y dale lugar a
                nuevas glorias futbolísticas!
              </AlertDescription>
            </Alert>
          ) : null}
          <p>
            Los partidos a continuación están ordenados por{" "}
            <span className="font-bold">última fecha de actualización</span>.
          </p>
          {matches.map((match, idx) => (
            <AnimatedListItem key={match.id} listIndex={idx}>
              <MatchItem match={match} />
            </AnimatedListItem>
          ))}
        </>
      ) : (
        <EmptyState>
          Silencio atroz... hasta que crees un partido y hagas que la hinchada
          ruja. ¡Vamos, empieza ya!
        </EmptyState>
      )}
    </div>
  );
};
