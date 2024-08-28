import { getMatchById } from "@/server/queries/matches";
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
    <div className="py-8">
      <div className="container mx-auto">
        <div className="flex flex-col gap-4">
          <div className="flex gap-4 items-center justify-between">
            <h2 className="font-semibold text-2xl">{match.name}</h2>
          </div>
        </div>
      </div>
    </div>
  );
}
