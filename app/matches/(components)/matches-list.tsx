import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { FaceFrownIcon } from "@heroicons/react/24/outline";
import Link from "next/link";

export const MatchesList = async () => {
  const matches = [];

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
          <li className="flex gap-2 items-center"></li>
        </ul>
      </div>
    </>
  );
};
