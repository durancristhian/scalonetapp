import { AddMatch } from "@/app/dashboard/(components)/add-match";
import { MatchList } from "@/app/dashboard/(components)/match-list";
import { CardTitle } from "@/components/ui/card";
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
            <div className="grid gap-4">
              <CardTitle>Tus partidos</CardTitle>
              <MatchList matches={matches} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
