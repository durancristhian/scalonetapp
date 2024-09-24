import { AddMatch } from "@/app/(authenticated)/(components)/add-match";
import { MatchesList } from "@/app/(authenticated)/(components)/matches-list";
import { getMatchesQuery } from "@/server/queries/match";
import { FC } from "react";

const Page: FC = async () => {
  const matches = await getMatchesQuery();

  return (
    <div className="py-4 md:py-8">
      <div className="max-w-7xl mx-auto px-4 w-full">
        <div className="space-y-4">
          <div className="flex gap-4 items-center justify-between">
            <h2 className="font-bold text-xl">Tus partidos</h2>
            <AddMatch
              disabled={
                matches.length >=
                Number(process.env.NEXT_PUBLIC_MAX_MATCHES_PER_USER)
              }
            />
          </div>
          <MatchesList matches={matches} />
        </div>
      </div>
    </div>
  );
};

export default Page;
