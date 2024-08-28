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
          <AlertTitle>Todavía no creaste ningún partido.</AlertTitle>
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

  return (
    <>
      <div className="mt-4">
        <ul className="flex flex-col gap-2">
          {matches.map((match) => (
            <li key={match.id} className="flex gap-2 items-center">
              <form
                action={async () => {
                  "use server";

                  await deleteMatch(match.id);
                }}
                className="inline-flex"
              >
                <button type="submit">
                  <TrashIcon className="h-4 text-zinc-500 w-4" />
                </button>
              </form>
              <div className="grow">
                <p>{match.name}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
};
