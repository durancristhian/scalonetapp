import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { deleteMatch, getMatches } from "@/server/queries/matches";
import { FaceFrownIcon, TrashIcon } from "@heroicons/react/24/outline";
import Link from "next/link";

export const MatchesList = async () => {
  const matches = await getMatches();

  if (!matches.length) {
    return (
      <>
        <Alert>
          <FaceFrownIcon className="h-4 w-4" />
          <AlertTitle>Todavía no creaste ninguno.</AlertTitle>
          <AlertDescription>
            <div className="mt-2">
              <Button asChild>
                <Link href="/matches/new">Creá tu primer partido</Link>
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      </>
    );
  }

  const getMatchDescription: (players: number) => string = (players) => {
    switch (players) {
      case 0:
        return "No hay personas anotadas";
      case 1:
        return "1 persona";
      default:
        return `${players} personas`;
    }
  };

  return (
    <ul className="flex flex-col gap-4">
      {matches.map((match) => (
        <li key={match.id}>
          <div className="border border-slate-300 flex items-center gap-4 pl-4 pr-2 py-2 rounded-md">
            <div className="grow">
              <p className="font-semibold">{match.name}</p>
              <p className="text-sm text-slate-700">
                {getMatchDescription(match.players.length)}
              </p>
            </div>
            <div className="inline-flex">
              <Link href={`/matches/${match.id}`}>
                <Button>Ver detalle</Button>
              </Link>
            </div>
            <div className="inline-flex">
              <form
                /* TODO: Ask for confirmation before deleting */
                /* TODO: Check if we can have a loading state and such */
                /* TODO: Show toast when deleted */
                action={async () => {
                  "use server";

                  await deleteMatch(match.id);
                }}
                className="inline-flex"
              >
                <Button type="submit" variant="ghost" size="icon">
                  <TrashIcon className="h-4 text-red-700 w-4" />
                </Button>
              </form>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
};
