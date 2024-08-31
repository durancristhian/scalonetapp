import { MatchDetails } from "@/app/[match-id]/(components)/match-details";
import { getMatchById } from "@/server/queries/match";
import { notFound } from "next/navigation";

type PageProps = {
  params: {
    ["match-id"]: string;
  };
};

export default async function Page({ params }: PageProps) {
  const match = await getMatchById(Number(params["match-id"]));

  if (!match) {
    return notFound();
  }

  return (
    <div className="py-4 md:py-8">
      <div className="max-w-7xl mx-auto px-2 md:px-4 w-full">
        <MatchDetails match={match} />
      </div>
    </div>
  );
}
