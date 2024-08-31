import { MatchDetails } from "@/app/[match-id]/(components)/match-details";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
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
    <div className="grid gap-4 py-4 md:py-8">
      <div className="max-w-7xl mx-auto px-4 w-full">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Tus partidos</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{match.name}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      <div className="max-w-7xl mx-auto px-4 w-full">
        <MatchDetails match={match} />
      </div>
    </div>
  );
}
