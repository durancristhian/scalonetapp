import {
  AddMatch,
  MatchLimitAlert,
} from "@/app/(authenticated)/(components)/add-match";
import { MatchesList } from "@/app/(authenticated)/(components)/matches-list";
import { Button } from "@/components/ui/button";
import { getMatchesQuery } from "@/server/queries/match";
import type { Metadata } from "next";
import Link from "next/link";
import { type FC } from "react";

const TAKE_LIMIT = 3;

export const metadata: Metadata = { title: "Dashboard" };

const Page: FC = async () => {
  const [matches, totalCount] = await getMatchesQuery({ take: TAKE_LIMIT });

  const atMatchLimit =
    totalCount >= Number(process.env.NEXT_PUBLIC_MAX_MATCHES_PER_USER ?? 100);

  return (
    <div className="py-4 md:py-8">
      <div className="max-w-7xl mx-auto px-4 w-full">
        <div className="space-y-4">
          <div className="flex flex-wrap gap-3 items-center justify-between">
            <h2 className="min-w-0 flex-1 basis-48 font-bold text-xl">Últimos partidos actualizados</h2>
            <AddMatch disabled={atMatchLimit} />
          </div>
          {atMatchLimit ? <MatchLimitAlert /> : null}
          <MatchesList matches={matches} atMatchLimit={atMatchLimit} />
          {totalCount > TAKE_LIMIT ? (
            <div className="text-center">
              <Button variant="outline" asChild>
                <Link href="/partidos">Ver todos ({totalCount})</Link>
              </Button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default Page;
