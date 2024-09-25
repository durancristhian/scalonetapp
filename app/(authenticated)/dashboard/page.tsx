import { AddMatch } from "@/app/(authenticated)/(components)/add-match";
import { MatchesList } from "@/app/(authenticated)/(components)/matches-list";
import { Button } from "@/components/ui/button";
import { getMatchesQuery } from "@/server/queries/match";
import Link from "next/link";
import { FC } from "react";

const Page: FC = async () => {
  const [matches, totalCount] = await getMatchesQuery({ take: 3 });

  return (
    <div className="py-4 md:py-8">
      <div className="max-w-7xl mx-auto px-4 w-full">
        <div className="space-y-4">
          <div className="flex gap-4 items-center justify-between">
            <h2 className="font-bold text-xl">Últimos partidos actualizados</h2>
            <AddMatch
              disabled={
                totalCount >=
                Number(process.env.NEXT_PUBLIC_MAX_MATCHES_PER_USER)
              }
            />
          </div>
          <MatchesList matches={matches} />
          <div className="text-center">
            <Button asChild>
              <Link href="/partidos">Ver todos</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
