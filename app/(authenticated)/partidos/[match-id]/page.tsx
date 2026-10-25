import { MatchDetails } from "@/app/(authenticated)/partidos/[match-id]/(components)/match-details";
import { Button } from "@/components/ui/button";
import { getMatchByIdQuery } from "@/server/queries/match";
import { ChevronLeftIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache, type FC } from "react";

type PageProps = {
  params: Promise<{
    ["match-id"]: string;
  }>;
};

const getMatch = cache(async (matchId: string) => {
  const id = Number(matchId);
  if (!Number.isInteger(id) || id < 1 || id > 2_147_483_647) {
    return null;
  }

  return getMatchByIdQuery(id);
});

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const match = await getMatch((await params)["match-id"]);
  // Keep user-entered $ sequences literal instead of applying Next's template.
  return {
    title: { absolute: `${match?.name ?? "Página no encontrada"} | Scalonet.app` },
  };
}

const Page: FC<PageProps> = async (props) => {
  const params = await props.params;
  const match = await getMatch(params["match-id"]);

  if (!match) {
    return notFound();
  }

  return (
    <div className="py-4 md:py-8 space-y-4">
      <div className="max-w-7xl mx-auto px-4 w-full">
        <div className="space-y-4">
          <div className="flex min-h-12 gap-4 items-center">
            <div className="flex-shrink-0">
              <Button variant="outline" size="icon" asChild>
                <Link href="/partidos" aria-label="Volver a partidos">
                  <ChevronLeftIcon className="h-4 text-muted-foreground w-4" />
                </Link>
              </Button>
            </div>
            <h2 className="min-w-0 font-bold text-xl [overflow-wrap:anywhere]">{match.name}</h2>
          </div>
          <MatchDetails match={match} />
        </div>
      </div>
    </div>
  );
};

export default Page;
