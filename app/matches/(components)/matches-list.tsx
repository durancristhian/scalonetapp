import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { deleteMatch, getMatches } from "@/server/queries/matches";
import { FaceFrownIcon, TrashIcon } from "@heroicons/react/24/outline";
import { revalidatePath } from "next/cache";
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

  return (
    <ul className="flex flex-col gap-4">
      {matches.map((match) => (
        <li key={match.id}>
          <div className="border border-slate-300 cursor-pointer flex hover:bg-slate-50 items-center gap-4 pl-4 pr-2 py-2 rounded-md">
            <div className="grow">
              <p className="font-semibold">{match.name}</p>
              <p className="text-sm text-slate-700">
                {match.players.length
                  ? `${match.players.length} personas`
                  : "No hay personas anotadas"}
              </p>
            </div>
            <div className="inline-flex">
              <form
                action={async () => {
                  /* TODO: Can we move this to another file? */
                  /* TODO: Ask for confirmation before deleting */
                  /* TODO: Check if we can have a loading state and such */
                  /* TODO: Show toast when deleted */
                  "use server";

                  await deleteMatch(match.id);

                  revalidatePath("/matches");
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
