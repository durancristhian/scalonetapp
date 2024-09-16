import { MatchDetails } from "@/app/(authenticated)/partidos/[match-id]/(components)/match-details";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { getMatchByIdQuery } from "@/server/queries/match";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FC } from "react";

type PageProps = {
  params: {
    ["match-id"]: string;
  };
};

const Page: FC<PageProps> = async ({ params }) => {
  const match = await getMatchByIdQuery(Number(params["match-id"]));

  if (!match) {
    return notFound();
  }

  return (
    <div className="py-4 md:py-8 space-y-4">
      <div className="max-w-7xl mx-auto px-4 w-full">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/dashboard">Tus partidos</Link>
              </BreadcrumbLink>
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
};

export default Page;
