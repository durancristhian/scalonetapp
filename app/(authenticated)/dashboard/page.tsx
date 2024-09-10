import { AddMatch } from "@/app/(authenticated)/dashboard/(components)/add-match";
import { MatchesList } from "@/app/(authenticated)/dashboard/(components)/matches-list";
import { getMatches } from "@/server/queries/match";
import { FC } from "react";

const Page: FC = async () => {
  const matches = await getMatches();

  return (
    <div className="py-4 md:py-8">
      <div className="max-w-7xl mx-auto px-4 w-full">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-1">
            <AddMatch />
          </div>
          <div className="md:col-span-2">
            <MatchesList matches={matches} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
