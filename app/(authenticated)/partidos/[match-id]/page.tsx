import { MatchDetails } from "@/app/(authenticated)/partidos/[match-id]/(components)/match-details";
import { Button } from "@/components/ui/button";
import { getMatchByIdQuery } from "@/server/queries/match";
import { ChevronLeftIcon } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { type FC } from "react";

type PageProps = {
  params: Promise<{
    ["match-id"]: string;
  }>;
};

const Page: FC<PageProps> = async (props) => {
  const params = await props.params;
  const match = await getMatchByIdQuery(Number(params["match-id"]));

  if (!match) {
    return notFound();
  }

  return (
    <div className="py-4 md:py-8 space-y-4">
      <div className="max-w-7xl mx-auto px-4 w-full">
        <div className="space-y-4">
          <div className="flex gap-4 items-center">
            <div className="flex-shrink-0">
              <Button variant="outline" size="icon" asChild>
                <Link href="/partidos">
                  <ChevronLeftIcon className="h-4 text-muted-foreground w-4" />
                </Link>
              </Button>
            </div>
            <h2 className="font-bold text-xl">{match.name}</h2>
          </div>
          <MatchDetails match={match} />
        </div>
      </div>
    </div>
  );
};

export default Page;
