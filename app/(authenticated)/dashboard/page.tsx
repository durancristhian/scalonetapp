import { AddMatch } from "@/app/(authenticated)/dashboard/(components)/add-match";
import { MatchesList } from "@/app/(authenticated)/dashboard/(components)/matches-list";
import { getMatches } from "@/server/queries/match";
import { FC } from "react";

const Page: FC = async () => {
  const matches = await getMatches();

  return (
    <div className="py-4 md:py-8">
      <div className="max-w-7xl mx-auto px-4 w-full">
        <div className="grid gap-4">
          <div className="flex gap-4 items-center justify-between">
            <h2 className="font-bold text-xl">Tus partidos</h2>
            <AddMatch />
          </div>
          {/* TODO: List */}
        </div>
      </div>
    </div>
  );
};

export default Page;
