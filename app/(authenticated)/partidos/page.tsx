import {
  AddMatch,
  MatchLimitAlert,
} from "@/app/(authenticated)/(components)/add-match";
import { MatchesList } from "@/app/(authenticated)/(components)/matches-list";
import { getMatchesQuery } from "@/server/queries/match";
import type { Metadata } from "next";
import { type FC } from "react";

export const metadata: Metadata = { title: "Partidos" };

const Page: FC = async () => {
  const [matches, totalCount] = await getMatchesQuery();

  const atMatchLimit =
    totalCount >= Number(process.env.NEXT_PUBLIC_MAX_MATCHES_PER_USER);

  return (
    <div className="py-4 md:py-8">
      <div className="max-w-7xl mx-auto px-4 w-full">
        <div className="space-y-4">
          <div className="flex flex-wrap gap-3 items-center justify-between">
            <h2 className="min-w-0 flex-1 basis-48 font-bold text-xl">Tus partidos ({totalCount})</h2>
            <AddMatch disabled={atMatchLimit} />
          </div>
          {atMatchLimit ? <MatchLimitAlert /> : null}
          <MatchesList matches={matches} />
        </div>
      </div>
    </div>
  );
};

export default Page;
